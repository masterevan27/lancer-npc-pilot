---
type: Design
title: Book-derived NPC policy contract
description: Proposed policy data, decision precedence, capability boundaries and T1 Cataphract behavior scenarios for module-only planning.
status: draft
tags: [foundry, planning, npc-coverage]
sources:
  - id: roadmap
    resource: ../../roadmap.md
  - id: mechanics-plan
    resource: ../plans/2026-11-01-full-npc-coverage.md
  - id: candidate-code
    resource: https://github.com/masterevan27/lancer-npc-pilot/blob/dc6f3b90d2ae03fdce3a5bd09ed21b999628ca46/foundry-module/scripts/core/options.mjs
  - id: controller-code
    resource: https://github.com/masterevan27/lancer-npc-pilot/blob/dc6f3b90d2ae03fdce3a5bd09ed21b999628ca46/foundry-module/scripts/adapter/controller.mjs
  - id: source-review
    resource: ../../../foundry-module/scripts/rules/npc-mechanics.mjs
  - id: catalogue
    resource: ../../../foundry-module/scripts/rules/npc-catalogue.mjs
  - id: book-excerpt
    resource: ../../roadmap.md
    title: Owner-supplied Core Book page 297 excerpt and its verification limits
generated:
  by: codex/unrecorded
  at: 2026-11-03T08:47:27.664Z
---
# Book-derived NPC policy contract

Roadmap item: `tactics-contract`. This is the proposed design for subsequent
`tactics-selector` implementation, not an executable policy or an implemented
selector. The owner selected work on the contract after agreeing to the
profile-first direction. Detailed defaults below are the builder's proposal;
they do not imply approval of every tactical tradeoff or completion of the
Cataphract scenario review.

Implementation update (November 3, 2026): the owner approved this contract and
its scenario expectations. Development 0.8.0 implements the selector; its
[scoped evidence](../../review-evidence/2026-11-03-policy-selector.md) records
local source delivery and remaining live/mechanics gates. The design examples
below remain explanatory data, not execution authority.

## Intent and first scope

Translate a class's published role and tactics into inspectable module decisions.
Keep legality and resolution in reviewed mechanics and native Foundry flows.
The first complete behavior slice is a T1 base Cataphract with Ram Cannon,
Trample, Impale and Point-Defense Shield, followed later by other tiers,
equipped optional systems, templates and classes.

This contract defines shared policy data, precedence, candidate retention,
unknown facts, explanations and acceptance scenarios. It specifies interfaces
and documentation examples only. It does not add runtime handlers, a settings
screen, objective editing, natural-language order interpretation, probabilistic
save simulation, multi-turn planning or a model requirement. Future GM controls
are covered by `tactics-orders`; the first selector accepts the same structured
order data through injected fixture inputs.

## Evidence and current integration boundaries

Baseline code is local development 0.7.0 at `dc6f3b9`. `generateCandidates()`
already deduplicates to a best endpoint per weapon/target and per movement
family before `pickTop()` keeps up to eight options. Current categories are
aggressive, defensive and reposition. `PilotController.plan()` then requests a
model choice; its private stored options, `approve()`, fresh board stamp and
execution reservation boundaries are the authoritative execution path.

Policy evaluation must happen before either endpoint deduplication or final
pruning can erase a defining maneuver. Re-ranking the existing final eight
options is insufficient. Existing snapshot `classIds`, `templateIds`, features,
native occupied cells and observed budgets are inputs; class names and persona
strings do not grant source identity or mechanics.

The special-ability descriptor registry is empty. The exact-source Impale
review explicitly leaves save timing relative to passing the target unresolved.
This contract does not settle that timing or prescribe a guessed execution
sequence. It can describe conditional tactical benefits, but actual Impale
candidates remain unavailable until its descriptor and continuation are reviewed.
The existing T1 Ram Cannon adapter is distinct from full base-class support.

