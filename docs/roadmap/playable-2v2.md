---
type: Roadmap
title: "Priority milestone: playable 2v2"
description: "Cards for hands-off auto mode, banter, full turns, engagement, a curated roster and a release playtest."
status: draft
tags: [planning, auto-mode]
sources:
  - resource: ../superpowers/specs/2026-11-07-auto-mode-and-banter-design.md
  - resource: ../superpowers/plans/2026-11-07-auto-mode-and-banter.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
---
# Priority milestone: playable 2v2

Part of the [NPC mechanics and tactical behavior roadmap](../roadmap.md).

The owner set this priority on November 7, 2026: a match that is playable at the
table as two humans against two AI-controlled NPCs, or one human plus one AI
teammate (a friendly-disposition NPC) against two AI NPCs. This milestone comes
before whole-roster acceptance. It does not relax any anti-goal or shared safety
contract, and it reuses the [Phase 1 cards](phase-1-mechanics.md) where they overlap rather than
replacing them. The [auto mode and banter design](../superpowers/specs/2026-11-07-auto-mode-and-banter-design.md)
covers the first two cards. Dashboard line ID: `playable-2v2`.

## play-auto-mode: Hands-off NPC turns with a shared turn banner

Status: active; 0.10.0 source implemented on branch claude/auto-mode-banter, live acceptance open.
Auto-roll is blocked and removed from 0.10.0: Lancer 3.1.3's damage HUD is not exposed to modules, so humans click Lancer's roll, damage and apply windows. A possible later approach is pressing the HUD's own submit control, which needs an owner-authorized disposable-world pass.

Acceptance: an off-by-default GM setting plans and executes NPC turns without the
review dialog, using the existing legality, stale-board and replay guards. Any
refusal, missing input or changed board falls back to GM review or a held turn,
never a guess. Rolls stay in Lancer's native windows, clicked by a human (auto-roll is deferred). Auto mode
ends only its own NPC's turn, after observed applied damage or a resolved miss,
with an "End turn" control; it never activates the next combatant. In model
mode, a relay failure or a 30-second silence plays the top-scoring safe option, and
a warm-up request with a notification readies the local model when the module
loads. Every client sees the agreed angled banner with
the round token/pilot portrait, a continuous ~1.8 s sweep while thinking, a brief
acting summary, and red/green side colours. Pure state-machine tests plus a
disposable-world pass with one hostile and one friendly NPC.

## play-banter: Situational in-character lines before and after resolution

Status: active; 0.10.0 source implemented on branch claude/auto-mode-banter, live acceptance open.
Depends on reading native attack outcomes (new, read-only).

Acceptance: an off-by-default toggle produces up to two lines per NPC turn — an
intent line before the roll that never claims an outcome, and a reaction line
written only from the outcome Lancer recorded (none when ambiguous). Repeats and
near-repeats are suppressed. Lines appear as a speech banner with the speaker's
portrait and as an in-character chat message. Intent generation can delay execution by up to 4 s and a failure drops the line; reaction generation
never delays turn completion. The local model is the default; paid providers
need explicit selection. The key stays relay-side.

## play-full-turns: Complete NPC turns

Status: planned. Same scope as `mechanics-sequences` (Chunk 3), prioritized.

Acceptance: plan and execute move plus two quick actions or one full action as a
confirmed ordered sequence, advancing dependent steps only from confirmed native
results, under the `mechanics-sequences` acceptance criteria.

## play-engagement: Engaged NPCs can still act

Status: planned. Draws on `mechanics-legality`.

Acceptance: an NPC that starts its turn engaged can choose Disengage, fight where
it stands, or move under the engagement rules, instead of requiring manual
movement. Hostile and friendly NPCs are both covered by tests.

## play-roster: A small curated encounter roster

Status: planned. A subset of `tactics-roster`.

Acceptance: the T1 Cataphract plus two or three contrasting classes whose kits are
mostly supported ordinary weapons play their full T1 kit, with every unsupported
feature still named in warnings. Friendly-disposition use of each is tested.

## play-release: Publish and playtest

Status: planned. Depends on the cards above.

Acceptance: a version is published through the existing release workflow with the
owner's push authorization, installed in a disposable copy of the campaign world,
and a full 2v2 match is played in both configurations. Findings are recorded as
evidence; the original campaign world is not mutated without explicit authority.
