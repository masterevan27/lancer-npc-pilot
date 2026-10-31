import assert from 'node:assert/strict';
import { test } from 'node:test';
import { reachableCells } from '../scripts/core/reach.mjs';
import { loadFixture } from './helpers/fixtures.mjs';

test('open square map: speed 4 with equidistant diagonals reaches a 9x9 block', () => {
  const snap = loadFixture('open-map');
  const r = reachableCells(snap, 'npc1');
  assert.equal(r.size, 81);
  assert.equal(r.get('5,10').cost, 0);
  assert.equal(r.get('9,14').cost, 4);
  assert.equal(r.get('9,14').path.length, 5);
  assert.ok(!r.has('10,10'));
});

test('bounds are respected', () => {
  const snap = loadFixture('open-map');
  snap.tokens[0].pos = { x: 0, y: 0 };
  const r = reachableCells(snap, 'npc1');
  assert.equal(r.size, 25);
  for (const v of r.values()) assert.ok(v.to.x >= 0 && v.to.y >= 0);
});

test('corridor: ally is passable but not endable, difficult costs 2, force field stops movement', () => {
  const snap = loadFixture('walled-corridor');
  const r = reachableCells(snap, 'npc1');
  assert.ok(!r.has('3,4'), 'cannot end on the allied Grunt');
  assert.equal(r.get('4,4').cost, 3);
  assert.deepEqual(r.get('4,4').path.map((c) => `${c.x},${c.y}`), ['1,4', '2,4', '3,4', '4,4']);
  assert.equal(r.get('5,4').cost, 5, 'entering difficult 5,4 costs 2');
  assert.ok(!r.has('6,4'), 'speed 5 runs out at the difficult cell');
  const far = reachableCells(snap, 'npc1', { maxCost: 20 });
  assert.ok(far.has('6,4'));
  assert.ok(!far.has('7,4'), 'blockedMoves 6,4>7,4 stops movement');
  for (const k of far.keys()) assert.ok(!snap.blocked.includes(k));
});

test('enemies block movement; size-2 footprint must fit', () => {
  const snap = loadFixture('melee-duel');
  const r = reachableCells(snap, 'npc1', { maxCost: 10 });
  // Atlas (size 2) covers 5..6 x 3..4; none of those may appear on any path.
  const atlas = new Set(['5,3', '6,3', '5,4', '6,4']);
  for (const v of r.values()) for (const c of v.path) assert.ok(!atlas.has(`${c.x},${c.y}`));
  assert.ok(!r.has('4,5'), 'cannot end on ally');

  // Make the mover size 2 in an open map: its 2x2 block may not overlap a blocked cell.
  const open = loadFixture('open-map');
  open.tokens[0].size = 2;
  open.blocked = ['7,10'];
  const big = reachableCells(open, 'npc1');
  for (const v of big.values()) {
    for (const c of v.path) {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) assert.notEqual(`${c.x + dx},${c.y + dy}`, '7,10');
    }
  }
  assert.ok(!big.has('6,10') && !big.has('7,9') && !big.has('6,9'));
});

test('no diagonal corner cutting around blocked cells', () => {
  const snap = loadFixture('open-map');
  snap.blocked = ['6,10'];
  const r = reachableCells(snap, 'npc1', { maxCost: 1 });
  assert.ok(!r.has('6,9'), 'diagonal past the corner of 6,10 is refused');
  assert.ok(!r.has('6,11'));
  assert.ok(r.has('4,9'));
});

test('hex: neutral token blocks, walls route around', () => {
  const snap = loadFixture('hex-map');
  const r = reachableCells(snap, 'npc1');
  assert.ok(!r.has('5,5'), 'neutral hauler cell');
  for (const v of r.values()) {
    for (const c of v.path) {
      const k = `${c.x},${c.y}`;
      assert.ok(!snap.blocked.includes(k));
      assert.notEqual(k, '5,5');
    }
  }
});
