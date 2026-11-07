---
type: Roadmap
title: NPC mechanics and tactical behavior roadmap
description: Verified remaining mechanics work and planned book-derived NPC behavior policies, beginning with the Cataphract.
status: draft
tags: [foundry, npc-coverage, planning]
sources:
  - id: mechanics-plan
    resource: superpowers/plans/2026-11-01-full-npc-coverage.md
  - id: coverage-evidence
    resource: review-evidence/2026-11-02-coverage-diagnostics.md
  - id: execution-evidence
    resource: review-evidence/2026-11-02-execution-acceptance.md
  - id: current-selector
    resource: ../foundry-module/scripts/core/options.mjs
  - id: descriptor-registry
    resource: ../foundry-module/scripts/rules/npc-descriptors.mjs
  - id: policy-contract
    resource: superpowers/specs/2026-11-03-npc-policy-contract-design.md
  - id: selector-runtime
    resource: ../foundry-module/scripts/core/policy.mjs
  - id: selector-evidence
    resource: review-evidence/2026-11-03-policy-selector.md
  - id: selector-plan
    resource: superpowers/plans/2026-11-03-policy-selector.md
  - id: policy-acceptance
    resource: review-evidence/2026-11-03-policy-acceptance.md
  - id: cataphract-implementation
    resource: review-evidence/2026-11-03-cataphract-implementation.md
  - id: cataphract-native
    resource: review-evidence/2026-11-03-cataphract-native-acceptance.md
  - id: auto-banter-design
    resource: superpowers/specs/2026-11-07-auto-mode-and-banter-design.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-07T06:30:00.000Z
---
# NPC mechanics and tactical behavior roadmap

The owner requested this roadmap on November 3, 2026 after discussing using
the books' class roles and TACTICS sections as the basis for module decisions.
The planned direction is a module that can choose supported legal plans from
class policies without a model connection. Optional LLM assistance can add
intent interpretation or characterization after its value is evaluated.
Development 0.8.0 is locally landed on `main` at `9b0a5df` and adds the opt-in
module selector described below. Model mode remains the default. Local source
delivery, scoped runtime checks and human acceptance remain separate.

This roadmap carries forward the [full NPC coverage plan](superpowers/plans/2026-11-01-full-npc-coverage.md).
It adds tactical behavior requirements without replacing that plan's mechanics
contracts, review limits or unfinished acceptance gates. Roadmap status is
implementation progress, separate from source landing and human acceptance.

## Historical audit baseline — development 0.7.0

Audit baseline: local default branch `main`, development 0.7.0 at
`dc6f3b90d2ae03fdce3a5bd09ed21b999628ca46`. Local `origin/main` is one commit
behind; this audit did not fetch or verify current remote publication.
There were no registered roadmap lines or cards before this update.

- Supported basic move/attack choices, tunable scoring, model selection and
  top-score fallback exist. A class-policy selector does not yet exist.
- The catalogue and inert diagnostics preserve 461 features across 1,383
  feature/tier records, 44 classes and 15 templates. Evidence records 64 source
  questions and 911 implementation mechanic records with unfinished gates.
- Native larger-token geometry and observed partial-turn budgets have scoped
  implementation and copied-world evidence. Feature exceptions, template
  rules, counter timing and broader acceptance remain unfinished.
- The executable special-ability descriptor registry is empty. Existing T1
  Ram Cannon support does not establish complete Cataphract support.
- The recorded exact-commit full suite passed 302 tests. This audit separately
  ran the coverage, mechanic accounting, options and prompt/reply suites:
  51 passed, zero failures or skips. It did not repeat live Foundry tests.

The audit used default-branch code, local Git history, the latest landing
handoff and the two linked evidence documents. The Cataphract policy proposal
uses the owner's supplied Core Book page 297 excerpt. Neither whole PDF nor
The Long Rim was independently reviewed for this roadmap. Later policy work
must identify the applicable source/version and resolve installed-data or
errata discrepancies explicitly. Do not track full copyrighted rule exports.
No pinned OKF bundle/checker is present; its adoption remains outside this task.

