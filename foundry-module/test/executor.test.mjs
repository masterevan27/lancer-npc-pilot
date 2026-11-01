import test from 'node:test';
import assert from 'node:assert/strict';
import { executeOption } from '../scripts/adapter/executor.mjs';

function setup({ interrupted = false, changed = false } = {}) {
  const calls = [];
  const actor = { system: { action_tracker: { move: 3, full: true, quick: true } },
    getFlag: () => null, setFlag: async (...v) => calls.push(['flag', ...v]),
    update: async v => calls.push(['budget', v]),
    items: { get: () => ({ beginWeaponAttackFlow: async () => calls.push(['flow']) }) } };
  const token = { actor, document: { x: 0, y: 0, elevation: 0,
    move: async path => { calls.push(['move', path]); if (!interrupted) { token.document.x = path.at(-1).x; token.document.y = path.at(-1).y; } return true; } },
    checkCollision: () => false };
  const board = { turn: 't1', stamp: 'a', guard: 'stable', terrainReviewed: true,
    snapshot: { activeTokenId: 'npc', tokens: [{ id: 'npc', speed: 3, pos: { x: 0, y: 0 } }, { id: 'pc', hp: [5, 5], pos: { x: 3, y: 0 } }],
      losFrom: { '1,0': { pc: true } } } };
  let reads = 0;
  const env = { game: { user: { id: 'gm', isGM: true, updateTokenTargets: async ids => calls.push(['targets', ids]) },
    users: { activeGM: { id: 'gm' } } }, canvas: { tokens: { get: () => token },
    grid: { getTopLeftPoint: ({ i, j }) => ({ x: j * 100, y: i * 100 }) } },
    read: () => { reads++; return { ...board, guard: changed && reads > 1 ? 'changed' : 'stable' }; },
    withLock: async (_key, fn) => fn(), postLine: async line => calls.push(['line', line]) };
  const option = { id: 'A', move: { to: { x: 1, y: 0 }, path: [{ x: 0, y: 0 }, { x: 1, y: 0 }], cost: 1 },
    action: { kind: 'attack', itemId: 'gun', targetTokenIds: ['pc'] }, facts: { usesBoost: false } };
  return { calls, env, board, option, token };
}

test('approved executor uses waypoint movement then targets and Lancer flow; never rolls dice', async () => {
  const s = setup(); await executeOption(s.option, s.board, { line: 'Advance' }, s.env);
  assert.deepEqual(s.calls.filter(c => ['move', 'targets', 'flow'].includes(c[0])).map(c => c[0]), ['move', 'targets', 'flow']);
  assert.equal(s.calls.filter(c => c[0] === 'flow').length, 1);
  assert(s.calls.some(c => c[0] === 'budget'));
});

test('interrupted movement and changes during movement stop before targeting or attack', async () => {
  for (const mode of [{ interrupted: true }, { changed: true }]) {
    const s = setup(mode); await assert.rejects(executeOption(s.option, s.board, {}, s.env));
    assert(!s.calls.some(c => c[0] === 'targets' || c[0] === 'flow'));
  }
});

test('secondary GMs, already reserved turns and changed initial board produce no mutation', async () => {
  for (const change of [s => { s.env.game.users.activeGM.id = 'other'; },
    s => { s.token.actor.getFlag = () => 't1'; }, s => { s.board.stamp = 'old'; s.env.read = () => ({ ...s.board, stamp: 'new' }); }]) {
    const s = setup(); change(s); await assert.rejects(executeOption(s.option, s.board, {}, s.env));
    assert.equal(s.calls.length, 0);
  }
});

test('missing attack flow is caught before moving and hold never changes targets or starts a flow', async () => {
  const s = setup(); s.token.actor.items.get = () => undefined;
  await assert.rejects(executeOption(s.option, s.board, {}, s.env)); assert.equal(s.calls.length, 0);
  const h = setup(); h.option.move = null; h.option.action = { kind: 'hold' };
  await executeOption(h.option, h.board, {}, h.env);
  assert(!h.calls.some(c => ['move', 'targets', 'flow'].includes(c[0])));
});

test('changes across action-budget, chat and targeting awaits cannot start a stale Lancer flow', async () => {
  for (const stage of ['budget', 'chat', 'targets']) {
    const s = setup(); let guard = 'stable';
    s.env.read = () => ({ ...s.board, guard });
    if (stage === 'budget') s.token.actor.update = async () => { guard = 'changed'; };
    if (stage === 'chat') s.env.postLine = async () => { guard = 'changed'; };
    if (stage === 'targets') s.env.game.user.updateTokenTargets = async () => { guard = 'changed'; };
    await assert.rejects(executeOption(s.option, s.board, { line: 'Advance' }, s.env));
    assert(!s.calls.some(c => c[0] === 'flow'));
  }
});

test('moving the active NPC during budget, chat or target awaits cannot bypass the final position check', async () => {
  for (const stage of ['budget', 'chat', 'targets']) {
    const s = setup();
    const move = async () => { s.token.document.x = 700; };
    if (stage === 'budget') s.token.actor.update = move;
    if (stage === 'chat') s.env.postLine = move;
    if (stage === 'targets') s.env.game.user.updateTokenTargets = move;
    await assert.rejects(executeOption(s.option, s.board, { line: 'Advance' }, s.env));
    assert(!s.calls.some(c => c[0] === 'flow'));
  }
});
