import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  HEX_LAYOUTS, axialToOffset, cellDistance, footprint, footprintDistance, neighbors, offsetToAxial, parseKey,
} from '../scripts/core/grid.mjs';

test('parseKey accepts "x,y" with negatives and rejects junk', () => {
  assert.deepEqual(parseKey('3,-4'), { x: 3, y: -4 });
  assert.deepEqual(parseKey(' 0 , 7 '), { x: 0, y: 7 });
  assert.equal(parseKey('3;4'), null);
  assert.equal(parseKey('a,b'), null);
});

test('square distances: equidistant diagonals and rectilinear', () => {
  const eq = { type: 'square' };
  const rect = { type: 'square', diagonals: 'rectilinear' };
  assert.equal(cellDistance(eq, { x: 0, y: 0 }, { x: 3, y: 5 }), 5);
  assert.equal(cellDistance(rect, { x: 0, y: 0 }, { x: 3, y: 5 }), 8);
  assert.equal(neighbors(eq, { x: 0, y: 0 }).length, 8);
  assert.equal(neighbors(rect, { x: 0, y: 0 }).length, 4);
});

for (const layout of HEX_LAYOUTS) {
  test(`hex ${layout}: offset<->axial round trip, 6 neighbours at distance 1`, () => {
    const grid = { type: 'hex', hexLayout: layout };
    for (let x = -3; x <= 3; x++) {
      for (let y = -3; y <= 3; y++) {
        const c = { x, y };
        assert.deepEqual(axialToOffset(offsetToAxial(c, layout), layout), c);
        const ns = neighbors(grid, c);
        assert.equal(ns.length, 6);
        assert.equal(new Set(ns.map((n) => `${n.x},${n.y}`)).size, 6);
        for (const n of ns) assert.equal(cellDistance(grid, c, n), 1);
      }
    }
  });
}

test('hex distances match known values per layout', () => {
  // Moving 4 rows straight down: odd-r/even-r zig-zag, distance 4.
  assert.equal(cellDistance({ type: 'hex', hexLayout: 'odd-r' }, { x: 0, y: 0 }, { x: 0, y: 4 }), 4);
  // odd-q: (0,0) -> (3,0) crosses 3 columns; odd columns shoved down so (3,0) is 3 away.
  assert.equal(cellDistance({ type: 'hex', hexLayout: 'odd-q' }, { x: 0, y: 0 }, { x: 3, y: 0 }), 3);
  // odd-q: (1,0) is shoved down, so (0,1) and (1,0) are adjacent.
  assert.equal(cellDistance({ type: 'hex', hexLayout: 'odd-q' }, { x: 0, y: 1 }, { x: 1, y: 0 }), 1);
  // even-q: even columns shoved down, so (0,0) and (1,1) are NOT adjacent there but are in odd-q.
  assert.equal(cellDistance({ type: 'hex', hexLayout: 'odd-q' }, { x: 0, y: 0 }, { x: 1, y: 1 }), 2);
  assert.equal(cellDistance({ type: 'hex', hexLayout: 'even-q' }, { x: 0, y: 0 }, { x: 1, y: 1 }), 1);
});

test('square footprints and footprint distance for size 2', () => {
  const g = { type: 'square' };
  assert.equal(footprint(g, { x: 1, y: 1 }, 2).length, 4);
  assert.equal(footprint(g, { x: 1, y: 1 }, 0.5).length, 1);
  assert.equal(footprint(g, { x: 1, y: 1 }, 3).length, 9);
  // size-2 at (5,3) covers x 5..6, y 3..4; a size-1 at (4,5) is diagonal-adjacent.
  assert.equal(footprintDistance(g, { x: 4, y: 5 }, 1, { x: 5, y: 3 }, 2), 1);
  assert.equal(footprintDistance(g, { x: 9, y: 4 }, 1, { x: 5, y: 3 }, 2), 3);
  // hex: always one cell
  assert.equal(footprint({ type: 'hex' }, { x: 0, y: 0 }, 3).length, 1);
});
