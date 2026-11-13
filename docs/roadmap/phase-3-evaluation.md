---
type: Roadmap
title: "Phase 3: Evaluate behavior and optional model assistance"
description: "Cards for comparing optional LLM assistance and for tactical scenario and GM review acceptance."
status: draft
tags: [planning, policy]
sources:
  - resource: ../../foundry-module/scripts/core/options.mjs
  - resource: ../../foundry-module/scripts/core/policy.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Phase 3: Evaluate behavior and optional model assistance

Part of the [NPC mechanics and tactical behavior roadmap](../roadmap.md).

## tactics-llm: Optional LLM assistance and comparative evaluation

Status: planned. Depends on a working module-only baseline and reviewed scenarios.

Acceptance: compare profile-only choices with the current model selector using
the same known battlefield state and supported plans, including delays and
GM-reviewed tactical fit. Test cases must expose any candidates lost to pruning.
Use evidence to choose a bounded role for optional intent interpretation,
advice or characterization; do not assume a model improves tactics. Disabling
it preserves planning. Model output never grants rules, outcomes or approval;
API keys stay relay-only and paid calls need their own authorization.

## tactics-acceptance: Tactical scenario and GM review acceptance

Status: planned. Depends on the policy batch and mechanics being accepted.

Acceptance: maintain representative fixtures with explicit acceptable choices
and refusal cases, inspectable explanations and unchanged legality checks.
Run applicable disconnected-relay, cancellation, stale-board and disposable-world
cases. Obtain GM review of class behavior; record exact tested tiers/features
and remaining gaps. Tactical quality is not established by a higher damage
score or a passing schema test. Accept individual batches without claiming the
unfinished roster is complete.

## Related

- [Phase 2: Encode the books' tactical identities](phase-2-tactics.md)
- [Priority milestone: playable 2v2](playable-2v2.md)
- [Evidence and live acceptance gates](../foundry-adapter/acceptance-gates.md)