Book guidance is the owner's supplied Core Book page 297 excerpt. No whole-PDF,
Long Rim or errata review is claimed. Installed Lancer 3.1.3 catalogue fingerprints
identify feature sources; policy provenance alone never authorizes those features.

## Non-negotiable boundaries

- The same snapshot produces the same ordered choices and explanations, without
  network access. Random variation is outside version 1.
- Rules, budgets, timing, target legality and capability readiness are enforced
  before tactical preference. A class preference cannot waive a wall or grant
  Trample, a save, resistance, forced movement or a resource refresh.
- Planning is read-only. Approval uses controller-owned candidates and the
  current board/order/policy stamp. Existing explicit execution and auto-mode
  authorization boundaries remain in force; choosing a policy does not enable
  execution or change the approval mode.
- Predicted benefits remain estimates or conditional branches. Native confirmed
  outcomes determine later actions. No explanation may claim a predicted hit,
  failed save, grapple, damage or shield effect actually occurred.
- Use only the supplied authorized snapshot and explicitly supplied GM context.
  Do not infer enemy roles, hidden capabilities, objectives or rear areas from
  token names, artwork, prose persona or absent data.
- Optional model output remains advice/intent/characterization. It cannot edit
  policy authority, executable steps, facts, source bindings or approval.

## Decision pipeline and precedence

1. Validate inert JSON, reviewed policy/bindings, source compatibility, the
   snapshot and structured order. Reject incompatible or ambiguous class/policy
   identity. Feature-specific source drift excludes the affected capability and
   marks dependent goal facts unknown, giving partial coverage rather than
   granting a guessed rule.
2. Generate feasible plans through reviewed mechanics, retaining endpoint and
   sequence alternatives required by active policy goals. Unknown legality
   refuses that candidate; unsupported families produce explicit coverage gaps.
3. Apply hard order constraints. If no legal plan satisfies them, return
   `needs-input` with the constraint and supported alternatives for manual review.
   Do not silently relax the order or execute a generic fallback.
4. Rank remaining plans lexicographically by soft-order utility, class utility,
   individual utility, then existing basic tactical utility. Thus class tactics
   cannot outweigh an explicit soft GM objective, and personality cannot negate
   class priorities. Hard constraints are never numeric bonuses.
5. Break exact ties by lower movement cost, then a canonical plan key containing
   step kinds, source item IDs, targets, endpoints and path/branch identity.
   Display IDs such as A/B are assigned only after ordering and are not tie keys.
6. Form a bounded review shortlist, keeping the preferred evaluated plan and
   representatives of active supported policy families. Return diagnostics when
   search or display limits omit a family. Review and execution remain separate.

Proposed version-1 defaults: maximum review shortlist eight; no randomness;
one active GM order; no automatic persistence across a changed turn. Search
limits must be explicit input and deterministic, with coverage diagnostics.
Enumeration order and truncation never justify a claim of globally optimal play.

## Data contract

All records are plain JSON data, finite numbers and dense arrays. Version 1
uses closed schemas: reject unknown executable fields, expressions, callbacks,
accessors, sparse arrays, duplicate IDs and unsupported schema versions. Strings
are identifiers or display text, never code or scripts. Validate untrusted data
without invoking getters, as the existing ability descriptor code does.

