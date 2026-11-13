---
type: Architecture
title: "Architecture: relay, pure core and adapter"
description: "Component layout, why a relay, the snapshot sketch, option generation, prompt/reply, relay API and execution design."
status: draft
tags: [architecture]
sources:
  - resource: ../../foundry-module/scripts/core/README.md
  - resource: ../../relay/server.mjs
  - resource: ../../foundry-module/scripts/pilot.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Architecture: relay, pure core and adapter

Part of the [Lancer NPC Pilot design](../design.md).

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

## Pure core, thin adapter

All logic that doesn't need Foundry (option generation, scoring, prompt
building, reply parsing) works on a plain-JSON **snapshot** so it runs under
`node --test` with fixtures. The Foundry adapter is a thin layer for reading
documents, wall-collision and line-of-sight queries, and execution. When the
pure core needs walls or LOS, the adapter precomputes them into the snapshot
(e.g. a `blocked` cell set, and a `los(a,b)` table for candidate cells ×
targets). Use Foundry v13 APIs (`CONFIG.Canvas.polygonBackends`,
`token.document.move` or the movement API, `canvas.grid`) and check them
against the v13 API docs.

## Snapshot (sketch, builder refines)

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

## Options

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

## Prompt and reply

The system prompt covers the NPC's role, persona, the rules for picking, and
"reply with JSON only". The user message holds a compact battlefield summary
and a numbered option list in plain words with `facts`. Reply schema:
`{"option": "<id>", "reason": "<= 25 words", "line": "<optional in-character
line, <= 20 words>"}`. Parse tolerantly (strip code fences). An id that isn't
in the list gets one retry, then falls back to the top-scored option and is
labelled "fallback" in the UI.

## Relay API

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

## Execution (module)

Move the token along the chosen path, set the GM's targets, then start the
item's Lancer weapon-attack flow. Look up the flow entry point in the
installed system; the Uplink hooks `lancer.postFlow.*`, which shows the flows
exist. Let the system roll and apply damage under its normal GM confirmation.
Post the NPC line as a chat message spoken by the token. Re-snapshot before
executing; if the state changed (the token moved, the target died), re-plan
instead of executing a stale option.