## Priority milestone: playable 2v2

The owner set this priority on November 7, 2026: a match that is playable at the
table as two humans against two AI-controlled NPCs, or one human plus one AI
teammate (a friendly-disposition NPC) against two AI NPCs. This milestone comes
before whole-roster acceptance. It does not relax any anti-goal or shared safety
contract, and it reuses the Phase 1 cards below where they overlap rather than
replacing them. The [auto mode and banter design](superpowers/specs/2026-11-07-auto-mode-and-banter-design.md)
covers the first two cards. Dashboard line ID: `playable-2v2`.

### play-auto-mode: Hands-off NPC turns with a shared turn banner

Status: design agreed with the owner on November 7; not implemented.

Acceptance: an off-by-default GM setting plans and executes NPC turns without the
review dialog, using the existing legality, stale-board and replay guards. Any
refusal, missing input or changed board falls back to GM review or a held turn,
never a guess. Rolls stay in Lancer's native windows, clicked by a human unless the
separate off-by-default auto-roll option presses Lancer's own buttons. Auto mode
ends only its own NPC's turn, after observed applied damage or a resolved miss,
with an "End turn anyway" control; it never activates the next combatant. In model
mode, a relay failure or a 30-second silence plays the top-scoring safe option, and
a warm-up request with a notification readies the local model when the module
loads. Every client sees the agreed angled banner with
the round token/pilot portrait, a continuous ~1.8 s sweep while thinking, a brief
acting summary, and red/green side colours. Pure state-machine tests plus a
disposable-world pass with one hostile and one friendly NPC.

### play-banter: Situational in-character lines before and after resolution

Status: design agreed with the owner on November 7; not implemented.
Depends on reading native attack outcomes (new, read-only).

Acceptance: an off-by-default toggle produces up to two lines per NPC turn — an
intent line before the roll that never claims an outcome, and a reaction line
written only from the outcome Lancer recorded (none when ambiguous). Repeats and
near-repeats are suppressed. Lines appear as a speech banner with the speaker's
portrait and as an in-character chat message. Generation never blocks or changes
the turn; failure drops the line. The local model is the default; paid providers
need explicit selection. The key stays relay-side.

### play-full-turns: Complete NPC turns

Status: planned. Same scope as `mechanics-sequences` (Chunk 3), prioritized.

Acceptance: plan and execute move plus two quick actions or one full action as a
confirmed ordered sequence, advancing dependent steps only from confirmed native
results, under the `mechanics-sequences` acceptance criteria.

### play-engagement: Engaged NPCs can still act

Status: planned. Draws on `mechanics-legality`.

Acceptance: an NPC that starts its turn engaged can choose Disengage, fight where
it stands, or move under the engagement rules, instead of requiring manual
movement. Hostile and friendly NPCs are both covered by tests.

### play-roster: A small curated encounter roster

Status: planned. A subset of `tactics-roster`.

Acceptance: the T1 Cataphract plus two or three contrasting classes whose kits are
mostly supported ordinary weapons play their full T1 kit, with every unsupported
feature still named in warnings. Friendly-disposition use of each is tested.

### play-release: Publish and playtest

Status: planned. Depends on the cards above.

Acceptance: a version is published through the existing release workflow with the
owner's push authorization, installed in a disposable copy of the campaign world,
and a full 2v2 match is played in both configurations. Findings are recorded as
evidence; the original campaign world is not mutated without explicit authority.

## Phase 1: Finish the existing mechanics foundation

These cards retain the scope of the existing eight chunks. An active card
contains partial delivery, not a claim that the whole chunk is implemented.
Future cards are planned; dependency work is not classified as an access blocker.

### mechanics-source: Exact-source catalogue and reviewed descriptors

Status: active. Existing plan: Chunk 1.

