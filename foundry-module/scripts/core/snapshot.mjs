// Snapshot contract between the Foundry adapter and the pure core, plus
// validation and small normalisers the other core modules share.
// No Foundry or browser globals. See README.md in this folder.

import { HEX_LAYOUTS, SQUARE_DIAGONALS, parseKey } from './grid.mjs';
import { canSpend } from './budgets.mjs';

/**
 * @typedef {{x:number, y:number}} Cell  Grid cell, x = column, y = row.
 *
 * @typedef {object} GridInfo
 * @property {'square'|'hex'} type
 * @property {number} [size]          Pixels per cell (informational only).
 * @property {number} [distance]      Scene units per cell (informational only).
 * @property {'odd-r'|'even-r'|'odd-q'|'even-q'} [hexLayout]  Hex offset layout, default "odd-r".
 * @property {'equidistant'|'rectilinear'} [diagonals]       Square diagonal rule, default "equidistant".
 * @property {number} [width]         Optional bounds in cells; cells outside 0..width-1 are off-map.
 * @property {number} [height]
 *
 * @typedef {object} RangeEntry
 * @property {'Range'|'Threat'|'Line'|'Cone'|'Blast'|'Burst'} type
 * @property {number} val
 *
 * @typedef {object} DamageEntry
 * @property {string} type   Kinetic | Explosive | Energy | Burn | Heat | Variable
 * @property {string|number} val  Dice expression such as "1d6+2", or a number.
 *
 * @typedef {string | {id?:string, name?:string, val?:number|string}} Tag
 *   "Loading", "AP", "Reliable 2", "Heat 2 (Self)" or Lancer-system style
 *   {id: "tg_reliable", val: 2}.
 *
 * @typedef {object} Weapon
 * @property {string} itemId
 * @property {string} name
 * @property {string} [type]          "Rifle", "Melee", "Main Cannon", ...
 * @property {'melee'|'ranged'} [mode] Explicit reviewed mode; shares its source item ID.
 * @property {RangeEntry[]} range
 * @property {string|DamageEntry[]} damage  "1d6+2 Kinetic" or [{type, val}].
 * @property {number} [accuracy]      Net accuracy: positive = accuracy, negative = difficulty (tier already resolved).
 * @property {number} [attackBonus]   Flat bonus added to the d20 (NPC tier attack bonus). Default 0.
 * @property {Tag[]} [tags]
 * @property {boolean} [loaded]       false = cannot fire until reloaded. Missing = loaded.
 * @property {null|number|[number,number]} [uses]  Remaining uses (Limited); null = unlimited.
 * @property {boolean} [destroyed]
 * @property {boolean} [tech]         true = attack targets E-Defense (not used by v1 options).
 *
 * @typedef {object} Feature
 * @property {string} itemId
 * @property {string} name
 * @property {'trait'|'system'|'reaction'|'tech'|'weapon'|string} kind
 * @property {string} [text]
 *
 * @typedef {object} Token
 * @property {string} id
 * @property {string} [actorId]
 * @property {string} name
 * @property {'hostile'|'friendly'|'neutral'} side
 * @property {boolean} [isNpc]
 * @property {Cell} pos               Anchor cell (top-left of the footprint on squares).
 * @property {number} size            LANCER size: 0.5, 1, 2, 3...
 * @property {Object<string,Cell[]>} [occupiedCells] Exact native cells keyed by hypothetical anchor; missing keys are unavailable.
 * @property {string[]} [classIds]    Actual native NPC class IDs; metadata does not apply prose mechanics.
 * @property {string[]} [templateIds]
 * @property {[number,number]} hp     [current, max]
 * @property {[number,number]} [heat]
 * @property {[number,number]} [structure]
 * @property {[number,number]} [stress]
 * @property {number} [overshield]
 * @property {number} armor
 * @property {number} evasion
 * @property {number} edef
 * @property {number} speed
 * @property {number} [sensors]
 * @property {string[]} [statuses]    e.g. "IMPAIRED", "prone", "Lock On".
 * @property {string[]} [resistances] Damage types this token resists (halves).
 * @property {Weapon[]} [weapons]
 * @property {Feature[]} [features]
 * @property {string} [persona]
 * @property {boolean} [defeated]     true = wreck/dead: never a target, never an occupant (put wreck cells in `blocked` if they block).
 *
 * @typedef {boolean | {visible:boolean, cover?:'none'|'soft'|'hard'}} LosEntry
 *
 * @typedef {object} Snapshot
 * @property {number} [round]
 * @property {string} activeTokenId
 * @property {GridInfo} grid
 * @property {Token[]} tokens
 * @property {string[]} [blocked]       Cells no token can enter ("x,y").
 * @property {string[]} [blockedMoves]  Directed steps a wall blocks: "x1,y1>x2,y2".
 * @property {string[]} [blockedAnchorMoves] Whole-mover directed blockers, distinct from individual body-cell rays.
 * @property {object} [actionBudget] Remaining observed/projected pool from budgets.mjs; never an extra full-action resource.
 * @property {string[]} [difficult]     Cells that cost 2 spaces to enter.
 * @property {Object<string,'soft'|'hard'>} [cover]  Directionless cover a token in that cell enjoys.
 * @property {Object<string, Object<string, LosEntry>>} [losFrom]
 *   losFrom["x,y"][targetTokenId]: line of sight from the ACTIVE token standing
 *   with its anchor at x,y to the target. Missing = unknown (never treated as visible).
 */

