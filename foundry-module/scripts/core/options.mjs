// Turn option generation and scoring. snapshot -> ranked, legal TurnOptions.
// No Foundry or browser globals.
//
// v1 turn shape (docs/design.md): one move, then ONE of
//   attack  - move up to Speed, then attack one target with one weapon
//   boost   - move + Boost (up to 2 x Speed) toward an enemy, no attack
//   retreat - move (+ Boost if needed, up to 2 x Speed) away / into cover
//   hide    - move up to Speed into a cell every enemy is KNOWN not to see, then Hide
//   hold    - stay put, take no action (keep cover, Brace is a reaction and is not chosen here)
//
// Legality guarantees (tested property-style in test/legality.test.mjs):
//   - the path is a chain of adjacent cells from the token's cell, never
//     entering blocked cells, enemy/neutral-occupied cells or walled steps,
//     and never ending on another token;
//   - path cost <= observed remaining movement, plus one Speed grant only
//     when a legal Boost is available (legacy fixtures default to Speed);
//   - an attack's target is within the weapon's Range/Threat from the end
//     cell, and losFrom[end][target] is KNOWN visible. Missing LOS = no attack.
//
// Statuses honoured (RULE? check against the Lancer system): STUNNED -> hold
// only; IMMOBILIZED -> no movement; SLOWED -> no Boost (retreat limited to
// Speed); IMPAIRED -> +1 difficulty on attacks; target PRONE -> +1 accuracy;
// target LOCKON -> +1 accuracy; target INVISIBLE -> 50% of hits miss; target
// EXPOSED / SHREDDED -> see hit.mjs.

import { cellKey, tokenDistance } from './grid.mjs';
import { attackDamage, hitChance } from './hit.mjs';
import { reachableCells } from './reach.mjs';
import { canSpend } from './budgets.mjs';
import {
  areEnemies, findTag, hasStatus, isDefeated, isMeleeWeapon, rangeVal, usesLeft,
} from './snapshot.mjs';

/**
 * Scoring weights. Everything is in rough "expected HP damage" units so the
 * terms compare: one point of expected damage = 1.0. Tune per world or per
 * persona by passing `weights` (shallow-merged; `cover` merged too).
 */
export const DEFAULT_WEIGHTS = Object.freeze({
  expectedDamage: 1.0,       // per point of expected HP damage
  zeroHpChance: 6,           // x probability the attack takes the target to 0 HP
  overheat: -8,              // the attack's self-heat would push past Heat Cap
  moveCost: -0.05,           // per space moved: prefer shorter paths when equal
  cover: Object.freeze({ none: 0, soft: 1, hard: 2 }), // own cover at the end cell
  inEnemyThreat: -1.5,       // per enemy whose Threat covers the end cell
  enemyInRange: -0.4,        // per enemy whose best Range/Threat reaches the end cell (LOS ignored)
  lowHpRisk: 1.0,            // defensive terms x (1 + lowHpRisk x fraction of HP missing)
  boostBase: 0.5,
  boostPerSpaceClosed: 0.4,
  retreatBase: 0,
  retreatPerSpaceGained: 0.25,
  hideBase: 1.5,
  holdBase: 0,
});

export const DEFAULT_MAX_OPTIONS = 8;

/** RULE? Default Threat of a character with no Threat weapon. */
export const DEFAULT_THREAT = 1;

const CATEGORY = { attack: 'aggressive', boost: 'reposition', retreat: 'defensive', hide: 'defensive', hold: 'defensive' };

/**
 * @typedef {object} TurnOption
 * @property {string} id                 "A", "B", ...
 * @property {{to:{x:number,y:number}, path:{x:number,y:number}[], cost:number}|null} move  null = stays put.
 * @property {{kind:'attack'|'boost'|'retreat'|'hide'|'hold', itemId?:string, mode?:'melee'|'ranged', targetTokenIds?:string[]}} action
 * @property {number} score
 * @property {'aggressive'|'defensive'|'reposition'} category
 * @property {object} facts              Numbers (and display names) for the prompt and the UI.
 */

/**
 * Generate the top TurnOptions for the snapshot's active token.
 * @param {import('./snapshot.mjs').Snapshot} snap  Should pass validateSnapshot first.
 * @param {{maxOptions?:number, weights?:object}} [opts]
 * @returns {TurnOption[]} sorted by score, best first, ids A, B, C...
 */
export function generateOptions(snap, opts = {}) {
  const all = generateCandidates(snap, opts);
  return pickTop(all, opts.maxOptions ?? DEFAULT_MAX_OPTIONS);
}

/**
 * Every deduplicated candidate (best end cell per weapon x target, per boost
 * target, one retreat, one hide, one hold), scored, unsorted, without ids.
 */
