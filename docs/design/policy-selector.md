---
type: Design
title: "Module policy selector design"
description: "How the relay-free policy selector binds, fingerprints, prunes and ranks choices, and its limits."
status: draft
tags: [architecture, policy]
sources:
  - resource: ../../foundry-module/scripts/core/policy.mjs
  - resource: ../superpowers/specs/2026-11-03-npc-policy-contract-design.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Module policy selector design

Part of the [Lancer NPC Pilot design](../design.md).

The [approved policy contract](../superpowers/specs/2026-11-03-npc-policy-contract-design.md)
now has a pure selector and opt-in client mode. Closed reviewed records bind
one native class LID to a T1 base Cataphract policy. Native feature sources are
captured before asynchronous SHA-256, checked against catalogue fingerprints,
and kept out of model requests. Identity/loadout ambiguity is unconfigured;
feature drift excludes the affected choices and reports partial coverage.

Supported legal candidates retain endpoint identities before policy pruning.
Ranking uses soft order, class weighted utility, bounded individual preference,
then existing basic score, followed by movement cost and canonical identity.
Hard orders never relax; missing mandatory native geometry requires input.
Production supplies a free order. Other structured orders are core interfaces
for injected inputs, with no objective editor yet. Development 0.9.0 adds scoped,
exact-source Cataphract Trample/Impale choices, standalone grapple lifecycle and
native Shield card application. Unsupported target interactions, useful incoming
protection, reactions and new live acceptance remain explicit gaps. See the
[mechanics scope](../foundry-adapter/cataphract-mechanics.md).
This is a bounded one-move/one-action search with one shortest path per
endpoint, not an optimal multi-turn planner.

Policy planning never requests a relay or a secret. Its review holds private
authoritative choices, re-reads board/configuration after hashing and before
approval, and refuses stale/no-choice/duplicate approval before execution.
[Selector evidence](../review-evidence/2026-11-03-policy-selector.md) separates
synthetic ranking tests, installed-code conformance and unverified live gates.

## Related

- [Lancer NPC Pilot design](../design.md)
- [Architecture: relay, pure core and adapter](architecture.md)
- [Module policy mode (development 0.8.0)](../foundry-adapter/policy-mode.md)