| Record | Required content and interpretation |
|---|---|
| `NpcPolicy` | `schemaVersion`, stable `id`, integer `revision`, `reviewState`, `role`, `sourceRefs`, `match`, `requirements`, `goals`, `individualBounds`, `search`. Policy review records author/evidence separately; imported JSON cannot declare itself trusted. |
| `PolicyBinding` | `schemaVersion`, adapter-local `classId`, `policyId`, `policyRevision`, `sourceBindings` containing feature LIDs/versions/fingerprints. Match actual snapshot class IDs through reviewed binding metadata, never a normalized display name. Zero matches is explicit `unconfigured`; multiple matches is an `unconfigured` decision with an `ambiguous-binding` diagnostic, without first-match selection. |
| `match` | Exact supported tiers, template IDs and optional-feature policy. Initial pilot accepts T1, no templates and no optional systems. Unknown or changed loadouts cannot silently inherit the full base profile. |
| `requirements` | Feature LIDs, catalogue versions/fingerprints and whether needed for full-profile coverage. Readiness, costs and executable support come from mechanics resolution at planning time. A matched fingerprint is necessary source evidence, not a handler grant. |
| `goal` | Stable ID, an allowlisted `metricId`, integer weight 1–10, applicable supported families and source/interpretation references. Metrics are reviewed code from a finite registry. No arbitrary predicate language. |
| `Order` | `schemaVersion`, stable `id`, integer `revision`, `turn`, `actorTokenId`, `kind`, `mode` (`hard` or `soft`) and kind-specific `parameters`. Version 1 kinds: `free`, `focus-target`, `hold-area`, `protect-ally`. Their closed meanings are below; no arbitrary predicate arrays or new UI are required in the selector slice. |
| `EvaluationFact` | `id`, value with a declared unit, `knowledge` (`known`, `unknown`, `not-applicable`), source and relevant token/plan IDs. Unknown has `value:null`; every estimate/conditional branch is labeled. |
| `PolicyEvaluation` | Policy/order revisions, plan key, rank vector, contributing facts/goal utilities, omissions/warnings and factual reason codes. Explanations are generated from registered templates and these facts. |
| `PolicyDecision` | `state`, policy/order/snapshot stamps, selected plan key or null, ordered candidates/evaluations and coverage/uncertainty diagnostics. No execution token, applied effect or fabricated native result. |

Policies and bindings carry explicit review evidence in maintained module data;
changing a policy revision or feature source invalidates the applicable review.
The runtime uses a reviewed registry rather than trusting a `reviewState` string
from an actor flag. Actor/world settings may choose a known policy ID and allowed
tendencies, but cannot install handlers or manufacture a source match.

### Source drift and partial policies

Proposed boundary: malformed/unreviewed policy data, a changed policy revision,
ambiguous class identity or unsupported tier/template/optional loadout produces
`unconfigured`. A feature fingerprint/version mismatch within an otherwise
valid base-class binding instead removes that feature's candidates and any
dependent tactical benefit. It produces `partial` with the affected LID and
reason. Remaining independent goals and independently supported ordinary choices
remain usable; unknown goals retain conservative utility as described below.
Do not transfer movement exceptions, resistance or source-specific weapon rules
to generic candidates. If no suggested plan is supported, return `needs-input`.
This distinguishes an identified Cataphract with unavailable Impale from an
actor whose class policy cannot be established at all.

### Structured order semantics

These are proposed version-1 defaults, not book rules. One order applies to one
actor/turn; compound orders and whole-route containment are later scope. Input
parameters reference existing authorized token IDs or explicit native grid cells.
Unknown, destroyed or wrong-side required tokens, missing cells/distances and
unknown required geometry yield `needs-input`, not guessed defaults.

| Kind and parameters | Hard mode | Soft mode |
|---|---|---|
| `free`, `{}` | Invalid; use soft free. | No extra order utility; class behavior applies. |
| `focus-target`, `{targetTokenId}` identifying a hostile | Every hostile-targeted action must target only this hostile; legal self/ally actions and movement remain possible. Does not mandate an attack or a hit. | Prefer estimated pressure on that explicit target; no fabricated target selection or damage outcome. |
| `hold-area`, `{areaCells}` as a nonempty unique cell list | Every cell of the actor's final native footprint must lie in the supplied area. Paths may leave it; occupied-anchor containment alone is insufficient. An actor starting outside may enter if legally reachable. | Prefer the fraction of final occupied cells inside the area; full containment is best. |
| `protect-ally`, `{allyTokenId,maxEndDistance}` with finite nonnegative distance | Actor's final native character distance from the identified ally is at most the supplied distance. This constrains position, not a guarantee the ally takes no damage. | Prefer positions within that radius and then useful pressure on known threats to the ally; unsupported threat information stays unknown. |

