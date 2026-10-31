// Test/fixture helper, NOT part of the core: a simple cell-based line-of-sight
// stand-in for what the Foundry adapter will compute with real wall
// collision. A line from cell centre to cell centre is blocked when it passes
// through any `blocked` cell other than its two end cells.

import { axialToOffset, cellDistance, cellKey, footprint, offsetToAxial } from '../scripts/core/grid.mjs';

function squareLine(a, b) {
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) * 4));
  const cells = new Map();
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Tiny nudge so lines exactly through corners resolve consistently.
    const x = Math.round(a.x + (b.x - a.x) * t + 1e-6);
    const y = Math.round(a.y + (b.y - a.y) * t + 1e-6);
    cells.set(`${x},${y}`, { x, y });
  }
  return [...cells.values()];
}

function hexLine(grid, a, b) {
  const layout = grid.hexLayout ?? 'odd-r';
  const A = offsetToAxial(a, layout);
  const B = offsetToAxial(b, layout);
  const n = cellDistance(grid, a, b);
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = n === 0 ? 0 : i / n;
    const q = A.q + (B.q - A.q) * t + 1e-6;
    const r = A.r + (B.r - A.r) * t + 1e-6;
    const s = -q - r - 2e-6;
    let rq = Math.round(q); let rr = Math.round(r); const rs = Math.round(s);
    const dq = Math.abs(rq - q); const dr = Math.abs(rr - r); const ds = Math.abs(rs - s);
    if (dq > dr && dq > ds) rq = -rr - rs; else if (dr > ds) rr = -rq - rs;
    out.push(axialToOffset({ q: rq, r: rr }, layout));
  }
  return out;
}

export function lineCells(grid, a, b) {
  return grid.type === 'hex' ? hexLine(grid, a, b) : squareLine(a, b);
}

/** Cell-to-cell LOS ignoring tokens (tokens do not block LOS in LANCER). */
export function cellLos(grid, blockedSet, a, b) {
  for (const c of lineCells(grid, a, b)) {
    if ((c.x === a.x && c.y === a.y) || (c.x === b.x && c.y === b.y)) continue;
    if (blockedSet.has(cellKey(c))) return false;
  }
  return true;
}

/** LOS from any cell of the mover's footprint at `pos` to any cell of the target's. */
export function tokenLos(grid, blockedSet, pos, size, target) {
  for (const a of footprint(grid, pos, size)) {
    for (const b of footprint(grid, target.pos, target.size)) {
      if (cellLos(grid, blockedSet, a, b)) return true;
    }
  }
  return false;
}
