import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sweptWallBlocked } from '../scripts/adapter/swept.mjs';

test('swept directional decisions agree with installed Wall methods and normal polygon origin-side filtering', {
  skip: !process.env.PILOT_FOUNDRY_CODE,
}, async () => {
  const root = process.env.PILOT_FOUNDRY_CODE;
  const load = p => import(pathToFileURL(resolve(root, p)).href);
  const [constants, { orient2dFast }, source] = await Promise.all([load('common/constants.mjs'),
    load('common/utils/geometry.mjs'), readFile(resolve(root, 'client/canvas/placeables/wall.mjs'), 'utf8')]);
  // Execute only the actual installed direction methods in memory; no source is copied to fixtures.
  const method = signature => {
    const start = source.indexOf(`  ${signature} {`); assert(start >= 0, `Native ${signature} unavailable`);
    let i = source.indexOf('{', start), depth = 1;
    while (depth && ++i < source.length) { if (source[i] === '{') depth++; else if (source[i] === '}') depth--; }
    assert.equal(depth, 0); return source.slice(start, i + 1);
  };
  const NativeDirection = new Function('CONST', `return class {${[
    method('get direction()'), method('isDirectionBetweenAngles(lower, upper)'), method('canRayIntersect(ray)'),
  ].join('\n')}}`)(constants);
  for (const coords of [[100, 0, 100, 200], [0, 100, 200, 100], [0, 0, 200, 200],
    [100, 200, 100, 0], [200, 100, 0, 100], [200, 200, 0, 0]]) {
    const [ax, ay, bx, by] = coords, length = Math.hypot(bx - ax, by - ay);
    const normal = { x: (by - ay) / length, y: -(bx - ax) / length };
    for (const sign of [-1, 1]) for (const dir of Object.values(constants.WALL_DIRECTIONS)) {
      const wall = new NativeDirection(); wall.coords = coords; wall.document = { c: coords, move: constants.WALL_MOVEMENT_TYPES.NORMAL, dir }; wall.isOpen = false;
      const origin = { x: (ax + bx) / 2 + normal.x * sign * 50, y: (ay + by) / 2 + normal.y * sign * 50 };
      const delta = { x: -normal.x * sign * 100, y: -normal.y * sign * 100 };
      const polygon = [{ x: origin.x - 10, y: origin.y - 10 }, { x: origin.x + 10, y: origin.y - 10 },
        { x: origin.x + 10, y: origin.y + 10 }, { x: origin.x - 10, y: origin.y + 10 }];
      const orientation = orient2dFast({ x: ax, y: ay }, { x: bx, y: by }, origin);
      const side = orientation < 0 ? constants.WALL_DIRECTIONS.LEFT : constants.WALL_DIRECTIONS.RIGHT;
      // ClockwiseSweepPolygon normal mode ignores a directional edge facing away from this origin.
      const expected = !dir || side !== dir;
      assert.equal(sweptWallBlocked(polygon, delta, [wall], constants.WALL_MOVEMENT_TYPES), expected,
        `${coords}/dir${dir}/sign${sign}`);
    }
  }
});
