# Scoped execution acceptance — 2026-11-02

Agent: Codex / unrecorded. This is agent evidence, not human acceptance.

Scope: development 0.5.0 source, Foundry 13.351, Lancer 3.1.3, in the
disposable `LancerWorld — NPC Pilot TEST COPY`. The original campaign was not
entered or mutated. No paid inference was used. Full NPC coverage remains open.

## Observations and fixes

- Lancer Automations inserts a step before native weapon initialization. The
  flow guard now requires unique initialization before the HUD and roll steps,
  preserving registered hooks rather than requiring initialization at index zero.
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
