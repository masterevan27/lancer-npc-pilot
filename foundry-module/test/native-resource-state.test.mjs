import test from 'node:test';
import assert from 'node:assert/strict';
import { readActionBudget } from '../scripts/adapter/budgets.mjs';
import { canSpend } from '../scripts/core/budgets.mjs';
import { environment } from './adapter.test.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';

test('native Limited, Loading and Recharge states remain separate explicit resources', () => {
  const actor = { system: { speed: 4, action_tracker: { move: 2, full: false, quick: true,
    protocol: false, reaction: true, used_reactions: ['old'] } }, statuses: new Set(),
    items: [{ id: 'limited', type: 'npc_feature', system: { uses: { value: 2, max: 3 },
      loaded: false, charged: true, tags: [{ lid: 'tg_loading' }, { lid: 'tg_recharge' }] } },
    { id: 'unlimited', type: 'npc_feature', system: { uses: { value: 0, max: 0 }, tags: [] } }] };
  const b = readActionBudget(actor);
  assert.equal(b.counters['uses:limited'].remaining, 2);
  assert.equal(b.counters['loading:limited'].remaining, 0);
  assert.equal(b.counters['recharge:limited'].remaining, 1);
  assert.equal(b.counters['uses:unlimited'], undefined);
  assert.equal(canSpend(b, { counters: { 'uses:limited': 3 } }).ok, false);
  assert.equal(canSpend(b, { counters: { 'loading:limited': 1 } }).ok, false);
  actor.items[0].system.charged = false;
  assert.equal(readActionBudget(actor).counters['recharge:limited'].remaining, 0);
  delete actor.items[0].system.charged;
  assert.equal(canSpend(readActionBudget(actor), { counters: { 'recharge:limited': 1 } }).ok, false);
  assert.deepEqual(actor.system.action_tracker.used_reactions, ['old']);
});

test('known movement restrictions block costs without resetting the native observation', () => {
  const actor = { system: { speed: 4, action_tracker: { move: 4, full: true, quick: true,
    protocol: true, reaction: true } }, statuses: new Set(['slowed']), items: [] };
  assert.equal(canSpend(readActionBudget(actor), { boost: 1 }).ok, false);
  assert.equal(canSpend(readActionBudget(actor), { move: 1 }).ok, true);
  actor.statuses = new Set(['immobilized']);
  assert.equal(canSpend(readActionBudget(actor), { move: 1 }).ok, false);
  actor.statuses = new Set(['stunned']);
  assert.equal(canSpend(readActionBudget(actor), { quick: 1 }).ok, false);
  assert.equal(canSpend(readActionBudget(actor), { reaction: 1 }).ok, false);
  assert.equal(readActionBudget(actor).observedTracker.move, 4);
});

test('snapshots retain actual class/template IDs for later reviewed restrictions', () => {
  const env = environment(), actor = env.canvas.tokens.placeables[0].actor;
  actor.items.push({ type: 'npc_class', system: { lid: 'class-fixture' } },
    { type: 'npc_template', system: { lid: 'template-fixture' } });
  const token = extractSnapshot(env).snapshot.tokens[0];
  assert.deepEqual(token.classIds, ['class-fixture']);
  assert.deepEqual(token.templateIds, ['template-fixture']);
});