The hard predicate must hold for each represented planned outcome, including
uncertain branches when a descriptor supplies them; otherwise exclude the plan
or request the necessary choice before approval. Reactive interruption still
requires normal revalidation, not a guarantee about future enemy actions.
If no hard-compliant plan exists, explain the failed condition and wait for GM
input. There is no automatic switch to soft mode. Soft-order metric normalization
is a builder choice subject to these meanings and the scenario ordering tests.

### Utilities and unknown context

An allowlisted metric produces an integer desirability utility 0–100, where
higher is preferred. Each metric defines its units, normalization, inputs and
whether it needs a complete relevant population. The class score is the
weighted mean of all applicable goal utilities; retain unknown goals' weights
and give their unknown utility the conservative lower bound 0. This is a
ranking convention, not an assertion that the physical benefit is zero.
Record the unknown fact and penalty in the explanation. Exclude `not-applicable`
goals consistently by the same declared applicability test across candidates.

Examples: unknown shield distance population cannot establish active resistance;
unknown reaction exposure cannot be called safe; missing displacement goals
cannot establish that a destination is disadvantageous. The known facts remain
available for ranking supported ordinary moves. Unknown information required
for a hard constraint or legality instead yields `needs-input` or exclusion.

Metric implementations and numeric class tuning are a later builder task,
subject to the scenario relations below. Do not apply the current expected
damage calculation twice or include a native-derived resistance bonus twice.
Individual settings adjust only a final bounded preference vector in version 1,
not rule semantics or class weights. Out-of-bound settings are invalid input.

### Binding and source example

This is a non-executable documentation example. The class ID is synthetic;
feature fingerprints are real catalogue metadata for installed source 3.1.3.
The omitted full-profile features remain required by the prose contract; this
small binding example is not a complete policy or coverage manifest.

```json
{
  "schemaVersion": 1,
  "classId": "fixture-cataphract-class",
  "policyId": "cataphract-base-t1",
  "policyRevision": 1,
  "sourceBindings": [
    {
      "lid": "npcf_impale_cataphract",
      "sourceVersion": "3.1.3",
      "sourceFingerprint": "cf7794eeac1852a42a611efde0a72dee18f3b22b3c54853d27d4a4e17381af42"
    },
    {
      "lid": "npcf_point_defense_shield_cataphract",
      "sourceVersion": "3.1.3",
      "sourceFingerprint": "4bae80a12ea5bbb57a330ca3ca81892390be49bff3b33a37fee91d9f889c0a2c"
    }
  ]
}
```

## Cataphract policy interpretation

Printed guidance supplies the mobile-striker role, penetration toward rear
targets, displacement via Impale, attention to closest-hostile shield distance
and caution about movement reactions. The following priorities are proposed
implementation interpretations, not extra printed rules or a tactical optimum.

- Prefer access to vulnerable or GM-prioritized targets when the resulting
  position offers useful pressure. Never reward distance traveled for its own
  sake. A rear area must be supplied or derived by an explicitly reviewed metric;
  version 1 does not invent a formation direction.
- Evaluate Impale as a contingent displacement opportunity, comparing legal
  destination positions and possible branches. Until confirmed resolution,
  reasons say that displacement is conditional. No invented save probability
  contributes to expected damage or positional utility in version 1.
- Prefer a useful uniquely closest-hostile shield arrangement over an equal
  distance tie, all else equal. Include the identity of that hostile and known
  incoming danger; do not prefer any unique nearest hostile at arbitrary cost.
  Native distance semantics and the complete relevant hostile population are
  mechanics inputs, not a center-distance approximation in the policy.
