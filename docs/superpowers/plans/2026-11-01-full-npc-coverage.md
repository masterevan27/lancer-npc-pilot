# Full Installed NPC Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the Pilot plan and hand off the installed NPC roster's weapons and special abilities, with tested legality, action costs, timing and native Foundry outcomes.

**Architecture:** Keep the Foundry adapter responsible for documents, geometry and native flows; keep rules descriptors, candidate generation and budget validation pure. Replace the single-action turn shape with reviewed action sequences and an execution state machine that resumes only from confirmed Foundry results. A finite catalogue and coverage matrix track each installed feature, tier and template interaction; unknown or modified mechanics remain visibly manual until reviewed.

**Tech Stack:** Plain browser ES modules; Node >= 20 built-ins for relay/tooling/tests; Foundry 13.351 and Lancer 3.1.3 as the initial verified runtime.

**Spec:** The owner's November 1, 2026 instruction in this chat requests full special-ability support across all NPC frames/classes, explicitly including area attacks, multi-attacks, tech attacks and reactions, and permits chunks/subagents. Read [design](../../design.md), [adapter guide](../../foundry-adapter.md) and the narrower [REQ-3 first-chunk plan](2026-11-01-npc-weapons.md) together with this scope.

## Global Constraints

- This scope supersedes the earlier v1 exclusions of reactions, Overwatch, tech attacks/invades and complex targeting. It does not authorize player-mech control or model-generated rules/outcomes.
- All design anti-goals remain: the AI never rolls or invents outcomes; actions require GM approval; illegal movement/targeting must not reach execution; provider keys remain relay-only; NHP Uplink must not be disrupted.
- The module uses plain ES modules with no build step. The relay uses Node >= 20 built-ins only. Tests run with `node --test` from the intended checkout.
- Continue in `G:/GIT-REPOS/lancer-npc-pilot/.worktrees/planning-errors` on `codex/planning-errors`, as the owner explicitly selected. Preserve the incoming uncommitted REQ-2 changes and their regression cases. Do not reset or overwrite other work.
- The owner subsequently authorized documentation review, local landing and a push of the verified partial milestone. This does not authorize release tags, installation, world mutation or deployment. Staged live runs need their applicable authorization and must keep the original campaign untouched.
- Keep execution and turn prompts off during source development. A passed unit suite does not establish live acceptance.
- Follow `docs/VERSIONING.md`. Development 0.4.0 incorporates the unreleased 0.3.2 REQ-2 preparation and the new weapon behavior; 0.3.1 remains the latest published release.
- No registered roadmap or pinned OKF bundle was found during this check-in. This plan does not invent dashboard approval or whole-document freshness.

## Scope and Completion Contract

The installed local `lancerworldv1` NPC compendium audit reports **44 classes** (including drones/deployables), **15 templates** and **461 features**: **68 Weapon** and **393 nonweapon** features. The nonweapon total includes **21 Tech** and **26 Reaction** entries. These are a finite starting scope, not a claim to cover every published expansion, homebrew item or future system update. Re-run the inventory before implementation to freeze exact IDs, fingerprints and runtime provenance; never silently drop entries to make coverage pass.

Cover T1, T2 and T3, optional features, template changes, installed sizes beyond Size ½/1, and rule-relevant interactions between active NPCs and targets. A feature counts as supported only when the planner can consider its legal uses, validate targeting/resources/timing, and hand off its resolution through reviewed handlers. Merely listing a feature, printing its native effect card or telling the GM to do it manually does not meet full support. A passive trait counts as supported when its relevant restrictions/modifiers and event effects are represented, including when it affects another NPC's candidate.

Rule-mandated decisions and saves can remain explicit GM/player interactions. Their required inputs, confirmed results and cancellation behavior must be part of the execution state machine. They are different from an unimplemented mechanic. No dependent step may infer a result from prose, a model response or the existence of a chat card.

