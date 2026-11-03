---
type: Plan
title: Module-only NPC policy selector implementation plan
description: Implement approved class policies through pure evaluation, candidate retention and an explicit module-only review path.
status: draft
tags: [foundry, planning, npc-coverage]
sources:
  - id: approved-contract
    resource: ../specs/2026-11-03-npc-policy-contract-design.md
  - id: roadmap
    resource: ../../roadmap.md
  - id: existing-mechanics
    resource: 2026-11-01-full-npc-coverage.md
  - id: controller
    resource: https://github.com/masterevan27/lancer-npc-pilot/blob/dc6f3b90d2ae03fdce3a5bd09ed21b999628ca46/foundry-module/scripts/adapter/controller.mjs
generated:
  by: codex/unrecorded
  at: 2026-11-03T08:47:27.664Z
---
# Module-only NPC policy selector implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Offer explainable, repeatable NPC choices without a relay, using approved class policies and the existing supported-action executor.

**Architecture:** Keep policy validation, order constraints, metrics and selection pure. Apply policy comparison before endpoint deduplication; resolve native class/source identity in a separate GM adapter. Add explicit policy mode to the current controller while retaining its authoritative options, approval and stale-state guards and the existing model path.

**Tech Stack:** Plain browser ES modules, Node >= 20 built-ins only, `node --test`, Foundry 13.351 and Lancer 3.1.3 as the initial conformance baseline. Browser hashing uses Web Crypto; no new dependencies or paid calls.

**Spec:** [Approved policy contract and CAT-01–20](../specs/2026-11-03-npc-policy-contract-design.md), approved by the owner in chat on November 3, 2026. Read both documents; this plan does not redefine the contract.

## Global Constraints

- The same snapshot produces the same ordered choices and explanations, without network access. Random variation is outside version 1.
- Planning is read-only. Choosing a policy does not enable execution or change approval mode. Preserve private controller candidates, board/turn checks and executor reservations.
- Policy preferences cannot grant mechanics, source identity, save outcomes, forced movement, reaction immunity or resource refresh. All outcomes remain native-confirmed.
- Initial class scope is T1 base Cataphract, without templates or optional systems. The current executable special-ability registry is empty; missing defining mechanics remains partial coverage.
- Metric utilities are integers 0–100; goal weights integers 1–10. Class utility is their weighted mean. Unknown facts have `value:null`, conservative utility 0 and retained weights, with explicit reasons.
- Ranking is lexicographic: soft order, class, individual, existing basic score; then lower move cost and canonical key. Defaults: review cap eight, one order per actor/turn, no randomness.
- Reject malformed data, ambiguous identity, unsupported loadouts and mandatory unknown context. Never infer class/tactics from names or silently fall back to a model.
- Provider keys stay relay-only; player clients receive no planning API; keep NHP Uplink independent.
- This slice uses current one-action options and ordinary movement. Sequences, Trample, Impale, shield effects and reactions retain the existing mechanics plan's gates. Ranking fixtures cannot establish native support.
- Reuse `G:/GIT-REPOS/lancer-npc-pilot/.worktrees/tactical-roadmap`, branch `codex/tactical-roadmap`, baseline `dc6f3b9`, preserving this session's existing documents. The original implementation task excluded landing. The owner subsequently invoked local land on November 3, 2026; push, deployment and original-campaign testing remain outside this scope.
- Behavior implementation advances current 0.7.0 to 0.8.0 if still current at execution; synchronize VERSION, package.json, module.json and manifest download under docs/VERSIONING.md. Planning alone keeps 0.7.0.

## Review Focus

1. Hard orders use every final native footprint cell; missing geometry cannot be approximated (Task 2).
2. Getters, sparse records, forged review flags, ambiguous classes and feature drift cannot manufacture authority (Tasks 1 and 5).
3. Input order, display labels, ties and early weapon/target dedup cannot change or discard the preferred evaluated choice (Tasks 3 and 4).
4. Source hashing races and mode/order/binding changes must invalidate reviews before execution or reservations (Tasks 5 and 6).
5. Disconnected policy mode needs no secret/model request; invalid policies and escaped explanations stay visible without enabling no-choice execution (Task 6).

## Scope and shared interfaces

Deliver `tactics-selector`, not complete Cataphract mechanics. Initial native
execution remains restricted to the already-supported weapons/movement. Core
order behavior is implemented with injected inputs; production initially uses
a free order, with no objective editor or natural-language orders. Existing
users retain model mode by default; policy mode is explicitly selected.

