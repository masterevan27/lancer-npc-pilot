// Pure planning ledger. Spending projects resources; it never updates Foundry.
// Native Lancer 3.1.3 full/quick flags represent a single two-quick-action pool.
const integer = n => Number.isSafeInteger(n) && n >= 0;
const flags = ['full', 'quick', 'protocol', 'reaction'];
const actions = ['move', 'quick', 'full', 'protocol', 'reaction', 'free', 'boost'];

/** Preserve the actual observation separately from the projected native tracker. */
export function normalizeBudget(tracker, { speed, counters = {}, blocked = [] } = {}) {
  if (!tracker || !integer(tracker.move) || !integer(speed)
    || flags.some(k => typeof tracker[k] !== 'boolean')
    || !Array.isArray(blocked) || blocked.some(k => !actions.includes(k)))
    throw Error('Native action budget is missing or invalid; continue manually.');
  return { move: tracker.move, speed, quick: Number(tracker.full) + Number(tracker.quick),
    full: tracker.full && tracker.quick, protocol: tracker.protocol, reaction: tracker.reaction,
    nativeTracker: structuredClone(tracker), observedTracker: structuredClone(tracker),
    counters: structuredClone(counters), blocked: [...blocked] };
}

/** Refuse unknown costs and counter periods rather than inventing availability. */
export function canSpend(budget, cost) {
  const no = reason => ({ ok: false, reason });
  if (!budget || !integer(budget.move) || !integer(budget.speed) || !integer(budget.quick)
    || budget.quick > 2 || typeof budget.full !== 'boolean'
    || typeof budget.protocol !== 'boolean' || typeof budget.reaction !== 'boolean'
    || !Array.isArray(budget.blocked) || !budget.nativeTracker
    || flags.some(k => typeof budget.nativeTracker[k] !== 'boolean')
    || budget.quick !== Number(budget.nativeTracker.full) + Number(budget.nativeTracker.quick)
    || budget.full !== (budget.nativeTracker.full === true && budget.nativeTracker.quick === true)
    || budget.move !== budget.nativeTracker.move
    || budget.protocol !== budget.nativeTracker.protocol || budget.reaction !== budget.nativeTracker.reaction)
    return no('Invalid or inconsistent action budget.');
  if (!cost || typeof cost !== 'object' || Array.isArray(cost)
    || Object.keys(cost).some(k => ![...actions, 'counters'].includes(k))) return no('Unknown action cost.');
  for (const key of actions) {
    if (cost[key] !== undefined && (!integer(cost[key]) || (['full', 'protocol', 'reaction', 'free', 'boost'].includes(key) && cost[key] > 1)))
      return no(`Invalid ${key} cost.`);
    if (cost[key] > 0 && budget.blocked.includes(key)) return no(`${key} is restricted.`);
  }
  if (cost.protocol && actions.some(k => k !== 'protocol' && cost[k] > 0))
    return no('Represent the protocol as a separate ordered step.');
  const quickCost = (cost.quick ?? 0) + 2 * (cost.full ?? 0) + (cost.boost ?? 0);
  if (quickCost > budget.quick || (cost.full && !budget.full)) return no('Not enough remaining actions.');
  if ((cost.move ?? 0) > budget.move) return no('Not enough remaining movement.');
  if (cost.protocol && !budget.protocol) return no('Protocol window has closed.');
  if (cost.reaction && !budget.reaction) return no('Reaction is unavailable.');
  if (cost.counters !== undefined && (!cost.counters || typeof cost.counters !== 'object' || Array.isArray(cost.counters)))
    return no('Invalid feature counter costs.');
  for (const [id, count] of Object.entries(cost.counters ?? {})) {
    const counter = budget.counters?.[id];
    if (!integer(count) || !counter || !integer(counter.remaining)
      || !['resource', 'turn', 'round', 'scene'].includes(counter.scope)
      || typeof counter.period !== 'string' || !counter.period.trim())
      return no(`Unverified resource or period: ${id}.`);
    if (count > counter.remaining) return no(`Not enough remaining uses: ${id}.`);
  }
  return { ok: true, reason: null };
}

/** No reset inference: period changes and recharge require a fresh native observation. */
export function spend(budget, cost) {
  const checked = canSpend(budget, cost);
  if (!checked.ok) throw Error(checked.reason);
  const out = structuredClone(budget), native = out.nativeTracker;
  let quickCost = (cost.quick ?? 0) + 2 * (cost.full ?? 0) + (cost.boost ?? 0);
  while (quickCost-- > 0) { if (native.full) native.full = false; else native.quick = false; }
  out.quick = Number(native.full) + Number(native.quick); out.full = native.full && native.quick;
  out.move -= cost.move ?? 0;
  if (cost.boost) out.move += out.speed; // Separate grant; do not restore already-spent base movement.
  native.move = out.move;
  if (cost.reaction) native.reaction = out.reaction = false;
  if (cost.free) native.free = true; // Native flag is history, not a finite free-action pool.
  for (const [id, count] of Object.entries(cost.counters ?? {})) out.counters[id].remaining -= count;
  if (actions.some(k => cost[k] > 0) || Object.values(cost.counters ?? {}).some(n => n > 0))
    native.protocol = out.protocol = false;
  return out;
}
