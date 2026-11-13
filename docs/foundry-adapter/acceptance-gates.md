---
type: Runbook
title: "Evidence and live acceptance gates"
description: "Lab environment facts, local conformance checks, the open acceptance checklist and scoped 0.5.0 live checks."
status: draft
tags: [foundry, testing]
sources:
  - resource: ../review-evidence/2026-11-02-execution-acceptance.md
  - resource: ../../foundry-module/test/foundry-runtime.test.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Evidence and live acceptance gates

Part of the [Foundry adapter guide](../foundry-adapter.md).

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
See the [scoped evidence and remaining gates](../review-evidence/2026-11-02-execution-acceptance.md).

Later continuation checks in that evidence verified both Boost segments, a
native ranged attack/damage result, external stale changes before approval and
between movement segments, reservation-only refusal after reload, same-browser
tab overlap exclusion, and scoped live wall/LOS/terrain extraction on all five
supported layouts. Uplink hook coexistence was checked with both transports and
narration polling disabled. These remain scoped observations; the broad boxes
and full NPC coverage remain open. Development 0.5.1 keeps the review footer
visible while long proposal content scrolls, verified at 1280×900 and 1024×768.

## Related

- [Install and plan a turn in a staged scene](install.md)
- [Module policy mode (development 0.8.0)](policy-mode.md)
- [Review evidence](../review-evidence/index.md)
- [NPC mechanics and tactical behavior roadmap](../roadmap.md)