`PolicyContext` contains `snapshot`, `policy`, `order`, `individual`,
`capabilities`, `factsByPlanKey`, `contextStamp` and `coverageGaps`.
`Candidate` retains current `move`, `action`, `facts`, `score`, `category`, plus
canonical `key` and `family`. `PolicyEvaluation` contains `rank:[order,class,
individual,basic]`, `moveCost`, `goalUtilities`, `reasonCodes` and `warnings`.
`PolicyDecision` follows the approved four states, ordered candidates/evaluations
and selected key or null. Validation errors are
`{ok:false,errors:[{path,code,message}]}`; successful validation is `{ok:true,errors:[]}`.

No new `TurnPlan` executor is introduced. Current reachability retains one
shortest path per endpoint; report that bounded-search limitation and the
single-action limit, without claiming every alternate route was evaluated.

## File map

| New file under `foundry-module/` | Responsibility |
|---|---|
| `scripts/core/policy-data.mjs` | Closed inert-data validation. |
| `scripts/core/policy-orders.mjs` | Hard predicates and soft-order utility. |
| `scripts/core/policy-metrics.mjs` | Finite metric registry and unknown treatment. |
| `scripts/core/policy.mjs` | Resolution, keys, evaluation, comparison and selection. |
| `scripts/core/rule-source.mjs` | Pure canonical rule-source serialization. |
| `scripts/rules/npc-policies.mjs` | Trusted data-only policy registry and provenance. |
| `scripts/adapter/policy-context.mjs` | Native binding/source checks, browser hashing and stamps. |

Modify existing `core/options.mjs`, `adapter/controller.mjs`, `adapter/review.mjs`
and `pilot.mjs` under that scripts tree; modify `tools/audit-npc-catalog.mjs`
at repository root to consume shared serialization. Test files below are under
`foundry-module/test/`. No existing module needs a broad reorganization.

### Task 1: Validated policy data and canonical sources

**Files:** Create the new `core/policy-data.mjs`, `core/rule-source.mjs` and `rules/npc-policies.mjs` listed above; create `foundry-module/test/policy-data.test.mjs`, `rule-source.test.mjs`, `helpers/policy-fixtures.mjs` and `fixtures/policies/cataphract-v1.json`. Modify `tools/audit-npc-catalog.mjs`.

**Interfaces:** `validatePolicy(data,registry)`, `validateBinding(data,registry)`, `validateOrder(data,context)` return the shared validation result. `canonicalRuleSource(system)` returns the canonical string currently hashed by inventory. `NPC_POLICIES` is a trusted frozen registry. `policyScenario(id)` in the test helper returns a fresh synthetic fixture.

- [x] Write failing validation tests for version 1, finite numbers, weights 1–10, dense arrays, unique IDs, closed nested keys, unsupported tiers/templates/options, forged review flags and ambiguous class bindings. Pin `assert.equal(getterCalls,0)` and `assert.equal(validatePolicy(forged,trusted).ok,false)`; validating untrusted data must not execute accessors.
- [x] Run `node --test foundry-module/test/policy-data.test.mjs foundry-module/test/rule-source.test.mjs`; expect missing-module/export or named validation failures.
- [x] Implement validated records and policy `cataphract-base-t1`, revision 1, with the four base feature LIDs/fingerprints from the catalogue and explicit native class binding. Register goals `priority-access`, `shield-position`, `reaction-safety`, `conditional-displacement`, weighted 3,2,3,2 initially. These are implementation tuning, not book rules.
- [x] Extract the inventory's exact RULE_FIELDS and sorted-object serializer; preserve selected fields, absent values and array order. Node hashing remains in the tool. Test parity with the previous algorithm, property-order changes, rule changes and readiness-only changes. Refuse malformed/accessor source material before serialization. Do not track or log additional raw licensed prose.
- [x] Give every CAT-01–20 fixture inputs, expected relations/refusals and an explicit layer: facts, ranking, controller or mechanics-gated. Fake capability data stays inside tests; it never becomes a production handler or a native execution result.
- [x] Run the two new suites and `node --test foundry-module/test/ability-coverage.test.mjs foundry-module/test/mechanic-coverage.test.mjs`; require zero failures and unchanged catalogue accounting. Retain the verified task diff; create a focused local commit only if committing is authorized.

