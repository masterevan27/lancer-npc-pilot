// Banter core: pure text layer for the short in-character lines an NPC says.
// An "intent" line comes before the attack roll and must never claim a result;
// a "reaction" line comes after Lancer resolved the attack and may only use the
// recorded outcome. No Foundry or browser globals, no network.

import { cellDistance, tokenDistance } from './grid.mjs';
import { areEnemies, isDefeated, normStatus } from './snapshot.mjs';
import { describeOption, LINE_MAX_WORDS } from './prompt.mjs';

/** Coarse condition label; never exposes exact numbers. */
export function hpBand(hp, structure) {
  const sCur = Array.isArray(structure) ? Number(structure[0]) : null;
  const sMax = Array.isArray(structure) ? Number(structure[1]) : null;
  if (sCur !== null && sCur <= 0) return 'destroyed';
  const cur = Array.isArray(hp) ? Number(hp[0]) : 0;
  const max = Array.isArray(hp) ? Number(hp[1]) : 0;
  const frac = max > 0 ? cur / max : 0;
  if (frac <= 0.25 || (sCur !== null && sMax !== null && sCur < sMax)) return 'badly damaged';
  if (frac < 0.75) return 'damaged';
  return 'fresh';
}

/** Excluded from banter: a Lancer Hidden status, or a GM-hidden token (gmHidden / legacy hidden flag). */
export const isHiddenFromBanter = (t) => t.hidden === true || t.gmHidden === true
  || (t.statuses ?? []).some((x) => normStatus(x) === 'HIDDEN');

const bandOf = (t) => (isDefeated(t) ? 'destroyed' : hpBand(t.hp, t.structure));

function distanceBetween(grid, a, b) {
  try {
    return tokenDistance(grid, a, b);
  } catch {
    return cellDistance(grid, a.pos, b.pos);
  }
}

/**
 * Compact, visible-information-only description of the scene for one line.
 * Hidden and defeated tokens are left out; neutral tokens are not listed.
 */
export function buildBanterContext(snapshot, { speakerTokenId, phase, option, outcome, persona } = {}) {
  const me = snapshot.tokens.find((t) => t.id === speakerTokenId);
  if (!me) throw new Error(`Banter speaker ${speakerTokenId} is not in the snapshot.`);
  const others = snapshot.tokens.filter((t) => t.id !== me.id && !isHiddenFromBanter(t) && !isDefeated(t));
  const entry = (t) => ({ name: t.name, band: bandOf(t), distance: distanceBetween(snapshot.grid, me, t) });
  return {
    speaker: { name: me.name, className: me.className ?? me.classIds?.[0] ?? null, side: me.side, band: bandOf(me) },
    allies: others.filter((t) => t.side === me.side && me.side !== 'neutral').map(entry),
    enemies: others.filter((t) => areEnemies(me, t)).map(entry),
    action: option ? describeOption(option) : null,
    outcome: outcome ?? null,
    persona: persona ?? me.persona ?? null,
  };
}

const SYSTEM = [
  'You write one line of in-character chatter for an NPC mech pilot in a Lancer tabletop game.',
  `Reply with exactly one spoken line of at most ${LINE_MAX_WORDS} words.`,
  'No quotation marks, no markdown, no stage directions, no asterisks, no speaker label, no JSON.',
  'Address other combatants by name when it fits. Stay in the persona if one is given.',
  'Intent lines are written BEFORE the attack roll: express intent, bravado or hope, and never state a hit, miss, damage or kill as having happened.',
  'Reaction lines are written AFTER the attack: describe only the outcome given, using only what is recorded there, and do not invent damage, numbers or other results.',
  'Do not repeat or closely echo any recent line listed.',
].join('\n');

/** Provider-neutral prompt; the relay maps it onto a model API. */
export function buildBanterPrompt(context, recentLines = []) {
  const parts = [];
  parts.push(`Phase: ${context.outcome ? 'reaction (the attack has resolved)' : 'intent (the attack has not been rolled)'}`);
  const sp = context.speaker;
  parts.push(`Speaker: ${sp.name}${sp.className ? ` (${sp.className})` : ''}, ${sp.side}, condition ${sp.band}`);
  if (context.persona) parts.push(`Persona: ${context.persona}`);
  const list = (label, xs) => xs.length
    ? `${label}: ${xs.map((x) => `${x.name} (${x.band}, ${x.distance} away)`).join('; ')}` : `${label}: none visible`;
  parts.push(list('Allies', context.allies));
  parts.push(list('Enemies', context.enemies));
  if (context.action) parts.push(`Planned action: ${context.action}`);
  if (context.outcome) parts.push(`Recorded outcome: ${JSON.stringify(context.outcome)}`);
  parts.push(recentLines.length
    ? `Recent lines (do not repeat):\n${recentLines.map((l) => `- ${l}`).join('\n')}`
    : 'Recent lines: none');
  parts.push('Write the line now.');
  return { system: SYSTEM, messages: [{ role: 'user', content: parts.join('\n') }] };
}

