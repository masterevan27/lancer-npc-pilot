import { isJsonData, resolveAbility } from './abilities.mjs';
import { canSpend } from './budgets.mjs';
import { areEnemies, isDefeated } from './snapshot.mjs';

const policyFields = new Set(['kind', 'side', 'maxRange', 'requiresLOS', 'minTargets', 'maxTargets',
  'minSize', 'maxSize', 'npcOnly', 'excludeSelf']);
const finite = n => typeof n === 'number' && Number.isFinite(n) && n >= 0;

/** Pure prerequisite checks for reviewed descriptors; not an execution permission. */
export function validateUse(descriptor, use, context) {
  const reasons = [], no = reason => ({ ok: false, reasons: [reason] });
  if (!use || !context || !isJsonData(use) || !isJsonData(context)) return no('Use/context must be plain observed JSON data.');
  const resolved = resolveAbility(context.entry, { systemVersion: context.systemVersion, tier: context.tier,
    descriptors: [descriptor], handlers: context.handlers });
  if (!resolved.descriptor) return { ok: false, reasons: resolved.gaps };
  const d = resolved.descriptor, p = d.targetPolicy;
  if (!Array.isArray(context.gaps) || context.gaps.length) return no('Unresolved legality context requires manual play.');
  if (!['Quick', 'Full', 'Protocol'].includes(d.activation) || context.window !== 'turn'
    || context.activeTokenId !== use.actorTokenId) return no('This activation/timing window is not supported here.');
  const activationCost = { Quick: 'quick', Full: 'full', Protocol: 'protocol' }[d.activation];
  if (d.cost[activationCost] !== 1) return no('Activation requires an explicit matching action cost.');
  if (typeof context.sourceItemId !== 'string' || !context.sourceItemId
    || use.sourceItemId !== context.sourceItemId) return no('Source item ownership was not verified.');
  const budget = canSpend(context.budget, d.cost);
  if (!budget.ok) reasons.push(budget.reason);
  if (!['none', 'self', 'single', 'multiple'].includes(p.kind)
    || Object.keys(p).some(k => !policyFields.has(k))) return no('Target policy requires a later reviewed handler.');
  if (!Array.isArray(use.targets) || Array.from(use.targets).some(id => typeof id !== 'string' || !id)
    || new Set(use.targets).size !== use.targets.length) return no('Targets must be unique concrete token IDs.');
  if (!Array.isArray(context.tokens) || Array.from(context.tokens).some(t => !t || typeof t.id !== 'string')
    || new Set(context.tokens.map(t => t.id)).size !== context.tokens.length) return no('Observed tokens are missing or ambiguous.');
  const actor = context.tokens.find(t => t.id === use.actorTokenId);
  if (!actor || actor.isNpc !== true || isDefeated(actor) || !Array.isArray(actor.hp)
    || !finite(actor.hp[0]) || actor.hp[0] <= 0) return no('The acting token must be a living NPC.');
  const min = p.kind === 'none' ? 0 : p.minTargets ?? 1;
  const max = p.kind === 'none' ? 0 : ['self', 'single'].includes(p.kind) ? 1 : p.maxTargets;
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 0 || max < min || max > 32
    || use.targets.length < min || use.targets.length > max) return no('Target count is outside the reviewed policy.');
  if (['single', 'multiple'].includes(p.kind) && (!finite(p.maxRange)
    || typeof p.requiresLOS !== 'boolean' || !['enemy', 'ally', 'any'].includes(p.side)))
    return no('Range, LOS and side policy must be explicit.');
  for (const key of ['minSize', 'maxSize']) if (p[key] !== undefined && !finite(p[key])) return no('Invalid target size policy.');
  for (const key of ['npcOnly', 'excludeSelf']) if (p[key] !== undefined && typeof p[key] !== 'boolean') return no('Invalid target restriction.');
  for (const id of use.targets) {
    const target = context.tokens.find(t => t.id === id);
    if (!target || isDefeated(target) || !Array.isArray(target.hp) || !finite(target.hp[0]) || target.hp[0] <= 0) {
      reasons.push(`Target ${id} is unavailable.`); continue;
    }
    if ((p.kind === 'self' && id !== actor.id) || (p.excludeSelf && id === actor.id)) reasons.push(`Target ${id} violates self targeting.`);
    if ((p.side === 'enemy' && !areEnemies(actor, target))
      || (p.side === 'ally' && (target.side === 'neutral' || target.side !== actor.side))) reasons.push(`Target ${id} has the wrong side.`);
    if ((p.npcOnly && target.isNpc !== true) || !finite(target.size)
      || (p.minSize !== undefined && target.size < p.minSize) || (p.maxSize !== undefined && target.size > p.maxSize))
      reasons.push(`Target ${id} violates the size/type policy.`);
    if (['single', 'multiple'].includes(p.kind)) {
      const geometry = context.geometry?.[id];
      if (context.geometryActorId !== actor.id || !geometry || !finite(geometry.distance)
        || geometry.distance > p.maxRange || (p.requiresLOS && geometry.visible !== true))
        reasons.push(`Target ${id} lacks verified legal range/LOS.`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}