Acceptance: preserve every installed feature/tier/owner and source fingerprint;
resolve or explicitly retain all source ambiguities; allow execution only
through reviewed, version-bound descriptors. Classification and diagnostic
coverage alone must never satisfy executable coverage. Existing inventory,
resolver and diagnostics are partial evidence; the generic executable registry
is empty. The separately fingerprinted 0.9.0 Cataphract policy path does not
grant catalogue-wide dispatch or complete this card.

### mechanics-legality: Complete feature legality, footprints and budgets

Status: active. Existing plan: Chunk 2. Depends on mechanics-source.

Acceptance: finish feature-specific movement/target restrictions, template
exceptions, partial-turn costs and counter refresh; compare supported footprint,
wall and LOS cases with native square and four hex layouts. Preserve existing
0.7.0 geometry/budget regressions and record missing native cases explicitly.

### mechanics-sequences: Confirmed ordered plans and resumable execution

Status: planned. Existing plan: Chunk 3. Depends on relevant source/legality gates.

Acceptance: validate complete action sequences and costs before approval;
advance dependent steps only from confirmed native results. Cancellation,
interruption, reload, stale state and duplicate/concurrent approvals must not
repeat effects or spend actions twice. Existing single-option guards are not
evidence that the new sequence contract is implemented.

### mechanics-attacks: Area geometry and repeated or split attacks

Status: planned. Existing plan: Chunk 4. Depends on mechanics-sequences.

Acceptance: native-conformant Blast/Burst/Cone/Line targets and LOS, affected
allies/neutral actors, tiered repeated/split attacks, Ram Cannon mode exclusivity
and full-action costs. Planning is read-only; cancelled attacks cannot silently
start later attacks. All rolls and damage remain native outcomes.

### mechanics-effects: Tech, saves, effects and forced movement

Status: planned. Existing plan: Chunk 5. Depends on mechanics-sequences.

Acceptance: reviewed tech/save/choice result capture, costs and recharge, plus
legal status, heat and forced-movement handlers. Missing input waits for native
or GM/player confirmation; an effect card or predicted save never establishes
resolution. Test collision, immunity, size and interrupted movement boundaries.

### mechanics-passives: Passive traits and template interactions

Status: planned. Existing plan: Chunk 6. Depends on relevant reviewed handlers.

Acceptance: account for acting/target passives, equipped optional features,
templates and timing effects without duplicating native-derived bonuses.
Test rule-derived interactions and keep unresolved combinations explicit;
catalogue membership does not establish class or template support.

### mechanics-reactions: Reactions and interrupted-plan revalidation

Status: planned. Existing plan: Chunk 7. Depends on confirmed receipts and timing.

Acceptance: capture actual triggers, enforce availability/counter refresh,
deduplicate events and obtain the required separate GM approval. Revalidate
remaining actions after interruption; test simultaneous eligibility and
concurrent GM clients. Turn approval must not authorize unrelated reactions.

### mechanics-acceptance: Full installed-roster mechanics acceptance

Status: planned. Existing plan: Chunk 8. Depends on applicable mechanics cards.

Acceptance: account for all installed features, tiers, classes and templates;
every missing/manual mechanic remains visible unless the owner explicitly
accepts a scope exception. Complete the plan's unit, licensed conformance and
disposable-world scenarios, including native outcomes, concurrency and Uplink
coexistence. Preserve original-campaign safety and explicit deployment authority.

## Phase 2: Encode the books' tactical identities

Policy preferences may rank legal choices, but cannot grant an ability, waive
a rule, infer a save result or authorize execution. GM approval and Foundry's
native resolution apply with either selector. Structured GM orders constrain
class preferences; class-specific movement exceptions require reviewed mechanics.

### tactics-contract: Book-derived policy contract and scenario expectations

Status: design complete; source delivery is included in the local 0.8.0 milestone.
The owner selected this item on November 3, 2026. The
[approved policy contract](superpowers/specs/2026-11-03-npc-policy-contract-design.md)
defines the agreed data, precedence and Cataphract scenario expectations;
the builder review is complete, and the owner approved the contract and
scenario expectations in chat. This completes the design deliverable, without
claiming native special mechanics or live gameplay acceptance. The selector
implementation is recorded in the next item.

