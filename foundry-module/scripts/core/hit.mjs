// Exact LANCER attack math: hit/crit probability and damage distributions.
// Computed by enumeration of exact distributions, never by sampling.
// No Foundry or browser globals.
//
// Rules this file assumes. Anything marked RULE? is an interpretation the
// local adapter session should check against the core book and the Lancer
// system's own roll code before trusting the numbers.
//   - Attack roll: 1d20 + flat bonus + (highest of N d6 if net accuracy N > 0,
//     minus highest of N d6 if net difficulty N > 0). Hit if total >= target
//     (Evasion, or E-Defense for tech/Smart).
//   - Critical hit: a hit whose total is 20 or more.
//   - RULE? No natural-1 auto-miss and no natural-20 auto-hit.
//   - RULE? Crit damage: every damage source is rolled twice and the higher
//     result of each source is kept. Here a "source" is one typed damage
//     entry (e.g. the whole "1d6+2 Kinetic"), flat bonuses included.
//   - RULE? Armor is subtracted once from the total of non-Burn, non-Heat
//     damage. AP and a SHREDDED target ignore it.
//   - RULE? Resistance halves damage of that type, applied per entry BEFORE
//     armor, rounded with ROUND_HALF (up). SHREDDED ignores resistance.
//   - RULE? EXPOSED doubles Kinetic, Explosive and Energy damage (before
//     armor and resistance).
//   - RULE? Reliable X: a miss deals X; a hit deals at least X (before armor).
//   - RULE? Overkill: damage dice showing 1 are rerolled, so each die is
//     uniform over 2..n. The heat Overkill deals to the attacker is ignored.
//   - Burn and Heat are reported separately and never count toward HP damage
//     or the zero-HP chance.

export const ROUND_HALF = Math.ceil; // RULE? LANCER rounding direction for halved damage.
export const CRIT_THRESHOLD = 20;
export const HP_EXEMPT_TYPES = Object.freeze(['burn', 'heat']);
export const EXPOSED_TYPES = Object.freeze(['kinetic', 'explosive', 'energy']);

// --- exact discrete distributions ------------------------------------------
// A distribution is {min, p}: p[i] is the probability of value min + i.

export function point(v) {
  return { min: v, p: [1] };
}

export function uniform(lo, hi) {
  const n = hi - lo + 1;
  return { min: lo, p: new Array(n).fill(1 / n) };
}

export function convolve(a, b) {
  const p = new Array(a.p.length + b.p.length - 1).fill(0);
  for (let i = 0; i < a.p.length; i++) {
    if (!a.p[i]) continue;
    for (let j = 0; j < b.p.length; j++) p[i + j] += a.p[i] * b.p[j];
  }
  return { min: a.min + b.min, p };
}

/** Apply f to every value; f must return integers. */
export function mapDist(d, f) {
  const acc = new Map();
  d.p.forEach((pr, i) => {
    if (!pr) return;
    const v = f(d.min + i);
    acc.set(v, (acc.get(v) ?? 0) + pr);
  });
  const keys = [...acc.keys()];
  const min = Math.min(...keys);
  const max = Math.max(...keys);
  const p = new Array(max - min + 1).fill(0);
  for (const [v, pr] of acc) p[v - min] += pr;
  return { min, p };
}

/** Distribution of max(X1, X2) for two independent copies of d. */
export function maxOfTwo(d) {
  const p = new Array(d.p.length).fill(0);
  let cdfPrev = 0;
  for (let i = 0; i < d.p.length; i++) {
    const cdf = cdfPrev + d.p[i];
    p[i] = cdf * cdf - cdfPrev * cdfPrev;
    cdfPrev = cdf;
  }
  return { min: d.min, p };
}

export function mean(d) {
  return d.p.reduce((s, pr, i) => s + pr * (d.min + i), 0);
}

/** P(X >= v). */
export function probAtLeast(d, v) {
  let s = 0;
  d.p.forEach((pr, i) => { if (d.min + i >= v) s += pr; });
  return s;
}

