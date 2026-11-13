---
type: Runbook
title: "Terrain flags and NPC personas"
description: "Attach grid-cell terrain data to a scene and an optional persona to an NPC."
status: draft
tags: [foundry, operations]
sources:
  - resource: ../../foundry-module/scripts/adapter/snapshot.mjs
  - resource: ../../foundry-module/scripts/pilot.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Terrain flags and NPC personas

Part of the [Foundry adapter guide](../foundry-adapter.md).

Walls alone do not encode every Lancer terrain rule. Advanced setup can attach
grid-cell terrain data to the scene before reviewing it:

```js
await canvas.scene.setFlag('lancer-npc-pilot', 'terrain', {
  blocked: ['3,4'], difficult: ['4,4', '5,4'], cover: { '6,4': 'hard' },
  reviewed: false
});
```

Coordinates are `column,row`, matching the route shown in the dialog. Changing
terrain invalidates existing proposals. Mark it unreviewed again after editing
the map. The GM must include visual obstacles not represented by walls.

An NPC persona is optional:

```js
await canvas.tokens.controlled[0].actor.setFlag(
  'lancer-npc-pilot', 'persona', 'Berserker: close to melee and protect allies.'
);
```