Acceptance: define a shared, inspectable policy format for role, preferred
targets/positions, conditional priorities, equipped-feature dependencies and
source provenance. Distinguish printed rules/tactics from implementation
judgment. Specify precedence for GM orders, class preferences and individual
tendencies, plus explicit handling of unknown context and unsupported mechanics.
Agree Cataphract scenario expectations before implementing its selector.

### tactics-selector: Module-only planning and explainable selection

Status: active; 0.8.0 implementation and scoped ordinary live checks complete;
GM tactical-quality acceptance remains open.
Depends on tactics-contract and supported candidate mechanics.

The [selector implementation plan](superpowers/plans/2026-11-03-policy-selector.md)
stages pure evaluation, candidate retention and explicit controller integration.
Development 0.8.0 implements this selector in the existing tactical-roadmap
worktree: closed policies, deterministic pre-pruning evaluation and disconnected
GM review with source/configuration guards. [Scoped evidence](review-evidence/2026-11-03-policy-selector.md)
records tests, the selected REQ-7 diagnostic fix and local source delivery.
The [disposable-world pass](review-evidence/2026-11-03-policy-acceptance.md)
now records disconnected policy UI, cancellation, changed board/binding/source
refusals and approved ordinary movement/Ram Cannon native handoff. The owner
supplied a real role-2 player diagnostic with no Pilot API and an Alt+P no-op.
GM tactical-quality acceptance remains open.
The Cataphract special mechanics and later order editor remain separate gates.

Acceptance: apply policy priorities during candidate generation and pruning,
then rank/select using the same policy. A defining maneuver must not disappear
behind generic damage scoring. Selection is repeatable for the same inputs,
reports factual reasons and works with the relay disconnected. Preserve manual
alternatives, stale-state checks and GM approval. Never turn policy prose into
executable handlers or silently substitute a generic profile for missing support.

### tactics-cataphract: Complete T1 base Cataphract behavior slice

