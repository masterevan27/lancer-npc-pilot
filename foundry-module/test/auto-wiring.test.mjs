import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOutcomeExpectation, turnKeyFor } from '../scripts/adapter/auto-wiring.mjs';

test('turn key joins combat, round, turn and combatant ids', () => {
  assert.equal(turnKeyFor({ id: 'c', round: 2, turn: 3, combatant: { id: 'k' } }), 'c:2:3:k');
});

const tok = (id, hpMax, uuid = `Scene.s.Token.${id}`) => ({ id, name: `N-${id}`, document: { uuid }, actor: { id: `a-${id}`, system: { hp: { max: hpMax } },
  items: { get: iid => iid === 'rifle' ? { uuid: `Actor.a-${id}.Item.rifle` } : undefined } } });
const tokens = Object.fromEntries([tok('npc', 10), tok('p1', 20), tok('p2', 30)].map(t => [t.id, t]));
const getToken = id => tokens[id];

test('expectation builds weapon uuid and ordered targets, uuids derived from targets', () => {
  const option = { action: { kind: 'attack', itemId: 'rifle', targetTokenIds: ['p2', 'p1'] } };
  const e = buildOutcomeExpectation(option, { snapshot: { activeTokenId: 'npc' } }, { getToken });
  assert.equal(e.actorId, 'a-npc'); assert.equal(e.itemUuid, 'Actor.a-npc.Item.rifle');
  assert.deepEqual(e.targets, [{ tokenUuid: 'Scene.s.Token.p2', name: 'N-p2', maxHp: 30 }, { tokenUuid: 'Scene.s.Token.p1', name: 'N-p1', maxHp: 20 }]);
  assert.deepEqual(e.targetTokenUuids, e.targets.map(t => t.tokenUuid));
});

test('missing weapon, target or attacker throws so the runner holds', () => {
  const b = { snapshot: { activeTokenId: 'npc' } };
  assert.throws(() => buildOutcomeExpectation({ action: { itemId: 'nope', targetTokenIds: ['p1'] } }, b, { getToken }));
  assert.throws(() => buildOutcomeExpectation({ action: { itemId: 'rifle', targetTokenIds: ['zz'] } }, b, { getToken }));
  assert.throws(() => buildOutcomeExpectation({ action: { itemId: 'rifle', targetTokenIds: ['p1'] } }, { snapshot: { activeTokenId: 'x' } }, { getToken }));
});

import { initializePilot } from '../scripts/pilot.mjs';
import { environment } from './adapter.test.mjs';

test('initializePilot registers combat hooks, setAutoOptOut, and warns once when auto mode lacks execution', async () => {
  const env = environment();
  env.game.users = { activeGM: env.game.user };
  const values = { decisionMode: 'policy', autoMode: true, executionEnabled: false };
  env.game.settings = { get: (_m, k) => values[k] ?? false };
  const hooks = [], warns = [];
  const api = initializePilot({ ...env, Hooks: { on: n => hooks.push(n) }, notifications: { info() {}, warn: m => warns.push(m) } });
  await new Promise(r => setTimeout(r, 0));
  for (const n of ['updateCombat', 'deleteCombat', 'canvasTearDown']) assert(hooks.includes(n), n);
  assert.equal(typeof api.setAutoOptOut, 'function');
  assert.equal(warns.length, 1); assert.match(warns[0], /auto mode needs token execution/);
  let flag; await api.setAutoOptOut({ setFlag: async (m, k, v) => { flag = [m, k, v]; } }, true);
  assert.deepEqual(flag, ['lancer-npc-pilot', 'autoOptOut', true]);
});
