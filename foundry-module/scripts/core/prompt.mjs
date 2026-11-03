// Prompt builder: snapshot + options + persona -> {system, messages}.
// Provider-neutral (the relay maps it onto Anthropic or OpenAI-style APIs).
// No Foundry or browser globals.

import { tokenDistance } from './grid.mjs';
import { areEnemies, isDefeated, rangeVal } from './snapshot.mjs';

export const REASON_MAX_WORDS = 25;
export const LINE_MAX_WORDS = 20;

const pct = (p) => `${Math.round(p * 100)}%`;
const num = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));
const cell = (c) => `(${c.x},${c.y})`;
const pair = (v) => (Array.isArray(v) ? `${v[0]}/${v[1]}` : '-');

/** One-line, plain-words description of an option (also useful for the UI). */
export function describeOption(opt) {
  const f = opt.facts;
  const parts = [];
  const move = opt.move
    ? `Move ${opt.move.cost} space${opt.move.cost === 1 ? '' : 's'} to ${cell(opt.move.to)}${f.usesBoost ? ' (uses Boost)' : ''}`
    : 'Stay in place';
  switch (opt.action.kind) {
    case 'attack':
      parts.push(`${move}, then attack ${f.targetName} with ${f.weaponName}`);
      parts.push(`hit ${pct(f.hitChance)}, crit ${pct(f.critChance)}, expected damage ${num(f.expectedDamage)}`
        + `${f.expectedBurn ? ` +${num(f.expectedBurn)} burn` : ''}, ${pct(f.zeroHpChance)} chance to drop it to 0 HP`
        + ` (target HP ${f.targetHp}/${f.targetHpMax}, ${f.distanceToTarget} away)`);
      break;
    case 'boost':
      parts.push(`${move} toward ${f.towardName}, no attack`);
      parts.push(`distance to ${f.towardName} ${f.distanceBefore} -> ${f.distanceAfter}`);
      break;
    case 'retreat':
      parts.push(`${move} to fall back, no attack`);
      parts.push(`nearest enemy ${f.distanceBefore} -> ${f.nearestEnemy}`);
      break;
    case 'hide':
      parts.push(`${move}, then Hide (no enemy has line of sight there), no attack`);
      break;
    case 'hold':
      parts.push(`${move}, hold position, no attack`);
      break;
    default:
      parts.push(`${move}, ${opt.action.kind}`);
  }
  const end = [];
  end.push(f.cover && f.cover !== 'none' ? `${f.cover} cover` : 'no cover');
  end.push(f.inEnemyThreat ? `inside ${f.inEnemyThreat} enemy threat range${f.inEnemyThreat === 1 ? '' : 's'}` : 'outside enemy threat');
  end.push(`${f.enemiesInRange ?? 0} enem${f.enemiesInRange === 1 ? 'y' : 'ies'} in range`);
  if (f.heatAfter !== null && f.heatAfter !== undefined) end.push(`heat ${f.heatAfter}/${f.heatCap}${f.overheats ? ' OVERHEATS' : ''}`);
  parts.push(`ends with ${end.join(', ')}`);
  return parts.join('; ');
}

function weaponLine(w) {
  const r = (w.range ?? []).map((x) => `${x.type} ${x.val}`).join(', ');
  const dmg = typeof w.damage === 'string' ? w.damage : (w.damage ?? []).map((d) => `${d.val} ${d.type}`).join(' + ');
  const state = [];
  if (w.loaded === false) state.push('unloaded');
  if (w.destroyed) state.push('destroyed');
  if (Array.isArray(w.uses)) state.push(`${w.uses[0]} uses left`);
  else if (typeof w.uses === 'number') state.push(`${w.uses} uses left`);
  return `${w.name} (${r}; ${dmg}${state.length ? `; ${state.join(', ')}` : ''})`;
}

function tokenLine(t, me, grid) {
  const bits = [`${t.name}`, `at ${cell(t.pos)}`];
  if (me && t.id !== me.id) bits.push(`${tokenDistance(grid, me, t)} away`);
  bits.push(`HP ${pair(t.hp)}`);
  if (t.structure) bits.push(`structure ${pair(t.structure)}`);
  bits.push(`armor ${t.armor}`, `evasion ${t.evasion}`, `e-def ${t.edef}`, `speed ${t.speed}`, `size ${t.size}`);
  const reach = Math.max(0, ...(t.weapons ?? []).map((w) => Math.max(rangeVal(w, ['range']), rangeVal(w, ['threat']))));
  if (reach) bits.push(`best reach ${reach}`);
  if (t.statuses?.length) bits.push(`statuses: ${t.statuses.join(', ')}`);
  return `- ${bits.join(', ')}`;
}