**Current status:** the first REQ-3 chunk is implemented and independently reviewed: conservative weapon diagnostics and reviewed T1 Ram Cannon modes. The installed catalogue metadata, SHA-256 fingerprints, all-roster accounting test and data-only descriptor/coverage resolver are also implemented. The full 198-test suite passed with installed-source conformance; the final roster drift comparison additionally passed. No executable special-ability descriptor registry or runtime integration has been delivered. Catalogue-wide special abilities, larger tokens and new turn sequencing remain unfinished.

## Verified Native Flow Boundaries

The locally installed `.mjs.map` files include original TypeScript in `sourcesContent`, permitting bounded source inspection without distributing licensed source. Retain hashes/version and extraction method with local test evidence.

| Installed source | Source-map entry | Verified boundary |
|---|---|---|
| `lancer-actor-DUbnXjU1.mjs.map` | `flows/flow.ts` index 29 | `game.lancer.flows` holds constructors; `game.lancer.flowSteps` holds steps. `Flow.begin()` returns false on aborted steps and true after completion. |
| Same map | `flows/attack.ts` index 30 | `WeaponAttackFlow` runs checks, HUD, rolls and chat. `setAttackTargets` is a no-op; target range/LOS legality is not supplied by this flow. |
| Same map | `flows/tech.ts` index 31 | Tech attacks use native E-Defense rolls. NPC tier initialization differs from weapon initialization; explicitly test `tier_override`. |
| Same map | `flows/activation.ts` index 48 | Structured `system.actions` can dispatch activation/tech flows. Prose-only NPC features do not become complete structured actions automatically. |
| Same map | `flows/system.ts` index 51 | `SystemFlow` checks readiness/resources, applies self-heat and prints effect/trigger text. Targeting, saves and forced-save result data are explicit source TODOs. |
| Same map | `flows/damage.ts` index 52 | Native damage rolls/results must remain the source of damage outcomes. Read actual completed results rather than simulating resolution. |
| `_template-CRuDkhEm.mjs.map` | `canvas/weapon-range-template.ts` index 0 | `WeaponRangeTemplate.fromRange({type,val}, creator).placeTemplate()` performs interactive placement and creates a scene document. It is not a read-only candidate generator. |
| Same map | `flows/_template.ts` index 1 | `game.lancer.targetsFromTemplate(id)` mutates user targets from highlighted template cells; it does not validate legal origin, range, LOS or ability restrictions. |

The public item entry points are `beginWeaponAttackFlow()`, `beginTechAttackFlow()`, `beginSystemFlow()` and `beginActivationFlow(actionPath)`. Convenience methods do not consistently return the underlying success/cancellation result. Where subsequent actions depend on that result, use a verified registered flow instance and its confirmed result. Do not patch shared prototypes, the global flow registry or shared step arrays.

## Review Focus

1. Modified feature text, imported expansions and unsupported system versions must invalidate a descriptor and explain the gap (Chunk 1 tests).
2. Template combinations and passive target restrictions must change legality before a candidate reaches approval (Chunks 2 and 6 tests).
3. A cancelled or partially completed native flow must never spend remaining actions twice or silently start the next attack (Chunks 3 and 5 tests).
4. Large/irregular token footprints, walls and Blast-origin LOS must agree with Foundry on square and all four hex layouts (Chunks 2 and 4 tests).
5. Reactions, saves and forced movement may interrupt a sequence; stale approvals and duplicate hook deliveries must never repeat an effect (Chunks 5 and 7 tests).

## Shared Contracts

Use JSDoc and plain JSON-compatible values. No model-authored descriptor is executable.

