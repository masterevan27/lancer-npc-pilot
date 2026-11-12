---
type: Plan
title: "Foundry adapter implementation plan"
description: "Connect the pure core and relay to a GM-only Foundry module with review before execution."
status: draft
tags: [foundry, planning]
sources:
  - resource: ../../design.md
generated:
  by: codex/unrecorded
  at: 2026-11-01T07:23:48Z
---
# Foundry adapter implementation plan

> Execute inline using superpowers:executing-plans; the owner's original instruction was to start building without a question round.

**Goal:** Connect the existing pure core and relay to a GM-only Foundry module with review before execution.

**Architecture:** A snapshot adapter isolates Foundry documents and geometry; a controller owns planning, retries and approval; a runtime supplies settings, DialogV2 and execution. No build or runtime dependencies.

**Spec:** [Design](../../design.md).

## Global constraints

- Foundry v13, Lancer 3.1.3 reference source, Node >=20 tests.
- No API keys in the browser. Relay shared secret is client scoped, hidden from settings UI on player clients; API keys stay in relay environment.
- No execution without explicit approval. Execution defaults off pending staged live acceptance.
- Unsupported geometry/mechanics fail closed; do not approximate them into executable plans.
- No merge, push, deployment or paid inference in this task.

## Review focus

- World/turn changes, concurrent requests, repeated clicks and duplicate GM clients.
- Missing data, hidden enemies, unsupported grids, token sizes and elevation.
- Model text containing HTML and invalid IDs, failed/aborted relay calls.
- Movement interrupted by walls or hooks: do not attack after an incomplete move.
- Action budgets, stale actor/item data, and the distinction between an attack flow and a resolved outcome.

## Tasks

- [x] Snapshot: create `scripts/adapter/snapshot.mjs` and `test/adapter.test.mjs`; test tiered weapon data, tag IDs, disposition, bounds, directed wall collision and known LOS. Verify failures before implementing. Use Foundry grid coordinate APIs, reject unsupported movement. Preserve all tokens including hidden enemies for the GM.
- [x] Controller: create `scripts/adapter/controller.mjs` and `test/controller.test.mjs`; test invalid reply retry/fallback, no execution before approval, changed board/turn rejection, re-entry and replay prevention, connection errors and cancellation. `PilotController.plan()` returns a review; `approve(review, optionId)` re-snapshots before calling injected execution.
- [x] Runtime/UI: create manifest, `scripts/pilot.mjs`, `scripts/adapter/review.mjs`, and stylesheet. GM-only API and keybinding, optional NPC-turn prompt, client relay configuration, explicit execution gate, pick/re-ask/skip/manual controls. Test HTML escaping, manifest paths and player no-op. Use TokenDocument.move and item.beginWeaponAttackFlow; never fabricate rolls or damage.
- [ ] Verify and record: run all tests, syntax checks, diff/whitespace checks; document installation, supported subset, source provenance and live acceptance gates; bump VERSION/package/manifest to 0.2.0; checkpoint and closeout.

## Evidence and rulings

- Baseline: integrate-cores `1f33a11`, 88 tests pass. Existing worktree reused on `codex/foundry-adapter`.
- Read-only live metadata: `/api/status` returned Foundry 13.351, active false; `/systems/lancer/system.json` returned Lancer 3.1.3. No world was entered or modified.
- API reference: Foundry v13 BaseGrid.getOffset/getTopLeftPoint/getCenterPoint, Token.checkCollision, TokenDocument.move; local Lancer 3.1.3 source maps confirm currentProfile(), tags use `lid`, and beginWeaponAttackFlow().
- No registered roadmap or pinned OKF bundle exists; do not invent acceptance or migrate the documentation bundle during this feature.
- Ruling: first executable subset is size-1 tokens on flat equidistant square grids, ordinary single-target weapons, move/attack/Boost/hold. Hex/large tokens, special targeting, Hide and complex statuses remain explicit live gates. This narrows execution rather than asserting the inherited core's RULE? assumptions were verified.
- Ruling: terrain must be explicitly reviewed by the GM via the scene configuration API before execution; Foundry walls do not describe all Lancer terrain. The review dialog calls out unknown cover and reaction handling.
- Verified implementation: 114 tests passed, 0 failed with loopback access on Node 26.12.1. Restricted full-suite failures were local HTTP `EACCES`, not product failures. All 12 module ES files passed `node --check`; all 11 local links in the changed documentation resolved.
- Fresh reviewer completed two passes. Findings addressed with observed failing-then-passing regressions: engagement stops, HIDDEN target exclusion, Superheavy type and scripted weapon-effect exclusion, revalidation across asynchronous handoff steps, active-position checks, and synthetic ActorDelta normalization. The GM alternatives also preserve tactical variety after filtering.
- Live Foundry UI, real provider calls, movement and attack acceptance remain open. Source/API comparison is not live acceptance. No inherited core `RULE?` claim was promoted to verified.