### Task 2: Orders, metrics and factual explanations

**Files:** Create `foundry-module/scripts/core/policy-orders.mjs`, `policy-metrics.mjs` and `foundry-module/test/policy-orders.test.mjs`, `policy-metrics.test.mjs`.

**Interfaces:** `checkOrder(candidate,context) -> {allowed,needsInput,reasons,utility}`; `evaluateMetric(metricId,candidate,context) -> {knowledge,value,utility,reasonCodes}`; `explainEvaluation(evaluation,context) -> {reason,warnings}`. Inputs use Task 1 validated records; unknown has null value and utility 0.

- [x] Write failing CAT-01–14 assertions: shield ties have zero utility; missing hostile population/distance remains unknown; Trample implies no reaction immunity; unavailable Impale gets no displacement benefit. Pin `assert.equal(fact.knowledge,'unknown')`, `assert.equal(fact.value,null)` and the prerequisite reason code.
- [x] Add hard-order boundary tests: anchor inside/body outside fails; starting outside can legally end inside; leaving the area en route alone does not fail endpoint containment. Missing native cells/distance requires input. Hard focus restricts hostile-targeted actions without requiring an attack. No compliant plan never relaxes to soft mode.
- [x] Run `node --test foundry-module/test/policy-orders.test.mjs foundry-module/test/policy-metrics.test.mjs`; expect named missing-interface/behavior failures.
- [x] Implement only allowlisted metrics. Shield utility requires both reviewed passive support and known useful uniquely-closest-hostile protection; a physical tie is 0 and missing support/information is unknown. Do not reward arbitrary unique proximity. Priority access uses explicit targets/areas; reaction safety is 100 only for known reviewed unexposed routes, with distinct exposed/unknown reasons. Displacement uses reviewed hypothetical branches without save probability or applied results.
- [x] Implement bounded soft utilities: hold-area is rounded percentage of final native footprint cells inside; focus-target uses existing estimated pressure on the explicit target; protect-ally favors the supplied radius before useful known pressure on threats. Pin chosen normalization constants and monotonic relations with tests. Unknown threat context cannot create a threat or protection guarantee.
- [x] Generate explanations from registered fact-backed templates. Assert they distinguish estimated/conditional/unknown facts and never say a hit, failed save, grapple or resistance application occurred. Run both suites to zero failures; retain verified changes or an authorized focused commit.

### Task 3: Deterministic evaluation and bounded selection

**Files:** Create `foundry-module/scripts/core/policy.mjs`, `foundry-module/test/policy-selection.test.mjs`; extend the policy fixture helper.

**Interfaces:** `resolvePolicy(snapshot,bindings,registry) -> {state,policy,gaps}`; `canonicalPlanKey(candidate) -> string`; `evaluatePolicyCandidate(candidate,context) -> PolicyEvaluation`; `comparePolicyEvaluations(a,b) -> number`; `selectPolicyDecision(candidates,context,{maxOptions,maxCandidates}) -> PolicyDecision`.

- [x] Write failing tests for fixed unknown weights, invalid individual bounds, lexicographic precedence, no-choice needs-input, feature drift partial versus identity ambiguity unconfigured and CAT-14/16/17/18. Pin `comparePolicyEvaluations(orderPreferred,classPreferred)<0` and exact plan-key ordering after shuffling inputs and renaming display labels.
- [x] Run `node --test foundry-module/test/policy-selection.test.mjs`; expect named failures.
- [x] Implement class weighted mean without dropping unknown weights. Zero applicable goals gives utility 0 with a diagnostic, never NaN. Bound `riskTolerance` to -1..1 in its own third rank dimension; existing candidate.score is the fourth dimension, without recomputing damage.
- [x] Canonical keys encode source IDs, kind/mode, sorted set-valued target IDs, endpoint, ordered path and represented branch identity; ignore display names/input order. Identical keys deduplicate; conflicting content under one key is invalid. Sort by rank, lower movement cost, then key.
- [x] Apply explicit deterministic limits, keep the best evaluated plan then supported family representatives within eight review slots. Report omitted families and search limits. Needs-input/unconfigured has no selected key. Run the suite to zero failures; retain verified changes or an authorized focused commit.

### Task 4: Preserve policy choices before endpoint dedup

