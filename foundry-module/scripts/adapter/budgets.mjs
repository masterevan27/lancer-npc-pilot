import { normalizeBudget } from '../core/budgets.mjs';
import { normStatus } from '../core/snapshot.mjs';

/** Native observed resources only; never infer recharge or prose frequency resets. */
export function readActionBudget(actor) {
  const counters = {};
  for (const item of actor.items ?? []) {
    if (item.type !== 'npc_feature') continue;
    const s = item.system, tags = s.tags ?? [], state = 'observed-native-item-state';
    const counter = (key, remaining) => {
      counters[`${key}:${item.id}`] = { remaining, scope: 'resource', period: state,
        sourceItemId: item.id };
    };
    // Native isLimited() is uses.max > 0, not the current uses value.
    if (Number(s.uses?.max) > 0) counter('uses', s.uses?.value);
    for (const [tag, key, field] of [['tg_loading', 'loading', 'loaded'], ['tg_recharge', 'recharge', 'charged']]) {
      if (tags.some(t => t.lid === tag)) counter(key, typeof s[field] === 'boolean' ? Number(s[field]) : null);
    }
  }
  const statuses = new Set([...(actor.statuses ?? [])].map(normStatus));
  const blocked = statuses.has('STUNNED') ? ['move', 'boost', 'quick', 'full', 'protocol', 'reaction', 'free']
    : statuses.has('IMMOBILIZED') ? ['move', 'boost'] : statuses.has('SLOWED') ? ['boost'] : [];
  // Native slots do not say which weapon/mode or Boost was already used.
  // Keep the observed slot, but do not infer permission to repeat an action.
  const tracker = actor.system.action_tracker;
  if (tracker?.full !== true || tracker?.quick !== true) blocked.push('quick', 'full', 'boost');
  return normalizeBudget(actor.system.action_tracker, { speed: actor.system.speed, counters, blocked });
}
