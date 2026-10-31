import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_WEIGHTS, generateCandidates, generateOptions, optionId } from '../scripts/core/options.mjs';
import { FIXTURES, loadFixture } from './helpers/fixtures.mjs';

test('optionId sequence', () => {
  assert.deepEqual([0, 1, 25, 26, 27].map(optionId), ['A', 'B', 'Z', 'AA', 'AB']);
});

for (const name of FIXTURES) {
  test(`${name}: ids, ordering, variety, determinism`, () => {
    const snap = loadFixture(name);
    const opts = generateOptions(snap);
    assert.ok(opts.length >= 1 && opts.length <= 8);
    assert.deepEqual(opts.map((o) => o.id), opts.map((_, i) => optionId(i)));
    for (let i = 1; i < opts.length; i++) assert.ok(opts[i - 1].score >= opts[i].score);
    const cands = generateCandidates(snap);
    for (const cat of ['aggressive', 'defensive', 'reposition']) {
      if (cands.some((c) => c.category === cat)) assert.ok(opts.some((o) => o.category === cat), `${cat} missing`);
    }
    assert.deepEqual(generateOptions(loadFixture(name)), opts);
  });
}

test('maxOptions caps the list but keeps variety', () => {
  const opts = generateOptions(loadFixture('open-map'), { maxOptions: 3 });
  assert.equal(opts.length, 3);
  assert.deepEqual(new Set(opts.map((o) => o.category)), new Set(['aggressive', 'defensive', 'reposition']));
});

test('open map: top option attacks the wounded target from hard cover', () => {
  const [top] = generateOptions(loadFixture('open-map'));
  assert.equal(top.action.kind, 'attack');
  assert.deepEqual(top.action.targetTokenIds, ['pc1']);
  assert.deepEqual(top.move.to, { x: 6, y: 8 });
  assert.equal(top.facts.cover, 'hard');
  assert.ok(top.facts.zeroHpChance > 0);
});

test('melee duel: Berserker attacks the reachable enemy in melee and never ends on its ally', () => {
  const snap = loadFixture('melee-duel');
  const opts = generateOptions(snap);
  const attacks = opts.filter((o) => o.action.kind === 'attack');
  assert.ok(attacks.length >= 1);
  for (const a of attacks) {
    assert.equal(a.action.itemId, 'w-blade');
    assert.equal(a.facts.distanceToTarget, 1);
    assert.equal(a.facts.heatAfter, 3, 'Heat 1 (Self) counted');
  }
  for (const o of opts) if (o.move) assert.notDeepEqual(o.move.to, { x: 4, y: 5 });
  // Ace is 7 away with speed 5 and Threat 1: no attack on Ace.
  assert.ok(!attacks.some((a) => a.action.targetTokenIds[0] === 'pc1'));
  // Boost toward Ace exists.
  assert.ok(opts.some((o) => o.action.kind === 'boost' && o.action.targetTokenIds[0] === 'pc1'));
});

test('missing LOS means no attack; false LOS means no attack', () => {
  const snap = loadFixture('open-map');
  snap.losFrom = {};
  assert.ok(!generateCandidates(snap).some((c) => c.action.kind === 'attack'));
  const snap2 = loadFixture('open-map');
  for (const row of Object.values(snap2.losFrom)) row.pc1 = false;
  const cands = generateCandidates(snap2);
  assert.ok(!cands.some((c) => c.action.kind === 'attack' && c.action.targetTokenIds[0] === 'pc1'));
  assert.ok(cands.some((c) => c.action.kind === 'attack' && c.action.targetTokenIds[0] === 'pc2'));
});

test('corridor: unknown-LOS cell 4,4 is never an attack position', () => {
  const opts = generateCandidates(loadFixture('walled-corridor'));
  for (const o of opts) {
    if (o.action.kind === 'attack') assert.notDeepEqual(o.move?.to, { x: 4, y: 4 });
  }
});

test('hex: unloaded weapon and spent uses are never offered; Lock On and Impaired applied', () => {
  const snap = loadFixture('hex-map');
  const cands = generateCandidates(snap);
  assert.ok(!cands.some((c) => c.action.itemId === 'w-spent'));
  const missileOnPyre = cands.find((c) => c.key === 'attack:w-missile:pc1');
  assert.ok(missileOnPyre);
  // accuracy 1 + Lock On 1 - Impaired 1 = +1; Seeking ignores cover.
  assert.equal(missileOnPyre.facts.netAccuracy, 1);
  snap.tokens[0].weapons[1].uses = [0, 2];
  assert.ok(!generateCandidates(snap).some((c) => c.action.itemId === 'w-missile'));
  // Neutral hauler is never a target.
  assert.ok(!cands.some((c) => c.action.targetTokenIds?.includes('n1')));
});

test('statuses: STUNNED -> hold only; IMMOBILIZED -> no movement; SLOWED -> no boost', () => {
  const stunned = loadFixture('open-map');
  stunned.tokens[0].statuses = ['Stunned'];
  const s = generateOptions(stunned);
  assert.equal(s.length, 1);
  assert.equal(s[0].action.kind, 'hold');

  const immob = loadFixture('open-map');
  immob.tokens[0].statuses = ['IMMOBILIZED'];
  for (const o of generateCandidates(immob)) assert.equal(o.move, null);

  const slowed = loadFixture('open-map');
  slowed.tokens[0].statuses = ['slowed'];
  const sc = generateCandidates(slowed);
  assert.ok(!sc.some((c) => c.action.kind === 'boost'));
  for (const c of sc) if (c.move) assert.ok(c.move.cost <= 4);
});

test('weights are tunable: making threat terrifying changes the pick', () => {
  const snap = loadFixture('melee-duel');
  const base = generateOptions(snap)[0];
  assert.equal(base.action.kind, 'attack');
  const scared = generateOptions(snap, { weights: { inEnemyThreat: -50 } })[0];
  assert.notEqual(scared.action.kind, 'attack');
  assert.equal(DEFAULT_WEIGHTS.cover.hard, 2);
});

test('overheat is flagged and penalised', () => {
  const snap = loadFixture('melee-duel');
  snap.tokens[0].heat = [6, 6];
  const atk = generateCandidates(snap).find((c) => c.action.kind === 'attack');
  assert.equal(atk.facts.overheats, true);
});

test('defeated tokens are neither targets nor obstacles', () => {
  const snap = loadFixture('open-map');
  snap.tokens[1].defeated = true;
  const cands = generateCandidates(snap);
  assert.ok(!cands.some((c) => c.action.targetTokenIds?.includes('pc1')));
});
