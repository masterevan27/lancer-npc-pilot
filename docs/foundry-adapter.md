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
  - id: budgets
    resource: ../foundry-module/scripts/adapter/budgets.mjs
  - id: swept-walls
    resource: ../foundry-module/scripts/adapter/swept.mjs
  - id: budget-core
    resource: ../foundry-module/scripts/core/budgets.mjs
  - id: legality-core
    resource: ../foundry-module/scripts/core/legality.mjs
  - id: controller
    resource: ../foundry-module/scripts/adapter/controller.mjs
  - id: policy-context
    resource: ../foundry-module/scripts/adapter/policy-context.mjs
  - id: policy-selector
    resource: ../foundry-module/scripts/core/policy.mjs
  - id: policy-acceptance
    resource: review-evidence/2026-11-03-policy-acceptance.md
  - id: cataphract-implementation
    resource: review-evidence/2026-11-03-cataphract-implementation.md
  - id: cataphract-native
    resource: review-evidence/2026-11-03-cataphract-native-acceptance.md
  - id: cataphract-executor
    resource: ../foundry-module/scripts/adapter/cataphract-executor.mjs
  - id: standalone-grapple
    resource: ../foundry-module/scripts/adapter/grapple-controller.mjs
  - id: shield-application
    resource: ../foundry-module/scripts/adapter/shield-controller.mjs
  - id: design
    resource: design.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-07T12:00:00.000Z
stale_after: 2027-01-30T00:00:00Z
---
# Foundry adapter setup and acceptance

