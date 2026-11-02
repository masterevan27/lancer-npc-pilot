---
type: Runbook
title: Foundry adapter setup and acceptance
description: Install and review the first GM-only adapter subset without implying live acceptance.
status: draft
tags: [foundry, operations, testing]
sources:
  - id: packaging
    resource: ../tools/build-release.ps1
  - id: release-workflow
    resource: ../.github/workflows/release.yml
  - id: runtime
    resource: ../foundry-module/scripts/pilot.mjs
  - id: snapshot
    resource: ../foundry-module/scripts/adapter/snapshot.mjs
  - id: weapons
    resource: ../foundry-module/scripts/adapter/weapons.mjs
  - id: weapon-flow
    resource: ../foundry-module/scripts/adapter/weapon-flow.mjs
  - id: executor
    resource: ../foundry-module/scripts/adapter/executor.mjs
  - id: geometry
    resource: ../foundry-module/scripts/adapter/geometry.mjs
  - id: controller
    resource: ../foundry-module/scripts/adapter/controller.mjs
  - id: design
    resource: design.md
generated:
  by: codex/unrecorded
  at: 2026-11-02T03:18:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Foundry adapter setup and acceptance

Version 0.3.0 extends the GM-only Foundry v13 module with hex and mixed Size ½/1
geometry. Version 0.2.0 was installed and passed initial staged square-scene
proposal/Boost checks; full acceptance of 0.3.0 is still pending. Execution and turn prompts default off;
there is no auto-execute mode. Nothing calls a model until the GM requests a
proposal or explicitly enables turn prompts.

## Install for a staged scene

1. Use Foundry **Setup → Add-on Modules →
   Install Module → Manifest URL** with:

   ```text
   https://github.com/masterevan27/lancer-npc-pilot/releases/latest/download/module.json
   ```

   Later published versions are available through **Check Update / Update All**.
   The public 0.3.1 manifest and ZIP are available at this URL.
   For local staging from source, copy the **contents** of `foundry-module/`
   into a Foundry user-data module directory named `lancer-npc-pilot`, with
   `module.json` at its root, or extract the locally built release ZIP there.
   See [versioning and releases](VERSIONING.md). Module updates do not update or
   restart the separate relay.
2. Enable **Lancer NPC Pilot** in a disposable Lancer world. The reference
   environment is Foundry 13.351 with Lancer 3.1.3.
3. Start the [relay](../relay/README.md) on the GM's PC with a shared secret and
   the Foundry origin in `PILOT_ALLOWED_ORIGINS`. Keep provider API keys in the
   relay environment only.
4. As GM, create a Script macro containing:

   ```js
   await game.modules.get('lancer-npc-pilot').api.planTurn();
   ```

   **Alt+P** opens the same workflow. First use opens Relay settings. Choose
   Local / OpenAI compatible or Anthropic API, enter the relay shared secret,
   and optionally override the model. A blank override uses the relay setting.
   These values are browser-client settings; a provider API key is never needed
   in Foundry. The saved shared secret is not inserted into rendered HTML.
5. Start a combat and select a fresh NPC turn, with full movement and both
   quick actions available in Lancer's action tracker. Review the ranked
   alternatives, exact route, model reason, optional NPC line and warnings.
   An unusable model ID gets one retry, then the top option is labeled
   **fallback**. A connection error takes no action.
6. Use **Skip** or **Do it manually** while execution is off. Close also skips.
   **Re-ask model** makes another model request; **Relay settings** changes
   provider/model configuration. Anthropic requests incur provider usage.
7. For a simple staged scene only, use **Review terrain** to confirm that walls
   and configured terrain account for obstacles and movement costs. Then enable
   **Enable token execution (staged scenes only)** in module settings and
   request a new proposal. This reveals **Execute selected** to Foundry's
   active GM. The radio buttons choose an alternative instead of the model pick.

Optional **Offer a proposal when an NPC turn starts** is a world setting. It
only opens planning/review on Foundry's active GM client. It never auto-approves.
If the combat changes while a dialog is open, discard it and request a new
proposal. A second tab's request cannot approve the first tab's stored object.

## Troubleshooting Plan Turn