export const SIDES = Object.freeze(['hostile', 'friendly', 'neutral']);
export const COVER_LEVELS = Object.freeze(['none', 'soft', 'hard']);

/** "Lock On", "lock_on", "LOCKON" -> "LOCKON". */
export function normStatus(s) {
  return String(s).toUpperCase().replace(/[^A-Z]/g, '');
}

export function hasStatus(token, name) {
  const want = normStatus(name);
  return (token.statuses ?? []).some((s) => normStatus(s) === want);
}

/**
 * Normalise a tag to {name, val}. name is lowercase with the Lancer-system
 * "tg_" prefix removed and "(self)" folded in: "Heat 2 (Self)" and
 * {id:"tg_heat_self", val:2} both become {name:"heat_self", val:2}.
 */
export function normTag(tag) {
  if (tag && typeof tag === 'object') {
    const raw = String(tag.id ?? tag.name ?? '').toLowerCase().replace(/^tg_/, '');
    const name = raw.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const val = tag.val === undefined || tag.val === null || tag.val === '' ? null : Number(tag.val);
    return { name, val: Number.isFinite(val) ? val : null };
  }
  const str = String(tag).trim().toLowerCase();
  const self = /\(\s*self\s*\)/.test(str);
  const numMatch = /(-?\d+)/.exec(str);
  const words = str.replace(/\(\s*self\s*\)/, '').replace(/-?\d+/g, '').trim();
  let name = words.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  if (self) name += '_self';
  return { name, val: numMatch ? Number(numMatch[1]) : null };
}

/** First tag with that normalised name, or null. */
export function findTag(weapon, name) {
  for (const t of weapon.tags ?? []) {
    const n = normTag(t);
    if (n.name === name) return n;
  }
  return null;
}

/** Remaining uses as a number, or Infinity when unlimited. */
export function usesLeft(weapon) {
  const u = weapon.uses;
  if (u === null || u === undefined) return Infinity;
  if (Array.isArray(u)) return Number(u[0]);
  return Number(u);
}

/** Largest value of the given range types, or 0 if none. */
export function rangeVal(weapon, types) {
  let best = 0;
  for (const r of weapon.range ?? []) {
    if (types.includes(String(r.type).toLowerCase()) && Number(r.val) > best) best = Number(r.val);
  }
  return best;
}

export function isMeleeWeapon(weapon) {
  if (/melee/i.test(String(weapon.type ?? ''))) return true;
  const hasRange = rangeVal(weapon, ['range']) > 0;
  const hasThreat = rangeVal(weapon, ['threat']) > 0;
  return hasThreat && !hasRange;
}

/** Tokens that are on opposing sides. Neutral tokens are nobody's enemy. */
export function areEnemies(a, b) {
  if (a.side === 'neutral' || b.side === 'neutral') return false;
  return a.side !== b.side;
}

/**
 * A token is out of the fight when flagged defeated, or when it has no
 * structure left. Defeated tokens are not targets; whether their wreck still
 * blocks movement is left to the adapter (put the cells in `blocked`).
 */
export function isDefeated(t) {
  if (t.defeated === true) return true;
  if (Array.isArray(t.structure) && Number(t.structure[0]) <= 0) return true;
  return false;
}

// --- validation --------------------------------------------------------------

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const isInt = (v) => Number.isInteger(v);
const isPair = (v) => Array.isArray(v) && v.length === 2 && isNum(v[0]) && isNum(v[1]);

/**
 * Check a snapshot against the contract. Errors make the snapshot unusable;
 * warnings flag data the core will ignore or approximate.
 * @param {any} snap
 * @returns {{ok:boolean, errors:{path:string,message:string}[], warnings:{path:string,message:string}[]}}
 */