export function generateCandidates(snap, opts = {}) {
  const w = mergeWeights(opts.weights);
  const preferred = opts.compareCandidates ? (a,b) => opts.compareCandidates(finish(a),finish(b)) < 0 : better;
  const finalize = c => opts.candidateKey ? { ...finish(c), key: opts.candidateKey(finish(c)), family:c.action.kind } : finish(c);
  const me = snap.tokens.find((t) => t.id === snap.activeTokenId);
  if (!me) throw new Error(`active token "${snap.activeTokenId}" not found`);
  const grid = snap.grid;
  const enemies = snap.tokens.filter((t) => t.id !== me.id && !isDefeated(t) && areEnemies(me, t));
  const hpFrac = me.hp[1] > 0 ? Math.max(0, Math.min(1, me.hp[0] / me.hp[1])) : 1;
  const risk = 1 + w.lowHpRisk * (1 - hpFrac);
  const heatNow = me.heat ? me.heat[0] : null;
  const heatCap = me.heat ? me.heat[1] : null;

  const dist = (pos, t) => tokenDistance(grid, me, t, pos);
  const nearest = (pos) => enemies.reduce((m, e) => Math.min(m, dist(pos, e)), Infinity);
  const defense = (pos) => {
    const cover = snap.cover?.[cellKey(pos)] ?? 'none';
    let inThreat = 0;
    let inRange = 0;
    for (const e of enemies) {
      const d = dist(pos, e);
      if (d <= enemyThreat(e)) inThreat++;
      if (d <= enemyReach(e)) inRange++;
    }
    const value = (w.cover[cover] ?? 0) + w.inEnemyThreat * inThreat + w.enemyInRange * inRange;
    const near = nearest(pos);
    return {
      value,
      facts: {
        cover, inEnemyThreat: inThreat, enemiesInRange: inRange,
        nearestEnemy: Number.isFinite(near) ? near : null,
      },
    };
  };
  const heatFacts = (extra = 0) => (heatNow === null ? { heatAfter: null, heatCap: null, overheats: false }
    : { heatAfter: heatNow + extra, heatCap, overheats: heatNow + extra > heatCap }); // RULE? overheat when heat exceeds cap

  const start = { x: me.pos.x, y: me.pos.y };
  const hold = () => {
    const d = defense(start);
    return {
      key: 'hold', move: null, action: { kind: 'hold' },
      score: w.holdBase + risk * d.value,
      facts: { ...d.facts, moveCost: 0, ...heatFacts() },
    };
  };

  if (hasStatus(me, 'STUNNED')) return [finalize(hold())];

  const immobile = hasStatus(me, 'IMMOBILIZED');
  const slowed = hasStatus(me, 'SLOWED');
  const budget = snap.actionBudget;
  const quickAvailable = !budget || canSpend(budget, { quick: 1 }).ok;
  const boostAvailable = !budget || canSpend(budget, { boost: 1 }).ok;
  const speed = immobile ? 0 : Math.max(0, Math.floor(budget?.move ?? me.speed));
  const reach1 = reachableCells(snap, me.id, { ...opts.movement, maxCost: speed });
  const reach2 = slowed || immobile || !boostAvailable ? reach1
    : reachableCells(snap, me.id, { ...opts.movement, maxCost: speed + (budget?.speed ?? me.speed) });
  const toMove = (r) => (r.to.x === start.x && r.to.y === start.y ? null : { to: r.to, path: r.path, cost: r.cost });

  const out = [];
  const keep = (cand) => {
    if (opts.candidateKey) cand = { ...cand, key: opts.candidateKey(finish(cand)) };
    const prev = out.findIndex((c) => c.key === cand.key);
    if (prev === -1) out.push(cand);
    else if (preferred(cand, out[prev])) out[prev] = cand;
  };

  // --- attacks ---------------------------------------------------------------
  const weapons = quickAvailable ? (me.weapons ?? []).filter(usableWeapon) : [];
  const impaired = hasStatus(me, 'IMPAIRED');
  for (const r of reach1.values()) {
    const endKey = cellKey(r.to);
    const losRow = snap.losFrom?.[endKey];
    const def = defense(r.to);
    const engaged = enemies.some((e) => dist(r.to, e) <= 1); // RULE? engaged = adjacent to a hostile
    for (const wpn of weapons) {
      const melee = isMeleeWeapon(wpn);
      const maxRange = Math.max(rangeVal(wpn, ['range']), rangeVal(wpn, ['threat']));
      if (maxRange <= 0) continue; // Line/Cone/Burst-only patterns are not supported in v1
      const selfHeat = findTag(wpn, 'heat_self')?.val ?? 0;
      const seeking = !!findTag(wpn, 'seeking');
      for (const tgt of enemies) {
        const d = dist(r.to, tgt);
        if (d > maxRange) continue;
        const los = losRow?.[tgt.id];
        const visible = los === true || (los && typeof los === 'object' && los.visible === true);
        if (!visible) continue; // false OR unknown
        const tCover = (los && typeof los === 'object' && los.cover) || snap.cover?.[cellKey(tgt.pos)] || 'none';
        let net = Number(wpn.accuracy ?? 0);
        if (findTag(wpn, 'accurate')) net += 1;
        if (findTag(wpn, 'inaccurate')) net -= 1;
        if (impaired) net -= 1;
        if (hasStatus(tgt, 'PRONE')) net += 1;
        if (hasStatus(tgt, 'LOCKON')) net += 1;
        if (!melee && !seeking) net -= tCover === 'hard' ? 2 : tCover === 'soft' ? 1 : 0; // RULE? cover vs ranged only
        if (!melee && engaged) net -= 1;
        const useEdef = wpn.tech === true || !!findTag(wpn, 'smart'); // RULE? Smart targets E-Defense
        const defenseVal = useEdef ? tgt.edef : tgt.evasion;
        const chances = hitChance({
          target: defenseVal, net, bonus: Number(wpn.attackBonus ?? 0),
          concealment: hasStatus(tgt, 'INVISIBLE') ? 0.5 : 0,
        });
        const dmg = attackDamage({
          damage: wpn.damage, chances,
          armor: tgt.armor,
          ap: !!findTag(wpn, 'ap'),
          shredded: hasStatus(tgt, 'SHREDDED'),
          exposed: hasStatus(tgt, 'EXPOSED'),
          resistances: tgt.resistances ?? [],
          reliable: findTag(wpn, 'reliable')?.val ?? 0,
          overkill: !!findTag(wpn, 'overkill'),
          targetHp: tgt.hp[0] + (tgt.overshield ?? 0),
        });
        const heat = heatFacts(selfHeat);
        const score = w.expectedDamage * dmg.expectedDamage
          + w.zeroHpChance * dmg.zeroHpChance
          + risk * def.value
          + w.moveCost * r.cost
          + (heat.overheats ? w.overheat : 0);
        keep({
          key: `attack:${wpn.itemId}${wpn.mode ? `:${wpn.mode}` : ''}:${tgt.id}`,
          move: toMove(r),
          action: { kind: 'attack', itemId: wpn.itemId, ...(wpn.mode ? { mode: wpn.mode } : {}), targetTokenIds: [tgt.id] },
          score,
          facts: {
            weaponName: wpn.name, targetName: tgt.name, melee,
            distanceToTarget: d, range: maxRange,
            hitChance: chances.hit, critChance: chances.crit, netAccuracy: net,
            defenseType: useEdef ? 'edef' : 'evasion', targetDefense: defenseVal,
            targetCover: melee || seeking ? 'ignored' : tCover,
            expectedDamage: dmg.expectedDamage, expectedBurn: dmg.expectedBurn,
            zeroHpChance: dmg.zeroHpChance,
            targetHp: tgt.hp[0], targetHpMax: tgt.hp[1],
            ...def.facts, moveCost: r.cost, ...heat,
          },
        });
      }
    }
  }

  // --- boost toward each enemy ----------------------------------------------
  if (!slowed && !immobile) {
    for (const tgt of enemies) {
      const before = dist(start, tgt);
      let bestCand = null;
      for (const r of reach2.values()) {
        if (r.cost === 0) continue;
        const after = dist(r.to, tgt);
        if (after >= before) continue;
        const def = defense(r.to);
        const cand = {
          key: `boost:${tgt.id}`,
          move: toMove(r),
          action: { kind: 'boost', targetTokenIds: [tgt.id] },
          score: w.boostBase + w.boostPerSpaceClosed * (before - after) + risk * def.value + w.moveCost * r.cost,
          facts: {
            towardName: tgt.name, distanceBefore: before, distanceAfter: after,
            ...def.facts, moveCost: r.cost, usesBoost: r.cost > speed, ...heatFacts(),
          },
        };
        if (opts.candidateKey) keep(cand);
        else if (!bestCand || preferred(cand, bestCand)) bestCand = cand;
      }
      if (bestCand) keep(bestCand);
    }
  }

  // --- retreat --------------------------------------------------------------
  if (enemies.length && !immobile) {
    const before = nearest(start);
    const startDef = defense(start).value;
    let bestCand = null;
    for (const r of reach2.values()) {
      if (r.cost === 0) continue;
      const after = nearest(r.to);
      const def = defense(r.to);
      if (after <= before && def.value <= startDef) continue;
      const cand = {
        key: 'retreat',
        move: toMove(r),
        action: { kind: 'retreat' },
        score: w.retreatBase + w.retreatPerSpaceGained * (after - before) + risk * def.value + w.moveCost * r.cost,
        facts: { ...def.facts, distanceBefore: before, moveCost: r.cost, usesBoost: r.cost > speed, ...heatFacts() },
      };
      if (opts.candidateKey) keep(cand);
      else if (!bestCand || preferred(cand, bestCand)) bestCand = cand;
    }
    if (bestCand) keep(bestCand);
  }

  // --- hide: only where every enemy is KNOWN to lack LOS ----------------------
  if (enemies.length && quickAvailable) {
    let bestCand = null;
    for (const r of reach1.values()) {
      const row = snap.losFrom?.[cellKey(r.to)];
      if (!row) continue;
      const hidden = enemies.every((e) => row[e.id] === false || (row[e.id] && typeof row[e.id] === 'object' && row[e.id].visible === false));
      if (!hidden) continue;
      const def = defense(r.to);
      const cand = {
        key: 'hide', move: toMove(r), action: { kind: 'hide' },
        score: w.hideBase + risk * def.value + w.moveCost * r.cost,
        facts: { ...def.facts, moveCost: r.cost, ...heatFacts() },
      };
      if (opts.candidateKey) keep(cand);
      else if (!bestCand || preferred(cand, bestCand)) bestCand = cand;
    }
    if (bestCand) keep(bestCand);
  }

  keep(hold());
  return out.map(finalize);
}