/** Model reply -> one plain line, or null. Over-long lines are dropped, never truncated. */
export function cleanBanterLine(text) {
  if (typeof text !== 'string') return null;
  let s = text.replace(/```[a-zA-Z0-9_-]*/g, ' ');
  s = s.replace(/<[^>]*>/g, '');
  s = s.replace(/\*[^*]*\*/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  const strip = () => { s = s.replace(/^["'“”‘’]+|["'“”‘’]+$/g, '').trim(); };
  strip();
  s = s.replace(/^[A-Za-z][\w .'-]{0,30}:\s+/, '').trim();
  strip();
  if (!s || s.startsWith('{')) return null;
  if (s.split(' ').length > LINE_MAX_WORDS) return null;
  return s;
}

const NAMED_RESULT = /\b[\w-]+(?:'s|'re| is| was| are| were)\s+(?:dead|down|destroyed|wrecked|finished|done for|gone|toast)\b/i;
const FIRST_PERSON_RESULT = /\bi\s+(?:just\s+|totally\s+)?(?:destroyed|wrecked|killed|hit|missed|took\s+(?:\w+\s+)?(?:down|out))\b/i;
const OUTCOME_CLAIM = /\b(direct hit|scratch one|you('| a)re (dead|done for|finished)|i (hit|missed|killed)|(he|she|they|it)('s| is) (dead|down|destroyed))\b/i;
const NUMBER_WORD = String.raw`(?:\d+|an?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|several|some|much|more|full|double|triple|half|no)`;
// "took six damage", "12 damage", "took a beating"
const DAMAGE_CLAIM = new RegExp(String.raw`\b(?:${NUMBER_WORD}\s+(?:points?\s+of\s+)?damage|(?:took|taken|suffered|absorbed|eat|ate|lost)\b[^.!?]{0,24}\b(?:damage|hit|hits|beating)|(?:damaged|hurt|scorched|shredded|burned|bled))\b`, 'i');
// Past-tense kills and misses stated about anyone ("You killed it", "that missed", "took him out").
const KILL_CLAIM = /\b(?:killed|destroyed|wrecked|eliminated|downed|dead|scratch one|finished off|took\s+(?:\w+\s+)?(?:out|down)|blown up|(?:is|are|was|were|'s|'re|went|gone)\s+down)\b/i;
const MISS_CLAIM = /\b(?:missed|whiffed)\b/i;
// "hit/struck/shot" is a past-tense claim unless a modal, "to", or a determiner shows it is future, a noun or a wish.
const STRIKE = new Set(['hit', 'struck', 'shot', 'clipped', 'tagged', 'nailed']);
const NOT_PAST = new Set(['will', 'ill', 'ill', 'well', 'youll', 'theyll', 'hell', 'shell', 'to', 'gonna', 'gotta', 'can', 'cant', 'could', 'would', 'should',
  'must', 'might', 'may', 'shall', 'let', 'lets', 'wont', 'not', 'never', 'dont', 'didnt', 'couldnt', 'wouldnt', 'cannot', 'no', 'first', 'next', 'good', 'nice', 'great', 'my', 'your', 'the', 'a', 'one', 'any']);
const bare = (w) => w.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]/g, '');

function claimsStrike(text) {
  const ws = text.split(/\s+/).map(bare).filter(Boolean);
  for (let i = 0; i < ws.length - 1; i++) {
    if (STRIKE.has(ws[i]) && !(i > 0 && NOT_PAST.has(ws[i - 1]))) return true;
  }
  return false;
}

/** Remove negated spans ("didn't hit you", "no damage", "never killed") before searching for claims. */
const stripNegated = (t) => t.replace(/\b(?:\w+n't|cannot|not|never|no|without|nothing)\b(?:\s+\w+){0,2}/gi, ' ');
const norm = (line) => String(line ?? '').replace(/’/g, "'");

/** True when a line states a result as fact (illegal in an intent line). Rule-based; unusual phrasings can still slip through. */
export function claimsOutcome(line) {
  const t = norm(line);
  return OUTCOME_CLAIM.test(t) || NAMED_RESULT.test(t) || FIRST_PERSON_RESULT.test(t)
    || DAMAGE_CLAIM.test(t) || KILL_CLAIM.test(t) || MISS_CLAIM.test(t) || claimsStrike(t);
}

/**
 * True when a reaction line asserts something the recorded outcome contradicts: a hit, damage or
 * kill after a miss; a kill when nothing was destroyed; damage when every hit target took none.
 * Rule-based; unusual phrasings can still slip through.
 */
export function contradictsOutcome(line, outcome) {
  if (!outcome || typeof outcome !== 'object') return false;
  const t = stripNegated(norm(line));
  const hitClaim = claimsStrike(t) || /\b(?:direct hit|hits?)\b/i.test(t);
  const damageClaim = DAMAGE_CLAIM.test(t);
  const killClaim = KILL_CLAIM.test(t);
  const targets = Array.isArray(outcome.targets) ? outcome.targets : [];
  if (outcome.status === 'missed') return hitClaim || damageClaim || killClaim;
  if (outcome.status !== 'applied') return false;
  if (killClaim && !targets.some((x) => x.destroyed)) return true;
  const hits = targets.filter((x) => x.hit);
  if (damageClaim && hits.length && hits.every((x) => x.damage === 0)) return true;
  return false;
}

const words = (s) => new Set(String(s).toLowerCase().replace(/['‘’]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean));

/** Exact or near-duplicate (word-set Jaccard >= 0.6) of any recent line. */
export function isRepeat(line, recent = []) {
  const a = words(line);
  const key = [...a].join(' ');
  for (const r of recent) {
    const b = words(r);
    if (key === [...b].join(' ')) return true;
    const inter = [...a].filter((w) => b.has(w)).length;
    const union = new Set([...a, ...b]).size;
    if (union > 0 && inter / union >= 0.6) return true;
  }
  return false;
}

/** Skip unremarkable hits: a reaction is worth a line for a miss, a kill, a crit, a zero-damage hit, or >= 25% of max HP. */
export function shouldReact(outcome) {
  if (!outcome) return false;
  if (outcome.status === 'missed') return true;
  if (outcome.status !== 'applied') return false;
  return (outcome.targets ?? []).some((t) => {
    if (t.destroyed || t.crit) return true;
    if (!t.hit) return false;
    if (t.damage === 0) return true;
    return typeof t.damage === 'number' && t.maxHp > 0 && t.damage >= 0.25 * t.maxHp;
  });
}
