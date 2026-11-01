# Lancer NPC Pilot

An AI co-pilot for the GM that plays NPC mechs in a [LANCER](https://massifpress.com/lancer)
game on Foundry VTT. On an NPC's turn, code ranks supported move and attack
options. A language model, either Claude through the
Anthropic API or a local model through Ollama, picks one in character. The GM
approves it, and Foundry and the Lancer system roll the dice.

<!-- doc-media TODO: purpose: show the GM review dialog on a live NPC turn;
acceptance: sanitized real screenshot from a staged hex NPC turn at version 0.3.0;
blocker: hex-grid source has not yet completed live acceptance; existing 0.2.0 capture does not demonstrate hex planning. -->

Status: 0.3.0 development branch. The relay, pure core and GM review module are
implemented; 0.2.0 passed initial local-model and approved Boost checks on a staged
square scene. Full live acceptance is still pending. Execution and automatic turn
prompts default off. The adapter supports fresh NPC turns on flat equidistant
square grids and all four offset hex layouts, with single-cell Size ½/1 tokens. See the
[adapter setup and acceptance checklist](docs/foundry-adapter.md) and [design](docs/design.md).

| Part | Folder | Runs on |
|---|---|---|
| Foundry module | `foundry-module/` | the GM's browser |
| Model relay | `relay/` | the PC that runs the local model (keeps the API key out of the browser) |

Companion projects: [NHP Uplink](https://github.com/masterevan27/foundryvtt-to-sillytavern-nhp-uplink)
(narration) and the [Lancer TTRPG GM Hub](https://github.com/masterevan27/Lancer-TTRPG-GM-Hub).

License: GPL-3.0-or-later.