export function validateSnapshot(snap) {
  const errors = [];
  const warnings = [];
  const err = (path, message) => errors.push({ path, message });
  const warn = (path, message) => warnings.push({ path, message });

  if (!snap || typeof snap !== 'object' || Array.isArray(snap)) {
    err('', 'snapshot must be an object');
    return { ok: false, errors, warnings };
  }

  if (snap.round !== undefined && !isInt(snap.round)) err('round', 'must be an integer');
  if (snap.actionBudget !== undefined && !canSpend(snap.actionBudget, {}).ok)
    err('actionBudget', 'must be a consistent observed/projection budget');

  const g = snap.grid;
  if (!g || typeof g !== 'object') {
    err('grid', 'missing');
  } else {
    if (g.type !== 'square' && g.type !== 'hex') err('grid.type', 'must be "square" or "hex"');
    if (g.type === 'hex' && g.hexLayout !== undefined && !HEX_LAYOUTS.includes(g.hexLayout)) {
      err('grid.hexLayout', `must be one of ${HEX_LAYOUTS.join(', ')}`);
    }
    if (g.type === 'hex' && g.hexLayout === undefined) {
      warn('grid.hexLayout', 'not set; assuming "odd-r"');
    }
    if (g.type === 'square' && g.diagonals !== undefined && !SQUARE_DIAGONALS.includes(g.diagonals)) {
      err('grid.diagonals', `must be one of ${SQUARE_DIAGONALS.join(', ')}`);
    }
    for (const k of ['width', 'height']) {
      if (g[k] !== undefined && !(isInt(g[k]) && g[k] > 0)) err(`grid.${k}`, 'must be a positive integer');
    }
  }

  const ids = new Set();
  if (!Array.isArray(snap.tokens)) {
    err('tokens', 'must be an array');
  } else {
    snap.tokens.forEach((t, i) => validateToken(t, `tokens[${i}]`, g, ids, err, warn));
  }

  if (typeof snap.activeTokenId !== 'string' || !snap.activeTokenId) {
    err('activeTokenId', 'missing');
  } else if (Array.isArray(snap.tokens)) {
    const active = snap.tokens.find((t) => t && t.id === snap.activeTokenId);
    if (!active) err('activeTokenId', `no token with id "${snap.activeTokenId}"`);
    else if (isDefeated(active)) err('activeTokenId', 'active token is defeated');
  }

  for (const field of ['blocked', 'difficult']) {
    const v = snap[field];
    if (v === undefined) continue;
    if (!Array.isArray(v)) { err(field, 'must be an array of "x,y" strings'); continue; }
    v.forEach((k, i) => { if (!parseKey(k)) err(`${field}[${i}]`, `bad cell key "${k}"`); });
  }

  for (const field of ['blockedMoves', 'blockedAnchorMoves']) if (snap[field] !== undefined) {
    if (!Array.isArray(snap[field])) err(field, 'must be an array of "x1,y1>x2,y2" strings');
    else snap[field].forEach((k, i) => {
      const parts = String(k).split('>');
      if (parts.length !== 2 || !parseKey(parts[0]) || !parseKey(parts[1])) err(`${field}[${i}]`, `bad step "${k}"`);
    });
  }

  if (snap.cover !== undefined) {
    if (!snap.cover || typeof snap.cover !== 'object' || Array.isArray(snap.cover)) err('cover', 'must be an object');
    else for (const [k, v] of Object.entries(snap.cover)) {
      if (!parseKey(k)) err(`cover.${k}`, 'bad cell key');
      if (!COVER_LEVELS.includes(v)) err(`cover.${k}`, 'must be "none", "soft" or "hard"');
    }
  }

  if (snap.losFrom === undefined) {
    warn('losFrom', 'missing; no attack options can be generated (LOS unknown)');
  } else if (!snap.losFrom || typeof snap.losFrom !== 'object' || Array.isArray(snap.losFrom)) {
    err('losFrom', 'must be an object keyed by "x,y"');
  } else {
    for (const [k, row] of Object.entries(snap.losFrom)) {
      if (!parseKey(k)) { err(`losFrom.${k}`, 'bad cell key'); continue; }
      if (!row || typeof row !== 'object' || Array.isArray(row)) { err(`losFrom.${k}`, 'must be an object keyed by token id'); continue; }
      for (const [tid, e] of Object.entries(row)) {
        const p = `losFrom.${k}.${tid}`;
        if (typeof e === 'boolean') continue;
        if (!e || typeof e !== 'object' || typeof e.visible !== 'boolean') err(p, 'must be a boolean or {visible, cover?}');
        else if (e.cover !== undefined && !COVER_LEVELS.includes(e.cover)) err(p, 'cover must be "none", "soft" or "hard"');
        if (ids.size && !ids.has(tid)) warn(p, 'unknown token id');
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings };
}

function validateToken(t, p, grid, ids, err, warn) {
  if (!t || typeof t !== 'object') { err(p, 'must be an object'); return; }
  if (typeof t.id !== 'string' || !t.id) err(`${p}.id`, 'missing');
  else if (ids.has(t.id)) err(`${p}.id`, `duplicate id "${t.id}"`);
  else ids.add(t.id);
  if (typeof t.name !== 'string') err(`${p}.name`, 'missing');
  if (!SIDES.includes(t.side)) err(`${p}.side`, `must be one of ${SIDES.join(', ')}`);
  if (!t.pos || !isInt(t.pos.x) || !isInt(t.pos.y)) err(`${p}.pos`, 'must be {x, y} integers (grid cells)');
  if (!isNum(t.size) || t.size <= 0) err(`${p}.size`, 'must be a positive number');
  else if (grid && grid.type === 'hex' && t.size > 1 && t.occupiedCells === undefined)
    err(`${p}.occupiedCells`, 'large hex tokens require exact native occupied cells');
  if (t.occupiedCells !== undefined) {
    const map = t.occupiedCells;
    if (!map || typeof map !== 'object' || Array.isArray(map) || !map[`${t.pos?.x},${t.pos?.y}`])
      err(`${p}.occupiedCells`, 'must include native cells at the current anchor');
    else for (const [key, cells] of Object.entries(map)) {
      const anchor = parseKey(key);
      if (!anchor || !Array.isArray(cells) || cells.length === 0 || cells.length > 256
        || Array.from(cells).some(c => !c || !isInt(c.x) || !isInt(c.y))
        || new Set(cells.map(c => `${c?.x},${c?.y}`)).size !== cells.length
        || cells[0]?.x !== anchor.x || cells[0]?.y !== anchor.y)
        err(`${p}.occupiedCells.${key}`, 'must contain distinct native cells, beginning at the declared anchor');
    }
  }
  if (!isPair(t.hp)) err(`${p}.hp`, 'must be [current, max]');
  for (const k of ['heat', 'structure', 'stress']) {
    if (t[k] !== undefined && !isPair(t[k])) err(`${p}.${k}`, 'must be [current, max]');
  }
  for (const k of ['armor', 'evasion', 'edef', 'speed']) {
    if (!isNum(t[k])) err(`${p}.${k}`, 'must be a number');
  }
  if (t.statuses !== undefined && !Array.isArray(t.statuses)) err(`${p}.statuses`, 'must be an array');
  if (t.resistances !== undefined && !Array.isArray(t.resistances)) err(`${p}.resistances`, 'must be an array');
  if (t.weapons !== undefined) {
    if (!Array.isArray(t.weapons)) err(`${p}.weapons`, 'must be an array');
    else t.weapons.forEach((w, i) => validateWeapon(w, `${p}.weapons[${i}]`, err, warn));
  }
  if (t.features !== undefined && !Array.isArray(t.features)) err(`${p}.features`, 'must be an array');
}

function validateWeapon(w, p, err, warn) {
  if (!w || typeof w !== 'object') { err(p, 'must be an object'); return; }
  if (typeof w.itemId !== 'string' || !w.itemId) err(`${p}.itemId`, 'missing');
  if (typeof w.name !== 'string') err(`${p}.name`, 'missing');
  if (!Array.isArray(w.range) || w.range.length === 0) err(`${p}.range`, 'must be a non-empty array of {type, val}');
  else w.range.forEach((r, i) => {
    if (!r || typeof r.type !== 'string' || !isNum(Number(r.val))) err(`${p}.range[${i}]`, 'must be {type, val}');
  });
  if (typeof w.damage !== 'string' && !Array.isArray(w.damage)) err(`${p}.damage`, 'must be a string or [{type, val}]');
  if (w.accuracy !== undefined && !isNum(w.accuracy)) err(`${p}.accuracy`, 'must be a number');
  if (w.attackBonus !== undefined && !isNum(w.attackBonus)) err(`${p}.attackBonus`, 'must be a number');
  if (w.tags !== undefined && !Array.isArray(w.tags)) err(`${p}.tags`, 'must be an array');
  if (w.uses !== undefined && w.uses !== null && !isNum(w.uses) && !isPair(w.uses)) err(`${p}.uses`, 'must be null, a number or [current, max]');
  if (w.loaded !== undefined && typeof w.loaded !== 'boolean') err(`${p}.loaded`, 'must be a boolean');
}