**Files:** Modify `foundry-module/scripts/core/options.mjs`; create `foundry-module/test/policy-candidates.test.mjs`; preserve existing options, legality and partial-turn suites.

**Interfaces:** Extend `generateCandidates(snapshot,{weights,compareCandidates,candidateKey})` with optional hooks. Legacy defaults retain current results. A policy caller supplies Task 3 comparison/key functions; hooks may compare/retain existing legal candidates, never insert actions or waive legality.

- [x] Write a failing CAT-15 regression with two legal endpoints for one weapon/target: generic score prefers one, policy facts prefer the other. Assert the policy-best endpoint survives generation and selection. Add too-small shortlist/family-cap cases with explicit omission assertions.
- [x] Run `node --test foundry-module/test/policy-candidates.test.mjs`; expect the early-dedup regression to fail.
- [x] Thread comparison/key hooks through keep() and all best-endpoint paths for attack/Boost/retreat/hold. Preserve meaningful endpoint/path identities until policy comparison; current mechanics still supply every legal path/cost/target. No new ability family becomes executable.
- [x] Keep existing model-mode candidate fields/order identical on current fixtures when hooks are absent. Report the one-shortest-path/single-action bounds, and test policy-mode token-order invariance.
- [x] Run `node --test foundry-module/test/policy-candidates.test.mjs foundry-module/test/options.test.mjs foundry-module/test/legality.test.mjs foundry-module/test/partial-turn.test.mjs`; require zero failures and unchanged legality. Retain verified changes or an authorized focused commit.

### Task 5: Native class/source context and binding

**Files:** Create `foundry-module/scripts/adapter/policy-context.mjs`, `foundry-module/test/policy-context.test.mjs`; modify `foundry-module/scripts/pilot.mjs` for a GM-only binding API. Keep extractSnapshot() synchronous.

**Interfaces:** `readDecisionConfig({game,board}) -> {mode,binding,order,policyRevision,stamp}`; `resolvePolicyContext(board,config,{game,crypto,signal}) -> Promise<PolicyContext>`; `bindActorPolicy(actor,{classId,policyId},{game,registry}) -> Promise<boolean>`. Production supplies free order; other order kinds use injected core inputs until the later orders UI.

- [x] Write failing tests for exact native class ID, missing/multiple bindings, unexpected loadouts, altered source, readiness-only changes, aborted hashing and missing Web Crypto. An altered Impale fingerprint must remove that capability while retaining independent supported choices under partial coverage; incompatible identity must be unconfigured.
- [x] Run `node --test foundry-module/test/policy-context.test.mjs`; expect named failures.
- [x] Resolve only maintained registry IDs. GM binding stores class/policy identifiers on actor flags, verifying the class exists and has native type npc_class. Actor flags cannot supply trusted fingerprints, review authority or handlers; do not bind from display names or create actors.
- [x] Capture plain native feature source before awaiting SHA-256 over Task 1 canonical strings. Compare source versions/fingerprints; do not log or send rule material to a model. A fingerprint match does not enable specials: actual executor/descriptor capability and readiness remain separate.
- [x] Stamp mode, binding, policy revision, order and permitted individual context. Return only inert metadata/facts; cancellation discards results. Task 6 re-reads board/config after awaiting; data from a different board never becomes review authority. Run source-parity/context suites to zero failures; retain verified changes or an authorized focused commit.

### Task 6: Explicit mode and unchanged approval safety

**Files:** Modify `foundry-module/scripts/adapter/controller.mjs`, `adapter/review.mjs`, `pilot.mjs`; extend controller/ui tests and create `foundry-module/test/policy-controller.test.mjs`.

**Interfaces:** Add `readDecisionConfig` and `resolvePolicyContext` constructor injections, defaulting existing callers to model mode. plan() returns the existing review shape plus mode/state/diagnostics. Policy choice is `{source:'policy',optionId,reason,line:''}`. approve() also validates the stored decision/configuration stamp and eligible state.

