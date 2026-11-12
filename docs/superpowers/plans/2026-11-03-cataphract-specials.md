---
type: Plan
title: "T1 Cataphract special mechanics plan"
description: "Milestone 2: Trample, Impale with native save continuation and Point-Defense Shield resistance."
status: draft
tags: [foundry, planning, npc-coverage]
sources:
  - resource: ../specs/2026-11-03-npc-policy-contract-design.md
  - resource: 2026-11-01-full-npc-coverage.md
  - resource: ../../review-evidence/2026-11-03-cataphract-source-review.md
generated:
  by: codex/unrecorded
  at: 2026-11-04T02:12:05Z
---
# T1 Cataphract Special Mechanics Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline. Steps use checkbox syntax. Independent final review follows the project's two-round limit.

**Goal:** Complete milestone 2: reviewed T1 base Trample movement/transit damage, Impale with native-confirmed save continuation, and source-specific Point-Defense Shield facts and resistance.

**Architecture:** Keep exact rule identity and mechanics in maintained descriptors and pure functions. Extend the adapter with a private execution session that records actual native results and accepts only the precise document changes made by that session. Integrate the resulting legal plans before policy pruning. Preserve the ordinary model path.

**Tech stack:** Plain ES modules, Node >=20 built-ins, `node --test`, Foundry 13.351 and reviewed Lancer 3.1.3 APIs; no paid inference or new runtime dependency.

**Spec:** [Approved policy contract](../specs/2026-11-03-npc-policy-contract-design.md), [full mechanics plan](2026-11-01-full-npc-coverage.md), and [source diagnosis](../../review-evidence/2026-11-03-cataphract-source-review.md).

## Global constraints

- Reuse `G:/GIT-REPOS/lancer-npc-pilot/.worktrees/tactical-roadmap`, branch `codex/tactical-roadmap`, baseline `9b0a5df`; preserve all prior uncommitted evidence/docs/media.
- The AI never rolls, invents results, refreshes resources or interprets source prose as executable code. Native flow completion and actual results authorize dependent steps.
- Explicit GM approval remains required with auto mode off; client settings do not grant execution or override the active GM. Reservations survive reload/cancellation.
- No API key or relay use in policy mode. T1 base only; options, templates, other tiers and classes remain later scope.
- No original-campaign testing, push, release, landing or runtime replacement is implied. Revalidate TEST COPY and deployment state before live work.
- Do not clear wall restrictions to implement engagement exceptions, halve rolled damage to implement resistance, or remove whole target records from stale guards.
- Preserve unknown reaction exposure and incoming threat facts. Trample grants no reaction immunity.
- Impale timing and per-character Trample frequency below were approved by the owner in chat. Pilot owns the standalone grapple lifecycle; Lancer Automations is not a required dependency.

## Rules gate and proposed behavior

**Impale timing (owner approved November 3, 2026):** approve route, target and conditional carried placement; pause at first contact, or at the adjacent endpoint if no transit contact; request the native Hull roll with one added difficulty against the source NPC's current save target. Failed save permits grapple and carried continuation; successful save continues only the Cataphract; cancelled/unverifiable save pauses the session with no assumed effect. No later action starts automatically after cancellation.

This first-contact proposal still requires a legal non-overlapped pause position and a legal target placement along the remaining movement. Where either branch cannot be proved legal, exclude the automated plan and explain the precise gap. A target may not be teleported through a wall or silently placed on an occupied endpoint. GM selection of a legal carried destination is explicit input, followed by revalidation.

**Trample frequency (owner approved November 3, 2026):** once per crossed character per Cataphract turn, shared across ordinary movement, Boost and Impale. Never grant a new allowance when a session or browser reloads.

Direct local-book review: Core Book p.297 prints the same `1/turn` clause as
the installed feature; p.60 defines that notation as once per turn, but neither
explicitly defines whether this particular passive tracks each crossed
character or one selected damaging transit. Long Rim contains no Trample
clarification. Per-character accounting is the owner's approved interpretation,
not a printed clarification. The printed period is a turn, not a round;
out-of-turn movement and multi-activation actors remain outside this T1 active
turn slice until their timing is reviewed.

**Shield:** determine the unique nearest hostile using the full living hostile population and native occupied-cell distances. Ties remove the benefit. Resolve resistance in the native damage application path, after armor and without stacking existing resistance. Planning may state distance identity without claiming useful incoming protection is known.

