---
type: Reference
title: "Scoped execution acceptance 2026-11-02"
description: "Agent-observed development 0.5.0 execution results, fixes and remaining gates in the disposable TEST COPY world."
status: draft
tags: [foundry, testing]
sources:
  - resource: ../../foundry-module/scripts/adapter/executor.mjs
  - resource: ../../foundry-module/scripts/adapter/weapon-flow.mjs
generated:
  by: codex/unrecorded
  at: 2026-11-03T06:10:04Z
---
# Scoped execution acceptance — 2026-11-02

Agent: Codex / unrecorded. This is agent evidence, not human acceptance.

Scope: development 0.5.0 source, Foundry 13.351, Lancer 3.1.3, in the
disposable `LancerWorld — NPC Pilot TEST COPY`. The original campaign was not
entered or mutated. No paid inference was used. Full NPC coverage remains open.

## Observations and fixes

- Lancer Automations inserts a step before native weapon initialization. The
  flow guard now requires unique initialization before the HUD and roll steps,
  preserving registered hooks rather than requiring initialization at index zero.
  The 0.4.1 refusal came from requiring `Flow.steps[0] === 'initAttackData'`,
  which Lancer Automations breaks by prepending `lancer-automations:throwChoice`.
  The check now requires exactly one `initAttackData`, then `showAttackHUD`, then
  `rollAttacks`. The moving token's bookkeeping fields excluded from the board
  guard are `flags.lancer-automations.moveHistory`, `flags.about-face.prevPos` and
  `flags.about-face.direction`, plus sign normalization of `texture.scaleX` and
  `texture.scaleY` (`snapshot.mjs`, `execution-state.mjs`). Regression tests:
  `lancer-weapon-flow.test.mjs`.
- Foundry v13 targeting uses `canvas.tokens.setTargets` with replacement mode.
  Missing targeting capability is detected before spending actions.
- Approved native movement updates Lancer Automations movement history, About
  Face previous position/direction, and artwork mirror signs. Guard normalization
  is limited to these fields on the moving token. Scale magnitudes, images,
  other flags and all target data remain guarded; position is checked separately.
- Eight-space odd-row hex movement completed from cell (26,19) to (30,27).
  The observed tracker ended with move 0, protocol false, full true and quick true;
  no movement guard error followed.
- T1 Ram Cannon melee reached the native Lancer attack HUD with Ledger targeted.
  Cancel was selected. No roll or damage occurred. The observed tracker retained
  full false, quick true and protocol false; no automatic refund or retry occurred.
- The local 20B model twice exceeded the 120-second relay timeout. Temporary
  `qwen3-vl:8b-instruct` requests completed, including repeated warm requests
  below one second. This is scoped behavior, not a performance benchmark.
- Cleanup verified execution false and turn prompts false. The temporary relay
  was stopped. The flat test scene and native encounter state were retained.

## Automated verification

Command: `node --test` from the coverage checkout, Windows with installed
Foundry/Lancer and NPC pack conformance enabled through `PILOT_FOUNDRY_CODE`,
`PILOT_LANCER_SYSTEM` and `PILOT_NPC_PACK`. The roster test copies the database
before opening it and checks original hashes. Final result: exit 0, 204 passed,
0 failed, 0 skipped. `git diff --check`: exit 0. The retained worktree's
`fix-tests.local.log` contains the command output. Regression tests were observed
failing before the corresponding fixes and passing afterward.

Independent read-only code review found no actionable issues. Its targeted
tests omitted installed-source configuration; the controller's full run above
provides that separate verification.

## Remaining gates

Repeat Boost across both movement segments after the final mirror-sign fix;
native ranged HUD and actual rolls/results; cancellation and interruptions;
external stale changes; reload and duplicate/concurrent-client approval;
directed walls, LOS, terrain and live grid-layout variants; player no-op;
Uplink coexistence (Uplink was inactive); and paid-provider acceptance only
with separate authorization. Retain the broad checklist in the adapter guide.

