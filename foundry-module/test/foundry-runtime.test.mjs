// Optional conformance check against a licensed local Foundry installation.
// No Foundry code is distributed by this project.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { neighbors, cellDistance } from '../scripts/core/grid.mjs';
import { tokenGeometry } from '../scripts/adapter/geometry.mjs';

test('Foundry v13 public geometry agrees with all offset layouts and token pixel waypoints', {
  skip: !process.env.PILOT_FOUNDRY_CODE,
}, async () => {
  const load = p => import(pathToFileURL(resolve(process.env.PILOT_FOUNDRY_CODE, p)).href);
  Math.SQRT1_3 = 1 / Math.sqrt(3); // Normally installed by Foundry's Math extensions.
  const [{ default: HexGrid }, { default: SquareGrid }, { default: BaseToken }, { deepFreeze }] = await Promise.all([
    load('common/grid/hexagonal.mjs'), load('common/grid/square.mjs'), load('common/documents/token.mjs'), load('common/utils/helpers.mjs'),
  ]);
  globalThis.foundry = { utils: { deepFreeze } }; // Token shape cache's documented source dependency.
  for (const layout of ['odd-r', 'even-r', 'odd-q', 'even-q', 'square']) {
    const grid = layout === 'square' ? new SquareGrid({ size: 148, distance: 1 })
      : new HexGrid({ size: 148, distance: 1, columns: layout.endsWith('q'), even: layout.startsWith('even') });
    for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
      const core = layout === 'square' ? { type: 'square' } : { type: 'hex', hexLayout: layout };
      assert.deepEqual(neighbors(core, { x, y }).map(c => `${c.y},${c.x}`).sort(),
        grid.getAdjacentOffsets({ i: y, j: x }).map(c => `${c.i},${c.j}`).sort());
      for (const size of [0.5, 1]) {
        const d = Object.create(BaseToken.prototype);
        for (const [key, value] of Object.entries({ parent: { grid }, width: size, height: size, elevation: 0, shape: 0 }))
          Object.defineProperty(d, key, { value, writable: true, configurable: true });
        const p = d._gridOffsetToPosition({ i: y, j: x, k: 0 });
        Object.assign(d, { x: Math.round(p.x), y: Math.round(p.y) });
        const geometry = tokenGeometry({ document: d, actor: { system: { size } } }, grid);
        assert.deepEqual(geometry.cell, { x, y });
        for (const c of neighbors(core, { x, y })) {
          assert.equal(cellDistance(core, { x, y }, c), 1);
          const actual = d._gridOffsetToPosition({ i: c.y, j: c.x, k: 0 });
          const planned = geometry.positionAt(c);
          assert(planned && planned.x === Math.round(actual.x) && planned.y === Math.round(actual.y));
        }
      }
    }
  }
});