function finish(c) {
  return {
    key: c.key,
    move: c.move,
    action: c.action,
    score: round(c.score, 2),
    category: CATEGORY[c.action.kind],
    facts: roundFacts(c.facts),
  };
}

/** Higher score wins; ties go to the shorter move, then the lower cell (y, x). */
function better(a, b) {
  if (Math.abs(a.score - b.score) > 1e-9) return a.score > b.score;
  const ca = a.move?.cost ?? 0;
  const cb = b.move?.cost ?? 0;
  if (ca !== cb) return ca < cb;
  const ta = a.move?.to ?? { x: -Infinity, y: -Infinity };
  const tb = b.move?.to ?? { x: -Infinity, y: -Infinity };
  if (ta.y !== tb.y) return ta.y < tb.y;
  return ta.x < tb.x;
}

function compare(a, b) {
  if (a.score !== b.score) return b.score - a.score;
  return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
}

/**
 * Keep the best option of each category (aggressive, defensive, reposition)
 * when it exists, fill up with the next best by score, sort, assign ids.
 */
export function pickTop(cands, n = DEFAULT_MAX_OPTIONS) {
  const sorted = [...cands].sort(compare);
  const picked = [];
  for (const cat of ['aggressive', 'defensive', 'reposition']) {
    const best = sorted.find((c) => c.category === cat);
    if (best && picked.length < n) picked.push(best);
  }
  for (const c of sorted) {
    if (picked.length >= n) break;
    if (!picked.includes(c)) picked.push(c);
  }
  return picked.sort(compare).map((c, i) => ({ id: optionId(i), ...c }));
}