**Standalone grapple (owner approved November 3, 2026):** Pilot creates and removes only its own native effects and scene relations. It owns mirrored movement, free release, same-size control contests and the defender's quick-action escape. Native Hull flows determine opposed results; cancellation retains the grapple. Core Book p.13 awards tied contested checks to their actual initiator. No private Lancer Automations API, flags or synthetic attack event establishes the grapple.

## Review focus

1. A step blocked both by engagement and a wall remains wall-blocked when Trample is enabled.
2. A target crossed repeatedly, or by a large footprint over several cells, cannot receive duplicate Trample damage.
3. A cancelled or stale save, altered difficulty/DC, or unrelated roll cannot become an Impale failure receipt.
4. A native damage or grapple update may change only its named targets/fields; an external move or resource edit during that await interrupts continuation.
5. Shield ties, overlapping native resistances and changed attackers cannot produce pre-armor or repeated halving.

## Task 1: Reviewed source/readiness and separate movement restrictions

**Files:** modify `scripts/adapter/snapshot.mjs`, `scripts/core/reach.mjs` and `scripts/adapter/policy-context.mjs` under `foundry-module`; create `scripts/rules/cataphract.mjs` and `test/cataphract-movement.test.mjs`; extend `test/policy-context.test.mjs` and `test/large-snapshot.test.mjs`.

**Interfaces:** `cataphractCapabilities(board, sourceMatches) -> capabilities/gaps` resolves only maintained T1 feature identities and observed readiness. Snapshot records engagement edges separately from immutable wall/body collision edges. `movementContext(snapshot,mover,{passCharacters,ignoreEngagement})` defaults to ordinary restrictions; only reviewed handlers supply exceptions.

- [ ] Add failing source/version/tier/duplicate-feature/readiness cases. Assert source drift disables only the affected capability and never regenerates charge or usage counters.
- [ ] Add a same-edge engagement-plus-wall regression, ordinary engaged movement refusal, Trample engaged passage, allied/hostile/neutral transit, occupied endpoint refusal, body/difficult terrain and directed-wall cases on all five grids.
- [ ] Run targeted tests and retain the intended failing assertions.
- [ ] Separate engagement evidence in extraction; preserve all actual wall/body checks even on engagement edges. Implement explicit reviewed context exceptions without changing default callers.
- [ ] Run targeted movement/context tests plus installed large-snapshot conformance. Missing licensed dependencies stay unverified.

## Task 2: Native result adapters and durable session authority

**Files:** create `scripts/adapter/native-flows.mjs`, `scripts/adapter/execution-session.mjs`, `scripts/core/plans.mjs`, `test/native-flows.test.mjs`, `test/execution-session.test.mjs`; extend `adapter/controller.mjs`, `adapter/executor.mjs`, `adapter/snapshot.mjs` and their tests.

**Interfaces:** `validatePlan(plan,context) -> {ok,reasons}` validates closed inert steps. `executePlan(plan,approval,io) -> receipt` and `resumeExecution(executionId,confirmedInput,io) -> receipt` use private stored plans and exact execution/step IDs. Receipts distinguish completed, cancelled, awaiting-input, interrupted and failed. Persist reservation plus progress before mutation; reload retains a refusal/manual recovery path and never silently replays a step.

- [ ] Write failing cancellation, duplicate/out-of-order receipt, concurrent active-GM, reload, unknown-handler, edited public plan and missing native outcome tests.
- [ ] Write guard cases where one native update is expected but a target move, different HP change, resource edit or wall change occurs during the same await; require interruption.
- [ ] Run tests RED. Implement one session per reserved turn and a precise expected-document transition for each known native mutation; retain all unrelated guard fields.
- [ ] Adapt registered `StatRollFlow` on an instance only. Preserve native Hull initialization/HUD/difficulty modifiers, add one difficulty after native initialization, and require an evaluated native roll with the expected actor/path/DC before recording success/failure. Do not instantiate or evaluate `Roll` in Pilot code.
- [ ] Test native source conformance for initialization, HUD cancellation, adjusted difficulty, roll receipts and completed flow return. Reject unsupported step ordering/version; do not patch global steps, flow registry or prototypes.
- [ ] Run focused session/controller/executor/native tests GREEN, including ordinary-path regressions.

