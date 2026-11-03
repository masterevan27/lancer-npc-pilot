---
type: Reference
title: Full NPC coverage diagnostics
description: Source-bound coverage accounting, native geometry and scoped development 0.7.0 verification evidence.
status: draft
tags: [foundry, testing, npc-coverage]
sources:
  - resource: ../../foundry-module/scripts/core/coverage.mjs
  - resource: ../../foundry-module/scripts/rules/npc-mechanics.mjs
  - resource: ../../foundry-module/scripts/adapter/geometry.mjs
  - resource: ../../foundry-module/scripts/adapter/snapshot.mjs
  - resource: ../../foundry-module/scripts/core/budgets.mjs
  - resource: ../../tools/report-npc-coverage.mjs
  - resource: 2026-11-02-execution-acceptance.md
generated:
  by: codex/unrecorded
  at: 2026-11-03T06:08:00Z
---
# Full NPC coverage diagnostics — 2026-11-02

Agent: Codex / unrecorded. Scope: development 0.6.0 diagnostics and subsequent
0.7.0 integration in the retained coverage
worktree, based on local d9a1d04. This is source-research and diagnostic evidence,
not human acceptance or a claim of full NPC support.

## Source and method

Three disjoint research batches inspected the installed NPC pack through
disposable filesystem copies using the installed ClassicLevel reader. The
original database was never opened by a writer; each batch recorded equal
original file hashes before/after and removed its closed temporary copy.
Every feature fingerprint matched the frozen catalogue. Source version:
Lancer 3.1.3; Foundry 13.351. The copies are best-effort filesystem snapshots;
fingerprint equality provides the separate per-feature identity check.

Research read actual structured rule fields and human-readable clauses, then
recorded short paraphrased verification gates and owning chunks. Names, item
kinds and inventory prose signals did not establish mechanic classifications.
The retained ignored `dist/coverage-research/batch-0.json` through `batch-2.json`
contain methods, original hash evidence and individual results. The local import
tool checks batch ownership, uniqueness, fingerprints, versions and tiers before
producing the data-only `scripts/rules/npc-mechanics.mjs` module. Raw rules
exports and world IDs are not tracked.

## Accounting and limitations

- All 461 features and 1,383 feature/tier records remain represented, alongside
  all 44 classes and 15 templates.
- Source ownership classifications: 397 reviewed, 64 unresolved. All 911
  implementation mechanic records have concrete acceptance gates and owning
  chunks; every implementation gate remains unresolved.
- Two features have no frozen class/template owner association:
  `npcf_got_your_back_archer` and `npcf_void_rend`. They are retained and
  reported as unassigned, without inferring owners from names.
- Source ambiguities include timing, target scope, external rule references,
  missing structured fields, rounding and rule-mandated choices. These retain
  Chunk 1 obligations rather than becoming guessed runtime behavior.
- `npc-descriptors.mjs` deliberately has an empty executable special-ability
  registry. This is separate from the existing supported weapon adapter and
  reviewed T1 Ram Cannon modes; the new full-feature contract is not implemented
  merely because a simpler weapon flow already exists.
- Owner rollups and full coverage remain incomplete. Finishing source
  classification alone cannot grant a handler or complete a class/template.

Runtime warnings extend the existing active/target nonweapon warning path.
They retain native-derived stats and show source questions and concrete chunk
gates. The browser associates those guides by ID and kind only: it does not
compute the inventory SHA-256 fingerprint. The warning therefore remains manual
and explicitly says live source verification is unresolved, including for a
known catalogue ID. Unknown/custom kinds and IDs retain conservative diagnostics.

## Recoverable checks

`mechanic-coverage.test.mjs` exercises all-roster/tier/owner accounting, source
drift, missing/duplicate/extra entries, orphan features, malformed/sparse data,
inert accessors, ambiguous annotations and the separation between classification
and executable support. Adapter tests cover unresolved target traits without
changing native stats or weapon support. Inventory tests retain unresolved
owner references without dropping feature records.