- [x] Write failing CAT-19/20 tests: policy mode without secret/relay makes zero request calls, zero execution calls during planning and exactly one stored action after valid approval. Needs-input/unconfigured never chooses a model or offers Execute. Pin `assert.equal(requestCalls,0)` and authoritative-action equality after attempted UI edits.
- [x] Test mode/order/binding/policy/board/budget changes during hashing and after review, superseded plans, terrain changes and duplicate approval. All refuse before mutation/reservation; no asynchronous source result can revive an expired review.
- [x] Run `node --test foundry-module/test/policy-controller.test.mjs foundry-module/test/controller.test.mjs foundry-module/test/ui.test.mjs`; expect named failures.
- [x] Branch planning by explicit mode, keeping model request/retry behavior. Re-read board/config after context resolution and at approval; mismatches invalidate the review. Keep policy candidates/evaluations private like current authoritative options. Default executor and reservations are unchanged.
- [x] Register client decisionMode setting with choices model/policy, default model. Gate the current planTurn secret/configureRelay precondition on model mode. Expose only the GM binding API; do not add an objective editor or enable execution/turn prompts.
- [x] Policy review shows Re-plan, coverage and uncertainty diagnostics, without requiring relay setup. No-choice reviews retain Skip/Manual/configuration access without Execute. Escape all policy reasons/IDs/warnings; preserve model controls and dialog-footer behavior. Invalid data gives an actionable manual path, never hidden paid inference.
- [x] Run the three suites to zero failures; retain verified changes or an authorized focused commit.

### Task 7: Scenario accounting, versioning and acceptance evidence

**Files:** Update README.md, docs/design.md, docs/foundry-adapter.md, foundry-module/scripts/core/README.md, docs/index.md, docs/roadmap.md, VERSION, package.json and foundry-module/module.json. Add scoped evidence under docs/review-evidence/.

**Interfaces:** Scenario layer/ownership is explicit; count-based coverage or fake receipts never establish full class support. Record exact revision, commands, setup requirements and unverified gates.

- [x] Add a scenario-matrix test: every CAT-01–20 fixture has an owning suite or explicit mechanics gate. CAT-01–05/07–08/10/12–18 are fact/ranking cases; CAT-06/09 include unsupported-mechanic refusal; CAT-11 native continuation stays mechanics-gated; CAT-19/20 have controller integration tests. Actual special effects remain outside selector acceptance.
- [x] Run node --test from the implementation checkout and applicable installed Foundry/Lancer conformance. Separate skipped/unavailable native checks from product failures. Obtain whole-change code review within the repository's two-round limit, then run affected regressions and required final gates after fixes.
- [x] Apply the behavior-version bump specified above. Document opt-in policy mode, class binding, partial coverage and ordinary execution separately from special support. Keep source uncertainties and acceptance gates visible; refresh screenshots only after actually checking related UI.
- [x] If disposable-world testing is authorized, verify disconnected policy mode, no secret prompt, preview/Skip/Manual, stale/config refusal and ordinary native flow handoff. Do not infer special support from ranking tests. Keep the original campaign unchanged and record unverified live cases.
- [x] Run required docs/link/version/package checks, checkpoint verified milestones and record remaining exact mechanics/transport/GM/player gates. Complete only the tested selector scope; Cataphract full support retains its separate gates. No landing or publication follows automatically.

## Self-review and execution handoff

Spec coverage: data/trust/source boundaries → Tasks 1/5; precedence and unknowns
→ Tasks 2/3; pre-dedup retention → Task 4; modes/approval/staleness → Task 6;
scenario ownership and evidence → Task 7. All five Review Focus cases have
owning tests. Producer/consumer signatures above are the shared interfaces.

Tasks share policy context, canonical keys and the controller's async boundary.
Recommended method: native implementation in this session followed by an
independent whole-change review. Subagent-driven execution is available for
task-by-task reviews. Before product code, review this plan and select execution
method under the writing-plans workflow; the approved design needs no reapproval.

## Execution record (2026-11-03)

Implemented in the same `codex/tactical-roadmap` worktree as development 0.8.0.
All seven source/verification tasks are complete; optional disposable-world
checks were not authorized and remain unverified. The owner subsequently selected
REQ-7, docs-sweep and local land. REQ-7 is fixed in the same 0.8.0 milestone;
local Git history and the landing handoff record source delivery. Push, runtime
deployment and paid inference remain outside this scope. The original design
approval stands.
[Scoped evidence](../../review-evidence/2026-11-03-policy-selector.md) records
375 passing installed-source tests, independent review and regression fixes,
the original deferred diagnostic minor and its subsequent REQ-7 fix, plus exact
live/special-mechanics gates.
The approval-race fix adds a private guard inside the existing executor lock,
a necessary safety extension to Task 6’s otherwise unchanged execution path.
