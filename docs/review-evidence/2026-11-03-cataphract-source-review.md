---
type: Reference
title: T1 Cataphract special-mechanic source review
description: Exact installed sources, native flow boundaries and approved table rulings for the second Cataphract milestone.
status: draft
tags: [foundry, testing, npc-coverage]
sources:
  - resource: ../../foundry-module/scripts/rules/npc-mechanics.mjs
  - resource: ../../foundry-module/scripts/adapter/snapshot.mjs
  - resource: ../../foundry-module/scripts/adapter/executor.mjs
  - resource: ../superpowers/specs/2026-11-03-npc-policy-contract-design.md
  - resource: 2026-11-03-policy-acceptance.md
generated:
  by: codex/unrecorded
  at: 2026-11-03T21:12:39Z
---
# T1 Cataphract special-mechanic source review

Scope: source diagnosis for milestone 2 in the retained `tactical-roadmap`
worktree, at `9b0a5df785cff11c009dae71e583f88a30e7bf16`, development 0.8.0.
This source diagnosis is not native execution acceptance. Owner rulings and
later implementation checks are attributed separately below.
Step 1's uncommitted documentation and image remain preserved.

## Method and recoverable sources

Read the installed Lancer 3.1.3 NPC item pack through a disposable filesystem
copy using Foundry's installed ClassicLevel reader. The original database was
never opened. Hashes of every original pack file matched before and after;
the temporary database was closed and its verified temporary path removed.
The three raw records remain private in ignored
`dist/cataphract-source.local.json`. The reproducible reader is
`dist/research-cataphract.local.cjs`; it also extracts selected native TypeScript
sources from installed source maps into ignored `.local.txt` files. This is a
best-effort pack copy, not a stopped-world atomic snapshot. Independent
fingerprint comparison binds each reviewed record to the frozen catalogue.

| Feature | Frozen source fingerprint | Scoped rule reading |
|---|---|---|
| Trample | `b5100a5c0a43b3cf50887929409ad816c18ef58437733591404fa3f635846088` | Ignores engagement; crosses other characters without ending overlapped. T1 transit damage is 2 kinetic. The owner approved per-character once-per-turn accounting below. Passage does not grant reaction immunity or ignore walls. |
| Impale | `cf7794eeac1852a42a611efde0a72dee18f3b22b3c54853d27d4a4e17381af42` | Full action, Recharge 6, straight movement up to eight spaces. A passed-through or endpoint-adjacent character makes a Hull save with one difficulty; failure grapples and carries the target. Timing relative to crossing and target placement require a reviewed continuation. |
| Point-Defense Shield | `4bae80a12ea5bbb57a330ca3ca81892390be49bff3b33a37fee91d9f889c0a2c` | Resistance against the uniquely closest hostile character; a nearest-distance tie disables this benefit. No static resistance against every attacker follows. |

Current readiness fields are observations, not part of rule identity. In this
pack copy, Impale is not charged; that does not authorize recharging an actor.
Only T1 base-class behavior is requested; matching shared T2/T3 text does not
grant implementation coverage for those tiers.

## Native boundaries

Installed `lancer-actor-DUbnXjU1.mjs.map` contains the following relevant sources:

| Entry | SHA-256 of recovered TypeScript | Boundary |
|---|---|---|
| `flows/flow.ts` | `7915d0b47b82935f1006ec27d85f01d827c5f266205c4dc8382721129c965a1c` | Awaited `begin()` reports cancellation/completion; instance state holds observed results. Shared flow steps must remain unchanged. |
| `flows/system.ts` | `07cc011b1d89a8b66801c7a3695ea30a754e0d2a177b1f6a197fdd523d2eb318` | System use checks resources and prints an effect card. Save targeting, rolling and forced-save result data remain explicit native TODOs. Card completion cannot establish a failed save or grapple. |
| `flows/damage.ts` | `92c52184ffb6491c03133617ba776eeddd7a30ecc3db0606b01a64263ddccc3e` | Damage HUD's Half Damage halves rolled amounts before armor. Native damage application with multiplier 0.5 instead requests resistance in `actor.damageCalc`. These operations are not interchangeable. |

`flows/stat.ts` provides `StatRollFlow`, native Hull initialization, a
cancellable HASE HUD and a native evaluated roll in `state.data.result.roll`.
It does not decide save success against the source NPC's save target or apply
grapple/forced movement. Those responsibilities need explicit adaptation and
verified receipts; no dedicated `SaveRollFlow` was found in the inspected maps.

`actor.damageCalc` already handles native armor, existing typed resistance,
Shredded, Paracausal, overshield, heat and HP updates. Shield integration must
preserve this ordering and avoid repeated halving. Applying the shield by
checking the damage HUD's Half Damage box would be incorrect when armor matters.
The exact final integration and live interactions are not verified by reading it.

