---
type: Reference
title: Cataphract partial local landing — 2026-11-03
description: Scoped documentation review and local source integration, separate from native and tactical acceptance.
status: draft
tags: [foundry, testing, npc-coverage]
sources:
  - resource: ../roadmap.md
  - resource: ../foundry-adapter.md
  - resource: 2026-11-03-cataphract-implementation.md
  - resource: 2026-11-03-cataphract-native-acceptance.md
  - resource: ../../foundry-module/scripts/rules/npc-descriptors.mjs
  - resource: ../../foundry-module/scripts/adapter/grapple-controller.mjs
  - resource: ../../foundry-module/scripts/adapter/shield-controller.mjs
generated:
  by: codex/unrecorded
  at: 2026-11-04T02:14:00Z
---
# Cataphract partial local landing — 2026-11-03

The owner explicitly requested docs-sweep and land in this chat. Scope is the
retained `codex/tactical-roadmap` worktree's complete prepared 0.9.0 source,
tests and evidence, including the earlier 0.8.0 ordinary acceptance record.
The source commit containing this record identifies the reviewed contents;
the dashboard landing receipt identifies the resulting local `main` revision.
This is an authorized partial landing, with Step 2 acceptance still blocked.
No push, publication, new runtime installation or world mutation is included.

## Documentation review

Reviewed the task's tracked/untracked documents against retained sources, the
625-test continuation result, native receipts, restoration readback and the
existing two-round critic record. Corrected current runbook wording that still
called the source uncommitted, clarified the historical 0.7.0 roadmap audit,
distinguished the empty generic descriptor registry from the scoped Cataphract
path, and replaced outdated next-gate wording with the actual remaining gates.
Current roadmap source references use relative paths changed with this commit.

The README's real policy/Impale previews and the native result panel retain
their capture version, date, dirty-source provenance and limits. Their pixels
were inspected during the native work; no private credentials or licensed page
captures are tracked. Historical dirty/unlanded statements in dated evidence
describe those earlier observations and are preserved as history.

This is a partial claim review, not whole-document freshness or human approval.
No pinned OKF profile/checker exists; existing REQ-8 tracks that migration gap.
The runbook's stale_after is preserved. The local checker validates paths,
imports and matching version sources; it does not validate remote URLs,
Markdown anchors, tactical quality or native gameplay.

## Verification and remaining work

The continuation's root `node --test` passed 625 tests with zero failures or
skips, installed Foundry/Lancer/roster checks enabled, normal Windows host
permissions. Its exact command/log and individual native outcomes are in the
[native record](2026-11-03-cataphract-native-acceptance.md#source-continuation-after-restoration).
Landing reruns the full suite on the committed source and receiving `main`;
those individual command results and the landed revision are retained in the
dashboard handoff and ignored `dist/land-*` logs in the retained worktree.
Local release packaging was byte-checked against current runtime source; the
final ZIP itself was not deployed.

Shield HP/Heat/replay, both Impale save branches, immediate first-turn control,
paired movement and cancelled/winning escape have scoped native passes.
Automations coexistence remains unsupported; movement and Shield refuse before
mutation. Shield variants, stale continuation, deletion, multiplayer/second-GM,
large square/hex variants and human tactical review remain open. Two independent
critic rounds were already consumed; this landing adds no critic round or
acceptance. Exact original 0.8.0 module/test world/configuration restoration and
unchanged original campaign hashes remain the latest runtime evidence.

Keep the worktree and branch for reuse, including ignored logs, backups,
packages and source snapshots. Local source delivery does not complete the
broader Cataphract or full-roster deliverables.
