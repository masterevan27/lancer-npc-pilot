// Grid geometry for the pure core: cell keys, neighbours, distances and token
// footprints on square and hex grids. No Foundry or browser globals.
//
// Coordinates are grid CELLS, not pixels: {x: column, y: row}, integers,
// origin wherever the adapter puts it (negative values are allowed).
//
// Square grids
//   diagonals: "equidistant" (default; a diagonal step costs 1 space, i.e.
//              Chebyshev distance) or "rectilinear" (4-way movement only,
//              Manhattan distance). LANCER rules assumption, see README:
//              the core rules count spaces with diagonals as 1.
//
// Hex grids use OFFSET coordinates. The layout is a parameter,
// `grid.hexLayout`, one of:
//   "odd-r"  pointy-top hexes, rows offset, odd rows shoved right (DEFAULT)
//   "even-r" pointy-top hexes, rows offset, even rows shoved right
//   "odd-q"  flat-top hexes, columns offset, odd columns shoved down
//   "even-q" flat-top hexes, columns offset, even columns shoved down
// (Red Blob Games naming.) Foundry v13 names these HEXODDR, HEXEVENR,
// HEXODDQ and HEXEVENQ; the adapter must map Foundry's {i: row, j: column}
// offsets to {x: j, y: i} and verify the parity against a live scene.

export const HEX_LAYOUTS = Object.freeze(['odd-r', 'even-r', 'odd-q', 'even-q']);
export const DEFAULT_HEX_LAYOUT = 'odd-r';
export const SQUARE_DIAGONALS = Object.freeze(['equidistant', 'rectilinear']);

/** @param {{x:number,y:number}} c */
export function cellKey(c) {
  return `${c.x},${c.y}`;
}

/** @param {string} key  "x,y" */
export function parseKey(key) {
  const m = /^\s*(-?\d+)\s*,\s*(-?\d+)\s*$/.exec(String(key));
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]) };
}

export function sameCell(a, b) {
  return a.x === b.x && a.y === b.y;
}

function layoutOf(grid) {
  return grid.hexLayout ?? DEFAULT_HEX_LAYOUT;
}

// --- hex offset <-> axial --------------------------------------------------
// `& 1` on negative integers in JS is two's complement, so (-1 & 1) === 1,
// which is exactly what the offset formulas need.

export function offsetToAxial(c, layout = DEFAULT_HEX_LAYOUT) {
  const { x, y } = c;
  switch (layout) {
    case 'odd-r': return { q: x - (y - (y & 1)) / 2, r: y };
    case 'even-r': return { q: x - (y + (y & 1)) / 2, r: y };
    case 'odd-q': return { q: x, r: y - (x - (x & 1)) / 2 };
    case 'even-q': return { q: x, r: y - (x + (x & 1)) / 2 };
    default: throw new Error(`unknown hex layout "${layout}"`);
  }
}

export function axialToOffset(a, layout = DEFAULT_HEX_LAYOUT) {
  const { q, r } = a;
  switch (layout) {
    case 'odd-r': return { x: q + (r - (r & 1)) / 2, y: r };
    case 'even-r': return { x: q + (r + (r & 1)) / 2, y: r };
    case 'odd-q': return { x: q, y: r + (q - (q & 1)) / 2 };
    case 'even-q': return { x: q, y: r + (q + (q & 1)) / 2 };
    default: throw new Error(`unknown hex layout "${layout}"`);
  }
}