The source deployment backed up replaced files and verified readback bytes.
The deployed manifest is 0.5.0; the server may display cached 0.4.1 metadata
until restart. No GitHub release or publication was performed.

## Continuation checks on local d9a1d04

Agent: Codex / unrecorded; November 2 evening (UTC November 3).
These checks used only the disposable world's `NPC Pilot Acceptance — Flat Hex`.

- Host-key-pinned SSH readback compared all 18 deployed module scripts and the
  manifest with local source: zero differences, source version 0.5.0. Foundry's
  runtime metadata still reports 0.4.1.
- Repeated installed-runtime `node --test`: exit 0, 204 passed, no failures or
  skips. Log: retained coverage checkout `acceptance-baseline-escalated.local.log`.
  The restricted first run encountered PowerShell packaging authorization errors;
  the approved outside-sandbox run resolved that environment failure.
- Inspected round 7 before advancing: move 0, protocol false, full true, quick
  true. No reservation was cleared. Used native round/turn controls thereafter.
- Round 8: explicitly approved option C, a 16-space Boost retreat from (30,27)
  through (26,19) to (22,11). Native geometry audit confirmed final cell (22,11).
  Tracker: move 0, protocol false, full false, quick true, reaction true. NPC HP
  15 and Ledger HP 10 were unchanged. This verifies both movement segments after
  the final mirror-sign fix. Round 9's reverse Boost also settled at (30,27)
  with the same spending; an intermediate audit during animation was discarded.
- Round 10: explicitly selected ranged Ram Cannon. Native HUD showed Range 5
  and Ledger targeted. Native attack produced 21 (d20 17 plus accuracy d6 4),
  marked CRIT. Native damage confirmation produced 5 kinetic; native automation
  applied it. Geometry audit confirmed Ledger HP 5, NPC HP 15. These are observed
  system results, not model outcomes. This does not verify every accuracy source
  or passive interaction in the installed automation stack.
- Reloaded the client without clearing reservations, viewed the flat scene and
  requested planning on that spent turn: refused with the fresh-turn requirement.
  This verifies partial-turn refusal after reload, not reservation-only replay
  protection with an otherwise fresh tracker.
- Round 11: obtained a review, advanced the native round, then clicked its old
  Execute selected button. Refused: `This review expired or was already used.`
  No native attack HUD or new attack result followed.
- Round 12: approved the 16-space Boost, then advanced the native round during
  movement. Movement settled after the first segment at (26,19), rather than
  (22,11). The read failed with `The active combatant must be a living NPC.`
  No second segment or attack followed. Ledger HP remained 5, NPC HP 15.
  This verifies turn-change interruption at that boundary only.
- Cleanup readback: round 13, no active turn, execution false, turn prompts
  false, Uplink inactive. Temporary local 8B relay stopped. No paid calls,
  source deployment changes, landing, push or publication.

Resume by inspecting the interrupted actor's tracker and persistent reservation
before starting another native test turn. Preserve the native partial state:
NPC cell (26,19), Ledger cell (31,29), HP 15/5. Broader acceptance remains open:
external stale document changes, duplicate/concurrent GM execution, other
interruption boundaries, walls/LOS/terrain, remaining live grids, player no-op
and safe Uplink coexistence. Chunk 1 completion and Chunk 2 implementation have
not advanced in this continuation.

## Resumed acceptance checks (November 2 evening, second continuation)

Agent: Codex / unrecorded. Scope remains the disposable test copy, primarily
Flat Hex. Incoming evidence and ignored logs, deployment tooling and backups
were preserved; source remains local d9a1d04 / development 0.5.0.

