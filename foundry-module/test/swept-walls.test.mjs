import test from 'node:test';
import assert from 'node:assert/strict';
import { segmentEntersSweep } from '../scripts/core/swept.mjs';
import { sweptWallBlocked } from '../scripts/adapter/swept.mjs';

const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];
const wall = (c, extra = {}) => ({ document: { c, move: 20, dir: 0 }, isOpen: false, ...extra });
const types = { NONE: 0, NORMAL: 20 };

test('complete swept native polygon catches a short wall between center rays', () => {
  const body = rect(592, 592, 296, 296), delta = { x: 148, y: 0 };
  assert.equal(segmentEntersSweep({ x: 950, y: 600 }, { x: 950, y: 610 }, body, delta), true);
  assert.equal(sweptWallBlocked(body, delta, [wall([950, 600, 950, 610])], types), true);
  assert.equal(segmentEntersSweep({ x: 1036, y: 600 }, { x: 1036, y: 610 }, body, delta), false, 'Touching a final boundary does not cross its interior.');
  assert.equal(segmentEntersSweep({ x: 950, y: 888 }, { x: 950, y: 900 }, body, delta), false);
  assert.equal(segmentEntersSweep({ x: 1, y: -1e8 }, { x: 1, y: 1e8 }, rect(0, 0, 2, 2), { x: 1, y: 0 }), true,
    'A long wall must not make a short physical intersection disappear in parameter-space tolerance.');
});

test('sweeps include intermediate positions and internal seams without filling concave notches', () => {
  assert(segmentEntersSweep({ x: 450, y: 100 }, { x: 450, y: 110 }, rect(0, 0, 296, 296), { x: 600, y: 0 }));
  assert(segmentEntersSweep({ x: 296, y: 100 }, { x: 296, y: 110 }, rect(0, 0, 296, 296), { x: 296, y: 0 }));
  const l = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }];
  assert.equal(segmentEntersSweep({ x: 2.5, y: 1.3 }, { x: 2.5, y: 1.7 }, l, { x: 1, y: 0 }), false);
  assert.equal(segmentEntersSweep({ x: 1.5, y: 1.3 }, { x: 1.5, y: 1.7 }, l, { x: 1, y: 0 }), true);
});

test('axis-aligned sweeps match independent open-rectangle interval intersections', () => {
  for (const delta of [{ x: 3, y: 0 }, { x: -3, y: 0 }, { x: 0, y: 3 }, { x: 0, y: -3 }]) {
    const body = rect(0, 0, 2, 2), box = { left: Math.min(0, delta.x), right: 2 + Math.max(0, delta.x),
      top: Math.min(0, delta.y), bottom: 2 + Math.max(0, delta.y) };
    for (let x = -4; x <= 6; x++) for (let y = -4; y <= 6; y++) {
      const vertical = x > box.left && x < box.right && y + 1 > box.top && y < box.bottom;
      const horizontal = y > box.top && y < box.bottom && x + 1 > box.left && x < box.right;
      assert.equal(segmentEntersSweep({ x, y }, { x, y: y + 1 }, body, delta), vertical);
      assert.equal(segmentEntersSweep({ x, y }, { x: x + 1, y }, body, delta), horizontal);
    }
  }
});

test('native open/nonmovement/directional walls retain their own restriction decisions', () => {
  const body = rect(592, 592, 296, 296), delta = { x: 148, y: 0 }, c = [950, 600, 950, 610];
  assert.equal(sweptWallBlocked(body, delta, [wall(c, { isOpen: true })], types), false);
  assert.equal(sweptWallBlocked(body, delta, [{ document: { c, move: 0, dir: 0 } }], types), false);
  const directional = wall(c); directional.document.dir = 1;
  directional.canRayIntersect = ray => Math.abs(ray.angle) < 0.1;
  assert.equal(sweptWallBlocked(body, delta, [directional], types), true);
  directional.canRayIntersect = () => false;
  assert.equal(sweptWallBlocked(body, delta, [directional], types), false);
  delete directional.canRayIntersect;
  assert.equal(sweptWallBlocked(body, delta, [directional], types), true, 'Unverified direction fails closed.');
});
