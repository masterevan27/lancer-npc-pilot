---
type: Runbook
title: "Module policy mode (development 0.8.0)"
description: "Select relay-free policy mode, bind an actor policy, and what the policy review checks."
status: draft
tags: [foundry, policy]
sources:
  - resource: ../../foundry-module/scripts/adapter/policy-context.mjs
  - resource: ../../foundry-module/scripts/adapter/policy-candidates.mjs
  - resource: ../../foundry-module/scripts/core/policy.mjs
  - resource: ../review-evidence/2026-11-03-policy-acceptance.md
  - resource: ../review-evidence/2026-11-03-policy-selector.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Module policy mode (development 0.8.0)

Part of the [Foundry adapter guide](../foundry-adapter.md).

In **Configure Settings → Lancer NPC Pilot → Decision mode**, select
**Module policy (no relay)** on the GM client. Model mode remains the default.
Policy mode never reads a relay secret or sends a model request, including
when its policy is invalid. It uses the same Plan Turn macro and Alt+P.
Execution and turn prompts still default off.

Bind the selected native NPC actor once through the GM-only module API:

```js
const actor = canvas.tokens.controlled[0]?.actor;
await game.modules.get('lancer-npc-pilot').api.bindActorPolicy(actor, {
  classId: 'npcc_cataphract',
  policyId: 'cataphract-base-t1'
});
```

The class identifier is the installed `npc_class` **LID**, not its display name
or embedded item ID. The actor must contain exactly one matching class item.
The binding stores only those identifiers on the actor, not source material,
review authority or an execution handler. Initial scope is T1, the four base
Cataphract features, no templates and no optional systems. Unexpected loadouts
or ambiguous/missing bindings give an unconfigured review with a manual path.
The GM API deliberately changes the selected actor's binding; use a disposable
world for acceptance. It does not create actors or enable execution.

Feature sources are captured from the same board snapshot and checked with
Web Crypto SHA-256 against maintained 3.1.3 catalogue fingerprints. Rule drift
removes the affected source's choices; readiness and budget remain independent
requirements. A spent/restricted ordinary attack budget reports Ram Cannon
unavailable with the budget reason while retaining its source-match metadata.
A matching source cannot enable a missing special handler.
The original 0.8.0 slice offered ordinary movement/Ram Cannon only. Development
0.9.0 adds the scoped [Cataphract mechanics](cataphract-mechanics.md). Coverage remains **partial** because
unsupported target passives and broader native acceptance are unfinished.
Unknown useful Shield protection and reaction exposure remain visible; the
selector never fabricates a save result or grants reaction immunity.

The review shows the policy/state, estimated reasons, coverage and uncertainty,
plus **Re-plan**, **Policy settings**, **Skip** and **Do it manually**. Policy
settings explains mode/binding setup; it does not open relay setup. There is no
objective editor yet: production uses a free order, while structured orders and
bounded individual preferences are pure injected interfaces. Needs-input and
unconfigured reviews have no Execute button. Ready/partial choices still require
normal explicit approval with execution enabled and terrain reviewed.

A changed board, turn, budget, mode, binding, order or policy configuration
expires review before execution/reservations. Changes during asynchronous source
hashing discard the proposal. Native execution, locks and resource guards stay
in the existing executor. Selection examines one shortest path per endpoint and
one supported action, capped to eight review slots with explicit omissions.
The [November 3 disposable-world pass](../review-evidence/2026-11-03-policy-acceptance.md)
observed disconnected policy review, manual/configuration controls, changed
board/binding/source refusals, ordinary movement and native ranged Ram Cannon
handoff with HUD cancellation. It includes a real policy UI capture and explicit
remaining gates; it does not establish the unsupported special mechanics.
See also [selector implementation evidence](../review-evidence/2026-11-03-policy-selector.md).

## Related

- [Module policy selector design](../design/policy-selector.md)
- [Cataphract mechanics (development 0.9.0)](cataphract-mechanics.md)
- [Auto mode and banter (development 0.10.0)](auto-mode-and-banter.md)
- [Evidence and live acceptance gates](acceptance-gates.md)
