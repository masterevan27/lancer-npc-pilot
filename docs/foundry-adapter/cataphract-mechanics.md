---
type: Runbook
title: "Cataphract mechanics (development 0.9.0)"
description: "Trample, Impale, standalone grapple and Point-Defense Shield handling, interaction boundaries and acceptance status."
status: draft
tags: [foundry, npc-coverage]
sources:
  - resource: ../../foundry-module/scripts/adapter/cataphract-executor.mjs
  - resource: ../../foundry-module/scripts/adapter/grapple-controller.mjs
  - resource: ../../foundry-module/scripts/adapter/shield-controller.mjs
  - resource: ../../foundry-module/scripts/adapter/trample-hooks.mjs
  - resource: ../review-evidence/2026-11-03-cataphract-implementation.md
  - resource: ../review-evidence/2026-11-03-cataphract-native-acceptance.md
  - resource: ../review-evidence/2026-11-03-cataphract-landing.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Cataphract mechanics (development 0.9.0)

Part of the [Foundry adapter guide](../foundry-adapter.md).

This development source is included in the authorized partial local landing;
[landing scope and checks](../review-evidence/2026-11-03-cataphract-landing.md).
Authorized temporary
TEST COPY staging exercised native mechanics, then restored the exact original
0.8.0 module, world and configuration; original campaign data hashes matched.
Full special-mechanic acceptance is **blocked**: Automations coexistence remains
unsupported and broader acceptance is unfinished. Scoped standalone passes now
include both Impale save branches, Shield HP/Heat and replay refusal, first-turn
control, paired movement and escape cancellation/completion, alongside prior
transit/free-release checks. The 625-test source suite does not establish full
acceptance. See the
[native findings](../review-evidence/2026-11-03-cataphract-native-acceptance.md).
[Implementation checks and remaining gates](../review-evidence/2026-11-03-cataphract-implementation.md).

- **Trample:** source-verified T1 base policy routes can cross characters and
  ignore engagement. They retain native walls, full-body occupancy, terrain
  costs and legal endpoints. Each actually crossed character, including allies
  and neutrals, can receive native fixed 2 kinetic damage at most once per
  Cataphract turn, shared across segments. Claims persist before application.
  An observed new native activation establishes history. Joining/reloading or
  ordinary manual movement makes the current history unknown without clearing
  claims; harmful transit remains manual until the next observed activation.
- **Impale:** requires a ready recharge item, both native Lancer **attacks** and
  **limited/loading** automation options, native save flows and an unspent Full
  action. Approve the straight route and conditional carried placement. Pilot
  pauses at a legal adjacent position before first contact, or at the adjacent
  endpoint; Lancer resolves Hull against the NPC save target with +1 difficulty.
  Actual failure establishes Pilot-owned native effects and mirrored movement;
  actual success continues only the Cataphract. Cancellation stops continuation
  and retains action/recharge spending. Ordinary movement is preserved.
- **Standalone grapple:** **Alt+G** opens free release for the original grappler,
  defender quick-action escape, same-size start-of-turn control contest and
  reviewed paired movement. Same-size control requires an observed native turn
  and refreshed actions; only the native turn's exact one-time action/reaction
  refreshes may advance that window. With Lancer Ruler Integration 7.3, its exact
  one-time current-combatant turn-status write may also complete turn start;
  other statuses, flags, versions and board drift still refuse. Rolls, action flows, movement or other board
  changes invalidate it. Non-roll turn banners do not. Native Hull rolls determine opposed results; Core
  Book p.13 awards ties to the actual initiator. Both characters lose Boost and
  reactions; the controlled side is Immobilized. Larger size controls after the
  Impale movement finishes. Partial-turn action identity, multiple grapples,
  unsupported changes or interrupted pending sessions remain manual. Cataphract
  paired movement uses **Plan Turn** so Trample accounting remains shared.
  Ordinary dragging is blocked on all clients; native API forced movement can
  break adjacency. Cleanup queues behind active mechanics and removes only
  Pilot-owned effects on broken adjacency, deletion or native defeat/destruction.
  Zero HP awaiting native structure resolution does not invent destruction.
- **Point-Defense Shield:** for newly observed native damage cards, clicking the
  native Apply control for a Shield-bearing target opens GM review. The current
  board, exact Shield source, unique source speaker token, full hostile
  population, confirmed amounts and native multiplier are rechecked. Resistance
  applies only to the unique nearest hostile, after armor, without stacking.
  Shield does not reduce Heat. Native half damage remains an independent GM
  choice affecting Heat too; heatless actors convert Heat to Energy natively.
  Old/reloaded/stale cards, ambiguous speakers and uncertain prior application
  remain manual. Write-ahead card claims prevent automatic double application.

Target source checks deliberately refuse automated Trample contact and Impale
against unreviewed NPC traits/templates, PC frames/talents/systems or active
effects. Supported ordinary native attacks can still be offered. This is a
conservative interaction boundary, not complete target-roster support. No private
Lancer Automations grapple API or flags are used; that module is optional.
When it is active, Cataphract special movement and standalone paired movement
refuse before reservation, costs or token movement; Shield refuses before claims
or damage. Resolve them manually. Native checks observed movement refusal and
Shield refusal with HP/Heat unchanged. This is a manual fallback, not coexistence
support.
Other modules' effects remain fully guarded; Pilot does not accept arbitrary
engagement changes or disable Automations to bypass this boundary.

Execution and turn prompts still default off. Free release, escape, control
contests, paired movement and Shield damage require the active GM and enabled
execution plus explicit review. Mandatory expiry of already-established owned
effects remains cleanup when execution is disabled. Neither policy planning nor
these handlers calls a model relay or reads a provider key.