Version 0.3.0 extends the GM-only Foundry v13 module with hex and mixed Size ½/1
geometry. Version 0.2.0 was installed and passed initial staged square-scene
proposal/Boost checks; full acceptance of 0.3.0 is still pending. Execution and turn prompts default off;
there was no auto-execute mode (historical; development 0.10.0 adds an off-by-default [auto mode](#auto-mode-and-banter-development-0100)). Nothing calls a model until the GM requests a
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
3. For default model mode, start the [relay](../relay/README.md) on the GM's PC with a shared secret and
   the Foundry origin in `PILOT_ALLOWED_ORIGINS`. Keep provider API keys in the
   relay environment only. Development 0.8.0 also has an opt-in
   [module policy mode](#module-policy-mode-development-080) that needs no relay.
4. As GM, create a Script macro containing:

   ```js
   if (!game.user?.isGM) {
     return ui.notifications.info('NPC Pilot planning is GM-only. No action was taken.');
   }
   const api = game.modules.get('lancer-npc-pilot')?.api;
   if (!api) {
     return ui.notifications.warn('NPC Pilot is unavailable. Enable it in a Lancer world and reload.');
   }
   await api.planTurn();
   ```

   **Alt+P** opens the same workflow for GMs; the restricted binding is absent
   from player settings. A player controlling a mech still cannot plan NPC
   turns. Existing copied macros need the guarded command above; module updates
   do not rewrite world macros. First GM use in model mode opens Relay settings. Choose
   Local / OpenAI compatible or Anthropic API, enter the relay shared secret,
   and optionally override the model. A blank override uses the relay setting.
   These values are browser-client settings; a provider API key is never needed
   in Foundry. The saved shared secret is not inserted into rendered HTML.
5. Start a combat and select an NPC turn. Development 0.7.0 and later read remaining
   native movement and actions, including a manually started partial turn.
   If a quick slot was already spent, earlier action identity is unknown;
   attacks and Boost stay manual rather than risking an illegal repeat or mode switch.
   Review the remaining budget shown above the ranked
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
- Development 0.7.0 source reads native Size ½,1,2,3,4 footprints at equal
  elevation, including the six native token shapes. Size½ tokens may be 0.5×0.5
  or1×1; other token width/height must match actor size. The adapter enumerates
  exact occupied cells at each candidate position; large hexes are never square
  approximations. Independent review and copied-world checks of Sizes 2–4 on
  all five layouts passed; see the scoped evidence below. Broader acceptance
  remains open.
- Token documents must already be snapped. Planning never resizes or moves
  them. Small tokens retain their position within a cell; their containing cell
  is conservatively occupied for movement. Their actual centers are used for LOS.
- Hex row/column counts come from Foundry offset ranges, rather than dividing
  pixel dimensions by grid size. Candidates whose full pixel bounds extend
  outside the scene are omitted. Rounded token positions allow at most 0.51px
  of snapping error, matching Foundry's integer-pixel commits.
- NPC Speed is an integer from 0 to 12. All scene tokens need supported Lancer
  actors, including hidden enemies; player clients receive no planning API.
- Development 0.7.0 preserves partial native movement and the shared full/quick
  action pool. One full action requires both quick slots. Protocols close after
  spending; reactions and native item resources retain their observed state.
  The adapter still executes at most one approved option per native NPC turn.
  When either quick slot was spent before planning, the remaining count is
  displayed but attacks and Boost are excluded: the native tracker does not
  identify earlier weapon modes or Boost use. Movement-only partial turns can
  still propose an attack when both quick slots remain.
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
  Nonweapon NPC features on every scene token are also named in proposal warnings,
  including passive traits, reactions, tech and systems. These conservative warnings
  identify the remaining implementation chunk and verification gates; unknown kinds
  stay manual. Native-derived stats remain in use, but warnings do not establish
  that additional passive restrictions or effects have been implemented.
  Development 0.6.0 adds concrete catalogue mechanic guides and unresolved source
  questions. Their runtime ID/kind association is explicitly informational:
  the browser has not verified an item's exact source fingerprint.
  A separate warning explains when no usable supported weapon remains; movement
  choices do not establish that the NPC has no weapons.
- Stunned, Immobilized, Slowed and Impaired are represented by the inherited
  core. Other active NPC conditions that may affect movement/actions are refused.
- Walls are checked in each direction using Foundry collision APIs. Missing or
  inconclusive collision/LOS never becomes permission to move or attack.
- HIDDEN enemies cannot be attack targets. Paths stop on entering adjacency
  to a visible enemy of equal or greater Size; an already-engaged NPC must
  move manually. This deliberately restricts movement rather than approximating
  Disengage. The reviewed 0.9.0 policy-only Trample handler is the explicit
  engagement/passage exception; walls and occupied endpoints remain enforced.
  Hidden enemies do not cause engagement.
- Region movement rules, different elevations, Hide,
  tech attacks, reactions and unreviewed feature activations require manual play.

This is intentionally narrower than the pure core and design. The inherited
`RULE?` assumptions in the core have **not** all been verified in live Lancer.
Hit/crit/expected-damage figures are scoring estimates, not predicted outcomes.
Cover is GM-supplied per cell and remains an approximation. Review engagement,
special traits and all accuracy/difficulty in the Lancer HUD. Resolve reactions
along the route manually; Pilot does not resolve Overwatch. The 0.9.0 handlers
delegate fixed Trample damage and explicitly approved Shield card applications
to native damage calculation; weapon rolls and outcomes remain native handoffs.

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
and finish manually. Development 0.7.0 spends the actual approved route cost,
including difficult occupied cells, and a quick action only for an attack or
Boost grant. Unspent movement/actions remain in the native tracker, but any
remaining Pilot actions are manual because the turn reservation survives reloads.
In a disposable
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

## Scoped development 0.5.0 live checks (2026-11-02)

A source deployment in the disposable copied world verified a complete eight-space
odd-row hex move, ending with move 0 and both attack actions still available.
Reviewed T1 Ram Cannon melee reached the native Lancer attack HUD with the approved
target; cancelling it produced no roll or damage and retained conservative action
spending. Execution and turn prompts were disabled after testing.

The fixes retain registered Lancer Automations flow steps before initialization,
use Foundry v13 `canvas.tokens.setTargets`, and exclude only the moving token's
known movement-history/facing caches and artwork mirror signs from the execution
guard. Positions, scale magnitudes, images, other flags and target data stay guarded.
These checks used a local 8B model after the 20B model twice exceeded the 120-second
relay limit. They do not close the broad acceptance boxes above: Boost, other hex
layouts in live play, interruption/stale/concurrent-client cases, paid-provider
acceptance and Uplink coexistence remain open. The development source has not been
published as a release.
See the [scoped evidence and remaining gates](review-evidence/2026-11-02-execution-acceptance.md).

Later continuation checks in that evidence verified both Boost segments, a
native ranged attack/damage result, external stale changes before approval and
between movement segments, reservation-only refusal after reload, same-browser
tab overlap exclusion, and scoped live wall/LOS/terrain extraction on all five
supported layouts. Uplink hook coexistence was checked with both transports and
narration polling disabled. These remain scoped observations; the broad boxes
and full NPC coverage remain open. Development 0.5.1 keeps the review footer
visible while long proposal content scrolls, verified at 1280×900 and 1024×768.

## Full NPC coverage work

The owner requested full special-ability support across NPC classes on 2026-11-01.
That work is planned in the [full coverage plan](superpowers/plans/2026-11-01-full-npc-coverage.md);
the current adapter does not yet provide it. The local catalogue audit contains
44 classes (including drones/deployables), 15 templates and 461 features. This is
an inventory of the installed pack, not every published or homebrew NPC and not
a passing execution matrix. Area attacks, tech, special effects, passive/template
modifiers and reactions still have the manual restrictions listed above.
Native large footprints are supported within the geometry restrictions above;
size-dependent special abilities remain manual. Lancer system flows do not
resolve all of those rules automatically.

Run a read-only inventory with explicit local paths:

```powershell
node tools/audit-npc-catalog.mjs --pack <npc-items-directory> --foundry-code-root <Foundry-code-directory>
```

The audit opens a disposable copy of the pack, reports class/feature crosslinks
and mechanics signals, and omits raw ability prose and world/document IDs. Its
results describe coverage work remaining, not permission to execute an ability.

The frozen diagnostic report needs no installed database or model call:

```powershell
node tools/report-npc-coverage.mjs
node tools/report-npc-coverage.mjs --lid npcf_trample_cataphract
node tools/report-npc-coverage.mjs --chunk 2
```

It accounts for all feature/tier records, class/template owners and unassigned
features. Source classification and implementation gates remain separate from
executable descriptor support. See the [coverage evidence](review-evidence/2026-11-02-coverage-diagnostics.md).

## Module policy mode (development 0.8.0)

In **Configure Settings → Lancer NPC Pilot → Decision mode**, select
**Module policy (no relay)** on the GM client. Model mode remains the default.
Policy mode never reads a relay secret or sends a model request, including
when its policy is invalid. It uses the same Plan Turn macro and Alt+P.
Execution and turn prompts still default off.

Bind the selected native NPC actor once through the GM-only module API:

```js
const actor = canvas.tokens.controlled[0]?.actor;
await game.modules.get('lancer-npc-pilot').api.bindActorPolicy(actor, {
  classId: 'npcc_cataphract',
  policyId: 'cataphract-base-t1'
});
```

The class identifier is the installed `npc_class` **LID**, not its display name
or embedded item ID. The actor must contain exactly one matching class item.
The binding stores only those identifiers on the actor, not source material,
review authority or an execution handler. Initial scope is T1, the four base
Cataphract features, no templates and no optional systems. Unexpected loadouts
or ambiguous/missing bindings give an unconfigured review with a manual path.
The GM API deliberately changes the selected actor's binding; use a disposable
world for acceptance. It does not create actors or enable execution.

Feature sources are captured from the same board snapshot and checked with
Web Crypto SHA-256 against maintained 3.1.3 catalogue fingerprints. Rule drift
removes the affected source's choices; readiness and budget remain independent
requirements. A spent/restricted ordinary attack budget reports Ram Cannon
unavailable with the budget reason while retaining its source-match metadata.
A matching source cannot enable a missing special handler.
The original 0.8.0 slice offered ordinary movement/Ram Cannon only. Development
0.9.0 adds the scoped mechanics below. Coverage remains **partial** because
unsupported target passives and broader native acceptance are unfinished.
Unknown useful Shield protection and reaction exposure remain visible; the
selector never fabricates a save result or grants reaction immunity.

The review shows the policy/state, estimated reasons, coverage and uncertainty,
plus **Re-plan**, **Policy settings**, **Skip** and **Do it manually**. Policy
settings explains mode/binding setup; it does not open relay setup. There is no
objective editor yet: production uses a free order, while structured orders and
bounded individual preferences are pure injected interfaces. Needs-input and
unconfigured reviews have no Execute button. Ready/partial choices still require
normal explicit approval with execution enabled and terrain reviewed.

A changed board, turn, budget, mode, binding, order or policy configuration
expires review before execution/reservations. Changes during asynchronous source
hashing discard the proposal. Native execution, locks and resource guards stay
in the existing executor. Selection examines one shortest path per endpoint and
one supported action, capped to eight review slots with explicit omissions.
The [November 3 disposable-world pass](review-evidence/2026-11-03-policy-acceptance.md)
observed disconnected policy review, manual/configuration controls, changed
board/binding/source refusals, ordinary movement and native ranged Ram Cannon
handoff with HUD cancellation. It includes a real policy UI capture and explicit
remaining gates; it does not establish the unsupported special mechanics.
See also [selector implementation evidence](review-evidence/2026-11-03-policy-selector.md).

## Cataphract mechanics (development 0.9.0 source)

This development source is included in the authorized partial local landing;
[landing scope and checks](review-evidence/2026-11-03-cataphract-landing.md).
Authorized temporary
TEST COPY staging exercised native mechanics, then restored the exact original
0.8.0 module, world and configuration; original campaign data hashes matched.
Full special-mechanic acceptance is **blocked**: Automations coexistence remains
unsupported and broader acceptance is unfinished. Scoped standalone passes now
include both Impale save branches, Shield HP/Heat and replay refusal, first-turn
control, paired movement and escape cancellation/completion, alongside prior
transit/free-release checks. The 625-test source suite does not establish full
acceptance. See the
[native findings](review-evidence/2026-11-03-cataphract-native-acceptance.md).
[Implementation checks and remaining gates](review-evidence/2026-11-03-cataphract-implementation.md).

- **Trample:** source-verified T1 base policy routes can cross characters and
  ignore engagement. They retain native walls, full-body occupancy, terrain
  costs and legal endpoints. Each actually crossed character, including allies
  and neutrals, can receive native fixed 2 kinetic damage at most once per
  Cataphract turn, shared across segments. Claims persist before application.
  An observed new native activation establishes history. Joining/reloading or
  ordinary manual movement makes the current history unknown without clearing
  claims; harmful transit remains manual until the next observed activation.
- **Impale:** requires a ready recharge item, both native Lancer **attacks** and
  **limited/loading** automation options, native save flows and an unspent Full
  action. Approve the straight route and conditional carried placement. Pilot
  pauses at a legal adjacent position before first contact, or at the adjacent
  endpoint; Lancer resolves Hull against the NPC save target with +1 difficulty.
  Actual failure establishes Pilot-owned native effects and mirrored movement;
  actual success continues only the Cataphract. Cancellation stops continuation
  and retains action/recharge spending. Ordinary movement is preserved.
- **Standalone grapple:** **Alt+G** opens free release for the original grappler,
  defender quick-action escape, same-size start-of-turn control contest and
  reviewed paired movement. Same-size control requires an observed native turn
  and refreshed actions; only the native turn's exact one-time action/reaction
  refreshes may advance that window. With Lancer Ruler Integration 7.3, its exact
  one-time current-combatant turn-status write may also complete turn start;
  other statuses, flags, versions and board drift still refuse. Rolls, action flows, movement or other board
  changes invalidate it. Non-roll turn banners do not. Native Hull rolls determine opposed results; Core
  Book p.13 awards ties to the actual initiator. Both characters lose Boost and
  reactions; the controlled side is Immobilized. Larger size controls after the
  Impale movement finishes. Partial-turn action identity, multiple grapples,
  unsupported changes or interrupted pending sessions remain manual. Cataphract
  paired movement uses **Plan Turn** so Trample accounting remains shared.
  Ordinary dragging is blocked on all clients; native API forced movement can
  break adjacency. Cleanup queues behind active mechanics and removes only
  Pilot-owned effects on broken adjacency, deletion or native defeat/destruction.
  Zero HP awaiting native structure resolution does not invent destruction.
- **Point-Defense Shield:** for newly observed native damage cards, clicking the
  native Apply control for a Shield-bearing target opens GM review. The current
  board, exact Shield source, unique source speaker token, full hostile
  population, confirmed amounts and native multiplier are rechecked. Resistance
  applies only to the unique nearest hostile, after armor, without stacking.
  Shield does not reduce Heat. Native half damage remains an independent GM
  choice affecting Heat too; heatless actors convert Heat to Energy natively.
  Old/reloaded/stale cards, ambiguous speakers and uncertain prior application
  remain manual. Write-ahead card claims prevent automatic double application.

Target source checks deliberately refuse automated Trample contact and Impale
against unreviewed NPC traits/templates, PC frames/talents/systems or active
effects. Supported ordinary native attacks can still be offered. This is a
conservative interaction boundary, not complete target-roster support. No private
Lancer Automations grapple API or flags are used; that module is optional.
When it is active, Cataphract special movement and standalone paired movement
refuse before reservation, costs or token movement; Shield refuses before claims
or damage. Resolve them manually. Native checks observed movement refusal and
Shield refusal with HP/Heat unchanged. This is a manual fallback, not coexistence
support.
Other modules' effects remain fully guarded; Pilot does not accept arbitrary
engagement changes or disable Automations to bypass this boundary.

Execution and turn prompts still default off. Free release, escape, control
contests, paired movement and Shield damage require the active GM and enabled
execution plus explicit review. Mandatory expiry of already-established owned
effects remains cleanup when execution is disabled. Neither policy planning nor
these handlers calls a model relay or reads a provider key.

## Auto mode and banter (development 0.10.0)

<!-- doc-media TODO: purpose: show the shared turn banner (thinking sweep, acting summary, speech line) so a reader knows what players see. Capture acceptance: a real Foundry banner on a disposable world, sanitized, with source, date, revision and method recorded. Blocker: no live run yet. -->

Everything in this section is **unverified in live Foundry**. The source has pure
and adapter tests only; no disposable-world pass has been run.

Settings:

- **Auto mode** (`autoMode`): hostile and friendly NPC turns plan and execute
  when they start, without the review dialog. It needs token execution enabled
  and the responsible GM client. The GM can opt one NPC out with
  `api.setAutoOptOut(actor, true)` (actor flag `autoOptOut`). Existing legality,
  stale-board and replay guards still apply; any refusal or changed board falls
  back to GM review or a held turn.
- **NPC banter** (`banterEnabled`): see below.
- **Banter provider** (`banterProvider`, client): local / OpenAI compatible
  (default) or the paid Anthropic API, which needs explicit selection.
- **Banter model override** (`banterModel`, client): blank uses the relay's model.

What is automated: planning and executing the NPC's move and attack through the
existing native flows, the shared banner, reading the recorded outcome, and
ending that NPC's own turn. What is not: rolls, damage and apply. Humans click
Lancer's roll, damage and apply windows. Auto-roll is a blocked follow-up and is
not in this release: Lancer 3.1.3's damage HUD is not exposed to modules, so
pressing it would make Pilot compute damage inputs itself, which breaks the
anti-goals. A possible later approach is pressing the HUD's own submit control,
which needs an owner-authorized disposable-world pass.

Model fallback: in model mode, a relay failure or 30 seconds of silence plays the
top-scoring safe option with the reason "Model unavailable". The 30 seconds are one budget for the whole plan, retry included. It never guesses.

Warm-up: when the module loads, a tiny fixed prompt (no board data) is sent to
each configured **local** (OpenAI compatible) model so it is loaded before the
first turn. Paid providers are never warmed. One notification reports success
("model warmed up") or a warning that the first AI turn may be slow.

Turn end: after the outcome is observed (applied damage or a resolved miss),
auto mode ends only its own NPC's turn with `game.combat.nextTurn()`. It never
activates the next combatant for anything else. While the attack awaits
resolution the banner shows "is waiting for Lancer" with an **End turn** button
(it appears 3 s after the acting summary, even while Lancer's attack window is
still open and the hand-off has not returned), and the thinking and held banners
carry it too. It lets the GM end that turn manually.

Outcome attribution: Pilot only reads what Lancer recorded and never infers a
result from absence.

- A matching attack card resolves only when it has an explicit true or false `hit`
  for every expected target. A card with an empty or filtered target list, a
  missing or non-boolean `hit`, or a second card for the same attack is
  **ambiguous**: the turn is held for the GM (whispered, held banner with
  **End turn**). Lancer emits empty hit results when automated attack resolution
  is disabled, so that case holds.
- Damage needs two steps. After the matching attack card, a damage card
  (chat flag `lancer.damageData`) spoken by the same attacking actor must list the
  target in `targetDamageResults`. Only HP or structure decreases on that target
  after the damage card count as applied. A decrease before the card is ignored;
  a damage card with no decrease afterwards (for example armor absorbed it) keeps
  the turn waiting, and a second damage card for the same attack is ambiguous.
  Residual limitation: an unrelated manual HP edit made on a target after its
  damage card could still be counted as that attack's damage.

Banner: every connected client sees an angled banner, broadcast over the module
socket, with the token or pilot portrait, red or green side colours, a continuous
sweep (about 1.8 s) while the NPC is thinking, and a brief acting summary that
fades after about 3 s.

Banter: with the toggle on, an NPC speaks up to two lines per turn: an intent line
before the roll, which never claims a result, and a reaction line written only
from the outcome Lancer recorded (none when ambiguous). Repeats are suppressed.
Lines show as a speech banner and as in-character chat. Failure drops the line;
the intent line is awaited before execution, so it can delay the attack by up to
4 s (a failed or slow line is dropped and the turn proceeds); reaction generation
never delays turn completion.

Banter in GM-approved play: with banter on, pressing **Execute** in the review
dialog also speaks the intent line before the hand-off (the model's own line when
the GM picked its choice, otherwise a fresh one) and, for an attack, a reaction
line when the observed outcome is a resolved miss or applied damage. Nothing
advances the turn in approved play. A turn change or cancel disposes the observer
and silences any pending line; with banter off, approved play is unchanged.

Banter is checked by rule-based filters, not by understanding. Intent lines are
dropped when they state damage, a hit, a kill or a miss as having happened
(including "took six damage", "that shot hit Cicada", "is down"). Reaction lines
are dropped when they contradict the recorded outcome: a hit, damage or kill after
a miss, a kill when nothing was destroyed, or damage when every hit took none.
Unusual phrasings can still slip through. Tokens with the Lancer Hidden status or
hidden by the GM are never mentioned. A late reply after a cancel publishes
neither chat nor banner.

A cancelled Lancer attack HUD: when Lancer's flow `begin()` reports exactly
`false`, the executor returns `attack-cancelled` and the turn is held (whisper and
held banner with **End turn**) instead of waiting. Any other result is treated as
a normal hand-off, and a HUD closed without a `false` result still leaves the
turn waiting for the GM's **End turn** on the waiting banner.

Acceptance still open: a disposable-world pass with one hostile and one friendly
NPC, covering banner visibility on a second client, fallback, warm-up and banter.