- `CatalogueEntry`: `{ lid, kind, origin, tiers, sourceFingerprint, sourceVersion, descriptorId, coverage, gaps }`. `coverage` is `supported|partial|manual|unreviewed`; gaps are explicit acceptance items.
- `AbilityDescriptor`: `{ id, version, fingerprints, tiers, activation, cost, targetPolicy, geometry, attackSequence, effects, triggers, modifiers, handlerId, provenance }`. `handlerId` selects reviewed code, not arbitrary source text. `provenance` names the installed source/version and rule review evidence.
- `ActionBudget`: `{ move, quick, full, protocol, reaction, counters }`. Preserve native tracker values separately; normalize them through one adapter rather than duplicating conversion rules.
- `PlanStep`: `{ id, abilityId, handlerId, actorTokenId, sourceItemId, targets, geometry, cost, prerequisites, continuation }`. Targets and geometry are concrete approved values. `continuation` names which confirmed result a dependent step requires.
- `TurnPlan`: `{ id, snapshotStamp, turn, steps, score, facts, coverageWarnings }`. Model replies still select an offered plan ID only.
- `ResolutionReceipt`: `{ executionId, stepId, source, status, observed, nextDecision }`. `status` is `completed|cancelled|awaiting-input|interrupted|failed`; `observed` contains only native outcomes and document changes actually read.

## Chunk 1: Freeze the Catalogue and Descriptor Coverage

**Files:** extend the inventory tool produced by the first chunk; create `foundry-module/scripts/rules/npc-catalogue.mjs`, `foundry-module/scripts/rules/npc-descriptors.mjs`, `foundry-module/scripts/core/abilities.mjs`; add `foundry-module/test/ability-coverage.test.mjs` and sanitized `foundry-module/test/fixtures/abilities/` fixtures. Keep full local copyrighted exports and world identifiers out of tracked catalogue metadata.

**Interfaces:** `validateDescriptor(descriptor) -> {ok,errors}` and `resolveAbility(entry, context) -> {descriptor|null,coverage,gaps}` in `core/abilities.mjs`; `auditCoverage(catalogue, descriptors) -> {totals,entries,gaps}` in the inventory tool/library. Inputs include source fingerprints and runtime version, not names alone.

- [x] Freeze all 44 class, 15 template and 461 feature IDs/fingerprints from a temporary database copy. Reconcile count differences explicitly; never open original LevelDB stores with a writer.
- [x] Write failing coverage tests that preserve every installed entry, detect missing IDs, duplicate descriptors, changed fingerprints, unsupported tiers and runtime-version changes.
- [x] Implement the descriptor schema, resolver and explicit gaps without broad Effect/On Hit text exemptions or heuristic text-to-execution parsing.
- [ ] Annotate each mechanic with its owning later chunk and concrete remaining gates; show unresolved/passive coverage in review diagnostics.
- [x] Verify `node --test foundry-module/test/ability-coverage.test.mjs`. Expect all schema/accounting tests passing; expect the coverage report still to show unfinished mechanics until later chunks deliver them.

## Chunk 2: Footprints, Legality Context and Exact Budgets

**Files:** modify `scripts/adapter/geometry.mjs`, `scripts/adapter/snapshot.mjs`, `scripts/core/grid.mjs`, `scripts/core/reach.mjs` and `scripts/core/snapshot.mjs`; create `scripts/core/budgets.mjs` and `scripts/core/legality.mjs` under `foundry-module/`; add `test/budgets.test.mjs`, `test/large-geometry.test.mjs` and extend `test/foundry-runtime.test.mjs`.

**Interfaces:** `canSpend(budget,cost) -> {ok,reason}`; `spend(budget,cost) -> ActionBudget`; `validateUse(descriptor,use,context) -> {ok,reasons}`. Adapter snapshot adds actual token occupied-cell footprints, action budgets, relevant class/template IDs, reaction availability and per-feature counters. `context` supplies authoritative precomputed geometry/LOS, never browser globals inside the core.

- [ ] Write failing tests for every installed Size/tier/template-size variant, multi-cell occupancy, map edges, directional walls, friendly passage and target restrictions.
- [ ] Add licensed Foundry conformance cases using `getOccupiedGridSpaceOffsets()` and snapped native positions on square, odd/even-row and odd/even-column hex grids. Do not approximate large hex tokens as square footprints.
- [ ] Write budget tests for one full action versus two quick actions, protocols, movement, Boost, once-per-turn/round/scene counters, recharge and Limited uses. Include partial turns and restrictions imposed by conditions/templates.
- [ ] Implement geometry extraction, directed swept movement checks and budget normalization. Keep unsupported elevation/regions explicit until their exact semantics have conformance tests; log these as full-coverage gaps rather than claiming support.
- [ ] Verify `node --test foundry-module/test/budgets.test.mjs foundry-module/test/large-geometry.test.mjs foundry-module/test/foundry-runtime.test.mjs`, with `PILOT_FOUNDRY_CODE` set for native conformance. All supported variants must agree; missing licensed runtime is an unverified gate.

