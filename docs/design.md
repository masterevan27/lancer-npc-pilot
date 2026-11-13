---
type: Design
title: "Lancer NPC Pilot design"
description: "Intent, goals, anti-goals, constraints and milestones for the GM-approved Lancer NPC co-pilot, with links to architecture and selector pages."
status: draft
tags: [architecture, foundry]
sources:
  - resource: ../foundry-module/scripts/pilot.mjs
  - resource: ../foundry-module/scripts/core/README.md
  - resource: ../relay/server.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Lancer NPC Pilot — design

Status: design from 2026-10-31; relay, core and the first Foundry adapter subset
are implemented in local source as of 2026-11-01. Initial 0.2.0 staged
square-scene live checks passed; full acceptance remains open. Version 0.3.0 adds
adapter support for four hex layouts and single-cell Size ½/1 tokens, with local
Foundry geometry conformance checks. The [adapter guide](foundry-adapter.md) records current restrictions;
the broader goals below remain the intended direction. The owner asked for building to start
without a question round, so choices marked *(builder's call)* were made by
the agent and may be revisited.

Detailed design topics have their own pages:

- [Architecture: relay, pure core and adapter](design/architecture.md) - why a
  relay, the snapshot sketch, options, prompt/reply, relay API and execution.
- [Module policy selector design](design/policy-selector.md) - the relay-free
  selector added in development 0.8.0.
- [Auto mode and banter design](superpowers/specs/2026-11-07-auto-mode-and-banter-design.md)
  and its [adapter page](foundry-adapter/auto-mode-and-banter.md).

## Intent

An AI that plays the NPC mechs in the owner's LANCER campaign on the live
Foundry VTT at `https://foundry.lab.spiralfrenzy.com/` (Foundry v13, Lancer
system). On an NPC's turn it chooses a tactically sensible, in-character
action. The GM approves it, and the module carries it out through Foundry and
the Lancer system's own flows.

Deterministic code works out what is **legal and how good it is**. Development
0.8.0 offers an explicit module policy selector without a model connection,
alongside the default model selector and its characterization. Both use the
same GM review and native execution guards. Neither rolls dice or decides
outcomes; Foundry does.

## Goals

- Per-NPC turn planning: move plus actions (v1: one move, then one weapon
  attack or a Boost/Hide/Brace/Disengage-style simple action).
- Two model backends, switchable per world (and optionally per NPC):
  **Claude through the Anthropic API** and a **local model** through any
  OpenAI-compatible endpoint (Ollama at `http://127.0.0.1:11434/v1` is the
  default; KoboldCPP at `:5001/v1` should also work).
- The GM stays in control: a review dialog with the chosen option, the
  model's one-line reasoning, the ranked alternatives and buttons for Execute,
  Pick another, Re-ask, Skip, and Do it manually.
- Personas: a short per-NPC (actor flag) or per-NPC-class tactical
  personality, e.g. "Berserker: always closes to melee".

## Non-goals (v1)

- Reactions, Overwatch, tech attacks and invades, systems with complex
  targeting, Grapple or Ram, and multi-turn plans. Leave hooks for them.
- Controlling player mechs.
- Reinforcement learning or any training.
- A full LANCER rules engine. Use Foundry and the Lancer system for mechanics.

## Expanded NPC scope (2026-11-01)

The owner subsequently requested support for all installed NPC classes and their
full special abilities, including area attacks, multi-attacks, tech attacks and
reactions. The earlier v1 exclusions above describe the original milestone and
are superseded for this new work. The [full coverage plan](superpowers/plans/2026-11-01-full-npc-coverage.md)
defines the implementation chunks and acceptance gates. Current source still
has the adapter restrictions documented in the setup guide; catalogue inventory
and native effect cards do not establish support. The anti-goals below continue
to apply.

## Module policy selector (development 0.8.0)

Development 0.8.0 adds an opt-in, relay-free policy selector that binds a native
class to a reviewed T1 Cataphract policy and ranks supported legal choices. See
the [policy selector design](design/policy-selector.md).

## Anti-goals (a failure even if it "works")

- The AI rolls, fabricates or narrates results that Foundry didn't produce.
- An NPC acts without GM approval while auto mode is off (the default).
- The Anthropic API key ends up in Foundry world data, chat, settings synced
  to players, logs or the repository.
- Illegal moves, such as moving through walls or beyond Speed, or attacking
  out of range or without line of sight, reach execution.
- Interfering with the NHP Uplink module, which may run in the same world.

## Architecture

A GM-only Foundry module (pure core plus thin adapter) asks a relay on the
owner's PC for a model decision; the relay holds the provider key. See the
[architecture](design/architecture.md).

## Constraints

- Foundry v13, Lancer system ≥ 2.0.0 (match the Uplink's manifest). GM client
  only; no-op on player clients.
- No build step for the module: plain ES modules, like the Uplink. The relay
  uses Node ≥ 20 built-ins only. Tests use `node --test`.
- Secrets are never committed. `relay/.env` and `secrets/` are Git-ignored.
- Cloud agents can't reach the lab (`*.lab.spiralfrenzy.com`) or the owner
  PC. Cloud work is code plus fixture tests; live verification on Foundry
  and Ollama happens locally afterwards and is reported as unverified until
  then.

## Milestones

1. **Relay** (`relay/`): providers, auth, CORS/PNA, health, tests with a mocked
   upstream. Independent of 2.
2. **Pure core** (`foundry-module/scripts/core/`): snapshot types and
   fixtures, hit-chance math, reachability, option generation and scoring,
   prompt builder, reply parser, tests. Independent of 1.
3. **Foundry adapter and UI**: extractor, LOS/collision precompute, review
   dialog, relay client, executor, settings, manifest. Needs 1 and 2, and live
   checks on the lab Foundry.
4. **Live acceptance**: install on the lab Foundry, run a staged skirmish with
   both Claude and the local model, record results.

## Left to the builder

File layout inside each folder, scoring weights, prompt wording, the UI
look, and which Lancer actions beyond attack/move/Boost make v1, provided the
anti-goals hold.

## Auto mode and banter

Development 0.10.0 adds off-by-default auto mode and NPC banter. They keep the
anti-goals: the AI still never rolls or invents outcomes, execution still needs
the existing gates, and the key stays relay-side. See the
[adapter guide](foundry-adapter/auto-mode-and-banter.md) and the
[design](superpowers/specs/2026-11-07-auto-mode-and-banter-design.md).
