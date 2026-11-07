import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { matchAttackCard, OutcomeTracker } from '../scripts/core/outcome.mjs';
import { observeOutcome } from '../scripts/adapter/outcome-observer.mjs';

const fx = (n) => JSON.parse(readFileSync(new URL(`./fixtures/${n}.json`, import.meta.url), 'utf8'));
const hitFixture = fx('attack-card-hit'), missFixture = fx('attack-card-miss');
const CIC = 'Scene.s.Token.cicada', OTH = 'Scene.s.Token.other';
const mk = (uuids = [CIC]) => new OutcomeTracker({
  actorId: 'npc1', itemUuid: 'Item.ram', targetTokenUuids: uuids,
  targets: uuids.map((u) => ({ tokenUuid: u, name: u.split('.').pop(), maxHp: 10 })),
});
const st = (hp, structure) => ({ hp, structure });

test('only the handed-off attack card counts; a second one is ambiguous', () => {
  const t = new OutcomeTracker({ actorId: 'npc1', itemUuid: 'Item.ram', targetTokenUuids: [CIC] });
  t.onAttackCard({ origin: 'npc2', attackerItemUuid: 'Item.ram', targets: [] });
  assert.equal(t.outcome.status, 'pending');
  t.onAttackCard(hitFixture); assert.equal(t.outcome.status, 'pending');
  t.onAttackCard(hitFixture); assert.equal(t.outcome.status, 'ambiguous');
});

test('matchAttackCard requires both origin and item', () => {
  const e = { actorId: 'npc1', itemUuid: 'Item.ram' };
  assert.equal(matchAttackCard({ ...hitFixture, origin: 'x' }, e), null);
  assert.equal(matchAttackCard({ ...hitFixture, attackerItemUuid: 'Item.y' }, e), null);
  assert.equal(matchAttackCard(null, e), null);
  assert.deepEqual(matchAttackCard(hitFixture, e), { targets: [{ tokenUuid: CIC, hit: true, crit: false }] });
});

test('a miss completes without damage; damage to misses or non-targets is ignored', () => {
  const t = mk();
  t.onAttackCard(missFixture);
  assert.equal(t.outcome.status, 'missed');
  t.onHpChange({ tokenUuid: OTH, before: st(5, 3), after: st(1, 3), destroyed: false });
  t.onHpChange({ tokenUuid: CIC, before: st(5, 3), after: st(1, 3), destroyed: false });
  assert.equal(t.outcome.status, 'missed');
  assert.equal(t.outcome.targets[0].damage, null);
});

test('applied needs every hit target damaged; destroyed is reported', () => {
  const t = mk([CIC, OTH]);
  t.onAttackCard({ origin: 'npc1', attackerItemUuid: 'Item.ram', targets: [
    { uuid: CIC, hit: true, crit: false }, { uuid: OTH, hit: true, crit: true }] });
  t.onHpChange({ tokenUuid: CIC, before: st(8, 2), after: st(3, 2), destroyed: false });
  assert.equal(t.outcome.status, 'pending');
  t.onHpChange({ tokenUuid: OTH, before: st(4, 1), after: st(4, 0), destroyed: true });
  const o = t.outcome;
  assert.equal(o.status, 'applied');
  const [a, b] = o.targets;
  assert.deepEqual([a.damage, a.destroyed, a.maxHp], [5, false, 10]);
  assert.deepEqual([b.damage, b.destroyed, b.crit], [0, true, true]);
});

test('HP changes before the attack card are ignored', () => {
  const t = mk();
  t.onHpChange({ tokenUuid: CIC, before: st(8, 2), after: st(3, 2), destroyed: false });
  t.onAttackCard(hitFixture);
  assert.equal(t.outcome.status, 'pending');
});

test('damage is never negative and a heal does not count as applied', () => {
  const t = mk();
  t.onAttackCard(hitFixture);
  t.onHpChange({ tokenUuid: CIC, before: st(3, 2), after: st(8, 2), destroyed: false });
  assert.equal(t.outcome.status, 'pending');
  assert.equal(t.outcome.targets[0].damage, null);
});

// ---- adapter ----
function fakeHooks() {
  const regs = []; let n = 0;
  return { regs,
    on(name, fn) { const id = ++n; regs.push({ name, fn, id }); return id; },
    off(name, id) { const i = regs.findIndex((r) => r.id === id && r.name === name); if (i >= 0) regs.splice(i, 1); },
    fire(name, ...a) { for (const r of [...regs].filter((x) => x.name === name)) r.fn(...a); } };
}
const actorOf = (hp, structure) => ({ system: { hp: { value: hp }, structure: { value: structure } } });
const msg = (flags) => ({ getFlag: (s, k) => (s === 'lancer' ? flags[k] : undefined) });

test('observer resolves done from card + updateActor and dispose removes every hook', async () => {
  const Hooks = fakeHooks(), actor = actorOf(8, 2);
  const canvas = { scene: { tokens: [{ uuid: CIC, actor }] } };
  const expect = { actorId: 'npc1', itemUuid: 'Item.ram', targetTokenUuids: [CIC],
    targets: [{ tokenUuid: CIC, name: 'Cicada', maxHp: 10 }] };
  const obs = observeOutcome({ Hooks, canvas, expect });
  assert.ok(Hooks.regs.length >= 3);
  let settled = false; obs.done.then(() => { settled = true; });
  Hooks.fire('createChatMessage', msg({ attackData: hitFixture }));
  Hooks.fire('preUpdateActor', actor, { system: { hp: { value: 3 } } });
  actor.system.hp.value = 3;
  await Promise.resolve(); assert.equal(settled, false);
  Hooks.fire('updateActor', actor, { system: { hp: { value: 3 } } });
  const o = await obs.done;
  assert.equal(o.status, 'applied');
  assert.equal(o.targets[0].damage, 5);
  obs.dispose();
  assert.equal(Hooks.regs.length, 0);
});

test('observer ignores unrelated actor updates and matches unlinked token actors', async () => {
  const Hooks = fakeHooks(), actor = actorOf(8, 2), stranger = actorOf(5, 1);
  const canvas = { scene: { tokens: [{ uuid: CIC, actor }] } };
  const obs = observeOutcome({ Hooks, canvas, expect: { actorId: 'npc1', itemUuid: 'Item.ram',
    targetTokenUuids: [CIC], targets: [{ tokenUuid: CIC, name: 'C', maxHp: 10 }] } });
  Hooks.fire('createChatMessage', msg({ attackData: hitFixture }));
  Hooks.fire('preUpdateActor', stranger, { system: { hp: { value: 1 } } });
  stranger.system.hp.value = 1;
  Hooks.fire('updateActor', stranger, { system: { hp: { value: 1 } } });
  Hooks.fire('preUpdateActor', actor, { system: { notes: 'x' } });
  Hooks.fire('updateActor', actor, { system: { notes: 'x' } });
  assert.equal(obs.tracker.outcome.status, 'pending');
  obs.dispose();
});