## Chunk 3: Action Sequences and Resumable Execution

**Files:** create `foundry-module/scripts/core/plans.mjs`, `scripts/adapter/execution-session.mjs` and `scripts/adapter/native-flows.mjs`; modify `scripts/core/options.mjs`, `scripts/core/prompt.mjs`, `scripts/adapter/controller.mjs`, `scripts/adapter/executor.mjs` and `scripts/adapter/review.mjs`; add `test/plans.test.mjs`, `test/execution-session.test.mjs` and extend controller/UI tests.

**Interfaces:** `generatePlans(snapshot, abilities, limits) -> TurnPlan[]`; `validatePlan(plan,context) -> {ok,reasons}`; `executePlan(plan,approval,io) -> ResolutionReceipt`; `resumeExecution(executionId,confirmedInput,io) -> ResolutionReceipt`. Only controller-issued approval can start either executable path; user UI data cannot edit authoritative plans.

- [ ] Write failing tests for move plus two quick actions, full-action alternatives, conditional follow-ups, plan diversity/pruning and deterministic plan IDs.
- [ ] Define bounded search by remaining action budget, deduplicated board state and descriptor-provided branches. Limit candidates without silently excluding whole available ability families; show pruning/coverage limits in diagnostics.
- [ ] Write execution tests for native cancellation, failure, partial movement, browser reload, missing capability, changed GM, stale targets, duplicate approval and repeated receipts. Assert no dependent step or second reservation occurs after uncertainty.
- [ ] Implement persistent execution IDs, per-step reservations, native-flow result receipts and board/budget revalidation at every await boundary. Resume from observed state; do not replay completed steps or infer that a convenience method returning `undefined` succeeded.
- [ ] Keep model input to legal offered plans and intent text. Review displays all steps, costs, affected tokens, conditional branches and required GM decisions before approval.
- [ ] Verify `node --test foundry-module/test/plans.test.mjs foundry-module/test/execution-session.test.mjs foundry-module/test/controller.test.mjs foundry-module/test/ui.test.mjs` and retain the existing approval/stale-board regressions.

## Chunk 4: Area Geometry, Multi-Attacks and Native Attack Modes

**Files:** create `foundry-module/scripts/core/areas.mjs`, `scripts/core/attack-sequences.mjs` and `scripts/adapter/templates.mjs`; extend `scripts/adapter/weapon-flow.mjs`, `scripts/adapter/native-flows.mjs` and descriptors; add `test/areas.test.mjs`, `test/attack-sequences.test.mjs` and licensed `test/native-template.test.mjs`.

**Interfaces:** `areaTargets(geometry,tokens,context) -> {targets,blocked,unknown}`; `expandAttacks(descriptor,use,budget) -> PlanStep[]`; `prepareApprovedTemplate(step,io) -> {documentId,geometry,targets}`. Geometry includes origin, orientation, dimensions and LOS origin; Blast range and target LOS use their correct separate origins.

- [ ] Write failing tests for Blast/Burst/Cone/Line, allies/neutral actors inside areas, overlapping large targets, self-exclusion rules, cover and wall occlusion on each grid layout.
- [ ] Compare proposed affected cells with native Foundry/Lancer highlighting. Planning must remain read-only; create a scene template only after approval, or collect a GM placement choice and re-review its exact geometry before attack execution.
- [ ] Write tests for Ram Cannon T2–3 repeated/split attacks, per-attack targets, tier limits, once-per-turn mode exclusivity, Superheavy full-action costs and cancelled first attacks.
- [ ] Implement reviewed descriptor handlers and attack steps. Each actual roll/damage remains a native flow; aggregate scores are estimates and never substitute for observed results.
- [ ] Verify `node --test foundry-module/test/areas.test.mjs foundry-module/test/attack-sequences.test.mjs foundry-module/test/native-template.test.mjs`; retain explicit native conformance and live acceptance gates.