const AXIAL_DIRS = [
  { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
];
const SQUARE_ORTHO = [{ x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }];
const SQUARE_DIAG = [{ x: 1, y: -1 }, { x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 }];

/**
 * Adjacent cells in a fixed, deterministic order.
 * @returns {{x:number,y:number,diagonal?:boolean}[]}
 */
export function neighbors(grid, c) {
  if (grid.type === 'hex') {
    const layout = layoutOf(grid);
    const a = offsetToAxial(c, layout);
    return AXIAL_DIRS.map((d) => axialToOffset({ q: a.q + d.q, r: a.r + d.r }, layout));
  }
  const out = SQUARE_ORTHO.map((d) => ({ x: c.x + d.x, y: c.y + d.y }));
  if ((grid.diagonals ?? 'equidistant') === 'equidistant') {
    for (const d of SQUARE_DIAG) out.push({ x: c.x + d.x, y: c.y + d.y, diagonal: true });
  }
  return out;
}

/** Distance in spaces between two cells. */
export function cellDistance(grid, a, b) {
  if (grid.type === 'hex') {
    const layout = layoutOf(grid);
    const p = offsetToAxial(a, layout);
    const q = offsetToAxial(b, layout);
    const dq = p.q - q.q;
    const dr = p.r - q.r;
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
  }
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return (grid.diagonals ?? 'equidistant') === 'rectilinear' ? dx + dy : Math.max(dx, dy);
}

/**
 * Side length in cells of a token's square footprint. LANCER sizes 1/2 and 1
 * take one cell, size 2 a 2x2 block, size 3 a 3x3 block, and so on.
 * Large hex tokens require tokenFootprint's exact native per-anchor cells.
 */
export function footprintSide(grid, size) {
  if (grid.type === 'hex') {
    if (size > 1) throw Error('Large hex tokens require native occupied cells.');
    return 1;
  }
  return Math.max(1, Math.ceil(Number(size) || 1));
}

/** Cells covered by a token whose anchor (top-left on squares) is `pos`. */
export function footprint(grid, pos, size) {
  const n = footprintSide(grid, size);
  if (n === 1) return [{ x: pos.x, y: pos.y }];
  const cells = [];
  for (let dy = 0; dy < n; dy++) {
    for (let dx = 0; dx < n; dx++) cells.push({ x: pos.x + dx, y: pos.y + dy });
  }
  return cells;
}

/** Shortest distance between any cell of footprint A and any of footprint B. */
export function footprintDistance(grid, posA, sizeA, posB, sizeB) {
  const fa = footprint(grid, posA, sizeA);
  const fb = footprint(grid, posB, sizeB);
  let best = Infinity;
  for (const a of fa) {
    for (const b of fb) {
      const d = cellDistance(grid, a, b);
      if (d < best) best = d;
    }
  }
  return best;
}

/** Native per-anchor occupancy wins; a missing native candidate is unavailable. */
export function tokenFootprint(grid, token, pos = token.pos) {
  if (token.occupiedCells !== undefined) return token.occupiedCells[cellKey(pos)] ?? [];
  if (grid.type === 'hex' && token.size > 1) throw Error('Large hex tokens require native occupied cells.');
  return footprint(grid, pos, token.size);
}

export function tokenDistance(grid, a, b, posA = a.pos, posB = b.pos) {
  let best = Infinity;
  for (const ca of tokenFootprint(grid, a, posA)) for (const cb of tokenFootprint(grid, b, posB))
    best = Math.min(best, cellDistance(grid, ca, cb));
  return best;
}

/** Translate a body cell by an anchor's grid vector, preserving hex parity. */
export function translateCell(grid, cell, from, to) {
  if (grid.type !== 'hex') return { x: cell.x + to.x - from.x, y: cell.y + to.y - from.y };
  const layout = layoutOf(grid), c = offsetToAxial(cell, layout), a = offsetToAxial(from, layout), b = offsetToAxial(to, layout);
  return axialToOffset({ q: c.q + b.q - a.q, r: c.r + b.r - a.r }, layout);
}

/** True when the cell lies inside optional grid bounds (width/height in cells). */
export function inBounds(grid, c) {
  if (Number.isInteger(grid.width) && (c.x < 0 || c.x >= grid.width)) return false;
  if (Number.isInteger(grid.height) && (c.y < 0 || c.y >= grid.height)) return false;
  return true;
}