## Task 3: Trample movement and native transit damage

**Files:** create `scripts/core/cataphract.mjs` and `test/cataphract-trample.test.mjs`; extend native flows/session, `rules/cataphract.mjs`, `rules/npc-descriptors.mjs`, and snapshot warnings.

**Interfaces:** `trampleContacts(snapshot,path) -> ordered unique target contacts` intersects actual occupied cells, including allies/neutrals. `trampleDamageDue(contacts,ledger,ruling) -> due contacts` implements the answered frequency rule. Native damage adapter calls the reviewed native damage calculation and records actual changes rather than subtracting HP itself.

- [ ] Pin the owner's answered frequency rule in fixtures and source-review provenance; leave unresolved cases unavailable.
- [ ] Write failing repeated-body-overlap, repeated-segment, ally/neutral, interrupted-movement, failed-damage-write and turn-boundary tests. Damage is T1 fixed 2 kinetic before native armor/resistance, never a simulated attack roll.
- [ ] Run RED, then implement contact ordering and write-ahead accounting. Only verified reached contacts can trigger damage. Claiming a pending contact before application prevents duplicate automatic retry after an uncertain write.
- [ ] Verify movement-only and Boost tracker preservation, no reaction immunity, no damage on untraversed/cancelled movement, and exact native armor/resistance/overshield results.

## Task 4: Impale candidates and saved continuation

**Files:** extend `core/cataphract.mjs`, `core/plans.mjs`, native/session adapters and maintained descriptors; create `test/cataphract-impale.test.mjs`.

**Interfaces:** `impalePlans(snapshot,capabilities,limits) -> plans/gaps` enumerates straight routes up to eight spaces with explicit target and conditional carried placements. Hex straightness uses axial vectors, not offset-coordinate columns. A Full-action allowance and observed charged item are required; movement allowance is distinct from ordinary remaining movement.

- [ ] Pin the owner's timing ruling and test passed-through versus endpoint-adjacent targets, no target, wall/occupied landing, straightness on all grids, unavailable charge, partial-action refusal and conditional placement legality.
- [ ] Test successful, failed, cancelled and stale native saves. A saved target is not grappled/moved; failure proceeds only after its actual native receipt and revalidated legal destination. A cancelled save leaves no guessed result.
- [ ] Run RED; implement fixed-source candidate generation and session transitions using Task 2's receipts. Native recharge spending occurs once; never reset charge to retry cancellation. Preserve remaining ordinary movement rather than spending a special movement grant twice.
- [ ] Confirm actual grapple condition and target movement through native documents; fail closed on immunity/size/status restrictions not covered by reviewed evidence. Refuse broad unsupported interactions with an explicit reason.
- [ ] Run pure, session and installed-source tests GREEN before considering live execution.

## Task 5: Shield geometry and native resistance

**Files:** create `scripts/adapter/shield.mjs`, `test/cataphract-shield.test.mjs`, `test/native-resistance.test.mjs`; extend `core/cataphract.mjs`, `core/policy-metrics.mjs`, native adapters and snapshot/policy context.

**Interfaces:** `shieldSource(snapshot,defenderId,position) -> {knowledge,closestHostileTokenId,distances}` requires complete native footprints. `shieldResistance(context,sourceTokenId,defenderId) -> known applicability/gap` is source-specific. The adapter must associate the actual damage source with its scene token; ambiguous actor-to-token identity remains manual.

- [ ] Test no hostiles, unique nearest, ties, neutrals/allies, defeated characters, incomplete footprint/population, hidden population ambiguity and hypothetical endpoints on all five grids.
- [ ] Test armor-sensitive damage (e.g. raw 5/armor 2 yields resistance damage 2, whereas pre-armor halving yields 1), existing typed resistance, Shredded, Paracausal, Burn/Heat, overshield, multiple targets and changed source/position before application.
- [ ] Run RED and verify the native integration seam before enabling the descriptor: use native resistance at damage application, not the HUD's Half Damage control or persistent all-source resistance flags. No shared actor method/prototype patch.
- [ ] Integrate a guarded source-specific GM damage-application review with native result data and cancellation/duplicate protection. Where native source association or a safe application seam is unavailable, preserve an explicit manual gap; do not mark shield support complete from policy distance facts alone.
- [ ] Run pure/source-conformance/native damage tests GREEN and retain any unresolved extension seam as a precise blocker.

