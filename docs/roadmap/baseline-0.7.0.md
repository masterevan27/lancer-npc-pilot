---
type: Roadmap
title: "Historical audit baseline: development 0.7.0"
description: "State of the code, catalogue and tests when the roadmap was first written, and the sources it used."
status: draft
tags: [planning, history]
sources:
  - resource: ../review-evidence/2026-11-02-coverage-diagnostics.md
  - resource: ../review-evidence/2026-11-02-execution-acceptance.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Historical audit baseline: development 0.7.0

Part of the [NPC mechanics and tactical behavior roadmap](../roadmap.md).

Audit baseline: local default branch `main`, development 0.7.0 at
`dc6f3b90d2ae03fdce3a5bd09ed21b999628ca46`. Local `origin/main` is one commit
behind; this audit did not fetch or verify current remote publication.
There were no registered roadmap lines or cards before this update.

- Supported basic move/attack choices, tunable scoring, model selection and
  top-score fallback exist. A class-policy selector does not yet exist.
- The catalogue and inert diagnostics preserve 461 features across 1,383
  feature/tier records, 44 classes and 15 templates. Evidence records 64 source
  questions and 911 implementation mechanic records with unfinished gates.
- Native larger-token geometry and observed partial-turn budgets have scoped
  implementation and copied-world evidence. Feature exceptions, template
  rules, counter timing and broader acceptance remain unfinished.
- The executable special-ability descriptor registry is empty. Existing T1
  Ram Cannon support does not establish complete Cataphract support.
- The recorded exact-commit full suite passed 302 tests. This audit separately
  ran the coverage, mechanic accounting, options and prompt/reply suites:
  51 passed, zero failures or skips. It did not repeat live Foundry tests.

The audit used default-branch code, local Git history, the latest landing
handoff and the two linked evidence documents. The Cataphract policy proposal
uses the owner's supplied Core Book page 297 excerpt. Neither whole PDF nor
The Long Rim was independently reviewed for this roadmap. Later policy work
must identify the applicable source/version and resolve installed-data or
errata discrepancies explicitly. Do not track full copyrighted rule exports.
The documentation bundle is checked with the pinned OKF tools; see the [documentation index](../index.md).
