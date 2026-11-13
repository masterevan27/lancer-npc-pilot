---
type: Runbook
title: "Auto mode and banter (development 0.10.0)"
description: "Auto mode and banter settings, model fallback, warm-up, turn end, outcome attribution, banner and banter filters."
status: draft
tags: [foundry, auto-mode]
sources:
  - resource: ../../foundry-module/scripts/core/auto-mode.mjs
  - resource: ../../foundry-module/scripts/adapter/auto-wiring.mjs
  - resource: ../../foundry-module/scripts/adapter/turn-runner.mjs
  - resource: ../../foundry-module/scripts/core/outcome.mjs
  - resource: ../../foundry-module/scripts/adapter/outcome-observer.mjs
  - resource: ../../foundry-module/scripts/core/banner.mjs
  - resource: ../../foundry-module/scripts/adapter/banner.mjs
  - resource: ../../foundry-module/scripts/core/banter.mjs
  - resource: ../../foundry-module/scripts/adapter/banter.mjs
  - resource: ../../foundry-module/scripts/adapter/warmup.mjs
  - resource: ../superpowers/specs/2026-11-07-auto-mode-and-banter-design.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Auto mode and banter (development 0.10.0)

Part of the [Foundry adapter guide](../foundry-adapter.md).

<!-- doc-media TODO: purpose: show the shared turn banner (thinking sweep, acting summary, speech line) so a reader knows what players see. Capture acceptance: a real Foundry banner on a disposable world, sanitized, with source, date, revision and method recorded. Blocker: no live run yet. -->

Everything on this page is **unverified in live Foundry**. The source has pure
and adapter tests only; no disposable-world pass has been run.

Settings:

- **Auto mode** (`autoMode`): hostile and friendly NPC turns plan and execute
  when they start, without the review dialog. It needs token execution enabled
  and the responsible GM client. The GM can opt one NPC out with
  `api.setAutoOptOut(actor, true)` (actor flag `autoOptOut`). Existing legality,
  stale-board and replay guards still apply; any refusal or changed board falls
  back to GM review or a held turn.
- **NPC banter** (`banterEnabled`): see below.
- **Banter provider** (`banterProvider`, client): local / OpenAI compatible
  (default) or the paid Anthropic API, which needs explicit selection.
- **Banter model override** (`banterModel`, client): blank uses the relay's model.

What is automated: planning and executing the NPC's move and attack through the
existing native flows, the shared banner, reading the recorded outcome, and
ending that NPC's own turn. What is not: rolls, damage and apply. Humans click
Lancer's roll, damage and apply windows. Auto-roll is a blocked follow-up and is
not in this release: Lancer 3.1.3's damage HUD is not exposed to modules, so
pressing it would make Pilot compute damage inputs itself, which breaks the
anti-goals. A possible later approach is pressing the HUD's own submit control,
which needs an owner-authorized disposable-world pass.

Model fallback: in model mode, a relay failure or 30 seconds of silence plays the
top-scoring safe option with the reason "Model unavailable". The 30 seconds are one budget for the whole plan, retry included. It never guesses.

Warm-up: when the module loads, a tiny fixed prompt (no board data) is sent to
each configured **local** (OpenAI compatible) model so it is loaded before the
first turn. Paid providers are never warmed. One notification reports success
("model warmed up") or a warning that the first AI turn may be slow.

Turn end: after the outcome is observed (applied damage or a resolved miss),
auto mode ends only its own NPC's turn with `game.combat.nextTurn()`. It never
activates the next combatant for anything else. While the attack awaits
resolution the banner shows "is waiting for Lancer" with an **End turn** button
(it appears 3 s after the acting summary, even while Lancer's attack window is
still open and the hand-off has not returned), and the thinking and held banners
carry it too. It lets the GM end that turn manually.

Outcome attribution: Pilot only reads what Lancer recorded and never infers a
result from absence.

- A matching attack card resolves only when it has an explicit true or false `hit`
  for every expected target. A card with an empty or filtered target list, a
  missing or non-boolean `hit`, or a second card for the same attack is
  **ambiguous**: the turn is held for the GM (whispered, held banner with
  **End turn**). Lancer emits empty hit results when automated attack resolution
  is disabled, so that case holds.
- Damage needs two steps. After the matching attack card, a damage card
  (chat flag `lancer.damageData`) spoken by the same attacking actor must list the
  target in `targetDamageResults`. Only HP or structure decreases on that target
  after the damage card count as applied. A decrease before the card is ignored;
  a damage card with no decrease afterwards (for example armor absorbed it) keeps
  the turn waiting, and a second damage card for the same attack is ambiguous.
  Residual limitation: an unrelated manual HP edit made on a target after its
  damage card could still be counted as that attack's damage.

Banner: every connected client sees an angled banner, broadcast over the module
socket, with the token or pilot portrait, red or green side colours, a continuous
sweep (about 1.8 s) while the NPC is thinking, and a brief acting summary that
fades after about 3 s.

Banter: with the toggle on, an NPC speaks up to two lines per turn: an intent line
before the roll, which never claims a result, and a reaction line written only
from the outcome Lancer recorded (none when ambiguous). Repeats are suppressed.
Lines show as a speech banner and as in-character chat. Failure drops the line;
the intent line is awaited before execution, so it can delay the attack by up to
4 s (a failed or slow line is dropped and the turn proceeds); reaction generation
never delays turn completion.

Banter in GM-approved play: with banter on, pressing **Execute** in the review
dialog also speaks the intent line before the hand-off (the model's own line when
the GM picked its choice, otherwise a fresh one) and, for an attack, a reaction
line when the observed outcome is a resolved miss or applied damage. Nothing
advances the turn in approved play. A turn change or cancel disposes the observer
and silences any pending line; with banter off, approved play is unchanged.

Banter is checked by rule-based filters, not by understanding. Intent lines are
dropped when they state damage, a hit, a kill or a miss as having happened
(including "took six damage", "that shot hit Cicada", "is down"). Reaction lines
are dropped when they contradict the recorded outcome: a hit, damage or kill after
a miss, a kill when nothing was destroyed, or damage when every hit took none.
Unusual phrasings can still slip through. Tokens with the Lancer Hidden status or
hidden by the GM are never mentioned. A late reply after a cancel publishes
neither chat nor banner.

A cancelled Lancer attack HUD: when Lancer's flow `begin()` reports exactly
`false`, the executor returns `attack-cancelled` and the turn is held (whisper and
held banner with **End turn**) instead of waiting. Any other result is treated as
a normal hand-off, and a HUD closed without a `false` result still leaves the
turn waiting for the GM's **End turn** on the waiting banner.

Acceptance still open: a disposable-world pass with one hostile and one friendly
NPC, covering banner visibility on a second client, fallback, warm-up and banter.

## Related

- [Module policy mode (development 0.8.0)](policy-mode.md)
- [What approval and execution do](approval-and-execution.md)
- [Evidence and live acceptance gates](acceptance-gates.md)
- [Priority milestone: playable 2v2](../roadmap/playable-2v2.md)
