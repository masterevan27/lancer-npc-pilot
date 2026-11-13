---
okf_version: "0.2"
---
# Documentation

Bundle checked with the pinned [OKF tools](../.okf/tools/profile.md) (house
profile 1.2.0, OKF v0.2). Run `npm ci --prefix .okf/tools --ignore-scripts
--no-audit --no-fund`, then `node .okf/tools/cli.mjs check .` from the
repository root.

## Core documents

- [Lancer NPC Pilot design](design.md) - Intent, goals, anti-goals, constraints and milestones; links to the topic pages below.
- [Foundry adapter setup and acceptance](foundry-adapter.md) - Hub for installing, operating and accepting the GM-only Foundry adapter; each topic has its own page.
- [NPC mechanics and tactical behavior roadmap](roadmap.md) - Hub listing every roadmap card, the delivery order and links to each phase page.
- [Versioning and Foundry releases](VERSIONING.md) - Version source, increment rules and the Foundry release packaging procedure.

## Topic pages

Read the one you need instead of a whole hub.

- [Design pages](design/index.md) - Architecture and the module policy selector design.
- [Foundry adapter guide](foundry-adapter/index.md) - Install, troubleshooting, supported subset, terrain, execution, policy mode, Cataphract mechanics, auto mode and banter, NPC coverage and acceptance gates.
- [Roadmap pages](roadmap/index.md) - The playable 2v2 milestone, the three phases and the 0.7.0 baseline.

## Specifications, plans and evidence

- [Superpowers specs and plans](superpowers/index.md) - Approved designs and implementation plans, including the policy contract and auto mode.
- [Review evidence](review-evidence/index.md) - Scoped agent evidence for acceptance runs, source reviews and landings; not human acceptance.

## Outside the bundle

- [Relay](../relay/README.md) - Run the model relay on the owner PC.
- [Pure core](../foundry-module/scripts/core/README.md) - Snapshot contract, options, prompt and reply.

## Related

- [README](../README.md) - Project overview and status.
- [Agent instructions](../AGENTS.md) - Rules for agents working in this repository.
