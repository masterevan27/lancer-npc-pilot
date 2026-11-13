---
type: Roadmap
title: "Phase 1: Finish the existing mechanics foundation"
description: "Cards for exact-source descriptors, legality, ordered plans, area attacks, effects, passives, reactions and roster acceptance."
status: draft
tags: [planning, npc-coverage]
sources:
  - resource: ../superpowers/plans/2026-11-01-full-npc-coverage.md
  - resource: ../../foundry-module/scripts/rules/npc-descriptors.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Phase 1: Finish the existing mechanics foundation

Part of the [NPC mechanics and tactical behavior roadmap](../roadmap.md).

These cards retain the scope of the existing eight chunks. An active card
contains partial delivery, not a claim that the whole chunk is implemented.
Future cards are planned; dependency work is not classified as an access blocker.

## mechanics-source: Exact-source catalogue and reviewed descriptors

Status: active. Existing plan: Chunk 1.

Acceptance: preserve every installed feature/tier/owner and source fingerprint;
resolve or explicitly retain all source ambiguities; allow execution only
through reviewed, version-bound descriptors. Classification and diagnostic
coverage alone must never satisfy executable coverage. Existing inventory,
resolver and diagnostics are partial evidence; the generic executable registry
is empty. The separately fingerprinted 0.9.0 Cataphract policy path does not
grant catalogue-wide dispatch or complete this card.

## mechanics-legality: Complete feature legality, footprints and budgets

Status: active. Existing plan: Chunk 2. Depends on mechanics-source.

Acceptance: finish feature-specific movement/target restrictions, template
exceptions, partial-turn costs and counter refresh; compare supported footprint,
wall and LOS cases with native square and four hex layouts. Preserve existing
0.7.0 geometry/budget regressions and record missing native cases explicitly.

## mechanics-sequences: Confirmed ordered plans and resumable execution

Status: planned. Existing plan: Chunk 3. Depends on relevant source/legality gates.

Acceptance: validate complete action sequences and costs before approval;
advance dependent steps only from confirmed native results. Cancellation,
interruption, reload, stale state and duplicate/concurrent approvals must not
repeat effects or spend actions twice. Existing single-option guards are not
evidence that the new sequence contract is implemented.

## mechanics-attacks: Area geometry and repeated or split attacks

Status: planned. Existing plan: Chunk 4. Depends on mechanics-sequences.

Acceptance: native-conformant Blast/Burst/Cone/Line targets and LOS, affected
allies/neutral actors, tiered repeated/split attacks, Ram Cannon mode exclusivity
and full-action costs. Planning is read-only; cancelled attacks cannot silently
start later attacks. All rolls and damage remain native outcomes.

## mechanics-effects: Tech, saves, effects and forced movement

Status: planned. Existing plan: Chunk 5. Depends on mechanics-sequences.

Acceptance: reviewed tech/save/choice result capture, costs and recharge, plus
legal status, heat and forced-movement handlers. Missing input waits for native
or GM/player confirmation; an effect card or predicted save never establishes
resolution. Test collision, immunity, size and interrupted movement boundaries.

## mechanics-passives: Passive traits and template interactions

Status: planned. Existing plan: Chunk 6. Depends on relevant reviewed handlers.

Acceptance: account for acting/target passives, equipped optional features,
templates and timing effects without duplicating native-derived bonuses.
Test rule-derived interactions and keep unresolved combinations explicit;
catalogue membership does not establish class or template support.

## mechanics-reactions: Reactions and interrupted-plan revalidation

Status: planned. Existing plan: Chunk 7. Depends on confirmed receipts and timing.

Acceptance: capture actual triggers, enforce availability/counter refresh,
deduplicate events and obtain the required separate GM approval. Revalidate
remaining actions after interruption; test simultaneous eligibility and
concurrent GM clients. Turn approval must not authorize unrelated reactions.

## mechanics-acceptance: Full installed-roster mechanics acceptance

Status: planned. Existing plan: Chunk 8. Depends on applicable mechanics cards.

Acceptance: account for all installed features, tiers, classes and templates;
every missing/manual mechanic remains visible unless the owner explicitly
accepts a scope exception. Complete the plan's unit, licensed conformance and
disposable-world scenarios, including native outcomes, concurrency and Uplink
coexistence. Preserve original-campaign safety and explicit deployment authority.
