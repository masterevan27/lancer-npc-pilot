import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { environment } from './adapter.test.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';
import { tokenDistance, neighbors, cellKey } from '../scripts/core/grid.mjs';
import { reachableCells } from '../scripts/core/reach.mjs';
import { collectCarryGeometry } from '../scripts/adapter/carry-geometry.mjs';

test('large native documents feed exact snapshot footprints, range and swept wall checks', {
  skip: !process.env.PILOT_FOUNDRY_CODE,
}, async () => {
  const load = p => import(pathToFileURL(resolve(process.env.PILOT_FOUNDRY_CODE, p)).href);
  Math.SQRT1_3 = 1 / Math.sqrt(3);
  const [{ default: HexGrid }, { default: SquareGrid }, { default: BaseToken }, { deepFreeze }, { polygonCentroid }] = await Promise.all([
    load('common/grid/hexagonal.mjs'), load('common/grid/square.mjs'), load('common/documents/token.mjs'),
    load('common/utils/helpers.mjs'), load('common/utils/geometry.mjs'),
  ]);
  globalThis.foundry = { utils: { deepFreeze, polygonCentroid } };
  const types = { SQUARE: 1, HEXODDR: 2, HEXEVENR: 3, HEXODDQ: 4, HEXEVENQ: 5 };
  for (const [type, layout] of [[1, 'square'], [2, 'odd-r'], [3, 'even-r'], [4, 'odd-q'], [5, 'even-q']]) {
    for (const size of [2, 3, 4]) {
      const env = environment(), active = env.canvas.tokens.placeables[0];
      const grid = layout === 'square' ? new SquareGrid({ size: 148, distance: 1 })
        : new HexGrid({ size: 148, distance: 1, columns: layout.endsWith('q'), even: layout.startsWith('even') });
      env.canvas.grid = grid; env.constants.GRID_TYPES = types;
      env.canvas.walls = { placeables: [] };
      env.constants.WALL_MOVEMENT_TYPES = { NONE: 0, NORMAL: 20 };
      Object.assign(env.canvas.scene.grid, { type, size: 148 });
      env.canvas.dimensions = { width: 3500, height: 3500, sceneRect: { x: 0, y: 0, width: 3500, height: 3500 } };
      for (const [index, t] of env.canvas.tokens.placeables.entries()) {
        const d = Object.create(BaseToken.prototype), n = size;
        for (const [key, value] of Object.entries({ parent: { grid }, width: n, height: n, shape: 0, elevation: 0,
          disposition: index ? 1 : -1 })) Object.defineProperty(d, key, { value, writable: true, configurable: true });
        const p = d._gridOffsetToPosition({ i: 4 + index * 9, j: 4 + index * 9, k: 0 });
        Object.assign(d, { x: Math.round(p.x), y: Math.round(p.y) });
        d.toObject = () => ({ x: d.x, y: d.y, width: d.width, height: d.height, elevation: 0, shape: d.shape });
        t.document = d; t.actor.system.size = n;
      }
      const queries = [];
      active.checkCollision = (p, o) => { queries.push(`${o.type}:${o.origin.x},${o.origin.y}>${p.x},${p.y}`); return false; };
      const b = extractSnapshot(env), mover = b.snapshot.tokens[0], target = b.snapshot.tokens[1];
      assert.equal(new Set(queries).size, queries.length, 'Identical native rays should be queried only once per synchronous snapshot.');
      const nativeCells = active.document.getOccupiedGridSpaceOffsets().map(c => ({ x: c.j, y: c.i }));
      assert.deepEqual(mover.occupiedCells[cellKey(mover.pos)], nativeCells);
      const targetNative = env.canvas.tokens.placeables[1].document.getOccupiedGridSpaceOffsets().map(c => ({ x: c.j, y: c.i }));
      assert.deepEqual(target.occupiedCells[cellKey(target.pos)], targetNative);
      assert(Number.isFinite(tokenDistance(b.snapshot.grid, mover, target)));
      const nativeTarget=env.canvas.tokens.placeables[1],targetBefore=JSON.stringify(nativeTarget.document.toObject());
      const carry=collectCarryGeometry(env,b.snapshot);
      for(const [key,position] of Object.entries(carry.positions[target.id])){
        const actual=nativeTarget.document.getOccupiedGridSpaceOffsets(position).map(c=>({x:c.j,y:c.i}));
        assert.equal(cellKey(actual[0]),key);
        assert.deepEqual(target.occupiedCells[key],actual);
      }
      assert.equal(JSON.stringify(nativeTarget.document.toObject()),targetBefore);
      for (const entry of reachableCells(b.snapshot, mover.id).values()) {
        const native = active.document.getOccupiedGridSpaceOffsets(b.positions[cellKey(entry.to)]).map(c => ({ x: c.j, y: c.i }));
        assert.deepEqual(mover.occupiedCells[cellKey(entry.to)], native);
      }
      const targetTail = targetNative.at(-1), visibleEnd = grid.getCenterPoint({ i: targetTail.y, j: targetTail.x });
      active.checkCollision = (point, options) => options.type === 'sight'
        && !(Math.abs(point.x - visibleEnd.x) < 0.01 && Math.abs(point.y - visibleEnd.y) < 0.01);
      assert.equal(extractSnapshot(env).snapshot.losFrom[cellKey(mover.pos)].pc, true,
        `${layout}/Size${size}: a visible occupied target cell must supply LOS`);
      if (layout === 'square' && size === 2) {
        active.checkCollision = () => false; // All center rays miss this short native wall segment.
        env.canvas.walls.placeables.push({ document: { c: [950, 600, 950, 610], move: 20, dir: 0 }, isOpen: false });
        assert(!reachableCells(extractSnapshot(env).snapshot, mover.id).has('5,4'));
        env.canvas.walls.placeables.length = 0;
      }
      // Block a trailing body's ray while the center ray remains clear.
      const to = neighbors(b.snapshot.grid, mover.pos)[0];
      const tail = nativeCells.at(-1), tailCenter = grid.getCenterPoint({ i: tail.y, j: tail.x });
      let bodyRays = 0;
      active.checkCollision = (_destination, options) => {
        if (options.type === 'move' && Math.abs(options.origin.x - tailCenter.x) < 0.01
          && Math.abs(options.origin.y - tailCenter.y) < 0.01) { bodyRays++; return true; }
        return false;
      };
      const blocked = extractSnapshot(env);
      assert(bodyRays > 0, `${layout}/Size${size}: every occupied cell needs a swept native test`);
      assert(!reachableCells(blocked.snapshot, mover.id).has(cellKey(to)));
    }
  }
});
