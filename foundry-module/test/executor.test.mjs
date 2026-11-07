import test from 'node:test';
import assert from 'node:assert/strict';
import { executeOption } from '../scripts/adapter/executor.mjs';
import fs from 'node:fs';

function setup({ interrupted = false, changed = false } = {}) {
  const calls = [];
  const actor = { system: { action_tracker: { move: 3, full: true, quick: true, protocol: true, reaction: true } },
    getFlag: () => null, setFlag: async (...v) => calls.push(['flag', ...v]),
    update: async v => calls.push(['budget', v]),
    items: { get: () => ({ beginWeaponAttackFlow: async () => calls.push(['flow']) }) } };
  const token = { actor, document: { x: 0, y: 0, elevation: 0,
    move: async path => { calls.push(['move', path]); if (!interrupted) { token.document.x = path.at(-1).x; token.document.y = path.at(-1).y; } return true; } },
    checkCollision: () => false };
  const board = { turn: 't1', stamp: 'a', guard: 'stable', terrainReviewed: true,
    positions: { '0,0': { x: 0, y: 0 }, '1,0': { x: 100, y: 0 } },
    snapshot: { activeTokenId: 'npc', grid: { type: 'square' }, tokens: [{ id: 'npc', speed: 3, pos: { x: 0, y: 0 } }, { id: 'pc', hp: [5, 5], pos: { x: 3, y: 0 } }],
      losFrom: { '1,0': { pc: true } } } };
  let reads = 0;
  const env = { game: { user: { id: 'gm', isGM: true },
    users: { activeGM: { id: 'gm' } } }, canvas: { tokens: { get: () => token, setTargets: async ids => calls.push(['targets', ids]) },
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
  const missingTargets = setup(); missingTargets.env.canvas.tokens.setTargets = undefined;
  await assert.rejects(executeOption(missingTargets.option, missingTargets.board, {}, missingTargets.env));
  assert.equal(missingTargets.calls.length, 0);
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
    if (stage === 'targets') s.env.canvas.tokens.setTargets = async () => { guard = 'changed'; };
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
    if (stage === 'targets') s.env.canvas.tokens.setTargets = move;
    await assert.rejects(executeOption(s.option, s.board, { line: 'Advance' }, s.env));
    assert(!s.calls.some(c => c[0] === 'flow'));
  }
});

test('executor uses serialized token-specific pixel waypoints instead of grid top-left corners', async () => {
  const s = setup();
  s.token.document.x = 25; s.token.document.y = 25;
  s.board.positions = { '0,0': { x: 25, y: 25 }, '1,0': { x: 125, y: 25 } };
  await executeOption(s.option, s.board, {}, s.env);
  assert.deepEqual(s.calls.find(c => c[0] === 'move')[1], [{ x: 125, y: 25 }]);
});

test('missing or nonfinite approved waypoint geometry is refused before reservation or movement', async () => {
  for (const point of [undefined, { x: NaN, y: 0 }, { x: 100, y: Infinity }]) {
    const s = setup(); s.board.positions['1,0'] = point;
    await assert.rejects(executeOption(s.option, s.board, {}, s.env));
    assert.equal(s.calls.length, 0);
  }
});
test('review R1 executor invokes the private decision guard inside the lock before any reservation',async()=>{
 const s=setup();let release;
 s.env.withLock=async(_key,fn)=>{await new Promise(r=>release=r);return fn();};
 let changed=false;s.env.verifyDecision=()=>{if(changed)throw Error('Decision configuration changed.');};
 const pending=executeOption(s.option,s.board,{},s.env);changed=true;release();
 await assert.rejects(pending,/configuration changed/);assert.equal(s.calls.length,0);
});

function modeSetup(mode) {
  const s = setup();
  const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/ram-cannon.json', import.meta.url)));
  const item = { id: 'gun', ...fixture, beginWeaponAttackFlow: () => assert.fail('Must use explicit mode flow'),
    currentProfile() { return { range: this.system.range, damage: this.system.damage[0], accuracy: 1, attack: 0 }; } };
  s.token.actor.system.tier = 1;
  s.token.actor.items = [item]; s.token.actor.items.get = () => item;
  s.option.action.mode = mode;
  const normalInit = async state => { state.data = { attack_type: 'Ranged', acc_diff: { weapon: { melee: true } } }; return true; };
  class WeaponAttackFlow {
    static steps = ['initAttackData', 'checks', 'showAttackHUD', 'rollAttacks'];
    constructor(weapon) { assert.equal(weapon, item); this.state = { item: weapon }; }
    getStep(name) { return name === 'initAttackData' ? normalInit : async () => true; }
    async begin() {
      await this.getStep('initAttackData')(this.state);
      s.calls.push(['mode-flow', structuredClone(this.state.data)]);
    }
  }
  s.env.game.system = { id: 'lancer', version: '3.1.3' };
  s.env.game.lancer = { flows: new Map([['WeaponAttackFlow', WeaponAttackFlow]]) };
  return { ...s, item, WeaponAttackFlow };
}

test('approved Ram Cannon handoff initializes native flow and applies only its selected mode', async () => {
  for (const mode of ['melee', 'ranged']) {
    const s = modeSetup(mode), before = JSON.stringify(s.item);
    const steps = [...s.WeaponAttackFlow.steps], init = s.WeaponAttackFlow.prototype.getStep;
    await executeOption(s.option, s.board, {}, s.env);
    const data = s.calls.find(c => c[0] === 'mode-flow')?.[1];
    assert(data, 'selected mode must reach the Lancer flow');
    assert.equal(data.attack_type, mode === 'melee' ? 'Melee' : 'Ranged');
    assert.equal(data.acc_diff.weapon.melee, mode === 'melee');
    assert.equal(JSON.stringify(s.item), before);
    assert.deepEqual(s.WeaponAttackFlow.steps, steps);
    assert.equal(s.WeaponAttackFlow.prototype.getStep, init);
  }
});

test('unsupported mode APIs, versions, tiers or modified items fail before any mutation', async () => {
  for (const change of [s => { s.env.game.system.version = '9.0.0'; },
    s => { s.env.game.lancer.flows.clear(); }, s => { s.option.action.mode = 'blast'; },
    s => { s.item.system.effect += ' push'; }, s => { s.token.actor.system.tier = 2; },
    s => { s.WeaponAttackFlow.prototype.getStep = undefined; }]) {
    const s = modeSetup('ranged'); change(s);
    await assert.rejects(executeOption(s.option, s.board, {}, s.env));
    assert.equal(s.calls.length, 0);
  }
});

test('a native attack flow that reports false is returned as attack-cancelled (final review 6)', async () => {
  const s = setup();
  s.token.actor.items.get = () => ({ beginWeaponAttackFlow: async () => false });
  const r = await executeOption(s.option, s.board, {}, s.env);
  assert.equal(r.status, 'attack-cancelled');
});

test('any other native flow result keeps handed-to-lancer (final review 6)', async () => {
  for (const value of [undefined, true, null, 0, { ok: true }]) {
    const s = setup();
    s.token.actor.items.get = () => ({ beginWeaponAttackFlow: async () => value });
    assert.equal((await executeOption(s.option, s.board, {}, s.env)).status, 'handed-to-lancer', String(value));
  }
});

test('a cancelled mode flow begin() reports attack-cancelled (final review 6)', async () => {
  const s = modeSetup('ranged');
  s.WeaponAttackFlow.prototype.begin = async function () { return false; };
  assert.equal((await executeOption(s.option, s.board, {}, s.env)).status, 'attack-cancelled');
});
