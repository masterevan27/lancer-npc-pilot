import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUse } from '../scripts/core/legality.mjs';
import { normalizeBudget, spend } from '../scripts/core/budgets.mjs';

const fixture = () => {
  const descriptor = { id: 'synthetic', version: 1, fingerprints: ['frozen'], systemVersions: ['3.1.3'], tiers: [1],
    activation: 'Quick', cost: { quick: 1 }, coverage: 'supported', gaps: [], handlerId: 'reviewed-synthetic',
    targetPolicy: { kind: 'single', side: 'enemy', maxRange: 5, requiresLOS: true, excludeSelf: true, maxSize: 2 },
    provenance: { source: 'synthetic fixture only', review: 'unit fixture, no roster support' } };
  const use = { actorTokenId: 'npc', sourceItemId: 'item', targets: ['pc'] };
  const context = { entry: { lid: 'synthetic', sourceFingerprint: 'frozen', sourceVersion: '3.1.3', tiers: [1] },
    systemVersion: '3.1.3', tier: 1, handlers: ['reviewed-synthetic'], sourceItemId: 'item',
    activeTokenId: 'npc', window: 'turn', geometryActorId: 'npc', gaps: [],
    budget: normalizeBudget({ move: 4, full: true, quick: true, protocol: true, reaction: true }, { speed: 4 }),
    tokens: [{ id: 'npc', isNpc: true, side: 'hostile', size: 2, hp: [10, 10] }, { id: 'pc', isNpc: false, side: 'friendly', size: 1, hp: [5, 5] }],
    geometry: { pc: { distance: 5, visible: true } } };
  return { descriptor, use, context };
};
const checked = f => validateUse(f.descriptor, f.use, f.context);

test('use validation requires exact source, owning item, active actor and observed geometry', () => {
  assert.equal(checked(fixture()).ok, true);
  for (const change of [f => { f.context.entry.sourceFingerprint = 'edited'; },
    f => { f.context.handlers = []; }, f => { f.use.sourceItemId = 'other'; },
    f => { f.context.activeTokenId = 'pc'; }, f => { f.context.geometryActorId = 'pc'; },
    f => { f.context.tokens[0].isNpc = false; }, f => { f.context.tokens[0].hp[0] = 0; },
    f => { f.context.geometry.pc.distance = 6; }, f => { delete f.context.geometry.pc; },
    f => { f.context.geometry.pc.visible = false; }, f => { f.context.gaps.push('Unreviewed target passive'); }]) {
    const f = fixture(); change(f); assert.equal(checked(f).ok, false);
  }
});

test('target policies reject duplicates, allies, wrong sizes and unsupported constraints', () => {
  for (const change of [f => { f.use.targets = ['pc', 'pc']; }, f => { f.use.targets = ['missing']; },
    f => { f.context.tokens[1].side = 'hostile'; }, f => { f.context.tokens[1].size = 3; },
    f => { f.context.tokens[1].hp[0] = 0; }, f => { f.descriptor.targetPolicy.guessedRestriction = true; },
    f => { f.descriptor.targetPolicy.kind = 'area'; }]) {
    const f = fixture(); change(f); assert.equal(checked(f).ok, false);
  }
});

test('full-action and protocol uses consume the same verified budget and timing context', () => {
  const f = fixture(); f.descriptor.activation = 'Full'; f.descriptor.cost = { full: 1 };
  assert.equal(checked(f).ok, true);
  f.context.budget = spend(f.context.budget, { quick: 1 });
  assert.equal(checked(f).ok, false);
  f.descriptor.activation = 'Protocol'; f.descriptor.cost = { protocol: 1 };
  assert.equal(checked(f).ok, false);
  f.context.budget = fixture().context.budget;
  assert.equal(checked(f).ok, true);
  f.descriptor.activation = 'Reaction'; f.descriptor.cost = { reaction: 1 };
  assert.equal(checked(f).ok, false, 'Reaction events require the later verified controller.');
});