## Chunk 5: Tech Attacks, Saves, Effects and Forced Movement

**Files:** create `foundry-module/scripts/core/effects.mjs`, `scripts/adapter/effect-resolution.mjs` and `scripts/adapter/decision-inputs.mjs`; extend descriptors, `native-flows.mjs` and execution sessions; add `test/tech.test.mjs`, `test/effect-resolution.test.mjs` and `test/forced-movement.test.mjs`.

**Interfaces:** `requiredInputs(step,receipt,context) -> DecisionInput[]`; `resolveEffects(descriptor,observed,confirmedChoices,context) -> EffectStep[]`; `applyApprovedEffects(effectSteps,io) -> ResolutionReceipt`. A missing save/choice/result produces `awaiting-input`, never a guessed branch.

- [ ] Write failing tests for all 21 installed Tech entries, E-Defense, Sensors/range/LOS, tier overrides, recharge, heat caps, immunity/resistance and each targeting policy represented by the catalogue.
- [ ] Test native tech initialization against the installed source for T1–3 and every supported override; fail visibly if native and descriptor tier semantics disagree.
- [ ] Add real save/contested-check result capture and explicit GM/player choice inputs. `SystemFlow` printing an effect card must never count as a completed save or applied condition.
- [ ] Implement reviewed heat, status, healing/repair, resource and forced-movement handlers shared by descriptors. Use actual native document results and idempotent receipts; do not auto-apply unreviewed prose.
- [ ] Test push/pull/drag direction, size/immunity restrictions, collision, occupied cells, optional distances and interruption. Movement paths must remain legal under the ability's explicit movement exceptions.
- [ ] Verify `node --test foundry-module/test/tech.test.mjs foundry-module/test/effect-resolution.test.mjs foundry-module/test/forced-movement.test.mjs`. Complete descriptors only after every applicable case has assertions for both permitted and rejected uses.

## Chunk 6: Passive Traits, Templates and Remaining Class Mechanics

**Files:** create `foundry-module/scripts/core/modifiers.mjs`, `scripts/core/timing.mjs` and `scripts/adapter/feature-state.mjs`; extend descriptors, legality and effect handlers; add `test/passives.test.mjs`, `test/templates.test.mjs` and catalogue-driven `test/class-coverage.test.mjs`.

**Interfaces:** `deriveModifiers(features,state,event) -> Modifier[]`; `applyModifiers(context,modifiers) -> context`; `dueEffects(event,state) -> EffectStep[]`. Modifiers are typed operations with explicit precedence and provenance, not arbitrary executable text.

- [ ] Account for every remaining nonweapon feature and all 15 templates. Distinguish native-computed stats from additional text restrictions/effects; never double-apply a bonus already present in actor data.
- [ ] Write failing tests for active-NPC and target passives, optional-feature interactions, start/end turn and round effects, multiple activations, structure/stress changes, destruction, spawn/deployable control and template-specific action/resource exceptions present in the inventory.
- [ ] Implement mechanic families in bounded descriptor batches. Add a shared handler only after its exact semantics are verified; retain per-feature provenance and fingerprint checks.
- [ ] For stacking/order interactions, test each interacting pair and representative three-way cases derived from catalogue references. Keep noninteracting template/class combinations as schema/coverage cases rather than claiming exhaustive combinatorial runtime testing.
- [ ] Verify `node --test foundry-module/test/passives.test.mjs foundry-module/test/templates.test.mjs foundry-module/test/class-coverage.test.mjs`. No class/template is complete while its base or selected optional features have unresolved legality/effect gaps.

## Chunk 7: Reactions and Interrupted Sequences

**Files:** create `foundry-module/scripts/core/reactions.mjs` and `scripts/adapter/reaction-controller.mjs`; extend `scripts/pilot.mjs`, timing, feature-state and execution sessions; add `test/reactions.test.mjs` and `test/interruption.test.mjs`.

