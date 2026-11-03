import { segmentEntersSweep } from '../core/swept.mjs';

/** Native wall objects own door/direction decisions; unknown restrictions block. */
export function sweptWallBlocked(polygon, delta, walls, movementTypes) {
  if (!Array.isArray(walls)) throw Error('Native wall geometry is unavailable; continue manually.');
  if (!walls.length) return false;
  if (!movementTypes || movementTypes.NONE === undefined || movementTypes.NORMAL === undefined)
    throw Error('Native wall movement constants are unavailable; continue manually.');
  for (const wall of walls) {
    const d = wall.document;
    if (d?.move === movementTypes.NONE || wall.isOpen === true) continue;
    if (!Array.isArray(d?.c) || d.c.length !== 4 || !d.c.every(Number.isFinite))
      throw Error('Native wall segment is unavailable; continue manually.');
    if (!segmentEntersSweep({ x: d.c[0], y: d.c[1] }, { x: d.c[2], y: d.c[3] }, polygon, delta)) continue;
    if (d.move !== movementTypes.NORMAL) return true;
    if (d.dir === 0) return true;
    if (![1, 2].includes(d.dir) || typeof wall.canRayIntersect !== 'function') return true;
    if (wall.canRayIntersect({ angle: Math.atan2(delta.y, delta.x) }) !== false) return true;
  }
  return false;
}