Regressions were observed failing before the corresponding changes; retained
`coverage-*-red.local.log`, `coverage-*-green.local.log` and
`mechanic-annotations-*.local.log` contain individual command results. The
foundation full suite passed 213 tests before the exact-source annotation
integration; its log is `coverage-foundation-full.local.log`. Final combined
verification is recorded separately after integration.

Read the frozen report without a database or model call:

```powershell
node tools/report-npc-coverage.mjs
node tools/report-npc-coverage.mjs --lid npcf_trample_cataphract
node tools/report-npc-coverage.mjs --chunk 2
```

The installed inventory command also includes a `coverageWork` report. Its
inventory signals remain informational; they never authorize execution.
Large-token footprints, exact partial-turn budgets and later execution/ability
chunks remain separate implementation and native conformance gates.

## Verification and authorized review correction

Final combined `node --test` with installed Foundry/Lancer/pack conformance:
exit 0, 216 passed, 0 failed/skipped/cancelled. Retained log:
`coverage-chunk1-final.local.log`. This passing suite does not close the
independently found malformed-input issue below.

Review pass 1 found sparse nested review/owner arrays could throw or disappear
because array iteration skipped holes. The controller reproduced the failure,
added dense-data guards and regressions, and observed the targeted suite pass.
Pass 2 confirmed that correction but found another P2: assigning `{}` to the
classification mechanic's `gates` makes validation call a nonfunction
`includes`. The controller independently reproduced the TypeError.

The shared agent rules cap each subsystem at two builder/critic rounds. The
owner subsequently authorized one additional narrow guard/regression round in
the chat. The added malformed-`gates` case first failed with the reproduced
TypeError (`coverage-extra-red.local.log`). After the `Array.isArray` guard,
the targeted suite passed 9 tests (`coverage-extra-green.local.log`) and the
full installed-runtime suite passed 216 tests, with none failed or skipped
(`coverage-extra-full.local.log`). The independent reviewer inspected only
this guard/regression, reran the 9-test suite and reported no findings.
This resolves that review blocker without resolving any source ambiguity or
implementation gate. Development 0.6.0 was subsequently deployed with backups;
all 22 runtime files matched readback. The deployed snapshot extractor showed
the intended manual-only owning-chunk warnings in the copied test world without
model calls or execution; cached metadata still says 0.4.1.

Chunk 1's source work is retained, with its unresolved rules explicit. Chunk 2
now has the verified foundations and scoped integration below; broad
acceptance remains open. The authenticated Evan player shortcut and guarded-macro
observations, including the transient-notification limitation, are in the acceptance evidence;
broader player behavior remains open. No paid calls,
original-campaign testing, landing, push or publication occurred.

## Chunk 2 foundations: native geometry and projected budgets

The subsequent development foundation passed the full installed-runtime suite:
229 passed, none failed/skipped/cancelled, exit 0
(`chunk2-foundation-full.local.log`). At that milestone, the adapter still
refused large tokens and partial turns. Later integration is described below;
that earlier foundation did not change the deployed 0.6.0 installation.

`occupiedTokenGeometry` reads native occupied cells for current and hypothetical
positions using public `getSnappedPosition`, `getOccupiedGridSpaceOffsets`,
`getCenterPoint` and grid centers. It retains the exact snapped origin until
final pixel rounding. The pure anchor is explicitly the first occupied cell,
which may differ from Foundry's native top-left anchor. Licensed conformance
checks all five grids, six shapes, five installed sizes and 49 destinations
crossing negative coordinates/parity: 7,350 cases, no position or occupancy
mismatches. Underscore native anchor helpers are used only to generate the
independent conformance fixture positions. No Foundry source is distributed.

