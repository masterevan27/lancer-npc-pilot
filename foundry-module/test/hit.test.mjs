import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  attackDamage, averageDamage, entryDist, hitChance, maxOfTwo, mean, parseDamage, uniform,
} from '../scripts/core/hit.mjs';

const close = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

/** Brute force: enumerate d20 and every d6 combination. */
function bruteHit(target, net, bonus = 0) {
  const n = Math.abs(net);
  let hit = 0;
  let crit = 0;
  let total = 0;
  const combos = n === 0 ? [[]] : cartesian(n);
  for (let d20 = 1; d20 <= 20; d20++) {
    for (const dice of combos) {
      const mod = n === 0 ? 0 : Math.sign(net) * Math.max(...dice);
      const roll = d20 + bonus + mod;
      total++;
      if (roll >= target) {
        hit++;
        if (roll >= 20) crit++;
      }
    }
  }
  return { hit: hit / total, crit: crit / total };
}

function cartesian(n) {
  let out = [[]];
  for (let i = 0; i < n; i++) out = out.flatMap((c) => [1, 2, 3, 4, 5, 6].map((d) => [...c, d]));
  return out;
}

test('hitChance equals brute-force enumeration', () => {
  for (const net of [-3, -2, -1, 0, 1, 2, 3]) {
    for (const target of [2, 5, 8, 10, 12, 15, 19, 20, 23, 27]) {
      for (const bonus of [0, 2]) {
        const exact = hitChance({ target, net, bonus });
        const brute = bruteHit(target, net, bonus);
        close(exact.hit, brute.hit);
        close(exact.crit, brute.crit);
        close(exact.miss, 1 - brute.hit);
      }
    }
  }
});

test('hitChance spot values', () => {
  close(hitChance({ target: 10 }).hit, 0.55);
  close(hitChance({ target: 10 }).crit, 0.05);
  close(hitChance({ target: 1 }).hit, 1);
  close(hitChance({ target: 30 }).hit, 0);
  close(hitChance({ target: 10, concealment: 0.5 }).hit, 0.275);
});

test('parseDamage handles types, multiple dice, d3 and arrays', () => {
  assert.deepEqual(parseDamage('1d6+2 Kinetic'), [{ type: 'Kinetic', terms: [{ sign: 1, count: 1, sides: 6 }, { sign: 1, flat: 2 }] }]);
  assert.deepEqual(parseDamage('d3'), [{ type: 'Variable', terms: [{ sign: 1, count: 1, sides: 3 }] }]);
  const mixed = parseDamage('1d6 Kinetic + 2 Burn');
  assert.deepEqual(mixed.map((e) => e.type), ['Kinetic', 'Burn']);
  const arr = parseDamage([{ type: 'Explosive', val: '2d6+1d3' }, { type: 'Heat', val: 2 }]);
  assert.deepEqual(arr.map((e) => e.type), ['Explosive', 'Heat']);
  assert.equal(arr[0].terms.length, 2);
  close(averageDamage('1d6+2'), 5.5);
  close(averageDamage('2d6+1d3+1'), 10);
  close(averageDamage('1d3'), 2);
  close(averageDamage('5 Energy'), 5);
  close(averageDamage('1d6-2'), (0 + 0 + 1 + 2 + 3 + 4) / 6); // floors at 0
});

test('maxOfTwo and overkill distributions', () => {
  close(mean(maxOfTwo(uniform(1, 6))), 161 / 36);
  close(mean(entryDist(parseDamage('1d6')[0], { overkill: true })), 4); // uniform 2..6
});

/** Brute force expected damage, enumerating attack outcome and every die. */
function bruteDamage({ diceSides, flat, target, net = 0, armor = 0, reliable = 0 }) {
  const { hit, crit } = bruteHit(target, net);
  const rolls = (sidesList) => sidesList.reduce((acc, s) => acc.flatMap((a) => [...Array(s).keys()].map((k) => a + k + 1)), [0]);
  const base = rolls(diceSides).map((r) => r + flat);
  const after = (v) => Math.max(0, Math.max(v, reliable) - armor);
  const eHit = base.reduce((s, v) => s + after(v), 0) / base.length;
  let eCrit = 0;
  for (const a of base) for (const b of base) eCrit += after(Math.max(a, b));
  eCrit /= base.length ** 2;
  const eMiss = Math.max(0, reliable - armor);
  return (hit - crit) * eHit + crit * eCrit + (1 - hit) * eMiss;
}

test('attackDamage equals brute force with armor, crits and reliable', () => {
  const cases = [
    { damage: '1d6+2 Kinetic', diceSides: [6], flat: 2, target: 8, armor: 1 },
    { damage: '2d6 Explosive', diceSides: [6, 6], flat: 0, target: 12, net: 2, armor: 2 },
    { damage: '1d3+1d6+1', diceSides: [3, 6], flat: 1, target: 6, net: -1 },
    { damage: '1d6 Kinetic', diceSides: [6], flat: 0, target: 10, reliable: 2, armor: 1 },
  ];
  for (const c of cases) {
    const chances = hitChance({ target: c.target, net: c.net ?? 0 });
    const got = attackDamage({ damage: c.damage, chances, armor: c.armor ?? 0, reliable: c.reliable ?? 0 });
    close(got.expectedDamage, bruteDamage(c), 1e-9);
  }
});

test('AP and SHREDDED ignore armor; resistance halves; EXPOSED doubles; Burn/Heat separate', () => {
  const chances = { hit: 1, crit: 0 };
  close(attackDamage({ damage: '4 Kinetic', chances, armor: 3 }).expectedDamage, 1);
  close(attackDamage({ damage: '4 Kinetic', chances, armor: 3, ap: true }).expectedDamage, 4);
  close(attackDamage({ damage: '4 Kinetic', chances, armor: 3, shredded: true }).expectedDamage, 4);
  close(attackDamage({ damage: '5 Explosive', chances, resistances: ['Explosive'] }).expectedDamage, 3); // ceil(2.5)
  close(attackDamage({ damage: '3 Energy', chances, exposed: true }).expectedDamage, 6);
  const mixed = attackDamage({ damage: '1d6 Kinetic + 2 Burn + 3 Heat', chances, armor: 10 });
  close(mixed.expectedDamage, 0);
  close(mixed.expectedBurn, 2);
  close(mixed.expectedHeat, 3);
});

test('zeroHpChance is exact', () => {
  // Always hits, never crits: 1d6 vs 4 HP and no armor -> P(d6 >= 4) = 1/2.
  close(attackDamage({ damage: '1d6', chances: { hit: 1, crit: 0 }, targetHp: 4 }).zeroHpChance, 0.5);
  // Crit only: max of two d6 >= 4 -> 1 - (3/6)^2 = 0.75.
  close(attackDamage({ damage: '1d6', chances: { hit: 1, crit: 1 }, targetHp: 4 }).zeroHpChance, 0.75);
  // Miss always: nothing.
  close(attackDamage({ damage: '1d6', chances: { hit: 0, crit: 0 }, targetHp: 4 }).zeroHpChance, 0);
  assert.equal(attackDamage({ damage: '1d6', chances: { hit: 1, crit: 0 } }).zeroHpChance, null);
});