- Penalize known movement exposure and disclose unknown exposure. Trample's
  pass-through/engagement exceptions do not imply reaction immunity. Ordinary
  movement cannot end in occupied space, and only the reviewed ability can
  authorize its particular pass-through behavior.
- Use ordinary supported attacks/repositioning when a special is unavailable.
  Missing defining mechanics gives `partial` coverage and an explicit warning;
  it does not make the actor a fully supported Cataphract. Installed optional
  Charge, Lasso, Bola, Lance Shot or Capacitor Discharge are outside the pilot
  binding and cannot be silently ignored while claiming full actor support.

## Scenario contract

These are synthetic fixture specifications, not executed tests or live evidence.
Use two layers: facts/metrics from small geometric fixtures, then policy ranking
over authoritative reviewed-candidate facts. Injecting candidates for ranking
does not establish that their mechanics can generate or execute them.

Each future fixture supplies ID, grid/footprints, actor/loadout/budget, explicit
GM context, capability resolutions, source bindings, candidate plan keys/facts,
and expected exclusions/ordering/decision state/reason codes. A fixture pins the
policy revision and metric version. Candidate input order must not affect output.
Relational expectations below hold other rank dimensions equal unless stated;
they avoid prescribing arbitrary numeric scores as proof of good behavior.

| ID | Controlled situation | Required result |
|---|---|---|
| CAT-01 | Same legal attack target/damage, two endpoints; one has a useful known unique closest-hostile shield arrangement and the other a distance tie | Prefer the useful shield endpoint; explain estimated protection, not applied resistance. |
| CAT-02 | All relevant hostile distances tie | Give no unique-hostile shield utility; never break the physical tie with token ID. |
| CAT-03 | Omitted/unknown relevant hostile population or native distance | Shield fact remains unknown; no asserted resistance or invented closest hostile. |
| CAT-04 | Two otherwise equal penetration routes, only one reaches a supplied priority target area | Prefer useful access. A longer route without additional benefit receives no penetration bonus. |
| CAT-05 | No designated rear area or adequate data to derive one | Do not fabricate a rear-line role/area; rank supported choices using known facts and report missing context. |
| CAT-06 | Known legal Trample pass-through route and another route ending in occupied space | Only the reviewed pass-through route can be offered; occupied endpoint is refused. Without its mechanic capability, refuse that pass-through too. |
| CAT-07 | Known reaction-exposed and known unexposed paths with equal tactical benefits | Prefer the unexposed path. Do not infer that Trample suppresses reactions. |
| CAT-08 | One path has unknown reaction exposure | Mark uncertainty and use conservative metric utility; never label it safe or guarantee no interruption. |
| CAT-09 | Impale unavailable due recharge, budget, source drift or unresolved continuation | Exclude Impale with the exact reason. Retain legal ordinary choices under partial coverage; never clear the resource in the planner. |
| CAT-10 | Two reviewed hypothetical Impale destinations, one improving a supplied positional objective | Prefer the useful conditional displacement opportunity with other dimensions equal. Explain that the outcome requires native save/choice resolution. |
| CAT-11 | Hypothetical Impale later receives failed, successful or cancelled native resolution | Only the execution session consumes real receipts and revalidates continuation. Policy output contains no preselected save result or applied grapple. |
| CAT-12 | Hard hold-area order conflicts with a higher-damage pursuit | Exclude the violating pursuit. If no legal plan complies, return needs-input; do not relax the order. |
| CAT-13 | Soft protect-ally objective favors one plan but class attack utility favors another | Prefer the higher soft-order utility; retain the legal alternative for GM review. |
| CAT-14 | Personality favors risk but class utility clearly favors a different plan | Class dimension wins; personality only resolves class/order equivalence. Out-of-bound values are rejected. |
| CAT-15 | Generic weapon/target dedup would keep only a damage endpoint and discard a shield/penetration endpoint | Evaluate relevant policy facts before dedup; retain the policy-best choice and family representative. |
| CAT-16 | More supported policy families than shortlist slots, or deterministic search limit reached | Retain global best; report exactly which families/branches were omitted and that evaluation is bounded. Never claim complete enumeration. |
| CAT-17 | Same input with shuffled tokens/candidates and renamed display labels | Same canonical plan ordering and factual reasons; labels can change display text only. |
| CAT-18 | Missing/ambiguous binding, unexpected template/optional system or unsupported tier | No silent name-match or full-profile fallback; return explicit binding/loadout diagnostics. Supported manual choices remain independently available. |
| CAT-19 | Relay disconnected in explicit policy mode | Return policy decision without a request. Invalid policy input is an error/manual path, not a hidden switch to a paid provider. |
| CAT-20 | Order, policy revision, target, board or budget changes after review; duplicate approval | Expire/revalidate the authoritative review through existing controller/session guards. Never execute an edited UI copy or repeat a reservation. |