Development 0.4.0 retains the actionable scene messages originally prepared
for the unreleased 0.3.2 source:

- **Scene not ready:** open the encounter map and wait for it to finish loading.
- **No active combat encounter:** choose or create an encounter in Combat Tracker
  and add the NPC.
- **Combat not started:** click **Begin Combat**, then start the NPC's turn.
- **Encounter not linked:** open its map, then choose **Combat Tracker →
  three-dot menu → Link to Viewed Scene**. A running encounter can still be
  unlinked; starting it again does not create a scene link.
- **Different scene:** open the encounter's linked scene before planning.

Retry **Plan Turn** after resolving the named issue. These checks never move
tokens, start combat or link a scene automatically.

## Supported subset

- Equidistant square grids and Foundry's odd/even row/column hex layouts.
- All actors are Size ½ or 1 and every token occupies exactly one Foundry grid
  cell, at equal elevation. Size ½ tokens may be 0.5×0.5 or 1×1; Size 1 tokens
  must be 1×1. Larger/irregular footprints remain manual, including bystanders.
- Token documents must already be snapped. Planning never resizes or moves
  them. Small tokens retain their position within a cell; their containing cell
  is conservatively occupied for movement. Their actual centers are used for LOS.
- Hex row/column counts come from Foundry offset ranges, rather than dividing
  pixel dimensions by grid size. Candidates whose full pixel bounds extend
  outside the scene are omitted. Rounded token positions allow at most 0.51px
  of snapping error, matching Foundry's integer-pixel commits.
- NPC Speed is an integer from 0 to 12. All scene tokens need supported Lancer
  actors, including hidden enemies; player clients receive no planning API.
- Fresh NPC turns only; partial movement/action budgets require manual play.
- Ordinary single-target Range/Threat weapons, move, Boost/retreat and hold.
  Development 0.4.0 adds separate melee (Threat 2) and ranged (Range 5) modes
  for the reviewed, unmodified T1 Cataphract Ram Cannon on Lancer 3.1.3. The
  approved mode is applied to that native attack flow instance; weapon documents
  and shared flow definitions are unchanged. T2–3 multiple attacks, tier overrides
  and modified/unknown mixed-mode weapons still require manual play.
  Other weapons with scripted effect/on-hit text, unknown tags, special area targeting,
  Smart, Seeking, Arcing, Ordnance or Superheavy classification are omitted.
  Allowed tags are Loading, Limited, Recharge, Accurate, Inaccurate, Reliable,
  AP, Overkill and self-heat. Unloaded, destroyed, spent Limited and uncharged Recharge
  weapons are unavailable. The live system resolves the actor tier.
  Each excluded NPC weapon is named with its reason in the proposal warnings.
  A separate warning explains when no usable supported weapon remains; movement
  choices do not establish that the NPC has no weapons.
- Stunned, Immobilized, Slowed and Impaired are represented by the inherited
  core. Other active NPC conditions that may affect movement/actions are refused.
- Walls are checked in each direction using Foundry collision APIs. Missing or
  inconclusive collision/LOS never becomes permission to move or attack.
- HIDDEN enemies cannot be attack targets. Paths stop on entering adjacency
  to a visible enemy of equal or greater Size; an already-engaged NPC must
  move manually. This deliberately restricts movement rather than approximating
  Disengage. Hidden enemies do not cause engagement.
- Region movement rules, large tokens, different elevations, Hide,
  tech attacks, reactions and complex feature activations require manual play.

This is intentionally narrower than the pure core and design. The inherited
`RULE?` assumptions in the core have **not** all been verified in live Lancer.
Hit/crit/expected-damage figures are scoring estimates, not predicted outcomes.
Cover is GM-supplied per cell and remains an approximation. Review engagement,
special traits and all accuracy/difficulty in the Lancer HUD. Resolve reactions
along the route manually; Pilot does not resolve Overwatch or damage.

### Terrain and personas

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

## What approval does

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
and finish manually. Pilot conservatively spends the movement allotment for
its one movement even if the route is shorter than Speed. Remaining quick
actions are manual. A reservation for this turn survives reloads. In a disposable
test only, after verifying no action happened, the GM can clear a reservation:

