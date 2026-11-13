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
  at: 2026-11-13T06:00:00Z
---
# NPC mechanics and tactical behavior roadmap

The owner requested this roadmap on November 3, 2026 after discussing using
the books' class roles and TACTICS sections as the basis for module decisions.
The planned direction is a module that can choose supported legal plans from
class policies without a model connection. Optional LLM assistance can add
intent interpretation or characterization after its value is evaluated.
Development 0.8.0 is locally landed on `main` at `9b0a5df` and adds the opt-in
module selector described in [Phase 2](roadmap/phase-2-tactics.md). Model mode remains the default. Local source
delivery, scoped runtime checks and human acceptance remain separate.

This roadmap carries forward the [full NPC coverage plan](superpowers/plans/2026-11-01-full-npc-coverage.md).
It adds tactical behavior requirements without replacing that plan's mechanics
contracts, review limits or unfinished acceptance gates. Roadmap status is
implementation progress, separate from source landing and human acceptance.

Each phase and milestone is a separate page; this page lists every card so you
can jump to the one you need.

## Roadmap pages

- [Priority milestone: playable 2v2](roadmap/playable-2v2.md) (dashboard line
  `playable-2v2`): `play-auto-mode`, `play-banter`, `play-full-turns`,
  `play-engagement`, `play-roster`, `play-release`.
- [Phase 1: Finish the existing mechanics foundation](roadmap/phase-1-mechanics.md):
  `mechanics-source`, `mechanics-legality`, `mechanics-sequences`,
  `mechanics-attacks`, `mechanics-effects`, `mechanics-passives`,
  `mechanics-reactions`, `mechanics-acceptance`.
- [Phase 2: Encode the books' tactical identities](roadmap/phase-2-tactics.md):
  `tactics-contract`, `tactics-selector`, `tactics-cataphract`,
  `tactics-orders`, `tactics-roster`.
- [Phase 3: Evaluate behavior and optional model assistance](roadmap/phase-3-evaluation.md):
  `tactics-llm`, `tactics-acceptance`.
- [Historical audit baseline: development 0.7.0](roadmap/baseline-0.7.0.md) -
  the starting state and the sources this roadmap used.

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
shown in the card headings of each roadmap page. Every card has acceptance criteria; dependency
slugs identify required deliverables rather than calendar promises. No existing
work-item links were invented, and no Human todo or request acceptance changed.
The roadmap itself does not implement, land, push or deploy these plans.

## Related

- [Roadmap pages](roadmap/index.md)
- [Lancer NPC Pilot design](design.md)
- [Foundry adapter setup and acceptance](foundry-adapter.md)
- [Documentation index](index.md)