## Required architecture changes

`adapter/snapshot.mjs` currently inserts engagement stops into the same
`blockedAnchorMoves` and single-cell `blockedMoves` lists as wall collisions.
Trample cannot safely remove those lists wholesale: doing so would erase actual
wall restrictions. Separate engagement from immutable collision evidence and
test both constraints on the same edge before enabling passage.

`core/reach.mjs` rejects hostile/neutral occupied transit cells, and the current
executor only accepts ordinary actions and a single movement/attack handoff.
Enabling a policy capability alone cannot implement Trample or Impale. Passage
requires an explicitly reviewed movement context; damage, saved continuation
and target relocation require session accounting and revalidation.

The current stale execution guard includes all target positions, effects and
HP. New execution must permit only the exact mutations confirmed by its own
native step receipts. Broadly deleting target fields from the guard would hide
external movement or damage and is not an acceptable continuation mechanism.

Shield policy utility requires a complete hostile population and known useful
incoming protection. Unique proximity alone must not invent threat knowledge.
Distance facts can become known while usefulness remains unknown.

## Owner's approved rulings

Two questions were sent to the owner before implementation:

1. Impale: pause on first contact (or the adjacent endpoint), resolve the native
   Hull save, and only then grapple/carry on failure along the remaining
   approved route. The owner explicitly approved this timing ruling in chat
   on November 3, 2026; it is a table ruling, not a claim that the source text
   independently specifies the sequence.
2. Trample: the owner approved once per crossed character per Cataphract turn,
   shared across separate movement segments. The local-book review below does
   not claim that this interpretation is explicitly printed.
3. Pilot owns the full standalone grapple lifecycle. No required Lancer
   Automations dependency or private grapple-establishment API is used.

The second-milestone plan names the tests and files needed after those rulings.
No source registry, actor, world, deployment or executable behavior changed
during this diagnosis. Broad mechanics acceptance and human tactical review
remain open.

## Direct book follow-up

At the owner's request, read the PDFs under the GM Hub's local
`Reference/books` directory using the bundled `pypdf` reader. Rendered and
visually inspected Core Book PDF page 297 to verify the printed Trample clause,
then checked the frequency notation on p.60 and action-resolution guidance on
p.68. Searched the full Core Book and Long Rim for Trample and relevant
frequency/per-target wording. This is targeted rules research, not a review of
all rules in either book.

| Local book | SHA-256 | Scoped findings |
|---|---|---|
| Lancer - Core Book.pdf | `9d6d23d63cf61efc9783a16d65409933e266a45b659cd2d941af694334a2f28b` | 432 PDF pages. Printed p.297 matches the installed feature's `1/turn` wording; p.60 defines `1/turn` as once per turn. Neither clause explicitly says per target or defines one selected damaging movement. Page 68 leaves remaining timing clarity to GM adjudication. |
| Lancer - The Long Rim.pdf | `f289c3ff34e7631e4ffe9e3e9a879d3246fd3c99300205242c4997899634753d` | Full extracted-text search found no Trample entry/clarification. |

Per-crossed-character damage once per turn is the owner's approved interpretation,
not a source-established clarification. The once-per-turn limit does not limit the
separately stated engagement/passage permission, and it is not a once-per-round
limit. Out-of-turn movement trigger semantics are not resolved by this review.
The public community-maintained Lancer FAQ was also searched; it contains no
Trample/Cataphract clarification. No authoritative designer clarification was
located in the bounded supplementary search.

Further targeted Core Book checks: p.67 distinguishes Heat from damage;
p.69 supplies grapple restrictions, mirrored movement, release and Hull
contests. Page 13 explicitly awards a tied contested check to its initiator.
Production opposed-check handlers know that initiator; they do not invent a
winner or request a new table ruling for this printed rule.

The implementation and its separate verification scope are recorded in
[0.9.0 implementation checks](2026-11-03-cataphract-implementation.md).

Recoverable private evidence: `dist/check-trample-book.local.py`,
`dist/trample-book-research.local.json`, `dist/core-book-page-60.local.txt`,
`dist/core-book-page-68.local.txt`, `dist/core-book-page-297.local.txt`, and
`dist/cataphract-book-page-297.local.png`. Raw extracts and page imagery remain
ignored rather than tracked licensed content. Default Python lacked PDF
packages; the bundled Python with `pypdf` and `pypdfium2` completed extraction
and rendering without installing dependencies. A first attempted `fitz` import
also lacked that optional library; this was a tooling setup issue, not a book
or product failure.
