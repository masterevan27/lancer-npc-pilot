// Reachability: every cell a token can END its movement in within a budget
// of spaces, with the path and its cost. No Foundry or browser globals.
//
// Movement rules modelled (LANCER core, check RULE? items locally):
//   - Each step to an adjacent cell costs 1 space; entering a `difficult`
//     cell costs 2 (RULE? difficult terrain = double cost).
//   - `blocked` cells can never be entered. A `blockedMoves` step
//     "x1,y1>x2,y2" (a wall between two cells, from the adapter's collision
//     test) can never be taken.
//   - Square grids, equidistant diagonals: a diagonal step that would cut the
//     corner of a `blocked` cell is refused (conservative).
//   - Allied tokens may be moved through but not ended on. Hostile AND
//     neutral tokens block movement (RULE? neutral = obstruction).
//   - Defeated tokens are ignored; the adapter puts wreck cells in `blocked`
//     if wrecks should obstruct.
//   - Native per-anchor occupied cells govern every body cell. Large hex
//     tokens without native cells are refused, never approximated.
//   - Not modelled: engagement, Disengage, reactions (Overwatch) on the way,
//     elevation, flying, teleporting, being pushed.

import { cellKey, tokenFootprint, translateCell, inBounds, neighbors, parseKey } from './grid.mjs';
import { areEnemies, isDefeated } from './snapshot.mjs';

/**
 * Precompute the lookup sets a mover needs.
 * @param {import('./snapshot.mjs').Snapshot} snap
 * @param {import('./snapshot.mjs').Token} mover
 */
export function movementContext(snap, mover) {
  const grid = snap.grid;
  const blocked = new Set(snap.blocked ?? []);
  const blockedMoves = new Set(snap.blockedMoves ?? []);
  const difficult = new Set(snap.difficult ?? []);
  /** @type {Map<string, 'ally'|'enemy'|'neutral'>} */
  const occupied = new Map();
  for (const t of snap.tokens) {
    if (t.id === mover.id || isDefeated(t)) continue;
    const kind = t.side === 'neutral' || mover.side === 'neutral'
      ? 'neutral'
      : areEnemies(mover, t) ? 'enemy' : 'ally';
    for (const c of tokenFootprint(grid, t)) {
      const k = cellKey(c);
      // An enemy/neutral claim wins over an ally claim for passability.
      if (!occupied.has(k) || kind !== 'ally') occupied.set(k, kind);
    }
  }
  return { grid, blocked, blockedMoves, blockedAnchorMoves: new Set(snap.blockedAnchorMoves ?? []), difficult, occupied, size: mover.size, mover };
}

/** Can the mover's footprint stand on (pass through) anchor `c`? */
export function canPass(ctx, c) {
  const cells = tokenFootprint(ctx.grid, ctx.mover, c);
  if (!cells.length) return false;
  for (const f of cells) {
    if (!inBounds(ctx.grid, f)) return false;
    const k = cellKey(f);
    if (ctx.blocked.has(k)) return false;
    const occ = ctx.occupied.get(k);
    if (occ === 'enemy' || occ === 'neutral') return false;
  }
  return true;
}

/** Can the mover end its movement with its anchor on `c`? */
export function canEnd(ctx, c) {
  if (!canPass(ctx, c)) return false;
  for (const f of tokenFootprint(ctx.grid, ctx.mover, c)) {
    if (ctx.occupied.has(cellKey(f))) return false;
  }
  return true;
}

/** Cost of stepping from anchor a to adjacent anchor b, or null if illegal. */
export function stepCost(ctx, a, b) {
  if (ctx.blockedAnchorMoves.has(`${cellKey(a)}>${cellKey(b)}`)) return null;
  if (!canPass(ctx, b)) return null;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const fromCells = tokenFootprint(ctx.grid, ctx.mover, a);
  for (const f of fromCells) {
    const to = translateCell(ctx.grid, f, a, b);
    if (ctx.blockedMoves.has(`${cellKey(f)}>${cellKey(to)}`)) return null;
  }
  if (ctx.grid.type === 'square' && dx !== 0 && dy !== 0) {
    // Refuse diagonal corner-cutting around blocked cells.
    for (const f of fromCells) {
      if (ctx.blocked.has(cellKey({ x: f.x + dx, y: f.y })) || ctx.blocked.has(cellKey({ x: f.x, y: f.y + dy }))) {
        return null;
      }
    }
  }
  let cost = 1;
  for (const f of tokenFootprint(ctx.grid, ctx.mover, b)) {
    if (ctx.difficult.has(cellKey(f))) { cost = 2; break; }
  }
  return cost;
}

/** Exact approved route cost, including every occupied cell and directed step. */
export function pathCost(snap, tokenId, path) {
  const mover = snap.tokens.find(t => t.id === tokenId);
  if (!mover || !Array.isArray(path) || path.length === 0
    || path[0]?.x !== mover.pos.x || path[0]?.y !== mover.pos.y) return null;
  const ctx = movementContext(snap, mover);
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    if (!b || !neighbors(snap.grid, a).some(c => c.x === b.x && c.y === b.y)) return null;
    const cost = stepCost(ctx, a, b);
    if (cost === null) return null;
    total += cost;
  }
  return canEnd(ctx, path.at(-1)) ? total : null;
}

/**
 * @typedef {object} Reach
 * @property {{x:number,y:number}} to
 * @property {{x:number,y:number}[]} path  Start cell first, `to` last.
 * @property {number} cost                 Spaces spent.
 */

/**
 * All cells the token can end on within `maxCost` spaces (default: its
 * Speed), including its own cell at cost 0. Uniform-ish costs, so a bucket
 * queue Dijkstra; neighbour order is fixed, so results are deterministic.
 * @param {import('./snapshot.mjs').Snapshot} snap
 * @param {string} tokenId
 * @param {{maxCost?:number}} [opts]
 * @returns {Map<string, Reach>} keyed by "x,y"
 */
export function reachableCells(snap, tokenId, opts = {}) {
  const mover = snap.tokens.find((t) => t.id === tokenId);
  if (!mover) throw new Error(`no token "${tokenId}"`);
  const maxCost = Math.max(0, Math.floor(opts.maxCost ?? mover.speed));
  const ctx = movementContext(snap, mover);
  const start = { x: mover.pos.x, y: mover.pos.y };
  const startKey = cellKey(start);
  const best = new Map([[startKey, 0]]);
  const parent = new Map([[startKey, null]]);
  const buckets = [[start]];
  for (let cost = 0; cost <= maxCost; cost++) {
    const bucket = buckets[cost] ?? [];
    for (let i = 0; i < bucket.length; i++) {
      const c = bucket[i];
      const k = cellKey(c);
      if (best.get(k) !== cost) continue; // stale entry
      for (const n of neighbors(ctx.grid, c)) {
        const nc = { x: n.x, y: n.y };
        const step = stepCost(ctx, c, nc);
        if (step === null) continue;
        const nCost = cost + step;
        if (nCost > maxCost) continue;
        const nk = cellKey(nc);
        if (best.has(nk) && best.get(nk) <= nCost) continue;
        best.set(nk, nCost);
        parent.set(nk, k);
        (buckets[nCost] ??= []).push(nc);
      }
    }
  }
  const out = new Map();
  for (const [k, cost] of best) {
    const to = parseKey(k);
    if (k !== startKey && !canEnd(ctx, to)) continue;
    const path = [];
    for (let cur = k; cur !== null; cur = parent.get(cur)) path.push(parseKey(cur));
    path.reverse();
    out.set(k, { to, path, cost });
  }
  return out;
}