// --- attack roll -----------------------------------------------------------

/** P(highest of n d6 equals k), k = 1..6. */
export function highestD6(n, k) {
  if (n <= 0) return k === 0 ? 1 : 0;
  return (k ** n - (k - 1) ** n) / 6 ** n;
}

/** P(1d20 >= t). */
function d20AtLeast(t) {
  return Math.min(1, Math.max(0, (21 - t) / 20));
}

/**
 * Exact hit and crit chance of a LANCER attack roll.
 * @param {object} a
 * @param {number} a.target         Evasion or E-Defense.
 * @param {number} [a.net=0]        Net accuracy (+) or difficulty (-), in dice.
 * @param {number} [a.bonus=0]      Flat bonus added to the d20.
 * @param {number} [a.concealment=0] Chance a would-be hit misses anyway (0.5 for INVISIBLE; RULE?).
 * @returns {{hit:number, crit:number, miss:number}}  crit is included in hit.
 */
export function hitChance({ target, net = 0, bonus = 0, concealment = 0 }) {
  const n = Math.abs(Math.trunc(net));
  const sign = net > 0 ? 1 : -1;
  let hit = 0;
  let crit = 0;
  const outcomes = n === 0 ? [[0, 1]] : [1, 2, 3, 4, 5, 6].map((k) => [sign * k, highestD6(n, k)]);
  for (const [mod, pr] of outcomes) {
    hit += pr * d20AtLeast(target - bonus - mod);
    crit += pr * d20AtLeast(Math.max(target, CRIT_THRESHOLD) - bonus - mod);
  }
  const keep = 1 - concealment;
  hit *= keep;
  crit *= keep;
  return { hit, crit, miss: 1 - hit };
}

// --- damage parsing --------------------------------------------------------

/**
 * Parse damage into typed entries.
 * Accepts "1d6+2 Kinetic", "2d6 + 1d3 + 1 Explosive", "1d6 Kinetic + 2 Burn",
 * "d3", "5", or Lancer-system style [{type:"Kinetic", val:"1d6+2"}].
 * Untyped terms take the type of the next typed term (or the previous one if
 * nothing follows); a string with no type at all is "Variable".
 * @returns {{type:string, terms:({sign:number,count:number,sides:number}|{sign:number,flat:number})[]}[]}
 */
