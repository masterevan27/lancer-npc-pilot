import test from 'node:test';
import assert from 'node:assert/strict';
import { environment } from './adapter.test.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';
import { generateCandidates } from '../scripts/core/options.mjs';
import { normalizeBudget } from '../scripts/core/budgets.mjs';
import { executeOption } from '../scripts/adapter/executor.mjs';
import { readFileSync } from 'node:fs';

test('native partial turns retain exact observed movement and remaining shared actions', () => {
  const env = environment(), actor = env.canvas.tokens.placeables[0].actor;
  actor.system.action_tracker = { move: 1, full: false, quick: true, protocol: false,
    reaction: false, free: false, used_reactions: ['native-history'] };
  const board = extractSnapshot(env), b = board.snapshot.actionBudget;
  assert.equal(b.move, 1); assert.equal(b.quick, 1); assert.equal(b.full, false);
  assert.equal(b.protocol, false); assert.equal(b.reaction, false);
  assert.deepEqual(b.observedTracker, actor.system.action_tracker);
  assert.deepEqual(b.nativeTracker.used_reactions, ['native-history']);
});

test('LOS extraction covers all observed movement including an existing movement grant', () => {
  const env = environment(), actor = env.canvas.tokens.placeables[0].actor;
  actor.system.action_tracker.move = 3;
  const board = extractSnapshot(env);
  assert.equal(board.snapshot.losFrom['1,4']?.pc, true);
});

function execution(move = 2, quick = true) {
  const env = environment(), token = env.canvas.tokens.placeables[0], actor = token.actor, calls = [];
  actor.system.action_tracker = { move, full: true, quick, protocol: false, reaction: true, used_reactions: [] };
  env.game.user.id = 'gm'; env.game.users = { activeGM: { id: 'gm' } };
  env.canvas.scene.flags.terrain = { reviewed: true };
  actor.items.get = id => actor.items.find(i => i.id === id);
  actor.setFlag = async (ns, k, v) => { (actor.flags[ns] ??= {})[k] = v; calls.push('reserve'); };
  actor.getFlag = (ns, k) => actor.flags[ns]?.[k];
  actor.update = async data => { actor.system.action_tracker = data['system.action_tracker']; };
  token.document.move = async points => { Object.assign(token.document, points.at(-1)); calls.push('move'); return true; };
  env.canvas.tokens.setTargets = async () => calls.push('targets');
  const board = extractSnapshot(env);
  const option = { move: { to: { x: 2, y: 1 }, path: [{ x: 1, y: 1 }, { x: 2, y: 1 }], cost: 1 },
    action: { kind: 'attack', itemId: 'rifle', targetTokenIds: ['pc'] }, facts: { usesBoost: false } };
  const io = { ...env, read: options => extractSnapshot(env, options), withLock: async (_k, fn) => fn(), postLine: async () => {} };
  return { actor, calls, board, option, io };
}

test('partial-movement execution spends exact movement and one quick without replay', async () => {
  const s = execution();
  await executeOption(s.option, s.board, {}, s.io);
  assert.equal(s.actor.system.action_tracker.move, 1);
  assert.equal(s.actor.system.action_tracker.full, false);
  assert.equal(s.actor.system.action_tracker.quick, true);
  await assert.rejects(executeOption(s.option, s.board, {}, s.io));
  assert.equal(s.calls.filter(c => c === 'reserve').length, 1);
});

test('unknown earlier native quick use suppresses Ram modes and Boost, retaining movement and observed pool', async () => {
  const s = execution(), actor = s.actor;
  actor.system.tier = 1;
  const ram = JSON.parse(readFileSync(new URL('./fixtures/ram-cannon.json', import.meta.url)));
  ram.id = 'ram'; ram.currentProfile = () => ({ range: ram.system.range, damage: ram.system.damage[0] });
  actor.items.push(ram);
  actor.system.action_tracker.full = false;
  const board = s.io.read(), candidates = generateCandidates(board.snapshot);
  assert.equal(board.snapshot.actionBudget.quick, 1, 'Do not erase the native remaining slot.');
  assert(candidates.every(o => o.action.kind !== 'attack' && !o.facts.usesBoost));
  assert(candidates.some(o => o.move || o.action.kind === 'hold'));
  assert(board.warnings.some(w => /earlier.*action.*history/i.test(w)));
  await assert.rejects(executeOption(s.option, board, {}, s.io));
  assert.deepEqual(s.calls, []);
});

test('an action that exceeds the observed partial budget refuses before any reservation or move', async () => {
  for (const [move, quick] of [[0, true], [2, false]]) {
    const s = execution(move, quick);
    await assert.rejects(executeOption(s.option, s.board, {}, s.io));
    assert.deepEqual(s.calls, []);
  }
});

test('executor rechecks route adjacency and actual cost before reservation', async () => {
  for (const mutate of [s => { s.option.move.cost = 0; },
    s => { s.option.move.to = { x: 3, y: 1 }; s.option.move.path[1] = { x: 3, y: 1 }; }]) {
    const s = execution(); mutate(s);
    await assert.rejects(executeOption(s.option, s.board, {}, s.io));
    assert.deepEqual(s.calls, []);
  }
});

test('native tracker changes during a movement await stop instead of overwriting partial state', async () => {
  const s = execution(), d = s.io.canvas.tokens.get('npc').document, move = d.move;
  d.move = async points => { const result = await move(points); s.actor.system.action_tracker.quick = false; return result; };
  await assert.rejects(executeOption(s.option, s.board, {}, s.io), /tracker changed/);
  assert.equal(s.actor.system.action_tracker.move, 2);
  assert.equal(s.actor.system.action_tracker.quick, false);
  assert(!s.calls.includes('targets'));
});

test('partial-turn options cannot invent movement, another full action or a spent quick action', () => {
  const env = environment(), board = extractSnapshot(env), snap = board.snapshot;
  snap.actionBudget = normalizeBudget({ move: 1, full: false, quick: true, protocol: false, reaction: false }, { speed: 2 });
  const candidates = generateCandidates(snap);
  assert(candidates.some(o => o.action.kind === 'attack'));
  for (const o of candidates) {
    const cost = o.move?.cost ?? 0;
    assert(cost <= (o.facts.usesBoost ? 3 : 1));
    assert.equal(Boolean(o.facts.usesBoost), cost > 1);
  }
  snap.actionBudget = normalizeBudget({ move: 1, full: false, quick: false, protocol: false, reaction: false }, { speed: 2 });
  const spent = generateCandidates(snap);
  assert(spent.every(o => !['attack', 'hide'].includes(o.action.kind) && !o.facts.usesBoost));
  assert(spent.every(o => (o.move?.cost ?? 0) <= 1));
});
