---
okf_version: "0.2"
---
# Documentation

Bundle checked with the pinned [OKF tools](../.okf/tools/profile.md) (house
profile 1.2.0, OKF v0.2). Run `npm ci --prefix .okf/tools --ignore-scripts
--no-audit --no-fund`, then `node .okf/tools/cli.mjs check .` from the
repository root.

## Core documents

- [Lancer NPC Pilot design](design.md) - Intent, anti-goals, architecture and milestones for the GM-approved Lancer NPC co-pilot.
- [Foundry adapter setup and acceptance](foundry-adapter.md) - GM setup, supported scenes, auto mode, banter and live acceptance gates.
- [NPC mechanics and tactical behavior roadmap](roadmap.md) - Verified mechanics progress and planned book-derived NPC behavior policies.
- [Versioning and Foundry releases](VERSIONING.md) - Version source, increment rules and the Foundry release packaging procedure.

## Specifications, plans and evidence

- [Superpowers specs and plans](superpowers/index.md) - Approved designs and implementation plans, including the policy contract and auto mode.
- [Review evidence](review-evidence/index.md) - Scoped agent evidence for acceptance runs, source reviews and landings; not human acceptance.

## Outside the bundle

- [Relay](../relay/README.md) - Run the model relay on the owner PC.
- [Pure core](../foundry-module/scripts/core/README.md) - Snapshot contract, options, prompt and reply.
