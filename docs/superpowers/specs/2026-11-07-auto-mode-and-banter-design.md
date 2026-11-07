---
type: Design
title: Auto mode and NPC banter
description: Hands-off NPC turns with a shared turn banner, and situational in-character lines before and after native resolution, for 2v2 table play.
status: draft
tags: [foundry, auto-mode, banter, playable-2v2]
sources:
  - id: design
    resource: ../../design.md
  - id: roadmap
    resource: ../../roadmap.md
  - id: adapter-guide
    resource: ../../foundry-adapter.md
  - id: pilot-entry
    resource: ../../../foundry-module/scripts/pilot.mjs
  - id: reply-parser
    resource: ../../../foundry-module/scripts/core/reply.mjs
  - id: relay
    resource: ../../../relay/server.mjs
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-07T12:00:00.000Z
---
# Auto mode and NPC banter

Implementation status (development 0.10.0): source implemented on branch
`claude/auto-mode-banter`; live acceptance is open. Auto-roll described below is
deferred and was removed from 0.10.0 because Lancer 3.1.3's damage HUD is not
exposed to modules; humans click Lancer's roll, damage and apply windows.

Roadmap line: `playable-2v2` (cards `play-auto-mode` and `play-banter`). Agreed with
the owner in chat on 2026-11-07, using browser mockups. Decisions the owner made are
stated plainly. Decisions marked *(builder's call)* or *(Claude's call)* are open to
revision.

## Intent and why

The owner wants to play a LANCER match in Foundry as a 2v2: two humans against two
AI-controlled NPC mechs, or one human plus one AI teammate (an NPC with friendly
disposition) against two AI NPCs. Today every NPC turn stops for GM approval. Auto
mode lets those turns run without anyone approving them. Banter makes the AI mechs
feel like characters: teammates call out plans and warnings, and enemies taunt or beg.

Success: a 2v2 evening where the AI sides take their turns unprompted, everyone at the
table can see whose turn it is and what the AI did, and the AI mechs talk in a way
that fits what is actually happening on the board.

## Anti-goals (unchanged from the project design, and binding here)

- The AI never rolls, fabricates or narrates an outcome Foundry did not produce.
  Banter before a roll may express intent or hope ("Hang on, Cicada, I got him!")
  but must not claim a hit, damage or kill as fact.
- Nothing executes without GM approval unless auto mode is on. Auto mode is off by
  default.
- The API key never reaches the browser, world data, chat or the repository.
- Illegal actions never reach execution. Auto mode uses exactly the same legality,
  stale-board and replay guards as approved execution.
- Do not interfere with the NHP Uplink module.

## Part 1 — Auto mode

### Behavior

- A world-scope GM setting, **off by default**. When on, NPC turns are planned and
  executed without the review dialog. *(Claude's call: one world toggle plus a
  per-actor opt-out flag, so the GM can keep a boss NPC on manual approval.)*
- Auto mode needs `executionEnabled` and `promptOnTurn` behavior. Turning auto mode
  on doesn't silently turn those on: the settings UI states the dependency and the
  turn-start hook treats auto mode as implying the turn prompt. *(builder's call on
  exact wiring)*
- It works with both decision modes. Policy mode needs no relay. **Model-mode
  fallback (owner decision):** in auto mode, if the relay is unreachable, returns an
  error, returns an unusable reply, or has not answered within **30 seconds**, the
  turn plays the highest-scoring safe option from the same legal option list without
  the model. This is new behaviour: today `requestDecision` throws on relay errors
  and waits up to 125 s. GM-approved (non-auto) play keeps today's behaviour. The
  banner and GM console say when a fallback was used.
- **Model warm-up (owner decision).** A local model can take a long time to load
  into memory. When the module loads on the GM client and model mode or banter is
  enabled, Pilot sends one small warm-up request through the relay to the
  configured provider, and shows a notification when the model has answered
  ("NPC Pilot: model warmed up") or that warm-up failed. Warm-up never sends board
  data and never blocks play. *(builder's call: a relay `/v1/warmup` route or a
  minimal `/v1/decide`-style request; it must not call a paid provider unless that
  provider is explicitly selected.)*
