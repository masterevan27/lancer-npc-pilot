import { inertData, record } from './policy-data.mjs';
// Readiness, uses and usage-counter values deliberately do not identify rules.
export const RULE_FIELDS = Object.freeze(['lid', 'type', 'weapon_type', 'effect', 'on_hit', 'on_attack', 'on_crit', 'trigger',
  'activation', 'tech_type', 'tech_attack', 'accuracy', 'attack_bonus', 'range', 'damage', 'tags',
  'tier_override', 'bonus', 'override', 'actions', 'deployables', 'synergies', 'frequency', 'cost', 'heat_cost']);
export function canonicalRuleSource(system) {
  if (!record(system) || !inertData(system,{allowUndefined:true})) throw TypeError('Rule source must be plain finite data without accessors.');
  const sort = v => Array.isArray(v) ? v.map(sort) : record(v) ? Object.fromEntries(Object.keys(v).sort()
    .filter(k=>v[k]!==undefined).map(k=>[k,sort(v[k])])) : v;
  return JSON.stringify(sort(Object.fromEntries(RULE_FIELDS.filter(k=>system[k]!==undefined).map(k=>[k,system[k]]))));
}
