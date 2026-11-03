import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBudget, canSpend, spend } from '../scripts/core/budgets.mjs';

const tracker = () => ({ move: 5, full: true, quick: true, protocol: true,
  reaction: true, free: false, used_reactions: ['already-observed'] });
const fresh = options => normalizeBudget(tracker(), { speed: 5, ...options });

test('full actions and quick actions share one pool, including partial native turns', () => {
  const initial = fresh();
  assert.equal(initial.quick, 2); assert.equal(initial.full, true);
  const one = spend(initial, { quick: 1 });
  assert.equal(one.quick, 1); assert.equal(one.full, false);
  assert.equal(one.nativeTracker.full, false); assert.equal(one.nativeTracker.quick, true);
  assert.equal(canSpend(one, { full: 1 }).ok, false);
  assert.equal(spend(one, { quick: 1 }).quick, 0);
  assert.equal(spend(initial, { full: 1 }).quick, 0);
  assert.equal(canSpend(initial, { full: 1, quick: 1 }).ok, false);
  for (const [full, quick] of [[false, true], [true, false], [false, false]]) {
    const b = normalizeBudget({ ...tracker(), full, quick, move: 2 }, { speed: 5 });
    assert.equal(b.quick, Number(full) + Number(quick));
    assert.equal(b.full, false); assert.equal(b.move, 2);
  }
  assert.deepEqual(initial.nativeTracker, tracker(), 'Planning must not mutate the native observation.');
});

test('protocols, reactions and free actions consume only their observed resources', () => {
  for (const cost of [{ move: 1 }, { quick: 1 }, { full: 1 }, { reaction: 1 }, { free: 1 }, { protocol: 1 }]) {
    const after = spend(fresh(), cost);
    assert.equal(after.protocol, false);
    assert.deepEqual(after.nativeTracker.used_reactions, ['already-observed']);
  }
  const reacted = spend(fresh(), { reaction: 1 });
  assert.equal(reacted.quick, 2); assert.equal(reacted.move, 5);
  assert.equal(canSpend(reacted, { reaction: 1 }).ok, false);
  assert.equal(canSpend(spend(fresh(), { move: 1 }), { protocol: 1 }).ok, false);
  assert.equal(spend(fresh(), { free: 1 }).nativeTracker.free, true);
  assert.equal(canSpend(spend(fresh(), { free: 1 }), { free: 1 }).ok, true);
  assert.equal(canSpend(fresh(), { protocol: 1, quick: 1 }).ok, false, 'Ordered steps must represent protocols separately.');
  const resourceProtocol = fresh({ counters: { limited: { remaining: 2, scope: 'resource', period: 'native' } } });
  assert.equal(canSpend(resourceProtocol, { protocol: 1, counters: { limited: 1 } }).ok, true);
  assert.equal(spend(resourceProtocol, { protocol: 1, counters: { limited: 1 } }).counters.limited.remaining, 1);
});

test('movement and Boost preserve partial movement and spend one quick per granted segment', () => {
  const moved = spend(fresh(), { move: 3 });
  assert.equal(moved.move, 2); assert.equal(moved.quick, 2);
  assert.equal(canSpend(moved, { move: 3 }).ok, false);
  const boosted = spend(moved, { boost: 1 });
  assert.equal(boosted.move, 7); assert.equal(boosted.quick, 1);
  assert.equal(spend(boosted, { move: 7 }).move, 0);
  assert.equal(canSpend(spend(boosted, { quick: 1 }), { boost: 1 }).ok, false);
  assert.equal(canSpend(fresh({ blocked: ['boost'] }), { boost: 1 }).ok, false);
  assert.equal(canSpend(fresh({ blocked: ['move'] }), { move: 1 }).ok, false);
});

test('feature counters retain explicit periods; missing or ambiguous resource state refuses use', () => {
  const counters = { limited: { remaining: 2, scope: 'resource', period: 'observed-item-state' },
    once: { remaining: 1, scope: 'turn', period: 'combat:round:actor' } };
  const b = fresh({ counters });
  const after = spend(b, { quick: 1, counters: { limited: 2, once: 1 } });
  assert.equal(after.counters.limited.remaining, 0);
  assert.equal(canSpend(after, { counters: { once: 1 } }).ok, false);
  assert.equal(canSpend(b, { counters: { missing: 1 } }).ok, false);
  assert.equal(canSpend(fresh({ counters: { recharge: { remaining: 1 } } }), { counters: { recharge: 1 } }).ok, false);
  assert.equal(counters.limited.remaining, 2);
  assert.deepEqual(after.nativeTracker.used_reactions, ['already-observed']);
});

test('malformed native budgets and unrecognized costs fail closed without coercion', () => {
  for (const mutation of [t => { delete t.full; }, t => { t.move = -1; }, t => { t.quick = 1; }]) {
    const t = tracker(); mutation(t); assert.throws(() => normalizeBudget(t, { speed: 5 }));
  }
  for (const cost of [{ quick: -1 }, { move: NaN }, { quick: '1' }, { unknown: 1 }, { full: 2 }, { boost: 1.5 }]) {
    assert.equal(canSpend(fresh(), cost).ok, false);
    assert.throws(() => spend(fresh(), cost));
  }
  const inconsistent = spend(fresh(), { quick: 1 });
  inconsistent.nativeTracker.full = 1; inconsistent.nativeTracker.quick = false;
  assert.equal(canSpend(inconsistent, {}).ok, false, 'Numeric native flags must never be coerced to availability.');
});
