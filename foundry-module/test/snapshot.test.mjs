import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  findTag, hasStatus, isMeleeWeapon, normTag, usesLeft, validateSnapshot,
} from '../scripts/core/snapshot.mjs';
import { FIXTURES, loadFixture } from './helpers/fixtures.mjs';

for (const name of FIXTURES) {
  test(`fixture ${name} is a valid snapshot`, () => {
    const res = validateSnapshot(loadFixture(name));
    assert.deepEqual(res.errors, []);
    assert.equal(res.ok, true);
  });
}

test('validateSnapshot reports missing and invalid fields with paths', () => {
  const snap = loadFixture('open-map');
  delete snap.grid.type;
  snap.activeTokenId = 'nope';
  snap.tokens[1].hp = 7;
  snap.tokens[1].side = 'enemy';
  delete snap.tokens[2].evasion;
  snap.tokens[0].weapons[0].range = [];
  snap.blocked = ['1,1', 'x'];
  snap.losFrom['5,10'].pc1 = 'yes';
  const res = validateSnapshot(snap);
  assert.equal(res.ok, false);
  const paths = res.errors.map((e) => e.path);
  for (const p of ['grid.type', 'activeTokenId', 'tokens[1].hp', 'tokens[1].side', 'tokens[2].evasion',
    'tokens[0].weapons[0].range', 'blocked[1]', 'losFrom.5,10.pc1']) {
    assert.ok(paths.includes(p), `expected an error at ${p}; got ${paths.join(' | ')}`);
  }
});

test('validateSnapshot: hex layout checked, missing LOS warned and unknown large occupancy rejected', () => {
  const snap = loadFixture('hex-map');
  snap.grid.hexLayout = 'diagonal';
  assert.ok(validateSnapshot(snap).errors.some((e) => e.path === 'grid.hexLayout'));
  delete snap.grid.hexLayout;
  delete snap.losFrom;
  snap.tokens[1].size = 2;
  const res = validateSnapshot(snap);
  assert.equal(res.ok, false);
  const w = res.warnings.map((x) => x.path);
  assert.ok(w.includes('grid.hexLayout'));
  assert.ok(w.includes('losFrom'));
  assert.ok(res.errors.some(e => e.path === 'tokens[1].occupiedCells'));
});

test('validateSnapshot rejects non-objects and duplicate ids', () => {
  assert.equal(validateSnapshot(null).ok, false);
  const snap = loadFixture('open-map');
  snap.tokens[2].id = 'pc1';
  assert.ok(validateSnapshot(snap).errors.some((e) => /duplicate/.test(e.message)));
});

test('tag and status normalisation', () => {
  assert.deepEqual(normTag('Heat 2 (Self)'), { name: 'heat_self', val: 2 });
  assert.deepEqual(normTag({ id: 'tg_heat_self', val: 2 }), { name: 'heat_self', val: 2 });
  assert.deepEqual(normTag('Reliable 3'), { name: 'reliable', val: 3 });
  assert.deepEqual(normTag('AP'), { name: 'ap', val: null });
  assert.deepEqual(normTag({ id: 'tg_ap' }), { name: 'ap', val: null });
  assert.equal(findTag({ tags: ['Limited 2', 'Seeking'] }, 'seeking').name, 'seeking');
  assert.ok(hasStatus({ statuses: ['lock_on'] }, 'Lock On'));
  assert.ok(!hasStatus({}, 'PRONE'));
  assert.equal(usesLeft({ uses: [1, 2] }), 1);
  assert.equal(usesLeft({ uses: null }), Infinity);
  assert.ok(isMeleeWeapon({ type: 'Melee', range: [{ type: 'Threat', val: 1 }] }));
  assert.ok(!isMeleeWeapon({ type: 'CQB', range: [{ type: 'Range', val: 5 }, { type: 'Threat', val: 2 }] }));
});