Disposable-copy inventory metadata (`dist/native-size-inventory.local.json`)
accounts for 44 classes/132 tier rows: 14 classes Size ½, 23 Size 1, 5 Size 2,
1 Size 3 and 1 Size 4. All 15 templates lack direct numeric size fields; Ship's
associated Massive Size feature has a structured Size 4 override. Original file hashes
matched before/after; copies closed/deleted. This is numeric inventory,
not resolution of prose size choices. Native actor size and token shape remain
authoritative. Token source hash:
`8fcadf75c446e04a3948cac765ea6c6215503ef0b59be45bee06b0cde4ae1d05`.

Core movement/range/prompt helpers now accept exact per-anchor occupied-cell
maps. They test body-cell obstructions/difficult terrain, bounds, allied
passage, hostile obstruction and directed parity-changing hex steps. Missing
large-hex occupancy is an error, replacing the former one-cell approximation.
The standalone extraction helper did not authorize large movement. The subsequent
integration supplies native body-cell maps, center/body sweeps and body-cell LOS;
live acceptance remains a separate gate.

The pure budget ledger projects one full action or two quick actions from one
shared pool, partial observed movement, separate Boost grants, protocol closure,
reaction availability and explicit-period feature counters. It preserves the
observed tracker separately from the projected tracker and never resets a
counter or predicts recharge. Native action conformance loads installed
`actor-actions.ts` from its source map into memory and compares actual spending
for quick/full/move/protocol/reaction/free actions. Its source hash is
`96bd3ca759366ac54adcb153c488d900e3c89b77b0b237f5d09035394615ac16`.
The native mutator does not validate full-action legality; the shared-pool
constraint is the Pilot's check. Native reset merges omit free/used-reaction
history, so those fields must not be assumed cleared. Source research also
identified reaction refresh at each actor turn, rather than each round.
Native TypeScript
conformance requires the local Node stripping API; a missing runtime/API is a
skipped, unverified gate elsewhere.

## Development 0.7.0 scoped integration

The candidate connects exact occupied cells to snapshot extraction, movement,
range/engagement, LOS, prompt facts and executor route-cost checks. Body-cell
wall rays are distinct from whole-mover anchor blockers. Map bounds use actual
native token pixel dimensions; unsupported dimensions, elevation differences
and regions remain manual. The native suite also checks core body-cell
translation across all 7,350 native shape/parity cases, and snapshot sweeps/LOS
with both large movers and targets on all five layouts.

Snapshots now retain remaining native actions/movement, explicit Limited,
Loading and Recharge resource states and actual class/template IDs. Candidate
generation reads the remaining pool; execution validates actual path adjacency
and occupied-cell costs before reservation, preserves unused movement, and
checks the observed tracker across movement awaits instead of overwriting an
external tracker change. The review shows remaining movement/actions. Persistent
turn reservations remain; there is still only one approved Pilot option per
native turn. This is not resumable multi-step execution.

`validateUse` is a pure descriptor prerequisite foundation. It requires exact
source/version/tier/handler resolution, a living NPC, verified owning item and
active timing, remaining budget, explicit target restrictions, and authoritative
range/LOS. Missing context or unknown policy fields refuse use. It is not wired
to executable special abilities; areas, reactions, passives and effect handlers
retain their later-chunk gates. Native frequency-counter reset semantics and
template-specific action exceptions remain unresolved until reviewed descriptors
and native event histories supply that authority.

The pre-review installed-runtime suite passed 296 tests with none failed or
skipped (`chunk2-review-full.local.log`). Round 1 found three reproducible issues:
unknown earlier quick-action identity, short walls missed by body-center rays,
and resource costs incorrectly excluded from Protocol activations.

The corrective builder pass observed RED then GREEN for all three. Remaining
native slots are retained but attacks/Boost are blocked after an earlier quick
slot was spent, with a manual-history warning. Movement-only partial turns with
both slots intact remain usable. Protocols may spend feature counters in the
same activation; combining Protocol and another action remains refused.