The first five and CAT-15 are useful read-only selector prototypes even before
special execution exists. CAT-06 and CAT-09 must visibly refuse unsupported
mechanics in current development 0.7.0. Full CAT-10/11 execution evidence depends
on the mechanics roadmap; a ranking mock does not satisfy those runtime gates.

## Proposed pure interfaces and rollout

Future pure interfaces are `validatePolicy(data, registry)`,
`resolvePolicy(snapshot, bindings, registry)`,
`evaluatePolicyCandidate(candidate, context)` and
`selectPolicyDecision(candidates, context, limits)`. Generation must accept the
same policy context before its endpoint dedup stage. Exact function signatures,
metric implementation files, numeric tuning and search data structures are
builder choices; they must preserve the documented records and invariants.

Decision states are `ready` (complete declared coverage), `partial` (supported
choices with explicit feature/search gaps), `needs-input` (no compliant choice
or missing mandatory information), and `unconfigured` (no unambiguous valid
policy). Only ready/partial decisions can contain a suggested plan; partial
plans still require ordinary review and cannot imply full-profile completion.
No state directly executes. Malformed JSON is a structured validation error.

The next implementation plan should stage: contract/schema and fixtures;
policy-aware read-only candidate selection with deterministic explanation;
explicit policy-mode controller integration preserving approval; then the
Cataphract's reviewed special mechanics and disposable-world acceptance.
Existing model mode stays selectable. Switching modes is explicit and cannot
change execution settings, erase warnings or consume resources.

## Review and completion gates

For `tactics-contract`, this document and scenario inventory are the deliverable.
Validate example JSON/fingerprints, source links and scenario consistency; obtain
a builder review and the owner's review of the proposed behavior expectations.
Until the latter, keep the roadmap card active with unreviewed acceptance.
This does not require implementing every mechanics dependency to review the
contract. For `tactics-selector`, future tests must exercise each applicable
invariant and distinguish ranking fixtures from geometry/native execution.

Before a complete Cataphract claim, satisfy its exact source, native distance,
pass-through, conditional-save/drag continuation, passive and interrupted-flow
gates, then demonstrate approved outcomes in a disposable world. Preserve
existing tests and explicit unsupported-source diagnostics. No original-world
deployment or paid calls were authorized by the original design task. The owner
later explicitly requested local landing of the selector milestone; push and
runtime deployment remain separate.

Builder review: a read-only Codex reviewer raised source-drift scope and structured
order semantics in the first pass. Both were made explicit above; the second
pass reported "nothing important left". This is design review, not a passed
runtime test. The owner subsequently approved the contract and Cataphract
scenario expectations in chat on November 3, 2026. The accepted source has
SHA-256 `19c81d7433e3be1cdc929f7a07dac22bb3e57548e7707d7d52be2832377dfa15`,
retained in the task's local source snapshot. This is design acceptance;
selector implementation and native mechanics acceptance are separate work.