Status: blocked on native integration acceptance. Development 0.9.0 source adds
Trample/Impale, standalone grapple lifecycle and Shield application in this
worktree. The final source suite passes 625 tests, none failed or skipped;
[implementation evidence](review-evidence/2026-11-03-cataphract-implementation.md).
The [native continuation](review-evidence/2026-11-03-cataphract-native-acceptance.md#source-continuation-after-restoration)
passed both Impale save branches, Shield HP/Heat and replay refusal, immediate
first-turn control, paired movement and escape cancellation/completion. Foundry's
source shim, deferred turn/ruler updates, native no-op updates and movement
animation completion now have scoped corrections and regressions. Automations
coexistence remains unsupported: special/paired movement and Shield fail closed
before mutation. Exact original 0.8.0 module/world/config restoration passed;
campaign hashes matched. Remaining native variants, unknown target interactions
and human tactical-quality review stay open. This card is not complete. The
development source is included in an authorized partial local landing;
[landing scope and checks](review-evidence/2026-11-03-cataphract-landing.md).
Depends on tactics-contract, tactics-selector and relevant shared mechanics gates.

Acceptance: implement T1 base Ram Cannon, Trample, Impale and Point-Defense
Shield together with their tactical implications. Compare penetration routes,
useful displacement endpoints, vulnerable targets, known reaction exposure and
uniquely-closest-hostile shield positioning. Unknown reaction danger must remain
unknown. Respect native confirmed saves/grapples and cancelled/interrupted moves.

Fixture scenarios cover shield distance ties, blocked or occupied endpoints,
unavailable Impale, no useful penetration route, objective conflicts and a
shorter attack versus a tactically useful reposition. Show when a required
mechanic is unavailable. Demonstrate the supported slice in a disposable world
without a relay. T2/T3, optional systems and templates are later rollout scope;
a Ram Cannon-only preview is not completion of this card.

### tactics-orders: Encounter orders and individual tendencies

Status: planned. Depends on tactics-contract and tactics-selector.

Acceptance: let the GM supply structured objectives such as holding an assigned
area or protecting an identified ally, with limited individual risk/priority
adjustments. Targets/areas and missing context must be explicit. Tests show
orders changing candidate choice while preserving legal actions, equipped
capabilities and class identity. No LLM is required to use these controls.

### tactics-roster: Tier, optional-feature, template and class-policy rollout

Status: planned. Depends on the Cataphract slice and each batch's mechanics gates.

Acceptance: expand from Cataphract to contrasting class behaviors, then the
frozen installed roster. Include T2/T3, equipped optional systems and templates
without assuming uninstalled features. Give every applicable class a reviewed
source policy or a visible unresolved entry. Review Core Book/Long Rim sources
where applicable; do not claim expansion or whole-book coverage from filenames.
Track tactical behavior coverage separately from executable mechanic coverage.

## Phase 3: Evaluate behavior and optional model assistance

### tactics-llm: Optional LLM assistance and comparative evaluation

Status: planned. Depends on a working module-only baseline and reviewed scenarios.

Acceptance: compare profile-only choices with the current model selector using
the same known battlefield state and supported plans, including delays and
GM-reviewed tactical fit. Test cases must expose any candidates lost to pruning.
Use evidence to choose a bounded role for optional intent interpretation,
advice or characterization; do not assume a model improves tactics. Disabling
it preserves planning. Model output never grants rules, outcomes or approval;
API keys stay relay-only and paid calls need their own authorization.

### tactics-acceptance: Tactical scenario and GM review acceptance

Status: planned. Depends on the policy batch and mechanics being accepted.

Acceptance: maintain representative fixtures with explicit acceptable choices
and refusal cases, inspectable explanations and unchanged legality checks.
Run applicable disconnected-relay, cancellation, stale-board and disposable-world
cases. Obtain GM review of class behavior; record exact tested tiers/features
and remaining gaps. Tactical quality is not established by a higher damage
score or a passing schema test. Accept individual batches without claiming the
unfinished roster is complete.

## Delivery order and verification

As of November 7, 2026 the playable 2v2 milestone comes first: auto mode and
banter, then full turns and engagement, then the curated roster, release and
playtest. Phase 1–3 work continues behind it where the milestone does not already
cover it.

The approved contract and 0.8.0 selector implementation are locally landed.
The owner authorized the disposable-world pass on November 3. Its
[scoped evidence and real policy screenshot](review-evidence/2026-11-03-policy-acceptance.md)
cover disconnected no-secret review, Skip/Manual/configuration controls,
changed board/binding/source refusals, the real player-client boundary and
ordinary movement/Ram Cannon native handoff. This completes the scoped first
acceptance milestone; GM tactical-quality review remains separate. The ordinary
slice does not establish Trample, Impale or passive shield support.

The retained 0.9.0 Cataphract source has scoped native save, carry, Shield,
control, paired-movement and escape passes. The next gates are ownership-safe
Automations coexistence, the remaining native variants listed in the
[acceptance record](review-evidence/2026-11-03-cataphract-native-acceptance.md#source-continuation-after-restoration),
and tactical-quality review. Unknown target
passives remain explicit manual cases. Add the structured GM order
and tendency editor after the selector baseline is accepted. Complete the T1
base slice before expanding to other tiers, optional systems, templates and
contrasting class policies. The pilot need not wait for unrelated classes'
mechanics, but it cannot bypass the shared safety contracts.
Keep the existing eight-chunk implementation plan as the detailed mechanics
sequence. Optional model evaluation follows a usable module-only baseline.

Dashboard line ID: `npc-mechanics-and-tactics`. Card IDs are the stable slugs
shown in the headings above. Every card has acceptance criteria; dependency
slugs identify required deliverables rather than calendar promises. No existing
work-item links were invented, and no Human todo or request acceptance changed.
The roadmap update itself does not implement, land, push or deploy these plans.