Complete wall checking now sweeps the actual public native
`getGridSpacePolygon()` through the translation, testing start/end interiors
and every swept boundary edge. It detects the reviewer's short-wall example
without square approximations or finite ray sampling. Native wall objects retain
open-door/nonmovement/direction decisions; missing geometry or unverified
restrictions fail closed. Tests cover intermediate sweeps, internal seams,
concave notches, boundary contact, long-wall numeric scale and independent
rectangle interval comparisons. Native direction methods, loaded only in memory,
agree with the installed normal polygon origin-side filter for both directions
of vertical, horizontal and diagonal walls. Body/center rays remain additional
native checks, cached only within one synchronous read, never across snapshots.

The corrected installed-runtime suite passed 302 tests, with none failed or
skipped (`chunk2-review1-fixed-full.local.log`). Independent round 2 reported no
new actionable findings and independently passed 58 targeted/native tests.
Both permitted Chunk 2 review rounds are consumed. Development 0.7.0 was
deployed with timestamped backups and all 27 runtime files matched readback.

On November 3, the resumed installed-runtime suite again passed 302 tests with
no failures/skips (`dist/resume-full-tests-unrestricted.local.log`). Its first
sandbox run could not execute child PowerShell packaging checks; that was a
setup restriction, resolved by the unrestricted run. The frozen coverage report
still accounts for 461 features, 1,383 tier records, 59 owners, 64 source
questions and 911 pending mechanics, with zero executable special descriptors.

Copied-world live checks passed Sizes 2, 3 and 4 on square and all four hex
layouts. Each compared current/hypothetical occupied cells with native documents,
blocked a leading body cell, doubled entry cost for difficult terrain, checked
clear/walled LOS and both sides of a directed wall. A short square wall between
center rays also blocked the Size-2 route. All 15 cases passed. Fixture setup
uses native debug movement only for positioning new test tokens, then waits for
canvas redraw after dimensions change before snapping. It does not establish
approval/execution behavior by itself. Each case restored the fixture class/grid,
removed only its created walls and reported the original Flat Hex tokens,
HP, trackers and reservations unchanged. Recoverable UI reports are
`dist/resume-square-live.local.txt` and `dist/resume-hex{2,3,4,5}-live.local.txt`.

The [execution evidence](2026-11-02-execution-acceptance.md) distinguishes a
genuine native drag from the explicitly seeded partial-budget scenario and
records approved large-token movement/HUD cancellation. These are scoped agent
observations; feature-specific legality, counter refresh, template exceptions,
distributed locking and the broader acceptance matrix remain open.

## Scoped documentation review on November 3

Reviewed the task's README, documentation index, adapter runbook, full-NPC plan,
core README and both evidence records against the source in the commit containing
this record. Corrected pending-review/deployment claims, replaced the README's
preview with the inspected real 0.7.0 review, and kept source questions, later
chunks and broad acceptance gates open. The runbook's existing `stale_after`
was retained. This is a partial factual review, not whole-document freshness or
human sign-off; unrelated historical claims were not revalidated.

Executed from the coverage worktree on Windows, Node 26.12.1:

- `node --test`, with the documented installed Foundry/Lancer/pack environment
  paths: exit 0, 302 passed, 0 failed/skipped/cancelled. Full log:
  `dist/resume-full-tests-unrestricted.local.log`. Child PowerShell packaging
  needed an unrestricted shell; the restricted attempt is not passing evidence.
- `node tools/report-npc-coverage.mjs`: exit 0; frozen totals and incomplete
  executable support reported above. Output: `dist/resume-coverage-report.local.json`.
- `node dist/check-doc-links.local.mjs`: exit 0, 30 local Markdown links, none
  missing. The checker source and output remain in ignored local evidence.
  This verifies local link existence only, not external URLs or frontmatter.

No pinned OKF bundle/checker or registered roadmap exists in this project.
Migration and roadmap coverage remain unverified; this sweep does not invent
their completion. Dashboard closeouts record these scoped reviews separately
from implementation status and human acceptance.