/** 0 -> "A", 25 -> "Z", 26 -> "AA", ... */
export function optionId(i) {
  let s = '';
  let n = i;
  do {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return s;
}

export function usableWeapon(wpn) {
  if (wpn.destroyed === true) return false;
  if (wpn.loaded === false) return false;
  if (!(usesLeft(wpn) > 0)) return false;
  return true;
}

/** RULE? Threat = best Threat value among the token's usable weapons, at least DEFAULT_THREAT. */
export function enemyThreat(t) {
  let best = DEFAULT_THREAT;
  for (const w of (t.weapons ?? []).filter(usableWeapon)) best = Math.max(best, rangeVal(w, ['threat']));
  return best;
}

/** Best Range or Threat among the token's usable weapons (0 if none). */
export function enemyReach(t) {
  let best = 0;
  for (const w of (t.weapons ?? []).filter(usableWeapon)) {
    best = Math.max(best, rangeVal(w, ['range']), rangeVal(w, ['threat']));
  }
  return best;
}

function mergeWeights(over = {}) {
  return { ...DEFAULT_WEIGHTS, ...over, cover: { ...DEFAULT_WEIGHTS.cover, ...(over.cover ?? {}) } };
}

function round(v, digits) {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function roundFacts(facts) {
  const out = {};
  for (const [k, v] of Object.entries(facts)) out[k] = typeof v === 'number' ? round(v, 3) : v;
  return out;
}
