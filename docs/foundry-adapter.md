---
type: Runbook
title: Foundry adapter setup and acceptance
description: Hub for installing, operating and accepting the GM-only Foundry adapter; each topic has its own page.
status: draft
tags: [foundry, operations, testing]
sources:
  - id: runtime
    resource: ../foundry-module/scripts/pilot.mjs
  - id: controller
    resource: ../foundry-module/scripts/adapter/controller.mjs
  - id: executor
    resource: ../foundry-module/scripts/adapter/executor.mjs
  - id: design
    resource: design.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Foundry adapter setup and acceptance

Version 0.3.0 extends the GM-only Foundry v13 module with hex and mixed Size ½/1
geometry. Version 0.2.0 was installed and passed initial staged square-scene
proposal/Boost checks; full acceptance of 0.3.0 is still pending. Execution and
turn prompts default off; there was no auto-execute mode (historical;
development 0.10.0 adds an off-by-default [auto mode](foundry-adapter/auto-mode-and-banter.md)).
Nothing calls a model until the GM requests a proposal or explicitly enables
turn prompts.

Each topic below is a separate page so you can read only the part you need.

## Set up and play

- [Install and plan a turn in a staged scene](foundry-adapter/install.md) -
  manifest URL, relay, the guarded GM macro, Alt+P, the review dialog and
  enabling token execution.
- [Troubleshooting Plan Turn](foundry-adapter/troubleshooting.md) - scene,
  combat and scene-link messages and how to resolve them.
- [Terrain flags and NPC personas](foundry-adapter/terrain-and-personas.md) -
  scene terrain data and optional actor personas.
- [What approval and execution do](foundry-adapter/approval-and-execution.md) -
  pre-mutation checks, the executor, turn reservations and recovering from an
  interrupted turn.

## Scope

- [Supported scenes, tokens and weapons](foundry-adapter/supported-subset.md) -
  grids, token sizes, action budgets, allowed weapon tags, conditions, walls,
  engagement and what stays manual.
- [Module policy mode (development 0.8.0)](foundry-adapter/policy-mode.md) -
  relay-free decision mode and binding an actor policy.
- [Cataphract mechanics (development 0.9.0)](foundry-adapter/cataphract-mechanics.md) -
  Trample, Impale, standalone grapple (Alt+G) and Point-Defense Shield.
- [Auto mode and banter (development 0.10.0)](foundry-adapter/auto-mode-and-banter.md) -
  settings, model fallback, warm-up, turn end, outcome attribution, banner and
  banter filters.
- [Full NPC coverage work and catalogue audit](foundry-adapter/npc-coverage.md) -
  coverage status and the read-only audit/report tools.

## Evidence

- [Evidence and live acceptance gates](foundry-adapter/acceptance-gates.md) -
  lab facts, local conformance checks, the open acceptance checklist and scoped
  0.5.0 live checks.

Design intent and anti-goals are in the [design](design.md); release packaging is
in [versioning](VERSIONING.md).

## Related

- [Foundry adapter guide (topic pages)](foundry-adapter/index.md)
- [Lancer NPC Pilot design](design.md)
- [Versioning and Foundry releases](VERSIONING.md)
- [Documentation index](index.md)