```js
await canvas.tokens.controlled[0].actor.unsetFlag('lancer-npc-pilot', 'lastExecution');
```

## Evidence and acceptance gates

Lab checks on 2026-11-01 found Foundry 13.351 and Lancer 3.1.3. Initial 0.2.0
acceptance observed real gpt-oss:20b proposals, Skip, terrain review and an explicitly
approved staged Boost with action spending. Execution was disabled afterwards.
The later `lancerworldv1-npc-pilot-test` copy retains the campaign's maps, tokens,
seven world compendiums and visual modules; outbound NHP Uplink is disabled.
The original campaign's 152 files were hash-verified unchanged after copying.
All three populated battle scenes use hex grids; the active map includes Size ½
pilots/deployables alongside Size 1 mechs/NPCs. This motivates the 0.3.0 change;
it does not establish live movement or weapon acceptance for that version.
Local source maps from that Lancer version confirm
`currentProfile()`, `tag.lid`, `system.action_tracker` and
`beginWeaponAttackFlow()`. Foundry's installed source confirms
`TokenDocument.move(waypoints, options)` and `_movementHistory` updates.

API references: [v13 grids](https://foundryvtt.com/api/v13/classes/foundry.grid.BaseGrid.html),
[token collision](https://foundryvtt.com/api/v13/classes/foundry.canvas.placeables.Token.html#checkCollision),
[movement](https://foundryvtt.com/api/v13/classes/foundry.documents.TokenDocument.html#move),
[DialogV2](https://foundryvtt.com/api/v13/classes/foundry.applications.api.DialogV2.html).

Local checks use `node --test` and `node --check` on module files. An optional
conformance check uses the licensed installed Foundry classes without copying
them into this repository:

```powershell
$env:PILOT_FOUNDRY_CODE = 'G:/Programs/FoundryVTT_v13/FoundryVTT-Node-13.351/code'
node --test foundry-module/test/foundry-runtime.test.mjs
```

This compares all four hex layouts and squares across positive/negative offsets
and Size ½/1 token pixel waypoints. It is skipped when the environment variable
is absent. Fixtures and
mocked Foundry documents do not prove browser, live system or model acceptance.
Before using execution in a campaign, verify in a disposable staged scene:

- [ ] Module activation, Alt+P, settings, all dialog buttons, player no-op and
  the correct active GM client; capture a sanitized real review screenshot.
- [ ] Browser permission and HTTPS-to-loopback access, CORS and relay secret.
- [ ] Actual local model identifier and a complete model reply; then an
  owner-authorized Anthropic call with valid model/version settings.
- [ ] Lancer fresh-turn action tracking, tiered weapon fields and Limited,
  Loading and Recharge item state in the installed world.
- [ ] Directed walls, LOS, terrain costs, grid origin/padding and token snapping.
- [ ] Approval, another alternative, re-ask, skip, manual, stale board/turn,
  duplicate click/tab, reload and interrupted movement; no unapproved mutation.
- [ ] Boost boundaries, Lancer attack HUD, target selection, action spending,
  reactions and damage handoff, including coexistence with NHP Uplink.

These broad boxes remain open until every listed subcheck is individually
observed. The earlier square-scene observations are scoped evidence, not complete
acceptance. No paid inference has been used; campaign execution remains disabled.

## Full NPC coverage work

The owner requested full special-ability support across NPC classes on 2026-11-01.
That work is planned in the [full coverage plan](superpowers/plans/2026-11-01-full-npc-coverage.md);
the current adapter does not yet provide it. The local catalogue audit contains
44 classes (including drones/deployables), 15 templates and 461 features. This is
an inventory of the installed pack, not every published or homebrew NPC and not
a passing execution matrix. Area attacks, tech, special effects, passive/template
modifiers, reactions and larger footprints still have the manual restrictions
listed above. Lancer system flows do not resolve all of those rules automatically.

Run a read-only inventory with explicit local paths:

```powershell
node tools/audit-npc-catalog.mjs --pack <npc-items-directory> --foundry-code-root <Foundry-code-directory>
```

The audit opens a disposable copy of the pack, reports class/feature crosslinks
and mechanics signals, and omits raw ability prose and world/document IDs. Its
results describe coverage work remaining, not permission to execute an ability.
