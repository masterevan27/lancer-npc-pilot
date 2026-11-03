import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { occupiedTokenGeometry } from '../scripts/adapter/geometry.mjs';
import { translateCell, cellKey } from '../scripts/core/grid.mjs';

test('exact large-token cells and hypothetical pixels match licensed Foundry across every grid parity', {
  skip: !process.env.PILOT_FOUNDRY_CODE,
}, async () => {
  const load = p => import(pathToFileURL(resolve(process.env.PILOT_FOUNDRY_CODE, p)).href);
  Math.SQRT1_3 = 1 / Math.sqrt(3);
  const [{ default: HexGrid }, { default: SquareGrid }, { default: BaseToken }, { deepFreeze }, { polygonCentroid }] = await Promise.all([
    load('common/grid/hexagonal.mjs'), load('common/grid/square.mjs'), load('common/documents/token.mjs'),
    load('common/utils/helpers.mjs'), load('common/utils/geometry.mjs'),
  ]);
  globalThis.foundry = { utils: { deepFreeze, polygonCentroid } };
  let checked = 0, nonSquareHex = 0;
  for (const layout of ['square', 'odd-r', 'even-r', 'odd-q', 'even-q']) {
    const grid = layout === 'square' ? new SquareGrid({ size: 148, distance: 1 })
      : new HexGrid({ size: 148, distance: 1, columns: layout.endsWith('q'), even: layout.startsWith('even') });
    for (const size of [0.5, 1, 2, 3, 4]) for (let shape = 0; shape < 6; shape++) {
      const d = Object.create(BaseToken.prototype);
      for (const [key, value] of Object.entries({ parent: { grid }, width: size, height: size, elevation: 0, shape }))
        Object.defineProperty(d, key, { value, writable: true, configurable: true });
      const origin = d._gridOffsetToPosition({ i: 0, j: 0, k: 0 });
      Object.assign(d, { x: Math.round(origin.x), y: Math.round(origin.y) });
      const before = { x: d.x, y: d.y, width: d.width, height: d.height, shape: d.shape };
      const geometry = occupiedTokenGeometry({ document: d, actor: { system: { size } } }, grid);
      const coreGrid = layout === 'square' ? { type: 'square' } : { type: 'hex', hexLayout: layout };
      const originCells = geometry.cellsAt(geometry.cell);
      assert.deepEqual(geometry.cellsAt(geometry.cell), d.getOccupiedGridSpaceOffsets().map(c => ({ x: c.j, y: c.i })));
      for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
        const p = d._gridOffsetToPosition({ i: y, j: x, k: 0 });
        const pixel = { x: Math.round(p.x), y: Math.round(p.y) };
        const nativeCells = d.getOccupiedGridSpaceOffsets(pixel).map(c => ({ x: c.j, y: c.i }));
        const c = nativeCells[0];
        assert.deepEqual(geometry.positionAt(c), pixel, `${layout}/size${size}/shape${shape}/${x},${y}`);
        assert.deepEqual(geometry.cellsAt(c), nativeCells);
        assert.deepEqual(originCells.map(p => cellKey(translateCell(coreGrid, p, geometry.cell, c))).sort(),
          nativeCells.map(cellKey).sort(), 'Body-cell wall vectors must preserve the actual native shape across parity.');
        if (layout !== 'square' && size > 1 && nativeCells.length !== size * size) nonSquareHex++;
        checked++;
      }
      assert.deepEqual({ x: d.x, y: d.y, width: d.width, height: d.height, shape: d.shape }, before);
    }
  }
  assert.equal(checked, 7350); assert(nonSquareHex > 0, 'Native hex shapes must not become square blocks.');
});
