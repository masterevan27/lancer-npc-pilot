---
type: Plan
title: "NPC weapon diagnostics and reviewed modes"
description: "First REQ-3 chunk: per-weapon exclusion diagnostics and reviewed Ram Cannon attack modes."
status: draft
tags: [foundry, planning, npc-coverage]
sources:
  - resource: ../../design.md
  - resource: ../../../foundry-module/scripts/adapter/weapons.mjs
generated:
  by: codex/unrecorded
  at: 2026-11-02T04:25:27Z
---
# NPC weapon diagnostics and reviewed modes

**Goal:** Deliver the first REQ-3 chunk in the existing planning-errors checkout, preserving REQ-2.
**Spec:** REQ-3 and ../../design.md. No registered roadmap or pinned OKF bundle exists.
**Architecture:** Keep unknown effects refused. Recognize the installed T1 Ram Cannon payload explicitly, expose two mode-specific snapshots, and adapt only the approved Lancer flow instance after its normal initialization. Never modify the weapon document, global flow registry or shared flow steps.
**Tech stack:** Plain ES modules, Node built-ins, Lancer 3.1.3.

- [x] Preserve the seven incoming modified files in ignored local evidence.
- [x] Capture the installed Ram Cannon fixture, then watch regression tests fail for missing diagnostics and modes.
- [x] Add per-weapon exclusion diagnostics and a no-usable-weapons warning; keep readiness and unknown effects conservative.
- [x] Carry mode through candidate identity/action/prompt; restrict each mode to its own range and scoring.
- [x] Hand off through the registered WeaponAttackFlow with an instance-only init wrapper; validate capability and vetted item before reserving a turn. Refuse unsupported system versions.
- [x] Test real installed initialization and HUD data using optional licensed-source conformance, plus approval/stale-state regression coverage.
- [x] Run final module/full tests, inspect all changes, update affected docs/version, review and record checkpoint. The overall expanded attempt stays active; closeout follows full scope. The owner subsequently authorized local landing and pushing this partial milestone; installation and publication remain separate.

Review focus: edited effects or profiles, tier overrides, spent/unready weapons, missing flow APIs, range/LOS and action budgets. T2–3 remains manual. Existing REQ-2 behavior is preserved. The owner explicitly selected this checkout in chat after worktree creation was blocked.

The owner expanded this request to full NPC specials. Continue with the [full coverage plan](2026-11-01-full-npc-coverage.md); this first chunk does not satisfy catalogue-wide support.

Verified milestone: full suite with licensed Foundry/Lancer and installed-roster conformance: 198 passed, zero failed/skipped (`req3-full-tests.local.log`). The incoming REQ-2 regression file is preserved byte-for-byte. Independent review found/fixed the cleared-Effect mixed-mode fallback and found no remaining actionable issues. Development package 0.4.0 builds in a separate output directory; no install/live acceptance.

Landing scope: the retained REQ-2 diagnostics, first REQ-3 weapon chunk and catalogue/coverage foundations only. The expanded full NPC objective stays open after this landing.
