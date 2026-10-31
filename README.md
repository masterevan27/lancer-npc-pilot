# Lancer NPC Pilot

An AI co-pilot for the GM that plays NPC mechs in a [LANCER](https://massifpress.com/lancer)
game on Foundry VTT. On an NPC's turn, code works out every legal move and
attack and how good each one is. A language model, either Claude through the
Anthropic API or a local model through Ollama, picks one in character. The GM
approves it, and Foundry and the Lancer system roll the dice.

<!-- doc-media TODO: purpose: show the GM review dialog on a live NPC turn;
acceptance: real screenshot from the lab Foundry; blocker: nothing built yet. -->

Status: early development. See the [design](docs/design.md).

| Part | Folder | Runs on |
|---|---|---|
| Foundry module | `foundry-module/` | the GM's browser |
| Model relay | `relay/` | the PC that runs the local model (keeps the API key out of the browser) |

Companion projects: [NHP Uplink](https://github.com/masterevan27/foundryvtt-to-sillytavern-nhp-uplink)
(narration) and the [Lancer TTRPG GM Hub](https://github.com/masterevan27/Lancer-TTRPG-GM-Hub).

License: GPL-3.0-or-later.
