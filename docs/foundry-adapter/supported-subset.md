---
type: Runbook
title: "Supported scenes, tokens and weapons"
description: "Grids, token sizes, budgets, weapons, conditions, walls and engagement the adapter supports, and what stays manual."
status: draft
tags: [foundry, npc-coverage]
sources:
  - resource: ../../foundry-module/scripts/adapter/snapshot.mjs
  - resource: ../../foundry-module/scripts/adapter/weapons.mjs
  - resource: ../../foundry-module/scripts/adapter/geometry.mjs
  - resource: ../../foundry-module/scripts/adapter/budgets.mjs
  - resource: ../../foundry-module/scripts/adapter/swept.mjs
  - resource: ../../foundry-module/scripts/core/budgets.mjs
  - resource: ../../foundry-module/scripts/core/legality.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Supported scenes, tokens and weapons

Part of the [Foundry adapter guide](../foundry-adapter.md).

- Equidistant square grids and Foundry's odd/even row/column hex layouts.
- Development 0.7.0 source reads native Size ½,1,2,3,4 footprints at equal
  elevation, including the six native token shapes. Size½ tokens may be 0.5×0.5
  or1×1; other token width/height must match actor size. The adapter enumerates
  exact occupied cells at each candidate position; large hexes are never square
  approximations. Independent review and copied-world checks of Sizes 2–4 on
  all five layouts passed; see the scoped
  [evidence and acceptance gates](acceptance-gates.md). Broader acceptance
  remains open.
- Token documents must already be snapped. Planning never resizes or moves
  them. Small tokens retain their position within a cell; their containing cell
  is conservatively occupied for movement. Their actual centers are used for LOS.
- Hex row/column counts come from Foundry offset ranges, rather than dividing
  pixel dimensions by grid size. Candidates whose full pixel bounds extend
  outside the scene are omitted. Rounded token positions allow at most 0.51px
  of snapping error, matching Foundry's integer-pixel commits.
- NPC Speed is an integer from 0 to 12. All scene tokens need supported Lancer
  actors, including hidden enemies; player clients receive no planning API.
- Development 0.7.0 preserves partial native movement and the shared full/quick
  action pool. One full action requires both quick slots. Protocols close after
  spending; reactions and native item resources retain their observed state.
  The adapter still executes at most one approved option per native NPC turn.
  When either quick slot was spent before planning, the remaining count is
  displayed but attacks and Boost are excluded: the native tracker does not
  identify earlier weapon modes or Boost use. Movement-only partial turns can
  still propose an attack when both quick slots remain.
- Ordinary single-target Range/Threat weapons, move, Boost/retreat and hold.
  Development 0.4.0 adds separate melee (Threat 2) and ranged (Range 5) modes
  for the reviewed, unmodified T1 Cataphract Ram Cannon on Lancer 3.1.3. The
  approved mode is applied to that native attack flow instance; weapon documents
  and shared flow definitions are unchanged. T2–3 multiple attacks, tier overrides
  and modified/unknown mixed-mode weapons still require manual play.
  Other weapons with scripted effect/on-hit text, unknown tags, special area targeting,
  Smart, Seeking, Arcing, Ordnance or Superheavy classification are omitted.
  Allowed tags are Loading, Limited, Recharge, Accurate, Inaccurate, Reliable,
  AP, Overkill and self-heat. Unloaded, destroyed, spent Limited and uncharged Recharge
  weapons are unavailable. The live system resolves the actor tier.
  Each excluded NPC weapon is named with its reason in the proposal warnings.
  Nonweapon NPC features on every scene token are also named in proposal warnings,
  including passive traits, reactions, tech and systems. These conservative warnings
  identify the remaining implementation chunk and verification gates; unknown kinds
  stay manual. Native-derived stats remain in use, but warnings do not establish
  that additional passive restrictions or effects have been implemented.
  Development 0.6.0 adds concrete catalogue mechanic guides and unresolved source
  questions. Their runtime ID/kind association is explicitly informational:
  the browser has not verified an item's exact source fingerprint.
  A separate warning explains when no usable supported weapon remains; movement
  choices do not establish that the NPC has no weapons.
- Stunned, Immobilized, Slowed and Impaired are represented by the inherited
  core. Other active NPC conditions that may affect movement/actions are refused.
- Walls are checked in each direction using Foundry collision APIs. Missing or
  inconclusive collision/LOS never becomes permission to move or attack.
- HIDDEN enemies cannot be attack targets. Paths stop on entering adjacency
  to a visible enemy of equal or greater Size; an already-engaged NPC must
  move manually. This deliberately restricts movement rather than approximating
  Disengage. The reviewed 0.9.0 policy-only Trample handler is the explicit
  engagement/passage exception; walls and occupied endpoints remain enforced.
  Hidden enemies do not cause engagement.
- Region movement rules, different elevations, Hide,
  tech attacks, reactions and unreviewed feature activations require manual play.

This is intentionally narrower than the pure core and design. The inherited
`RULE?` assumptions in the core have **not** all been verified in live Lancer.
Hit/crit/expected-damage figures are scoring estimates, not predicted outcomes.
Cover is GM-supplied per cell and remains an approximation. Review engagement,
special traits and all accuracy/difficulty in the Lancer HUD. Resolve reactions
along the route manually; Pilot does not resolve Overwatch. The 0.9.0 handlers
delegate fixed Trample damage and explicitly approved Shield card applications
to native damage calculation; weapon rolls and outcomes remain native handoffs.