## Task 6: Policy generation, review and complete-slice verification

**Files:** extend `core/options.mjs`, `core/policy.mjs`, `core/policy-data.mjs`, `core/policy-metrics.mjs`, `adapter/controller.mjs`, `adapter/review.mjs`, `adapter/policy-context.mjs`, `pilot.mjs` and policy/UI tests.

- [ ] Write failing CAT-06/07/09/10/11 plus shield tie/usefulness, candidate retention, canonical sequence identity and hard-order refusal regressions. No save probability or invented reaction context contributes utility.
- [ ] Run RED, then enumerate reviewed specials before endpoint deduplication/pruning. Show conditional effects, exact target/route, Full/recharge costs and remaining gaps. Preserve private controller authority over all executable steps and continuation choices.
- [ ] Retain no-relay/no-secret tests through planning, review and continuation; test Skip, manual, disabled execution, board/config/source drift, edited UI copies and active-GM changes.
- [ ] Run `node --test` with installed Foundry/Lancer/pack conformance. Bump development minor version to 0.9.0 only when new behavior is implemented; synchronize root/package/manifest/download together. No release follows from changing these files.
- [ ] Request independent whole-change review; reproduce actionable findings RED and fix within the existing two-round budget. Preserve unfinished gates and report failed reviews honestly.

## Task 7: Disposable-world evidence and closeout

**Files:** update affected README/runbook/core documentation, versioning claims, index and roadmap; extend this task's source-review record with implementation evidence and add a separate live acceptance record when actually executed.

- [x] Revalidate current TEST COPY state, installed hashes, backup and deployment authorization before any runtime replacement. Preserve the original campaign. Automated windows remain hidden.
- [ ] Prove native Trample transit/damage limits, both Impale save branches and cancellation, stale continuation, source-specific shield resistance and ties, all with actual native outcomes and no relay. Do not force dice values to manufacture live evidence.
- [x] Restore settings, actors, scenes/encounters and temporary instrumentation; retain scoped native receipts and compare baseline hashes. Distinguish source tests from live acceptance and human tactical-quality review.
- [x] Run docs-sweep and available link/import/version checks: ten scoped documents, 120 local targets, 52 runtime modules, 160 imports, zero errors. No pinned OKF bundle exists; profile/freshness and native acceptance remain open.
- [ ] Review requests, checkpoint verified milestones, and record one canonical branch closeout/handoff. No commit/landing/push/publication without applicable authorization.

## Current checkpoint

- [x] Read project, handoff and existing approved policy/mechanics scope in the requested worktree.
- [x] Read exact installed three-feature records through a temporary pack copy; original hashes unchanged.
- [x] Inspect native system/stat/damage flow boundaries and identify engagement/wall conflation.
- [x] Focused baseline: 33 passed, zero failed/skipped; ignored `dist/cataphract-diagnosis-baseline.local.log`.
- [x] Owner approved Impale timing; direct Core Book/Long Rim check completed for Trample.
- [x] Owner approved per-character Trample frequency and standalone Pilot ownership.
- [x] Scoped product implementation, native-source conformance and two execution review rounds; corrections have failing/passing regression evidence.
- [x] Development versions synchronized to 0.9.0; prior uncommitted evidence preserved.
- [x] Partial native checks and real Impale review capture; exact module/world/config restoration and unchanged original-campaign data hashes.
- [ ] Complete disposable-world special-mechanic acceptance and human tactical-quality review: blocked on unsupported Automations coexistence and broader native variants. Scoped continuation passes now include Shield HP/Heat/replay, both Impale save branches, immediate control, paired movement and escape cancellation/completion. Active Automations refuses special/paired movement and Shield before mutation; 625 source tests pass. Exact 0.8.0 module/world/config restoration and campaign hashes matched. This does not establish complete acceptance. See [native findings](../../review-evidence/2026-11-03-cataphract-native-acceptance.md).

See [implementation checks](../../review-evidence/2026-11-03-cataphract-implementation.md)
for actual verification and remaining manual boundaries. Broad catalogue dispatch
stays closed; the source-checked Cataphract policy handler is a scoped entry point,
not a claim that the generic descriptor catalogue is complete. Earlier task
checklists retain their unfinished broad/native acceptance obligations.