- **Safe fallback.** If planning yields no executable option, the board changes
  mid-turn, a guard refuses execution, or the option needs human input (manual
  feature, missing native geometry), auto mode does not guess. It opens the normal
  GM review dialog for that turn and posts a GM-whispered chat note saying why the
  turn is held. The turn does not end until a human resolves it. (Planning only
  happens on an active GM client, so "no GM connected" cannot occur.)
- **Who clicks the dice (owner decision).** Default: auto mode starts Lancer's own
  attack flow, as approved execution does today, and a human clicks through the
  roll windows (roll to hit, roll damage, apply damage) on the GM's screen. An
  additional, separate off-by-default GM option, **auto-roll**, has Pilot press
  Lancer's own roll and apply buttons for AI attacks. Dice are still rolled by
  Foundry and results are never chosen, edited or predicted; Pilot only presses the
  native controls. With auto-roll off, Pilot never applies damage.
- **Turn ending (owner decision).** Lancer has no fixed turn order: a turn starts
  only when someone activates a combatant, and ending a turn leaves the next pick to
  the table. Auto mode **only ends its own NPC's turn**; it never activates the next
  combatant, player or NPC. A turn is over when the executed plan finished and the
  native attack flow reached **applied damage** (or a resolved miss, or there was
  no attack). The thinking/acting banner offers an **"End turn anyway"** button
  for the GM in case damage is never applied or the flow stalls. A cancelled flow
  holds the turn for the GM. *(builder's call on detecting flow completion; it must
  use observed native state, not timing alone.)* Activating the next AI combatant
  automatically is a later card, not this one.
- Only the responsible active GM client plans and executes, as today. Every other
  client only displays.
- Existing scope limit stays: one approved option per native NPC turn. Full turns
  (second quick action, full actions) are the separate `play-full-turns` card.

### The turn banner (owner-chosen design)

Shown on **every connected client** (players and GM), driven by the planning GM
client. *(builder's call on transport: a module socket or a flagged chat message;
module.json must declare `socket: true` if sockets are used.)*

- **Shape:** angled, skewed banner across the top-centre of the board, mockup
  option A. Gold accent stripe on the left edge. Uppercase title, small subtitle.
- **Portrait:** the pilot portrait if the NPC has one, otherwise the token image,
  shown as a round portrait with a gold ring **in front of** the banner's left end.
  It must stay circular — never stretched by the banner's width or wrapped text.
- **Thinking state:** "NPC NAME · CLASS is thinking…", subtitle "Hostile/Friendly ·
  Round N". A bright band sweeps left to right continuously, **~1.8 s per pass**,
  until the decision is made.
- **Acting state:** sweep stops, banner turns solid and briefly states what the mech
  is doing, e.g. "Moves 4 · Ram Cannon → Cicada", then fades out. *(Claude's call:
  ~3 s visible; the owner accepted this behavior.)*