**Interfaces:** `reactionCandidates(event,snapshot,descriptors) -> TurnPlan[]`; `offerReaction(event,io) -> review|null`; `recordEvent(nativeEvent) -> EventReceipt`. Event receipts identify source flow/document, triggering step and turn/round, permitting deduplication and exact timing.

- [ ] Write failing tests for all 26 installed Reaction entries plus Overwatch and reaction-granting passives from the coverage manifest. Validate triggers from actual native events, not model interpretations.
- [ ] Capture approved movement boundary and native pre/post-flow events with explicit cancellation status. Do not treat cancelled native flows as attacks that occurred.
- [ ] Test once-per-turn/round availability, reaction refresh, simultaneous eligible reactions, acting-character priority, stunned/disabled actors, chained reactions and duplicate hook delivery.
- [ ] Implement a separate GM reaction review with stable event IDs and interruption/resume boundaries. It may never inherit approval for an unrelated turn action or react automatically because turn prompts are enabled.
- [ ] Revalidate the interrupted plan after reaction resolution; changed position, conditions, resources or targets invalidate the remaining steps before they execute.
- [ ] Verify `node --test foundry-module/test/reactions.test.mjs foundry-module/test/interruption.test.mjs` with two-GM and repeated-hook tests proving one reservation/effect per event.

## Chunk 8: Catalogue-Wide Verification and Staged Acceptance

**Files:** extend the inventory/coverage tooling, `foundry-module/test/class-coverage.test.mjs`, `test/ability-coverage.test.mjs`, relevant descriptor fixtures and native conformance tests; update `README.md`, `docs/design.md`, `docs/foundry-adapter.md`, `docs/index.md` and version sources only when their claims actually change. Add scoped recoverable acceptance evidence under `docs/review-evidence/`.

- [ ] Run the finite catalogue audit and require every feature/tier/class/template to have a tested supported descriptor or an explicitly owner-accepted scope exception. A `manual`, `partial` or `unreviewed` entry keeps the full-support objective incomplete.
- [ ] Run `node --test` and the licensed Foundry/Lancer conformance suite. Separate sandbox/PowerShell/network/setup failures from product failures; keep individual command exit statuses and logs. Do not call a skipped native test verified.
- [ ] Use a disposable copied world for representative runtime scenarios across all mechanic families, all grid layouts and all installed size classes. Keep the original campaign unchanged and Uplink coexistence explicitly checked.
- [ ] Exercise proposal, alternate selection, execution disabled, cancellation, stale-board rejection, multi-step continuation, damage/save results, forced movement, reaction interruption, reload recovery and concurrent GM clients. Obtain real native outcomes, not mocked live screenshots.
- [ ] Review each descriptor's rules against source and fixture evidence; perform an independent code review of each subsystem, with at most two builder/critic rounds before recording unresolved blockers under repository preferences.
- [ ] Refresh affected docs/media and indexes, preserving unfinished acceptance gates and document freshness limits. Publish no claim of all-NPC support before the manifest and staged acceptance gates pass.
- [ ] Record verified milestones as checkpoints on the active attempt; record remaining exact chunk/descriptor IDs and evidence. Request review and create one canonical closeout/handoff when the authorized objective is complete or a concrete external blocker prevents further progress. Do not mark the request accepted or delivered merely because tests pass.

## Execution Order and Delegation

Complete the current REQ-3 first chunk and preserve its tests before extending its interfaces. Chunk 1 establishes the catalogue contract; Chunk 2 establishes legality/budgets; Chunk 3 establishes execution. Chunks 4 and 5 can then use separate implementation agents with disjoint handlers/tests. Chunk 6 integrates passives/templates before claiming class coverage. Chunk 7 depends on confirmed result/event receipts and timing. Chunk 8 is the final acceptance gate, not a substitute for per-chunk tests.

Delegate read-only rule/source research independently; implementation agents must own explicit file sets and communicate shared-contract changes before editing them. Preserve actual model provenance and token-free child receipts under the controller's attempt. This plan is a specification of requested future implementation, not a completed branch, release or installation.