/**
 * Build the model request.
 * @param {import('./snapshot.mjs').Snapshot} snap
 * @param {import('./options.mjs').TurnOption[]} options  Ranked, with ids.
 * @param {{persona?:string, role?:string}} [opts]  persona overrides token.persona.
 * @returns {{system:string, messages:{role:'user', content:string}[]}}
 */
export function buildPrompt(snap, options, opts = {}) {
  const me = snap.tokens.find((t) => t.id === snap.activeTokenId);
  if (!me) throw new Error(`active token "${snap.activeTokenId}" not found`);
  const persona = (opts.persona ?? me.persona ?? '').trim();
  const ids = options.map((o) => o.id);

  const system = [
    `You are the tactical mind of ${me.name}, an NPC mech in a LANCER battle run by a human GM.`,
    opts.role ? `Role: ${opts.role}` : null,
    persona ? `Persona: ${persona}` : 'Persona: a competent, self-preserving combatant.',
    '',
    'Each turn you are given a battlefield summary and a numbered list of legal options that the game has already worked out.',
    'Rules:',
    '- Choose exactly one option from the list, by its id. Never invent a move, target or action that is not listed.',
    '- The percentages and damage figures are estimates. Do not describe hits, misses, damage or any outcome as if it already happened; the dice are rolled later by the game.',
    '- Weigh the numbers, but act in character: the persona may prefer a lower-scored option.',
    `- "reason": why this option, at most ${REASON_MAX_WORDS} words.`,
    `- "line": optional short in-character line the pilot or NPC says aloud, at most ${LINE_MAX_WORDS} words; use "" for none.`,
    '',
    'Reply with JSON only, no other text and no code fences, exactly in this shape:',
    `{"option": "<one of: ${ids.join(', ')}>", "reason": "<why>", "line": "<in-character line or empty>"}`,
  ].filter((l) => l !== null).join('\n');

  const allies = snap.tokens.filter((t) => t.id !== me.id && !isDefeated(t) && !areEnemies(me, t) && t.side === me.side);
  const enemies = snap.tokens.filter((t) => t.id !== me.id && !isDefeated(t) && areEnemies(me, t));
  const others = snap.tokens.filter((t) => t.id !== me.id && !isDefeated(t) && !allies.includes(t) && !enemies.includes(t));

  const lines = [];
  lines.push(`Round ${snap.round ?? '?'}. ${snap.grid.type} grid; distances are in spaces.`);
  lines.push('');
  lines.push('You:');
  lines.push(tokenLine(me, null, snap.grid));
  if (me.heat) lines.push(`  heat ${pair(me.heat)}${me.stress ? `, stress ${pair(me.stress)}` : ''}`);
  const weapons = me.weapons ?? [];
  if (weapons.length) lines.push(`  weapons: ${weapons.map(weaponLine).join('; ')}`);
  const features = (me.features ?? []).filter((f) => f && f.name);
  if (features.length) lines.push(`  features: ${features.map((f) => f.name).join(', ')}`);
  lines.push('');
  lines.push(enemies.length ? 'Enemies:' : 'Enemies: none visible.');
  for (const t of enemies) lines.push(tokenLine(t, me, snap.grid));
  if (allies.length) {
    lines.push('');
    lines.push('Allies:');
    for (const t of allies) lines.push(tokenLine(t, me, snap.grid));
  }
  if (others.length) {
    lines.push('');
    lines.push('Others (neutral):');
    for (const t of others) lines.push(tokenLine(t, me, snap.grid));
  }
  lines.push('');
  lines.push('Options (best estimated first):');
  for (const o of options) lines.push(`${o.id}. ${describeOption(o)}.`);
  lines.push('');
  lines.push('Reply with JSON only: {"option": "<id>", "reason": "...", "line": "..."}');

  return { system, messages: [{ role: 'user', content: lines.join('\n') }] };
}
