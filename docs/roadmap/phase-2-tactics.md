---
type: Roadmap
title: "Phase 2: Encode the books' tactical identities"
description: "Cards for the policy contract, module selector, the T1 Cataphract slice, encounter orders and the class roster rollout."
status: draft
tags: [planning, policy]
sources:
  - resource: ../superpowers/specs/2026-11-03-npc-policy-contract-design.md
  - resource: ../superpowers/plans/2026-11-03-policy-selector.md
  - resource: ../../foundry-module/scripts/core/policy.mjs
  - resource: ../review-evidence/2026-11-03-policy-selector.md
  - resource: ../review-evidence/2026-11-03-policy-acceptance.md
  - resource: ../review-evidence/2026-11-03-cataphract-implementation.md
  - resource: ../review-evidence/2026-11-03-cataphract-native-acceptance.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Phase 2: Encode the books' tactical identities

Part of the [NPC mechanics and tactical behavior roadmap](../roadmap.md).

Policy preferences may rank legal choices, but cannot grant an ability, waive
a rule, infer a save result or authorize execution. GM approval and Foundry's
native resolution apply with either selector. Structured GM orders constrain
class preferences; class-specific movement exceptions require reviewed mechanics.

## tactics-contract: Book-derived policy contract and scenario expectations

Status: design complete; source delivery is included in the local 0.8.0 milestone.
The owner selected this item on November 3, 2026. The
[approved policy contract](../superpowers/specs/2026-11-03-npc-policy-contract-design.md)
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

## tactics-selector: Module-only planning and explainable selection

Status: active; 0.8.0 implementation and scoped ordinary live checks complete;
GM tactical-quality acceptance remains open.
Depends on tactics-contract and supported candidate mechanics.

The [selector implementation plan](../superpowers/plans/2026-11-03-policy-selector.md)
stages pure evaluation, candidate retention and explicit controller integration.
Development 0.8.0 implements this selector in the existing tactical-roadmap
worktree: closed policies, deterministic pre-pruning evaluation and disconnected
GM review with source/configuration guards. [Scoped evidence](../review-evidence/2026-11-03-policy-selector.md)
records tests, the selected REQ-7 diagnostic fix and local source delivery.
The [disposable-world pass](../review-evidence/2026-11-03-policy-acceptance.md)
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

## tactics-cataphract: Complete T1 base Cataphract behavior slice

Status: blocked on native integration acceptance. Development 0.9.0 source adds
Trample/Impale, standalone grapple lifecycle and Shield application in this
worktree. The final source suite passes 625 tests, none failed or skipped;
[implementation evidence](../review-evidence/2026-11-03-cataphract-implementation.md).
The [native continuation](../review-evidence/2026-11-03-cataphract-native-acceptance.md#source-continuation-after-restoration)
passed both Impale save branches, Shield HP/Heat and replay refusal, immediate
first-turn control, paired movement and escape cancellation/completion. Foundry's
source shim, deferred turn/ruler updates, native no-op updates and movement
animation completion now have scoped corrections and regressions. Automations
coexistence remains unsupported: special/paired movement and Shield fail closed
before mutation. Exact original 0.8.0 module/world/config restoration passed;
campaign hashes matched. Remaining native variants, unknown target interactions
and human tactical-quality review stay open. This card is not complete. The
development source is included in an authorized partial local landing;
[landing scope and checks](../review-evidence/2026-11-03-cataphract-landing.md).
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

## tactics-orders: Encounter orders and individual tendencies

Status: planned. Depends on tactics-contract and tactics-selector.

Acceptance: let the GM supply structured objectives such as holding an assigned
area or protecting an identified ally, with limited individual risk/priority
adjustments. Targets/areas and missing context must be explicit. Tests show
orders changing candidate choice while preserving legal actions, equipped
capabilities and class identity. No LLM is required to use these controls.

## tactics-roster: Tier, optional-feature, template and class-policy rollout

Status: planned. Depends on the Cataphract slice and each batch's mechanics gates.

Acceptance: expand from Cataphract to contrasting class behaviors, then the
frozen installed roster. Include T2/T3, equipped optional systems and templates
without assuming uninstalled features. Give every applicable class a reviewed
source policy or a visible unresolved entry. Review Core Book/Long Rim sources
where applicable; do not claim expansion or whole-book coverage from filenames.
Track tactical behavior coverage separately from executable mechanic coverage.
