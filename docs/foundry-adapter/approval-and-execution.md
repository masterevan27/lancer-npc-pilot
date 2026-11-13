---
type: Runbook
title: "What approval and execution do"
description: "Checks before mutation, how the executor moves and hands off attacks, and recovering from interrupted turns."
status: draft
tags: [foundry, operations]
sources:
  - resource: ../../foundry-module/scripts/adapter/controller.mjs
  - resource: ../../foundry-module/scripts/adapter/executor.mjs
  - resource: ../../foundry-module/scripts/adapter/weapon-flow.mjs
  - resource: ../../foundry-module/scripts/adapter/execution-state.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# What approval and execution do

Part of the [Foundry adapter guide](../foundry-adapter.md).

The controller verifies the stored proposal identity, active turn, actor/item
data, scene data and collision snapshot before mutation. Only Foundry's active
GM executes. A browser Web Lock prevents overlapping execution in same-origin
tabs in that browser; it is not a distributed lock between different browsers.
A persistent actor turn reservation prevents ordinary reload/replay. Use one GM
execution browser; do not run the same GM user simultaneously in other browsers.

The executor validates the stored token-specific pixel waypoints before reserving
the turn, then moves through approved waypoints (splitting
Boost after the ordinary movement budget), checks the actual final position and
unchanged board, updates Lancer's action tracker, selects targets and calls
`item.beginWeaponAttackFlow()`. The Lancer HUD owns all rolls and later outcome
handling. An optional NPC line is escaped and posted as **intent — before
resolution**. Damage is never applied by Pilot.

A cancelled flow, failed chat post or interrupted move may leave part of the
approved turn spent. There is no automatic retry or rollback; inspect the board
and finish manually. Development 0.7.0 spends the actual approved route cost,
including difficult occupied cells, and a quick action only for an attack or
Boost grant. Unspent movement/actions remain in the native tracker, but any
remaining Pilot actions are manual because the turn reservation survives reloads.
In a disposable
test only, after verifying no action happened, the GM can clear a reservation:

```js
await canvas.tokens.controlled[0].actor.unsetFlag('lancer-npc-pilot', 'lastExecution');
```

## Related

- [Install and plan a turn in a staged scene](install.md)
- [Supported scenes, tokens and weapons](supported-subset.md)
- [Evidence and live acceptance gates](acceptance-gates.md)
