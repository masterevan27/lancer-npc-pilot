---
type: Runbook
title: "Troubleshooting Plan Turn"
description: "Scene and combat messages Plan Turn shows and how to resolve each one."
status: draft
tags: [foundry, operations]
sources:
  - resource: ../../foundry-module/scripts/adapter/controller.mjs
  - resource: ../../foundry-module/scripts/pilot.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Troubleshooting Plan Turn

Part of the [Foundry adapter guide](../foundry-adapter.md).

Development 0.4.0 retains the actionable scene messages originally prepared
for the unreleased 0.3.2 source:

- **Scene not ready:** open the encounter map and wait for it to finish loading.
- **No active combat encounter:** choose or create an encounter in Combat Tracker
  and add the NPC.
- **Combat not started:** click **Begin Combat**, then start the NPC's turn.
- **Encounter not linked:** open its map, then choose **Combat Tracker →
  three-dot menu → Link to Viewed Scene**. A running encounter can still be
  unlinked; starting it again does not create a scene link.
- **Different scene:** open the encounter's linked scene before planning.

Retry **Plan Turn** after resolving the named issue. These checks never move
tokens, start combat or link a scene automatically.

## Related

- [Install and plan a turn in a staged scene](install.md)
- [Supported scenes, tokens and weapons](supported-subset.md)
- [Terrain flags and NPC personas](terrain-and-personas.md)
