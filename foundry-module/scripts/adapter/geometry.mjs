// Foundry geometry stays at the adapter boundary. The core only sees cells.
export const PIXEL_TOLERANCE = 0.51; // v13 commits token positions as rounded pixels.
const finitePoint = p => p && Number.isFinite(p.x) && Number.isFinite(p.y);
const close = (a, b) => finitePoint(a) && finitePoint(b)
  && Math.abs(a.x - b.x) <= PIXEL_TOLERANCE && Math.abs(a.y - b.y) <= PIXEL_TOLERANCE;

export function gridInfo(scene, grid, dimensions, constants) {
  const type = scene.grid.type;
  const layouts = [['HEXODDR', 'odd-r'], ['HEXEVENR', 'even-r'], ['HEXODDQ', 'odd-q'], ['HEXEVENQ', 'even-q']];
  let geometry;
  if (type === constants.GRID_TYPES.SQUARE && scene.grid.diagonals === constants.GRID_DIAGONALS.EQUIDISTANT)
    geometry = { type: 'square', diagonals: 'equidistant' };
  else {
    const match = layouts.find(([key]) => constants.GRID_TYPES[key] !== undefined && constants.GRID_TYPES[key] === type);
    if (!match) throw Error('This adapter requires an equidistant square or supported hex grid.');
    geometry = { type: 'hex', hexLayout: match[1] };
  }
  if (typeof grid.getOffsetRange !== 'function') throw Error('Foundry grid offset-range API is unavailable.');
  const range = grid.getOffsetRange({ x: 0, y: 0, width: dimensions.width, height: dimensions.height });
  if (!Array.isArray(range) || range.length !== 4 || !range.every(Number.isInteger) || range[2] <= 0 || range[3] <= 0)
    throw Error('Cannot determine supported grid bounds.');
  return { ...geometry, size: scene.grid.size, distance: scene.grid.distance, width: range[3], height: range[2] };
}

export function tokenGeometry(token, grid) {
  const d = token.document, size = Number(token.actor.system.size ?? d.width);
  if (![0.5, 1, 2, 3, 4].includes(size) || d.width !== d.height
    || (size === 0.5 ? ![0.5, 1].includes(d.width) : d.width !== size))
    throw Error('Token dimensions must match a supported native Size ½, 1, 2, 3 or 4 footprint.');
  const geometry = occupiedTokenGeometry(token, grid);
  if (size <= 1 && geometry.cellsAt(geometry.cell).length !== 1)
    throw Error('Every token must occupy exactly one grid cell. Larger footprints need manual play.');
  return geometry;
}

/** Exact native occupancy extraction; this alone does not enable large-token execution. */
export function occupiedTokenGeometry(token, grid) {
  const d = token.document;
  for (const method of ['getCenterPoint', 'getSnappedPosition', 'getOccupiedGridSpaceOffsets', 'getSize'])
    if (typeof d[method] !== 'function') throw Error(`Foundry token geometry API ${method} is unavailable.`);
  const offsetsAt = p => {
    const offsets = d.getOccupiedGridSpaceOffsets(p);
    if (!Array.isArray(offsets) || offsets.length === 0 || offsets.length > 256
      || offsets.some(c => !Number.isInteger(c?.i) || !Number.isInteger(c?.j))
      || new Set(offsets.map(c => `${c.i},${c.j}`)).size !== offsets.length)
      throw Error('Native token occupied cells are unavailable or invalid.');
    return offsets;
  };
  // This is the first occupied cell, not Foundry's potentially unoccupied top-left anchor.
  const offset = offsetsAt()[0], cell = { x: offset.j, y: offset.i };
  const origin = { x: d.x, y: d.y }, center = d.getCenterPoint();
  const snappedOrigin = d.getSnappedPosition();
  const anchor = grid.getCenterPoint(offset), dimensions = d.getSize();
  if (!finitePoint(center) || !finitePoint(anchor) || !close(origin, snappedOrigin)
    || !Number.isFinite(dimensions.width) || !Number.isFinite(dimensions.height) || dimensions.width <= 0 || dimensions.height <= 0)
    throw Error('Snap all tokens to the grid before planning; geometry must be finite.');
  const positionAt = c => {
    // Translate between cell centers; retain a small token's position within its cell.
    const target = grid.getCenterPoint({ i: c.y, j: c.x });
    if (!finitePoint(target)) return null;
    const p = { x: Math.round(snappedOrigin.x + target.x - anchor.x), y: Math.round(snappedOrigin.y + target.y - anchor.y) };
    if (!close(p, d.getSnappedPosition(p))) return null;
    const offset = offsetsAt(p)[0];
    return offset.i === c.y && offset.j === c.x ? p : null;
  };
  return { cell, center, dimensions, positionAt,
    polygonAt: c => {
      const p = positionAt(c), polygon = d.getGridSpacePolygon?.();
      if (!p || !Array.isArray(polygon) || polygon.length < 3 || !polygon.every(finitePoint))
        throw Error('Native token polygon is unavailable; continue manually.');
      return polygon.map(v => ({ x: p.x + v.x, y: p.y + v.y }));
    },
    cellsAt: c => { const p = positionAt(c); return p ? offsetsAt(p).map(o => ({ x: o.j, y: o.i })) : null; },
    centerAt: c => { const p = positionAt(c); return p ? d.getCenterPoint(p) : null; } };
}

export function insideScene(p, dimensions, rect) {
  return p && p.x >= rect.x && p.y >= rect.y
    && p.x + dimensions.width <= rect.x + rect.width && p.y + dimensions.height <= rect.y + rect.height;
}
