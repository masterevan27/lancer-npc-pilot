// Generic catalogue dispatch remains closed pending its broader acceptance.
// The scoped Cataphract policy path uses independently pinned source/readiness
// in cataphract.mjs; it does not grant catalogue-wide handlers or support.
export const NPC_DESCRIPTORS = Object.freeze([]);

// Work obligations, never executable handlers or assertions that a rule was reviewed.
const gate = (chunk, acceptance) => Object.freeze({ chunk, acceptance: Object.freeze(acceptance) });
export const COVERAGE_GATES = Object.freeze({
  'exact-rules': gate(1, [
    'Review exact fingerprinted rules and applicable tiers against the recorded system version.',
    'Record every mechanic family and class/template association; preserve unresolved and unassigned entries.',
  ]),
  'legality-budget': gate(2, [
    'Compare occupied cells and directed collision/LOS with native square and all four hex layouts.',
    'Test permitted and refused targets, partial turns, full/quick costs, protocols and feature/resource counters.',
  ]),
  'confirmed-sequence': gate(3, [
    'Test approval, cancellation, partial movement, stale state, reload and duplicate/concurrent execution.',
    'Require confirmed native results before a dependent step; never infer success from an effect card.',
  ]),
  'weapon-geometry': gate(4, [
    'Verify applicable tiers, modes, area origins, affected allies/neutral tokens and repeated/split attacks.',
    'Compare native template cells and LOS origins; test cancelled first attacks and full-action weapons.',
  ]),
  'native-effects': gate(5, [
    'Verify actual tiered tech/save/choice results, targeting, resources and permitted/refused effects.',
    'Test applicable forced movement against size, immunity, collision, occupancy and interrupted resolution.',
  ]),
  'passive-interactions': gate(6, [
    'Distinguish native-derived stats from additional passive restrictions; never apply a native bonus twice.',
    'Test acting and target features, timing, template stacking, and rule-derived pair/three-way interactions.',
  ]),
  'reaction-receipts': gate(7, [
    'Verify native trigger receipts, availability, separate approval and once-per-turn/round refresh.',
    'Test duplicate events, simultaneous eligible reactions and interruption/revalidation of the acting plan.',
  ]),
  'roster-acceptance': gate(8, [
    'Audit every declared feature/tier/class/template with no dropped unresolved entries.',
    'Run licensed conformance and disposable-world acceptance; retain any missing player/GM or transport gates.',
  ]),
});

const ROUTING = Object.freeze({
  Weapon: [4, 'weapon-geometry'], Trait: [6, 'passive-interactions'],
  System: [5, 'native-effects'], Tech: [5, 'native-effects'], Reaction: [7, 'reaction-receipts'],
});

/** Inventory kind is only a routing hint: a Trait may also contain an activation. */
export function coverageRouting(kind) {
  const [owningChunk, primary] = typeof kind === 'string' && Object.hasOwn(ROUTING, kind) ? ROUTING[kind] : [1, 'exact-rules'];
  return { owningChunk, basis: 'inventory-kind-hint',
    gates: [...new Set([primary, 'legality-budget', 'confirmed-sequence', 'roster-acceptance'])] };
}