- Repeated host-key-pinned deployment comparison: exit 0, 18 checked files
  (the script's total includes the manifest), zero mismatches. Runtime metadata
  remains cached 0.4.1. No deployment was changed.
- Before starting a fresh native turn, inspected the interrupted NPC: move 0,
  protocol/full/quick false, reaction true, free false, used reactions empty.
  Persistent `lastExecution` still identified Flat Hex combat round 12, turn 0.
  NPC cell (26,19), HP 15; Ledger cell (31,29), HP 5. No reservation was
  cleared and no tracker was manually reset. The existing read-only test macro
  was extended to expose tracker/reservation values.
- Repeated `node --test` with installed Foundry/Lancer/pack conformance:
  exit 0, 204 passed, 0 failed/skipped/cancelled. Recoverable output:
  `acceptance-resume-baseline.local.log` in the retained checkout. Windows
  packaging checks ran outside the sandbox; this is automated conformance,
  not complete live acceptance.
- Started round 13's NPC turn through native combat controls. Obtained a real
  local `qwen3-vl:8b-instruct` proposal, then changed Ledger's token name from
  a second hidden GM tab. Approving the original review was refused with
  `The board or turn changed. Re-plan before approving.` Readback showed
  unchanged positions/HP, fresh move 8 and protocol/full/quick true, and the
  old round-12 reservation unchanged. Restored the target name afterward.
  This verifies a target-document change before approval across two tabs of
  the same GM/browser. It does not establish overlapping execution exclusion,
  different-user active-GM selection, or distributed cross-browser locking.

- Replanned in round 13 and explicitly approved the 16-space Boost retreat
  toward (15,10). A second hidden GM tab renamed the target during the native
  movement await. The NPC stopped after the first eight spaces at (22,11).
  Console error: `The board changed during execution. Continue manually.
  Changed fields: board.tokens.1.token.name`. No second segment or attack
  followed; HP remained 15/5. Actual tracker still had move 8 and
  protocol/full/quick true; the persistent reservation now identified round 13.
  This is a native partial movement with a reservation, not a successful turn
  or a refunded action. Restored the target name, preserving that partial state.

- Reloaded the first client, viewed Flat Hex again, and obtained another
  proposal with that naturally fresh tracker. Explicitly approved Hold; it was
  refused with `This turn was already reserved for execution. Continue manually.`
  Readback preserved cell (22,11), HP 15/5, fresh tracker and round-13
  reservation. This independently verifies reservation-only rejection across
  reload, without clearing a reservation or resetting the tracker.
- Native round 14: obtained separate reviews in two hidden tabs of the same
  browser/GM, selected Boost in one and Hold in the other, then dispatched both
  approval clicks concurrently. Hold won; the Boost client reported
  `This turn is executing in another browser tab.` No movement/attack followed.
  Readback showed cell (22,11), HP 15/5, unchanged fresh tracker and round-14
  reservation. Replanning in the winning client was refused with `This NPC turn
  was already handed to execution. Continue manually.` This verifies same-origin
  Web Lock exclusion and that controller's used-turn refusal. It does not
  independently verify duplicate DOM callbacks, other GM user ownership, or
  cross-browser distributed exclusion (not provided by Web Locks).

Broader acceptance and the full NPC coverage plan remain open.

### Native board fixtures (same continuation)

Execution and turn prompts were disabled for these script-macro checks in the
same disposable Flat Hex scene. The guarded `NPC Pilot — Native Board Checks`
macro imports the deployed extractor and core reachability code, creates one
temporary native directional Wall, compares movement collision in both
directions with `blockedMoves`, replaces it with a two-way sight wall between
NPC and Ledger, then tests scene-flag blocked/difficult cells. It never rolls,
spends actions, clears reservations or executes a Pilot plan.

- Odd rows (type 2), square/equidistant (type 1), even rows (type 3), odd
  columns (type 4), and even columns (type 5): all
  five assertions passed. Native movement collision forward/reverse was
  true/false and matched the adapter. Native sight collision true matched
  adapter LOS false. Blocked cells were unreachable; adjacent difficult cells
  cost 2. Each corrected run reported walls 0, exact terrain restoration true,
  execution false and turn prompts false.
- The first fixture cleanup used `setFlag` to restore an object, which merged
  keys and left the two fixture cells. This was a test-harness error. Removed
  its blocked (23,11) and difficult (23,10) entries, inspected terrain as
  reviewed true / blocked [] / difficult [], corrected restoration to unset
  then set, and repeated odd-row checks successfully. Exact pre-first-run
  object shape was not retained; no claim of byte-identical restoration of
  that first terrain object is made.
- Grid changes use `NPC Pilot — Grid Fixtures`, guarded to the same world and
  scene with execution/prompts off. It durably saves original grid type and
  diagonals and both token positions in a scene test flag before changes.
  Native snapping is checked after the canvas settles. An immediate geometry
  read during the first square setup was refused as unsnapped; settled audit
  then showed zero snap error and board checks passed. This setup transient
  is not claimed as a product regression.
- Returned to original odd-row type 2 and saved token coordinates; settled
  Geometry Audit confirmed NPC (22,11), Ledger (31,29), HP 15/5 and unchanged
  fresh tracker / round-14 reservation. A second restoration/readback reported
  `restored: true` and removed the temporary grid backup flag. Immediate
  post-update fixture output can precede settled canvas data; settled audits
  remain the evidence used for geometry claims.

These verify scoped live collision/extraction/reachability, not complete
movement/attack execution on each layout, large-token support, or every wall,
terrain, door, region, elevation, cover and reaction interaction.

### Disabled-Uplink coexistence and rapid approval gesture

Read back installed Uplink source through pinned SSH: its manifest is 0.4.1,
and its scripts differ from the local newer checkout. Saved source and hashes
remain in ignored `dist/uplink-installed` and the comparison tool. Both installed
scripts gate their transports on separate world settings. Before activation,
persisted `enabled`, `importerEnabled` and `receiveNarration` as false while
Uplink was inactive, then verified all three values before changing only its
test-world module configuration. No secrets were read or changed.

After reload, Uplink was active with all three values still false, Pilot execution
and turn prompts false, 12 actors and 2 scene tokens. Browser resource timing
contained zero entries for the configured transport origins. In native round 15,
enabled Pilot only for a concrete reviewed 16-space Boost from (22,11) to
(30,27), then rapidly double-clicked Execute. Observed one completed route,
move 0, protocol/full false, quick/reaction true, HP 15/5 and a round-15
reservation. Disabled Pilot afterward. Uplink stayed active with transports off,
12 actors/2 tokens and transport-origin resource count 0. Saved Uplink
deactivation before reloading.

This proves scoped hook coexistence with transports disabled and the observed
rapid double-click outcome. Resource timing is not a packet capture. This is
not active Uplink transport/narration/importer acceptance, separate-GM election,
cross-browser exclusion, or proof of independently delivered duplicate callbacks.

### Review-footer defect found during acceptance

At a supported 1280 by 900 viewport, the live review footer extended below its
clipping parent: dialog bottom 861, window-content bottom 860, footer/buttons
bottom 883.89. The form and content retained automatic minimum height and
visible overflow; content could not shrink within the native dialog's maximum
height. This was observable clipping, not a failing source-format assertion.

Development 0.5.1 makes the form/content shrink within the dialog, scrolls the
content and keeps the wrapping footer outside that scroll area. Updated all
version sources and the manifest download URL; deployed only CSS and manifest
with timestamped backups and byte-verified readback. No landing, push or
publication. Affected live viewport checks follow; broad acceptance remains open.

After reload, verified Uplink inactive and Pilot execution/prompts false.
Opened a fresh round-16 review without executing it. DOM-based regression
checks on the actual deployed dialog passed at 1280×900 and 1024×768: all six
footer buttons fully fit inside window-content; content overflow was auto and
scroll height exceeded client height. At 1280×900 buttons ended at 844 inside
the clipping bottom 860; at 1024×768 they ended at 751 inside bottom 767.
Skipped the review and disabled execution afterward. The real review capture
in `docs/assets/npc-pilot-review-0.5.1.png` was inspected for private data;
capture date November 2, 2026, source d9a1d04 plus the 0.5.1 CSS fix, native
hidden-browser screenshot at 1280×900. It shows proposal UI, not an outcome.

Final cleanup readback: Flat Hex odd-row grid, round 16 / turn 0, NPC (30,27)
HP 15 and Ledger (31,29) HP 5. The NPC's native fresh tracker is move 8,
protocol/full/quick/reaction true, free false and used reactions empty;
`lastExecution` still identifies round 15. This fresh tracker came from native
round/turn controls, not a manual reset. Execution and turn prompts false,
Uplink inactive, provider local/openai, temporary relay stopped. Browser viewport
override was reset and the hidden tab retained. No user accounts or permissions
were changed. A genuine player-client test remains pending; existing Evan and
Jane accounts were only inventoried.

### Authorized diagnostic correction and scoped player observation

After the owner authorized one additional narrow Chunk 1 review round, the
malformed classification-gates regression reproduced its TypeError, then passed
with the array guard. The installed-runtime suite passed 216 tests with none
failed or skipped; the narrow independent review reported no findings.
Deployed six changed/new runtime files including the manifest, preserving a
timestamped backup. Readback of all 22 runtime files matched development 0.6.0.
No release was published; cached manifest metadata still reports 0.4.1.

After reloading the hidden GM client, a guarded read-only native macro invoked
the deployed snapshot extractor. Trample, Impale and Point-Defense Shield
warnings displayed their owning chunks, source questions and manual-only
status. No model call, approval or execution was needed. The owner signed in
as the existing non-GM Evan account, confirmed Flat Hex in the copied world,
reloaded and pressed Alt+P. The first attempt produced an unidentified transient
notification; the repeated attempt produced no popup. This is a scoped
user-reported shortcut observation, not proof of every player entry point or
the first notification's origin. GM-side before/after diagnostic reports were
identical: round 16/turn 0, NPC (30,27) HP15 with fresh native tracker and the
round-15 reservation, Ledger (31,29) HP5 with its unchanged tracker. Execution
and prompts remained false, Uplink inactive, and the temporary relay stopped.
Ignored reports: `dist/coverage-extra-live-before.local.txt` and
`dist/coverage-extra-live-after.local.txt`. No account permissions were changed.

The owner then copied the old unguarded planning macro to Evan and selected
Ledger's native turn. That macro raised `Cannot read properties of undefined
(reading 'planTurn')`, consistent with the intentionally absent player API.
Alt+P was absent from Evan's bindings, as intended for a GM-restricted shortcut.
The runbook macro now checks the user before accessing the API and handles an
unavailable GM API explicitly. The regression executed the actual documented
snippet: both player and unavailable-module cases failed before the correction,
then both tests passed (`player-macro-red.local.log`,
`player-macro-green.local.log`). The owner replaced the player copy and confirmed
the GM-only/no-action notice. This is a genuine player macro entry-point check;
it does not establish every possible player invocation path.

Final native readback after the owner's turn selection: round16/turn0, Ledger
active with move5, protocol/full/quick/reaction true. The NPC's ended-turn tracker
has move0 and protocol/full/quick false, reaction true; its round15 reservation
remains. Positions and HP remain NPC(30,27)/15, Ledger(31,29)/5. No tracker or
reservation was cleared. Execution/prompts false and Uplink inactive were
reconfirmed. The temporary diagnostic macro was restored to its exact retained
original command, and the viewport override reset. Ignored reports:
`dist/player-ledger-turn-audit.local.txt` and
`dist/player-noop-safe-status.local.txt`.

## November 3: development 0.7.0 isolated large-token checks

The owner resumed the retained coverage worktree and explicitly approved live
access to the copied world. A new Footprint Lab scene, two new world NPC actors
and a separate combat isolate this work from the retained Flat Hex NPC/PC. A
durable scene flag records the original view, combat, positions, HP, native
trackers and reservations. The initial creation and every geometry report
confirmed those original Flat Hex observations unchanged.

All 15 Size 2/3/4 × square/four-hex-layout geometry cases passed native current
and hypothetical occupancy, leading-body blocked/difficult terrain, clear/walled
LOS and directed-wall checks. The short-wall square regression also passed.
The harness restored its class/grid/terrain backup and removed its created
walls after each layout. Test setup needed the installed module's native debug
movement option to reposition fixtures without normal movement-cap processing,
plus a completed canvas redraw after changing dimensions. These setup options
were never used for approved Pilot execution or the original tokens.

A genuine native one-space Size-2 drag (`TokenDocument.move`, method `dragging`)
consumed the native movement flag from 8 to 0. For the partial-budget case only,
the new fixture's remaining movement was explicitly seeded to 7, with both
quick slots intact. This is seeded input, not evidence that a native drag
naturally retained seven movement. The review displayed 7 movement, 2 quick
actions and the correct protocol/reaction flags. A real local
`qwen3-vl:8b-instruct` proposal was reviewed; the GM selected the ranged
alternative A instead of the model's melee choice.

After explicit approval, the Size-2 token followed the three-space route
(7,7) → (8,7) → (9,7) → (10,7), reached the native ranged Ram Cannon HUD with
the fixture target selected, and retained move 4, full false, quick true,
protocol false and reaction true. The native Cancel control closed the HUD
before a roll. Both fixture HP values remained 15. The persisted reservation
matched the current native turn; repeating Plan Turn was refused with
“This NPC turn was already handed to execution.” No reservation was cleared.

The fixture then ended its turn and advanced to round 2 using native combat
controls. Its genuinely fresh tracker showed move 8 and both quick slots.
The GM selected retreat alternative B, a 13-space Boost route from (10,7) to
(1,0). Both base-movement and Boost segments completed, ending at native pixels
(50,0) with move 3, full false, quick true, protocol false, reaction true and
unchanged HP. This checks an actual large-token two-segment execution;
resource use is 8 base + 8 Boost − 13 movement, not a restored full movement bar.
Earlier-action-history warnings then excluded further attacks/Boost while
retaining the remaining movement count.

After client reload, the same round-2 position, tracker and reservation were
read back. A new real local-model review offered only movement/hold and the
manual-history warning. Approving it was refused with “This turn was already
reserved for execution.” Before/after reports showed identical position,
tracker and HP (`dist/resume-reload-{before,after}.local.txt`).

All six approval controls fit within the native clipping bounds at 1280×900
and 1024×768 (`dist/resume-footer-bounds.local.json`). A separate UI-only native
review, explicitly labeled as such and using observed fixture data, tested Skip
and Do it manually with execution disabled. Execute was absent; the controls
returned `skip` and `manual` respectively with identical scene/combat/actor
documents before/after (`dist/resume-footer-actions.local.txt`). This involved
no model or executor call.

The temporary relay ran only the installed local 8B model with both paid-provider
key variables empty. Its first sandbox-launched process was unreachable from
the browser; restarting outside that network restriction resolved the request.
No paid call or product change resulted from that setup failure. Recoverable
local reports are `dist/resume-partial-move.local.txt`,
`dist/resume-partial-review.local.txt`, `dist/resume-native-hud.local.txt`,
`dist/resume-partial-executed.local.txt`, `dist/resume-boost-review.local.txt`
and `dist/resume-boost-executed.local.txt`.

Final cleanup restored the original Flat Hex view/combat at round 16, turn null
and confirmed original positions, HP, trackers and reservations unchanged.
Execution and automatic prompts are false; the actual installed Uplink module
is inactive. The relay stopped and port 5090 had no listener. Client provider/
model settings and viewport were restored. The new fixture remains retained
at its observed Size-2 endpoint and partial tracker for later inspection; its
hotbar macro is now read-only. Final reports are
`dist/resume-final-safe-state.local.txt`, `dist/resume-final-world-status.local.txt`
and `dist/resume-retained-fixture.local.txt`.

The README's `docs/assets/npc-pilot-review-0.7.0.png` is an inspected native
browser screenshot at 1280×900, captured November 3 from this fixture review.
Source: d9a1d04 plus the development 0.7.0 milestone. It shows the explicitly
seeded partial budget and all six approval controls; it is not a mockup or
evidence of naturally retained movement. The earlier 0.5.1 capture remains
available for its historical footer check.

Full NPC special mechanics, all token-shape live combinations, template/counter
exceptions, distributed client locking and active Uplink transport acceptance
remain open. These scoped agent observations are not human acceptance.
