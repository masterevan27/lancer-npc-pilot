---
type: Reference
title: Module policy selector evidence
description: Development 0.8.0 selector scope, scenario ownership, verification and remaining native acceptance gates.
status: draft
tags: [foundry, testing, npc-coverage]
sources:
  - id: contract
    resource: ../superpowers/specs/2026-11-03-npc-policy-contract-design.md
  - id: plan
    resource: ../superpowers/plans/2026-11-03-policy-selector.md
  - id: selector
    resource: ../../foundry-module/scripts/core/policy.mjs
  - id: native-context
    resource: ../../foundry-module/scripts/adapter/policy-context.mjs
  - id: controller
    resource: ../../foundry-module/scripts/adapter/controller.mjs
  - id: scenarios
    resource: ../../foundry-module/test/fixtures/policies/cataphract-v1.json
  - id: later-live-acceptance
    resource: 2026-11-03-policy-acceptance.md
generated:
  by: codex/unrecorded
  at: 2026-11-03T18:26:00Z
---
# Module policy selector evidence

Historical implementation evidence follows. A later owner-authorized
[disposable-world acceptance pass](2026-11-03-policy-acceptance.md) staged
0.8.0, captured its policy UI and verified the scoped ordinary native path.
Its results supersede the runtime-authorization and screenshot blockers below
for that pass only; special mechanics and broader acceptance remain open.

Scope: implement the approved selector plan in the existing
`codex/tactical-roadmap` worktree, based on `dc6f3b90d2ae03fdce3a5bd09ed21b999628ca46`.
Development version is 0.8.0. After the initial implementation, the owner
selected REQ-7 and explicitly authorized a documentation sweep and local
commit/landing on November 3, 2026. The local Git history and dashboard landing
receipt identify the delivered revision. No runtime
installation, world mutation, publication, paid request or original-campaign
testing is part of this task. Local ignored `dist/policy-*` logs and the
plan-specific progress ledger retain command evidence. Dirty source snapshots
and a source hash manifest are retained in `dist/policy-source-snapshot/` for
recoverable document/code review; JavaScript copies use a `.source` suffix so Node does not discover archived
tests as runnable tests. Their exact bytes identify this review,
rather than claiming that the unchanged baseline commit contains the change.

## Implemented behavior

Closed inert records are checked against the frozen maintained registry;
accessors, sparse arrays, unknown keys, forged review flags and incompatible
loadouts cannot manufacture trust. The shared canonical rule serializer retains
the original catalogue algorithm's fields, sorted object keys, absent values
and array order. Readiness changes do not change rule identity.

Hard orders use final native cells/distance for every represented branch; they
do not approximate missing geometry or silently relax. Soft-order utility,
class weighted utility, bounded individual preference and existing basic score
are separate lexicographic dimensions. Unknown applicable goal weights remain
in the denominator. Canonical source/mode/target/endpoint/path/branch identity
breaks ties without display labels or enumeration order. Default model output
matches hashes captured from the baseline generator on all four core fixtures.

Policy evaluation precedes endpoint pruning. Bounded selection retains its
evaluated best and family representatives, reports omitted families, and limits
metric evaluation deterministically. Generation still uses one shortest path
per endpoint and one move plus one supported action. A truncated search cannot
claim a global optimum.

The browser resolves one native `npc_class` LID and hashes captured feature
sources using Web Crypto. Binding flags store identifiers only. Feature drift
removes affected weapon choices; optional systems, templates, tiers or ambiguous
identity are unconfigured. Matching a fingerprint grants no special handler.
Trample, Impale and Point-Defense Shield remain manual, with conservative unknown
benefits. The current free-order production selector therefore offers partial
ordinary coverage, not a fully supported Cataphract.

Explicit client policy mode makes no relay request and reads no relay secret.
The controller re-reads board/configuration after hashing and at approval,
keeps options private, refuses stale/no-choice/duplicate approval, and hands
the stored action to the existing native executor only after valid approval.
A private decision/permission guard is also checked inside its execution lock
before reservation and at continuation checks.
Model mode remains the default; execution and turn prompts remain disabled by
default. Reasons/IDs/diagnostics are escaped. No-choice reviews retain
configuration, Re-plan, Skip and manual play with no Execute.

## Scenario ownership

The fixture JSON is synthetic and its helper supplies fresh board/footprint,
budget, binding, candidates, facts and explicit GM context. Its presence alone
is not a coverage receipt; the assertions below are the relevant evidence.

| Scenarios | Owning tests and boundary |
|---|---|
| CAT-01–05, 07–08 | `policy-metrics.test.mjs`, plus `policy-scenarios.test.mjs`: useful shield vs tie/missing population, supplied priorities and conservative reaction facts. |
| CAT-06 | `policy-candidates.test.mjs`: unsupported Trample/occupied endpoint refusal only; actual pass-through mechanics remain gated. |
| CAT-09 | `policy-context.test.mjs`, metrics and candidate tests: source/support refusal with independent ordinary choices; no recharge or resource mutation. |
| CAT-10 | `policy-metrics.test.mjs`: hypothetical conditional displacement utility only, without save probability or applied results. |
| CAT-11 | Explicit mechanics gate: real confirmed save/choice/drag continuation is not implemented by this selector. |
| CAT-12 | `policy-orders.test.mjs` and selection tests: full final footprint, branch containment and no relaxation. |
| CAT-13–14 | `policy-selection.test.mjs`: actual soft protection and class precedence over personality/basic score; invalid individual bounds refuse. |
| CAT-15 | `policy-candidates.test.mjs`: policy-preferred legal endpoint survives generic weapon/target dedup. |
| CAT-16–18 | Selection/candidate/context tests: caps and actual metric-evaluation bound, canonical ties/shuffles, class/loadout ambiguity and source drift. |
| CAT-19–20 | `policy-controller.test.mjs`, controller and UI tests: disconnected selection, private authoritative actions, no-secret production manual review, configuration/hash races, cancellation, staleness and duplicate approval. |