export function parseDamage(input) {
  if (Array.isArray(input)) {
    return input.flatMap((e) => parseDamage(`${e.val} ${e.type ?? ''}`));
  }
  if (typeof input === 'number') return [{ type: 'Variable', terms: [{ sign: 1, flat: input }] }];
  const str = String(input ?? '').toLowerCase();
  const re = /([+-])?\s*(?:(\d*)d(\d+)|(\d+))\s*(kinetic|explosive|energy|burn|heat|variable)?/g;
  const raw = [];
  let m;
  while ((m = re.exec(str)) !== null) {
    const sign = m[1] === '-' ? -1 : 1;
    const term = m[3] !== undefined
      ? { sign, count: m[2] === '' ? 1 : Number(m[2]), sides: Number(m[3]) }
      : { sign, flat: Number(m[4]) };
    raw.push({ term, type: m[5] ?? null });
  }
  // Back-fill types from the next typed term, then forward-fill leftovers.
  let next = null;
  for (let i = raw.length - 1; i >= 0; i--) {
    if (raw[i].type) next = raw[i].type; else raw[i].type = next;
  }
  let prev = null;
  for (const r of raw) { if (r.type) prev = r.type; else r.type = prev; }
  const entries = [];
  for (const r of raw) {
    const type = r.type ? cap(r.type) : 'Variable';
    let e = entries.find((x) => x.type === type);
    if (!e) { e = { type, terms: [] }; entries.push(e); }
    e.terms.push(r.term);
  }
  return entries;
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Exact roll distribution of one parsed entry. */
export function entryDist(entry, { overkill = false } = {}) {
  let d = point(0);
  for (const t of entry.terms) {
    let td;
    if ('flat' in t) {
      td = point(t.sign * t.flat);
    } else {
      const lo = overkill && t.sides > 1 ? 2 : 1;
      td = point(0);
      for (let i = 0; i < t.count; i++) td = convolve(td, uniform(lo, t.sides));
      if (t.sign < 0) td = mapDist(td, (v) => -v);
    }
    d = convolve(d, td);
  }
  return mapDist(d, (v) => Math.max(0, v));
}

/** Average of a damage expression with no armor, hit or crit (e.g. "1d6+2" -> 5.5). */
export function averageDamage(input) {
  return parseDamage(input).reduce((s, e) => s + mean(entryDist(e)), 0);
}

// --- damage against a target -----------------------------------------------

/**
 * Damage distributions for a given outcome.
 * @returns {{hp:object, burn:object, heat:object}} distributions
 */
export function outcomeDamage(entries, opts, outcome) {
  const {
    armor = 0, ap = false, shredded = false, exposed = false,
    resistances = [], reliable = 0, overkill = false,
  } = opts;
  const resist = new Set(resistances.map((r) => String(r).toLowerCase()));
  let hp = point(0);
  let burn = point(0);
  let heat = point(0);

  if (outcome === 'miss') {
    if (reliable > 0) {
      const raw = point(reliable);
      hp = mapDist(raw, (v) => Math.max(0, v - (ap || shredded ? 0 : armor)));
    }
    return { hp, burn, heat };
  }

  for (const e of entries) {
    const type = e.type.toLowerCase();
    let d = entryDist(e, { overkill });
    if (outcome === 'crit') d = maxOfTwo(d);
    if (exposed && EXPOSED_TYPES.includes(type)) d = mapDist(d, (v) => v * 2);
    if (resist.has(type) && !shredded) d = mapDist(d, (v) => ROUND_HALF(v / 2));
    if (type === 'burn') burn = convolve(burn, d);
    else if (type === 'heat') heat = convolve(heat, d);
    else hp = convolve(hp, d);
  }
  if (reliable > 0) hp = mapDist(hp, (v) => Math.max(v, reliable));
  const effArmor = ap || shredded ? 0 : armor;
  if (effArmor > 0) hp = mapDist(hp, (v) => Math.max(0, v - effArmor));
  return { hp, burn, heat };
}

/**
 * Expected damage of one attack against one target, plus the chance it
 * takes the target to 0 HP (i.e. at least one structure damage).
 * @param {object} a
 * @param {string|object[]} a.damage
 * @param {{hit:number, crit:number}} a.chances   From hitChance().
 * @param {number} [a.armor=0]
 * @param {boolean} [a.ap]
 * @param {boolean} [a.shredded]
 * @param {boolean} [a.exposed]
 * @param {string[]} [a.resistances]
 * @param {number} [a.reliable=0]
 * @param {boolean} [a.overkill]
 * @param {number} [a.targetHp]       Current HP + overshield; enables zeroHpChance.
 * @returns {{expectedDamage:number, expectedBurn:number, expectedHeat:number, zeroHpChance:number|null}}
 */
export function attackDamage(a) {
  const entries = parseDamage(a.damage);
  const pCrit = a.chances.crit;
  const pHit = a.chances.hit - pCrit;
  const pMiss = 1 - a.chances.hit;
  const res = { expectedDamage: 0, expectedBurn: 0, expectedHeat: 0, zeroHpChance: a.targetHp === undefined ? null : 0 };
  for (const [outcome, pr] of [['hit', pHit], ['crit', pCrit], ['miss', pMiss]]) {
    if (pr <= 0) continue;
    const d = outcomeDamage(entries, a, outcome);
    res.expectedDamage += pr * mean(d.hp);
    res.expectedBurn += pr * mean(d.burn);
    res.expectedHeat += pr * mean(d.heat);
    if (res.zeroHpChance !== null) res.zeroHpChance += pr * probAtLeast(d.hp, Math.max(1, a.targetHp));
  }
  return res;
}