- **Colours by side:** hostile red (#8f1414 base, warm sweep); friendly green
  (#1b5e35 base, green sweep). Neutral is not used; the planner already refuses
  neutral-disposition NPCs.
- Must not block clicks on the board beyond its own footprint, and must clear on
  turn change, combat end, scene change and on the held/fallback path.

Reference mockups (not tracked): `.superpowers/brainstorm/*/content/auto-banner-v3.html`
and `banter-banner-v2.html`. These are mockups, not evidence of implementation.

## Part 2 — Banter

### Behavior

- A world-scope GM toggle, off by default. Works with or without auto mode. *(Claude's
  call: banter also works in GM-approved play.)*
- **Up to two lines per NPC turn:**
  1. **Before the roll (intent):** what the mech says as it acts, based on the
     situation it can see and what it is about to do. May express hope or belief,
     never a result.
  2. **After resolution (reaction):** written only from the outcome Lancer actually
     recorded — hit or miss, damage dealt, whether the target was destroyed, the
     speaker's own state. Examples: "Damn, I missed!", "Sorry, I tried…", "Scratch
     one!", an enemy begging at low HP.
- **Skip rules:** a line is skipped if it repeats or closely resembles something that
  speaker said recently. *(Claude's call: also skip the after-roll line when the
  result was unremarkable, so not every attack gets a comment; and skip it entirely
  if the outcome cannot be read unambiguously, e.g. a cancelled roll.)*
- **Context the line is built from:** the speaker's name, class, side and persona;
  nearby allies and enemies by name with rough distance and condition (HP/structure
  bands, not exact secrets the table can't see *(builder's call on what counts as
  visible)*); the chosen action and target; for the reaction, the recorded outcome.
  Teammates can address player characters by name ("Look out, Cicada!") and
  coordinate ("I'll take the one on the left").
- **Where it appears (owner-chosen):**
  - A **speech banner** in the same angled style with the speaker's round portrait
    in front; dark body edged in the side colour; the line in quotes.
  - The **chat log**, posted as that token speaking (in-character, with its name and
    portrait), like a player's IC message. *(Claude's call: no "AI" label.)* The GM
    can delete lines like any chat message.
- **Never blocks play.** Banter generation runs alongside or after the action. If the
  model is slow, errors or is offline, that line is dropped silently (GM console
  only) and the turn carries on. The tactical decision never waits on banter.

### Model and cost

- Banter has **its own provider and model settings**, separate from the decision
  provider, defaulting to the local OpenAI-compatible model through the relay
  (currently gpt-oss:20b on Ollama), which costs nothing per line. Choosing Claude
  for decisions does not make banter use Claude; the Anthropic provider for banter
  spends API money per line and must be selected explicitly in the banter setting.
  The relay therefore accepts a per-request provider for banter. *(Claude's call.)*
- **Policy-mode timing.** The before-roll line in policy mode needs its own call.
  Execution waits for it at most ~4 s; if it isn't ready by then, the line is
  dropped and the action proceeds. *(Claude's call.)*
- Requests go through the relay as today; the key stays relay-side. A new relay route
  (e.g. `/v1/banter`) or a mode on `/v1/decide` is the builder's call. Output is
  plain text, length-capped and HTML-escaped before posting, as the existing `line`
  field already is.
- The existing model-mode `line` field (posted today as "intent — before
  resolution") becomes the before-roll banter when banter is on, so model mode
  doesn't make a second call for it. Policy mode needs its own banter call because it
  doesn't use a model to decide.

### Reading the outcome (new capability)

Today Pilot hands attacks to Lancer and never reads the result. The after-roll line
needs Pilot to observe the native outcome — attack result chat cards and resulting
actor HP/structure/destroyed state — for the attack it started, correlated to that
flow. This is read-only: Pilot records what Lancer resolved and never changes it. If
correlation is ambiguous, no reaction line is produced. The same observation tells
auto mode that the flow reached applied damage or a resolved miss. Reaction lines
cover weapon attacks in this card; Cataphract Trample/Impale outcomes may be added
where their existing native-result capture already provides them. *(Claude's call.)*

## Non-goals

- Controlling player characters' mechs.
- Auto-rolling dice or auto-applying damage.
- Voice/TTS.
- Banter between turns, during reactions, or as free-running conversation.
- Full turns, Disengage, and roster expansion; those are separate playable-2v2 cards.
- Choosing or activating the next combatant (a later scheduler card).
- Routing NPC roll windows to a player's browser.

## Left to the builder

Socket vs chat-flag transport; banner DOM/CSS placement in Foundry's UI layer;
similarity measure for repeat suppression; prompt wording; flow-completion detection;
exact setting names; how the HP/visibility bands are drawn. Tests must stay
`node --test`, with the pure parts (banter context building, repeat suppression,
outcome classification, auto-mode decision/fallback state machine) testable on JSON
fixtures. Live Foundry behavior is unverified until a disposable-world pass.