Synthetic Web Crypto oracle fixtures model fingerprint matches without storing
licensed rule text. They are injected only in tests and are not a production
hash bypass or native execution evidence. Installed-source conformance uses
real local dependencies separately.

## Verification and limitations

The initial outside-sandbox baseline was 295 passed, seven optional installed
checks skipped, zero failures. The sandbox's local HTTP EACCES and PowerShell
authorization errors were setup failures; the same tests passed outside it.
The first full installed-dependency run passed 364 tests with zero failures and
one roster check skipped before supplying the local NPC pack path. Final
command results and independent review findings are recorded below.

All test commands run from the implementation checkout with Node 26.12.1 and
PowerShell, using Foundry 13.351 and Lancer 3.1.3 when installed checks are enabled.
Release tests exercise native and PowerShell-drive-alias ZIP packaging, reject
wrong tags/version disagreement, and verify excluded local files. They do not
publish a release or install anything.

Live policy UI, disconnected browser transport behavior, true native approved
policy attack/movement, GM/player separation in a running world, interruption
and reaction handling remain unverified. The README retains its inspected
historical 0.7.0 model review and an explicit media TODO; it is not a policy UI
capture. No current live screenshot is claimed. The project has no pinned OKF
bundle/checker; this task checks affected local links, source claims, versions
and package behavior without migrating unrelated documents.

Next acceptance: in an authorized disposable world, bind a T1 base actor, check
disconnected preview/no-secret/manual/configuration controls, change a binding
or board during/after review, then verify approved ordinary native flow handoff.
Actual Trample, Impale continuation, shield passive and full Cataphract support
retain their separate roadmap gates.

## Final verification and independent review

A read-only `gpt-6-astra` reviewer found eight Important issues and no Critical
issues. Each Important finding received a failing regression before the fix:
locked configuration/permission checks; native footprint/branch authority;
canonical fact identity; optional undefined native stats; malformed/getter data;
independently pinned policy sources; complete hostile population; and truthful
bounded-refusal diagnostics. The one fix pass passed the affected 92-test set
and the final full suite. That initial review received no second fix re-review. A later, separately
requested REQ-7 change received a narrow independent review with no findings.

| Command/check | Observed result |
|---|---|
| `node --test` with `PILOT_FOUNDRY_CODE`, `PILOT_LANCER_SYSTEM`, `PILOT_NPC_PACK` set to the inspected local 13.351/3.1.3/pack installation | 375 passed, 0 failed, 0 skipped; exit 0. `dist/policy-final-installed.local.log`. |
| `node --test foundry-module/test/policy-*.test.mjs foundry-module/test/executor.test.mjs foundry-module/test/controller.test.mjs foundry-module/test/ui.test.mjs` | 92 passed, 0 failed/skipped; exit 0 before the explicit-null-limit regression was added and verified in the final full suite. |
| Local documentation/source/image target checks | Nine affected documents, 81 local targets, no missing files. Remote URLs were not fetched. |
| `git diff --check` | Exit 0 outside sandbox; no whitespace errors. |

One final verification attempt discovered archived `.test.mjs` copies in ignored
`dist/policy-source-snapshot/`, causing duplicate stale test imports. Those copies
were renamed with `.source` suffixes and the complete suite reran successfully.
This was an evidence-storage/setup issue, not a product failure. The original
source pack remained unchanged in roster conformance tests.

REQ-7 is resolved in this milestone: Ram Cannon availability now uses the same
`canSpend(actionBudget,{quick:1})` eligibility check as ordinary attack generation.
Spent or restricted budgets produce a budget-specific diagnostic; source match
and reviewed support remain independent from readiness. Source fingerprints,
features and extracted weapons are unchanged by the diagnostic. A regression
failed before this fix and passed afterward across spent, restricted and
one-quick-remaining cases. No reservation or execution code is called by planning.
The independent narrow REQ-7 reviewer found no remaining issues.

Plan adjustment: an optional private executor configuration/permission guard was
necessary to satisfy the approval boundary across a delayed Web Lock. Existing
executor callers retain their default behavior. This adds one internal callback
contract, without changing native actions or reservation format. All live and
special-mechanics gates above remain open.

## REQ-7 follow-up and local landing checks

The owner selected REQ-7, docs-sweep and local land after the initial source
closeout. The new regression first failed with `true !== false` for a spent
budget. After using the existing pure budget check, context/controller/partial
turn suites passed 39 tests, and the full installed-source/roster/package suite
passed 376 tests with zero failures/skips (`dist/req7-full.local.log`, exit 0).
Source identity and extracted weapons stayed unchanged across budget states.
A separate narrow read-only `gpt-6-astra` review independently ran the regression
and found no critical, important or minor issues. The original special mechanics
and native runtime acceptance boundaries were retained.

Documentation sweep reviewed the nine changed Markdown documents against the
current code, fixtures and recorded approval/landing scope. It corrected stale
uncommitted/deferred wording, retained historical 375-test evidence as history,
and updated current next actions. It did not renew runbook freshness deadlines
or infer live acceptance from unit tests. The existing 0.7.0 screenshot was
inspected in the earlier review and remains explicitly historical. Current
policy UI capture is still blocked by missing runtime staging authorization;
the README media TODO records that gate. No pinned OKF bundle is present, so
its migration remains outstanding. Exact committed and received-main checks,
local-only delivery, retained worktree and REQ-7 fixed-in revision are recorded
in the landing receipt.
