# Lancer NPC Pilot — design

Status: design from 2026-10-31; relay, core and the first Foundry adapter subset
are implemented in local source as of 2026-11-01. Initial 0.2.0 staged
square-scene live checks passed; full acceptance remains open. Version 0.3.0 adds
adapter support for four hex layouts and single-cell Size ½/1 tokens, with local
Foundry geometry conformance checks. The [adapter guide](foundry-adapter.md) records current restrictions;
the broader goals below remain the intended direction. The owner asked for building to start
without a question round, so choices marked *(builder's call)* were made by
the agent and may be revisited.

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

The [approved policy contract](superpowers/specs/2026-11-03-npc-policy-contract-design.md)
now has a pure selector and opt-in client mode. Closed reviewed records bind
one native class LID to a T1 base Cataphract policy. Native feature sources are
captured before asynchronous SHA-256, checked against catalogue fingerprints,
and kept out of model requests. Identity/loadout ambiguity is unconfigured;
feature drift excludes the affected choices and reports partial coverage.

Supported legal candidates retain endpoint identities before policy pruning.
Ranking uses soft order, class weighted utility, bounded individual preference,
then existing basic score, followed by movement cost and canonical identity.
Hard orders never relax; missing mandatory native geometry requires input.
Production supplies a free order. Other structured orders are core interfaces
for injected inputs, with no objective editor yet. Development 0.9.0 adds scoped,
exact-source Cataphract Trample/Impale choices, standalone grapple lifecycle and
native Shield card application. Unsupported target interactions, useful incoming
protection, reactions and new live acceptance remain explicit gaps. See the
[mechanics scope](foundry-adapter.md#cataphract-mechanics-development-090-source).
This is a bounded one-move/one-action search with one shortest path per
endpoint, not an optimal multi-turn planner.

Policy planning never requests a relay or a secret. Its review holds private
authoritative choices, re-reads board/configuration after hashing and before
approval, and refuses stale/no-choice/duplicate approval before execution.
[Selector evidence](review-evidence/2026-11-03-policy-selector.md) separates
synthetic ranking tests, installed-code conformance and unverified live gates.

## Anti-goals (a failure even if it "works")

- The AI rolls, fabricates or narrates results that Foundry didn't produce.
- An NPC acts without GM approval while auto mode is off (the default).
- The Anthropic API key ends up in Foundry world data, chat, settings synced
  to players, logs or the repository.
- Illegal moves, such as moving through walls or beyond Speed, or attacking
  out of range or without line of sight, reach execution.
- Interfering with the NHP Uplink module, which may run in the same world.

## Architecture

```
GM's browser (Foundry client, GM only)
  foundry-module/  lancer-npc-pilot
    extract   : Foundry -> plain JSON snapshot (combat, tokens, stats, features)
    options   : snapshot -> ranked legal TurnOptions   (pure, Node-testable)
    prompt    : snapshot + options + persona -> messages (pure)
    choose    : POST relay /v1/decide, validate reply, fall back to top option
    review UI : approval dialog
    execute   : move token, set targets, start Lancer flows, post NPC line
        |
        | HTTP, shared-secret header
        v
Owner PC  relay/  (Node, no runtime deps, binds 127.0.0.1:5090)
    provider "anthropic"  -> Anthropic Messages API (key from env)
    provider "openai"     -> Ollama / KoboldCPP / any OpenAI-compatible URL
```

Why a relay *(builder's call)*: it keeps the API key out of the browser, and
it lets the HTTPS Foundry page reach the local model through one localhost
endpoint. Ollama binds localhost only on the owner PC, so the relay runs there
too. The GM plays from the owner PC (RTX 3080 12 GB). Before relying on it,
verify that the browser allows `https://foundry.lab…` to call
`http://127.0.0.1:5090`: Chromium treats localhost as a secure context, but
the Private Network Access preflight may need
`Access-Control-Allow-Private-Network: true`.

### Pure core, thin adapter

All logic that doesn't need Foundry (option generation, scoring, prompt
building, reply parsing) works on a plain-JSON **snapshot** so it runs under
`node --test` with fixtures. The Foundry adapter is a thin layer for reading
documents, wall-collision and line-of-sight queries, and execution. When the
pure core needs walls or LOS, the adapter precomputes them into the snapshot
(e.g. a `blocked` cell set, and a `los(a,b)` table for candidate cells ×
targets). Use Foundry v13 APIs (`CONFIG.Canvas.polygonBackends`,
`token.document.move` or the movement API, `canvas.grid`) and check them
against the v13 API docs.

### Snapshot (sketch, builder refines)

```json
{
  "round": 3, "activeTokenId": "t1",
  "grid": {"type": "hex|square", "size": 100, "distance": 1},
  "tokens": [{
    "id": "t1", "actorId": "a1", "name": "Sunzi", "side": "hostile|friendly|neutral",
    "isNpc": true, "pos": {"x": 15, "y": 9}, "size": 1,
    "hp": [13, 22], "heat": [2, 6], "structure": [1, 1], "stress": [1, 1],
    "armor": 1, "evasion": 8, "edef": 10, "speed": 4, "sensors": 10,
    "statuses": ["IMPAIRED"],
    "weapons": [{"itemId": "w1", "name": "Assault Rifle", "type": "Rifle",
                 "range": [{"type": "Range", "val": 10}], "damage": "1d6+2 Kinetic",
                 "accuracy": 0, "tags": ["Loading"], "loaded": true, "uses": null}],
    "features": [{"itemId": "f1", "name": "...", "kind": "trait|system|reaction", "text": "..."}],
    "persona": "optional text"
  }],
  "blocked": ["x,y", "..."],
  "losFrom": {"x,y": {"targetTokenId": true}}
}
```

Read Lancer data paths from the installed Lancer system version
(`actor.system.hp.value/max`, `heat`, `structure`, `stress`, `evasion`,
`edef`, `armor`, `speed`, `sensor_range`; NPC weapons are items of type
`npc_feature` with weapon data, tier-dependent stats). Verify each against the
system source; the Uplink's `snapshotActor` (GPL, may be ported) is a working
reference for the stat block.

### Options

A `TurnOption` = `{id, move: {to, path, cost} | null, action: {kind, itemId?,
targetTokenIds?} , score, facts}`. `facts` are numbers the prompt shows the
model: hit chance, expected damage, cover, distance to nearest threat, whether
the NPC ends in an enemy's threat range, and its heat after acting.

Hit chance in LANCER: 1d20 + accuracy/difficulty (the highest of N d6, signed)
against Evasion (or E-Defense for tech). Compute it exactly, not by sampling.
Generate candidates from reachable cells (BFS within Speed and around blocked
cells) × usable weapons × in-range targets, plus no-attack options (hold
cover, Boost to close distance, retreat). Prune by score to the top `N`
(default 8, a setting) while keeping variety: at least one aggressive, one
defensive and one repositioning option when they exist.

### Prompt and reply

The system prompt covers the NPC's role, persona, the rules for picking, and
"reply with JSON only". The user message holds a compact battlefield summary
and a numbered option list in plain words with `facts`. Reply schema:
`{"option": "<id>", "reason": "<= 25 words", "line": "<optional in-character
line, <= 20 words>"}`. Parse tolerantly (strip code fences). An id that isn't
in the list gets one retry, then falls back to the top-scored option and is
labelled "fallback" in the UI.

### Relay API

- `POST /v1/decide` with `{provider, model, system, messages, maxTokens,
  temperature}`, returning `{text, provider, model, usage}`.
- `GET /v1/health` returns the configured providers. It reports whether a key
  is present, never the key itself.
- Auth: the `X-Pilot-Secret` header must match `PILOT_SHARED_SECRET`.
- CORS: allow only the origins in `PILOT_ALLOWED_ORIGINS` (default
  `https://foundry.lab.spiralfrenzy.com`), and handle the PNA preflight.
- Config comes from env vars or a Git-ignored `relay/.env`:
  `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` (current relay default:
  `claude-opus-5-5`; actual API access remains unverified), `OPENAI_BASE_URL`
  (default `http://127.0.0.1:11434/v1`), `OPENAI_MODEL` (default: whatever
  `ollama list` shows as suitable; the owner runs gpt-oss), `PORT=5090`,
  `HOST=127.0.0.1`.
- Timeouts, a clear error body, and no logging of prompts unless
  `PILOT_LOG_PROMPTS=1`.

### Execution (module)

Move the token along the chosen path, set the GM's targets, then start the
item's Lancer weapon-attack flow. Look up the flow entry point in the
installed system; the Uplink hooks `lancer.postFlow.*`, which shows the flows
exist. Let the system roll and apply damage under its normal GM confirmation.
Post the NPC line as a chat message spoken by the token. Re-snapshot before
executing; if the state changed (the token moved, the target died), re-plan
instead of executing a stale option.

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
