# Auto mode and banter implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let NPC turns run hands-off with a shared turn banner, and let AI mechs speak situational lines before and after native resolution.

**Architecture:** Pure decision/state/text logic lives in `foundry-module/scripts/core/` and is tested on JSON fixtures. Thin adapters in `foundry-module/scripts/adapter/` observe Lancer chat cards and actor updates, broadcast banners over the module socket, and post chat. `pilot.mjs` wires settings and hooks. The relay needs no new route: banter and warm-up reuse `/v1/decide`, which already takes a per-request provider.

**Tech Stack:** Plain ES modules, no build step; Foundry v13 + Lancer 3.1.3; Node ≥ 20 built-ins; `node --test`.

**Spec:** [docs/superpowers/specs/2026-11-07-auto-mode-and-banter-design.md](../specs/2026-11-07-auto-mode-and-banter-design.md)

## Global Constraints

- Work in worktree `G:/GIT-REPOS/lancer-npc-pilot/.worktrees/auto-banter`, branch `claude/auto-mode-banter`, from `main` at `0dc6ec6`.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; match the repo's `area: sentence` subject style (`foundry: …`, `relay: …`, `docs: …`).
- Anti-goals are hard rules: Pilot never rolls, edits or predicts outcomes; nothing executes without GM approval unless auto mode is on; the API key never reaches the browser, world data, chat or repo; illegal options never reach execution; don't interfere with NHP Uplink.
- All new settings default **off** (`autoMode`, `autoRoll`, `banterEnabled`). Auto-roll is a separate setting from auto mode.
- Auto mode ends only its own NPC's turn; it never calls `activateCombatant` or starts any combatant's turn.
- Model fallback in auto mode: relay unreachable, HTTP error, unusable reply, or no answer within **30000 ms** → play the top-scoring option from the same list. GM-approved play keeps the existing 125 s timeout and throw.
- Banner thinking sweep: **1.8 s** per pass, continuous. Acting summary visible **3 s**, then fades. Hostile base `#8f1414`, friendly base `#1b5e35`, gold accent `#ffcc00`. Round portrait in front of the left end; must never stretch (`flex: none`, fixed width/height, `object-fit: cover`).
- Banter: up to two lines per NPC turn (intent, reaction). Policy-mode intent waits at most **4000 ms**. Lines ≤ `LINE_MAX_WORDS` (20) words, HTML-escaped. Banter provider/model settings are separate from decision provider; default provider `openai` (local).
- Warm-up notification copy: success `NPC Pilot: model warmed up.`; failure `NPC Pilot: model warm-up failed — the first AI turn may be slow.`
- Version: bump `VERSION`, `package.json`, `foundry-module/module.json` (and its `download` URL) to **0.10.0** together in the last task.
- Tests: `node --test` from the repo root must pass with zero failures. Live Foundry behavior is unverified until a disposable-world pass; don't claim it.

## Review Focus

1. **A human cancels the Lancer attack HUD during an auto turn** → turn is held for the GM (banner shows held state with "End turn anyway"), no reaction line, tracker not advanced. Test in Task 6.
2. **Combat turn changes while an auto turn is thinking or awaiting damage** (GM clicks another combatant) → planning is cancelled, observer disposed, banner cleared, nothing executes. Test in Task 6.
3. **Two attack cards from the same NPC in one turn, or a card from a different actor/item** → only the card whose `attackData.origin` and `attackerItemUuid` match the handed-off attack counts; a second matching card makes the outcome `ambiguous`. Test in Task 4.
4. **Damage applied to a target that was missed, or to a non-target** → ignored for completion; completion needs every hit target's applied damage. Test in Task 4.
5. **Banter model returns junk** (empty, JSON, markdown, a 200-word essay, HTML) → cleaned to plain text ≤ 20 words or dropped; never blocks the turn. Test in Task 8.

---

## File structure

| File | Responsibility |
|---|---|
| `foundry-module/scripts/core/auto-mode.mjs` (new) | Pure: should this turn run automatically; what to do with a planned review; turn lifecycle state machine. |
| `foundry-module/scripts/core/outcome.mjs` (new) | Pure: classify Lancer attack/damage cards and HP changes into a turn outcome. |
| `foundry-module/scripts/core/banner.mjs` (new) | Pure: banner view models (thinking/acting/speech/held). |
| `foundry-module/scripts/core/banter.mjs` (new) | Pure: banter context, prompt, line cleaning, repeat suppression, when to react. |
| `foundry-module/scripts/adapter/controller.mjs` | Add auto fallback and timeout. |
| `foundry-module/scripts/adapter/outcome-observer.mjs` (new) | Hooks `createChatMessage`/`updateActor`, feeds `core/outcome.mjs`. |
| `foundry-module/scripts/adapter/banner.mjs` (new) | Socket broadcast + DOM render of banners on every client. |
| `foundry-module/scripts/adapter/banter.mjs` (new) | Request lines through the relay, post IC chat, speech banner, recent-line memory. |
| `foundry-module/scripts/adapter/turn-runner.mjs` (new) | Runs one auto turn end-to-end using the above; ends the turn. |
| `foundry-module/scripts/adapter/auto-roll.mjs` (new) | Optional: drives Lancer's own HUD/damage/apply steps. |
| `foundry-module/scripts/adapter/warmup.mjs` (new) | One warm-up request + notification. |
| `foundry-module/scripts/pilot.mjs` | Settings, socket registration, hooks wiring. |
| `foundry-module/styles/pilot.css` | Banner styles. |
| `foundry-module/module.json` | `"socket": true`, version. |

---

### Task 1: Auto-mode decisions and turn lifecycle (pure)

**Files:**
- Create: `foundry-module/scripts/core/auto-mode.mjs`
- Test: `foundry-module/test/auto-mode.test.mjs`

**Interfaces:**
- Produces:
  - `shouldAutoRun({autoMode:boolean, executionEnabled:boolean, isResponsibleGM:boolean, actorOptOut:boolean, isNpc:boolean, side:'hostile'|'friendly'|'neutral'}) -> {auto:boolean, reason:string}`
  - `nextAutoStep(review, {canExecute:boolean, terrainReviewed:boolean}) -> {action:'execute', optionId:string} | {action:'review', why:string}`
  - `class TurnLifecycle` with `state` ∈ `'idle'|'thinking'|'acting'|'awaiting-resolution'|'done'|'held'|'cancelled'`, methods `start(turnKey)`, `decided()`, `handedOff({expectsAttack:boolean})`, `resolved()`, `hold(why)`, `cancel()`, `forceEnd()`; each returns the new state and throws `Error('Invalid turn transition: <from> -> <to>')` on an illegal move. `turnKey` is stored; `start` on a new key from any state resets.

- [ ] **Step 1: Write failing tests**

```js
test('auto runs only when every gate is open', () => {
  const ok = {autoMode:true,executionEnabled:true,isResponsibleGM:true,actorOptOut:false,isNpc:true,side:'hostile'};
  assert.equal(shouldAutoRun(ok).auto, true);
  assert.equal(shouldAutoRun({...ok,side:'friendly'}).auto, true);
  for (const k of ['autoMode','executionEnabled','isResponsibleGM','isNpc'])
    assert.equal(shouldAutoRun({...ok,[k]:false}).auto, false, k);
  assert.equal(shouldAutoRun({...ok,actorOptOut:true}).auto, false);
  assert.equal(shouldAutoRun({...ok,side:'neutral'}).auto, false);
});
test('nextAutoStep executes only a ready review with a chosen option', () => {
  const r = {state:'ready',options:[{id:'A'}],choice:{optionId:'A'}};
  assert.deepEqual(nextAutoStep(r,{canExecute:true,terrainReviewed:true}), {action:'execute',optionId:'A'});
  assert.equal(nextAutoStep({...r,state:'needs-input'},{canExecute:true,terrainReviewed:true}).action,'review');
  assert.equal(nextAutoStep({...r,choice:{optionId:null}},{canExecute:true,terrainReviewed:true}).action,'review');
  assert.equal(nextAutoStep({...r,options:[]},{canExecute:true,terrainReviewed:true}).action,'review');
  assert.equal(nextAutoStep(r,{canExecute:false,terrainReviewed:true}).action,'review');
  assert.equal(nextAutoStep(r,{canExecute:true,terrainReviewed:false}).action,'review');
});
test('lifecycle: attack turn waits for resolution; move-only turn finishes at hand-off', () => {
  const l = new TurnLifecycle();
  l.start('t1'); l.decided();
  assert.equal(l.handedOff({expectsAttack:true}), 'awaiting-resolution');
  assert.equal(l.resolved(), 'done');
  l.start('t2'); l.decided();
  assert.equal(l.handedOff({expectsAttack:false}), 'done');
  l.start('t3'); assert.throws(() => l.resolved(), /Invalid turn transition: thinking -> done/);
  l.start('t4'); l.decided(); l.handedOff({expectsAttack:true});
  assert.equal(l.hold('cancelled flow'), 'held'); assert.equal(l.forceEnd(), 'done');
  l.start('t5'); assert.equal(l.cancel(), 'cancelled');
});
```

- [ ] **Step 2:** `node --test foundry-module/test/auto-mode.test.mjs` → FAIL (module not found).
- [ ] **Step 3:** Implement the three exports in `core/auto-mode.mjs`. `nextAutoStep` requires `state ∈ {'ready','partial'}`, non-empty `options`, `choice.optionId` present in `options`. `why` strings are short GM-facing sentences.
- [ ] **Step 4:** Run the test → PASS.
- [ ] **Step 5:** Commit `foundry: add pure auto-mode decisions and turn lifecycle`.

---

### Task 2: Auto-mode model timeout and fallback

**Files:**
- Modify: `foundry-module/scripts/adapter/controller.mjs` (`plan()` and `requestDecision`)
- Test: `foundry-module/test/controller.test.mjs` (append)

**Interfaces:**
- Consumes: existing `PilotController`, `interpretReply`, `pickTop`.
- Produces: `controller.plan({auto=false}={})`. With `auto:true`, model mode passes `{signal, timeoutMs:30000}` to `request` and, on any non-cancel request error or after both attempts are unusable, returns a review whose `choice` is `{status:'fallback', source:'fallback', optionId:options[0].id, reason:'Model unavailable — top-scoring safe option.', line:'', error:<message>}`. `requestDecision(payload, settings, {fetchImpl, signal, timeoutMs})` — `timeoutMs` overrides `settings.timeoutMs`; default stays 125000. Cancellation (`epoch` change / abort) still throws `Planning was cancelled or superseded.` in both modes.

- [ ] **Step 1: Write failing tests**

```js
test('auto planning falls back to the top option when the relay fails', async () => {
  const { controller } = setup(async () => { throw Error('Cannot reach the relay.'); });
  const review = await controller.plan({ auto: true });
  assert.equal(review.choice.source, 'fallback');
  assert.equal(review.choice.optionId, review.options[0].id);
  assert.match(review.choice.error, /Cannot reach/);
});
test('auto planning passes a 30 s timeout; approved planning keeps throwing', async () => {
  let seen; const { controller } = setup(async (_p, o) => { seen = o.timeoutMs; throw Error('Model request timed out.'); });
  await controller.plan({ auto: true }); assert.equal(seen, 30000);
  await assert.rejects(setup(async () => { throw Error('Model request timed out.'); }).controller.plan(), /timed out/);
});
test('requestDecision honours an explicit timeoutMs', async () => {
  let aborted = false;
  const fetchImpl = (_u, init) => new Promise((_, rej) => init.signal.addEventListener('abort', () => { aborted = true; rej(Error('abort')); }));
  await assert.rejects(requestDecision({messages:[{role:'user',content:'x'}]},
    {relayUrl:'http://127.0.0.1:5090',secret:'s',provider:'openai'}, {fetchImpl, timeoutMs: 20}), /timed out/);
  assert(aborted);
});
```

- [ ] **Step 2:** Run `node --test foundry-module/test/controller.test.mjs` → new tests FAIL.
- [ ] **Step 3:** Implement. Keep all existing behavior for `auto:false`.
- [ ] **Step 4:** Run → PASS, including all pre-existing controller and policy-controller tests.
- [ ] **Step 5:** Commit `foundry: fall back to the top safe option when auto planning loses the model`.

---

### Task 3: Banner view models, styles and socket broadcast

**Files:**
- Create: `foundry-module/scripts/core/banner.mjs`, `foundry-module/scripts/adapter/banner.mjs`
- Modify: `foundry-module/styles/pilot.css`, `foundry-module/module.json` (`"socket": true`)
- Test: `foundry-module/test/banner.test.mjs`

**Interfaces:**
- Produces (core): `bannerView({kind:'thinking'|'acting'|'speech'|'held', name, className, side, round, portrait, summary?, line?, why?}) -> {kind, side, title, subtitle, quote:string|null, portrait:string|null, showEndTurn:boolean, autoHideMs:number|null}`.
  - thinking: title `${name} · ${className} is thinking…`, subtitle `${Side} · Round ${round}`, autoHideMs null.
  - acting: title `${name} · ${className} acts`, subtitle = summary, autoHideMs 3000.
  - speech: title `${name}`, quote = line, autoHideMs 5000 *(builder's call within 4–6 s)*.
  - held: title `${name} · turn held`, subtitle = why, showEndTurn true, autoHideMs null.
  - `showEndTurn` is also true for `thinking` (the GM can end a stalled turn).
- `portraitFor(actor, token) -> string|null`: `actor.img` unless it is Foundry's default (`icons/svg/mystery-man.svg`) or a Lancer default `systems/lancer/assets/icons/*`, else `token.document.texture.src`, else null.
- Produces (adapter): `createBannerChannel({game, socketName:'module.lancer-npc-pilot', document, onEndTurn}) -> {show(view), clear(), dispose()}`. `show` emits `{type:'banner', view}` over `game.socket` and renders locally (Foundry doesn't echo socket messages to the sender). Every client registers a listener that renders. The End-turn button renders only when `game.user.isGM` and calls `onEndTurn()` on that client. Text is set with `textContent`; portrait via `img.src` (never innerHTML).
- CSS: classes `.npc-pilot-banner`, `.npc-pilot-banner--hostile|--friendly`, `--thinking` (sweep `@keyframes npc-pilot-sweep`, 1.8 s linear infinite), `--speech`, `.npc-pilot-banner__portrait` (round, gold ring, `flex:none`, 74 px, `object-fit:cover`, overlaps by −26 px). Banner container `pointer-events:none` except the button. Position: fixed, top-centre over the canvas.

- [ ] **Step 1: Write failing tests** for `bannerView` (exact titles/subtitles above, `autoHideMs` values, `showEndTurn` true for thinking/held only), `portraitFor` (default-image fallback to token, both missing → null), and the adapter with a fake socket + minimal fake DOM: `show` emits once and renders locally; text with `<b>` renders literally; non-GM render has no button.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement core, adapter and CSS; add `"socket": true` to `module.json`.
- [ ] **Step 4:** Run → PASS. Also run `node --test test/release.test.mjs` (manifest validity) → PASS or skipped as before.
- [ ] **Step 5:** Commit `foundry: add the shared NPC turn banner`.

---

### Task 4: Native outcome classification and observer

**Files:**
- Create: `foundry-module/scripts/core/outcome.mjs`, `foundry-module/scripts/adapter/outcome-observer.mjs`
- Test: `foundry-module/test/outcome.test.mjs`
- Fixtures: `foundry-module/test/fixtures/attack-card-hit.json`, `attack-card-miss.json`, `damage-card.json` (flag shapes below; hand-written, no Lancer source copied)

**Lancer 3.1.3 facts (read from the installed system, `lancer-actor-*.mjs`):** `printAttackCard` creates a chat message with flag `lancer.attackData = {origin:<actor id>, attackerUuid, attackerItemUuid, targets:[{id,uuid,total,hit,crit}]}`. `printDamageCard` creates one with flag `lancer.damageData = {damageResults, critDamageResults, targetDamageResults:[{target:<token uuid>, …}], ap, paracausal, half_damage}`, spoken by the attacking actor. The card's apply button calls `actor.damageCalc`, which updates the target actor's `system.hp.value` / `system.structure.value`.

**Interfaces:**
- Produces (core):
  - `matchAttackCard(flags, expect:{actorId, itemUuid}) -> null | {targets:[{tokenUuid, hit:boolean, crit:boolean}]}` — null unless `origin===actorId && attackerItemUuid===itemUuid`.
  - `class OutcomeTracker(expect:{actorId, itemUuid, targetTokenUuids:string[]})` with `onAttackCard(flags)`, `onHpChange({tokenUuid, before:{hp,structure}, after:{hp,structure}, destroyed:boolean})`, and getter `outcome -> {status:'pending'|'missed'|'applied'|'ambiguous', targets:[{tokenUuid, name, hit, crit, damage:number|null, maxHp:number, destroyed:boolean}]}`. `expect` also carries `targets:[{tokenUuid, name, maxHp}]` captured at hand-off so `name`/`maxHp` are known without re-reading.
  - Rules: a second matching attack card → `ambiguous`. All targets missed → `missed`. Each hit target needs a decreasing HP or structure change to count as applied; when every hit target has one → `applied`. HP changes before the attack card, or on non-hit/non-target tokens, are ignored. `damage` = HP lost plus 0 for structure-only bookkeeping *(builder may refine; must never be negative)*.
- Produces (adapter): `observeOutcome({Hooks, canvas, expect}) -> {tracker:OutcomeTracker, done:Promise<outcome>, dispose()}`. Registers `createChatMessage` (reads `message.getFlag('lancer','attackData')`) and `preUpdateActor`/`updateActor` (captures before/after HP and structure for actors of `targetTokenUuids`). `done` resolves on `missed`/`applied`/`ambiguous`; never on its own timer. `dispose()` removes all hooks (also called on turn change).

- [ ] **Step 1: Write failing tests**, including the Review Focus cases:

```js
test('only the handed-off attack card counts; a second one is ambiguous', () => {
  const t = new OutcomeTracker({actorId:'npc1', itemUuid:'Item.ram', targetTokenUuids:['Scene.s.Token.cicada']});
  t.onAttackCard({origin:'npc2', attackerItemUuid:'Item.ram', targets:[]});
  assert.equal(t.outcome.status, 'pending');
  t.onAttackCard(hitFixture); assert.equal(t.outcome.status, 'pending');
  t.onAttackCard(hitFixture); assert.equal(t.outcome.status, 'ambiguous');
});
test('a miss completes without damage; damage to misses or non-targets is ignored', () => { /* missFixture → 'missed'; onHpChange for a non-target → still 'missed' */ });
test('applied needs every hit target damaged; destroyed is reported', () => { /* two targets hit; one HP drop → pending; second (structure 1→0, destroyed:true) → applied, destroyed true */ });
test('HP changes before the attack card are ignored', () => { /* onHpChange first, then hit card → pending */ });
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement core then adapter (adapter tested with a fake `Hooks` that records `on`/`off`, asserting `dispose()` removes every registered hook).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `foundry: observe native attack outcomes for the turn Pilot started`.

---

### Task 5: Banter core (pure)

**Files:**
- Create: `foundry-module/scripts/core/banter.mjs`
- Test: `foundry-module/test/banter.test.mjs`

**Interfaces:**
- Produces:
  - `hpBand(hp:[current,max], structure:[current,max]) -> 'fresh'|'damaged'|'badly damaged'|'destroyed'` — destroyed when structure current 0 or defeated; badly damaged ≤ 25 % HP or structure below max; damaged < 75 %; else fresh.
  - `buildBanterContext(snapshot, {speakerTokenId, phase:'intent'|'reaction', option?, outcome?, persona?}) -> {speaker:{name, className, side, band}, allies:[{name, band, distance}], enemies:[{name, band, distance}], action:string|null, outcome:object|null, persona:string|null}` — uses `describeOption` from `core/prompt.mjs` for `action`; distances in grid cells via the existing grid helper; excludes hidden tokens the speaker's side can't see (tokens with `hidden:true`).
  - `buildBanterPrompt(context, recentLines:string[]) -> {system:string, messages:[{role:'user', content:string}]}` — instructs: one in-character line, ≤ 20 words, no quotes/markdown/stage directions; address others by name; for `intent` express intent or hope and **never state a hit, miss, damage or kill as having happened**; for `reaction` describe only the given outcome; avoid repeating recent lines (listed).
  - `cleanBanterLine(text) -> string|null` — strip code fences, surrounding quotes, leading `Name:`, asterisk stage directions, HTML tags; collapse whitespace; reject if empty, starts with `{`, or > 20 words after cleaning (truncate is not allowed — drop).
  - `claimsOutcome(line) -> boolean` — true for past-tense result claims, e.g. `/\b(direct hit|scratch one|you('| a)re (dead|done for|finished)|i (hit|missed|killed)|(he|she|they|it)('s| is) (dead|down|destroyed))\b/i`. Intent lines that claim an outcome are dropped.
  - `isRepeat(line, recent:string[]) -> boolean` — normalized (lowercase, punctuation stripped) word-set Jaccard ≥ 0.6 against any recent line, or exact match.
  - `shouldReact(outcome) -> boolean` — false for `pending`/`ambiguous`; true for `missed`; for `applied` true if any target destroyed, any crit, or the attacker hit but dealt 0 HP; otherwise true with the deterministic rule "damage ≥ 25 % of that target's max HP" *(Claude's call: skip unremarkable hits)*. Needs target max HP in `outcome.targets[].maxHp` (Task 4 tracker adds it from the actor).

- [ ] **Step 1: Write failing tests** for each export, including the Review Focus junk cases: `cleanBanterLine('```json\n{"line":"x"}\n```')` → null; `'"Look out, Cicada!"'` → `Look out, Cicada!`; `'Sentinel: <b>Hold</b> the line *revs engine*'` → `Hold the line`; a 30-word string → null; `''` → null. `claimsOutcome('Hang on Cicada, I got him!')` → false; `claimsOutcome('Scratch one!')` → true. `isRepeat('Look out, Cicada!', ['look out cicada'])` → true.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `foundry: add pure banter context, cleaning and repeat rules`.

---

### Task 6: Auto turn runner and End-turn control

**Files:**
- Create: `foundry-module/scripts/adapter/turn-runner.mjs`
- Test: `foundry-module/test/turn-runner.test.mjs`

**Interfaces:**
- Consumes: `shouldAutoRun`, `nextAutoStep`, `TurnLifecycle` (Task 1); `controller.plan({auto:true})`, `controller.approve` (Task 2); `bannerView`, banner channel `show/clear` (Task 3); `observeOutcome` (Task 4); banter hooks `speakIntent`, `speakReaction` (Task 7 — injected; default no-ops so this task is testable first).
- Produces: `createTurnRunner({controller, banner, observe, endTurn, whisperGM, openReview, speakIntent, speakReaction, readTurnInfo}) -> {run(turnKey):Promise<'done'|'held'|'cancelled'>, endTurnAnyway():Promise<void>, cancel():void}`.
  - `run`: lifecycle `start` → banner thinking → `plan({auto:true})` → `nextAutoStep`; on `review` → `hold(why)`, `whisperGM(why)`, banner held, `openReview(review)` (the existing dialog path), return `'held'`. On `execute` → `decided` → `speakIntent(review, option)` (awaited; it enforces its own 4 s cap) → banner acting (summary from `describeOption`, prefixed `Fallback · ` when `review.choice.source==='fallback'`, and the fallback `error` logged to the GM console) → start `observe` **before** `approve` → `approve(review, optionId)` → `handedOff({expectsAttack: option.action.kind==='attack'})`. Attack: await observer `done`; `missed`/`applied` → `speakReaction(outcome, speakerTokenId)` (not awaited) → `resolved` → `endTurn()`; `ambiguous` → hold. Non-attack → `endTurn()`. An `approve` error or a `false` flow result → hold with the error message.
  - `endTurn()` is injected; production calls `game.combat.nextTurn()` (Lancer 3.1.3 ends the current turn and leaves the next pick to the table). Never call `activateCombatant`.
  - `cancel()` (wired to turn/round change and `canvasTearDown`): `controller.cancel()`, dispose observer, `banner.clear()`, lifecycle `cancel`.
  - `endTurnAnyway()` (GM button): `forceEnd`, dispose observer, clear banner, `endTurn()`.

- [ ] **Step 1: Write failing tests** with fakes: happy attack path calls in order `plan → speakIntent → approve → (observer applied) → speakReaction → endTurn`; move-only path ends without observing; `needs-input` review → `'held'`, `whisperGM` called, `endTurn` not called; approve throws → held; observer `ambiguous` → held; **Review Focus 1:** flow resolves `false`/observer never completes and GM presses End turn → `endTurn` called once, banner cleared; **Review Focus 2:** `cancel()` during `plan` → `approve` never called, banner cleared, result `'cancelled'`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `foundry: run auto NPC turns through the existing guards and end only their own turn`.

---

### Task 7: Banter adapter (relay, chat, speech banner)

**Files:**
- Create: `foundry-module/scripts/adapter/banter.mjs`
- Executors are **not** modified: when banter is on, the caller passes `choice.line=''` so the executor's existing `postLine` posts nothing and banter owns the intent line (Task 8).
- Test: `foundry-module/test/banter-adapter.test.mjs`

**Interfaces:**
- Consumes: Task 5 exports; `requestDecision` (Task 2) with banter settings; banner channel (Task 3).
- Produces: `createBanter({request, postChat, banner, readSnapshot, settings:()=>({enabled, provider, model, relayUrl, secret}), log}) -> {speakIntent(review, option):Promise<void>, speakReaction(outcome, speakerTokenId):Promise<void>, recent:Map<actorId,string[]>}`.
  - Disabled → both are no-ops.
  - `speakIntent`: model mode with a non-empty `review.choice.line` → use it (no extra call). Otherwise request with `timeoutMs:4000`. Clean → drop if `claimsOutcome` or `isRepeat` (last 6 lines for that actor) → `postChat(line, token)` + `banner.show(bannerView({kind:'speech',…}))`.
  - `speakReaction`: only if `shouldReact(outcome)`; request with `timeoutMs:15000` *(Claude's call)*; same cleaning/repeat rules (no `claimsOutcome` filter).
  - Any error → `log('banter dropped: '+message)` (GM console only); never throws.
  - `postChat` production: `ChatMessage.create({speaker: ChatMessage.getSpeaker({token}), style: CONST.CHAT_MESSAGE_STYLES.IC, content: '<p>'+escapeHtml(line)+'</p>'})` — no flavor, no "AI" label.
  - Request body uses banter provider/model, `maxTokens: 120`, `temperature: 0.9`.

- [ ] **Step 1: Write failing tests:** disabled → no request; model-mode line reused without a request; policy-mode request gets `timeoutMs 4000` and banter provider (not decision provider); request rejecting → no throw, nothing posted; outcome-claiming intent dropped; repeat dropped; reaction skipped for an unremarkable hit; posted content is escaped.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `foundry: let NPCs speak situational lines before and after resolution`.

---

### Task 8: Warm-up, settings and wiring

**Files:**
- Create: `foundry-module/scripts/adapter/warmup.mjs`
- Modify: `foundry-module/scripts/pilot.mjs`
- Test: `foundry-module/test/warmup.test.mjs`, extend `foundry-module/test/ui.test.mjs` or `macro-entry.test.mjs` for settings registration

**Interfaces:**
- Produces: `warmUpModel({request, providers:Array<{provider, model}>, notifications}) -> Promise<boolean>` — `providers` holds the decision provider (if decision mode is `model`) and the banter provider (if banter is on), de-duplicated. Only `openai` (local) entries are warmed; `anthropic` is never warmed, so warm-up never spends money. Sends `{messages:[{role:'user',content:'Reply with OK.'}], maxTokens:1}` per entry with `timeoutMs:180000` *(Claude's call: generous for a cold load)*; no board data; returns false with no notification when there is nothing to warm or no secret is set. Success → `notifications.info('NPC Pilot: model warmed up.')`; failure → `notifications.warn('NPC Pilot: model warm-up failed — the first AI turn may be slow.')`.
- Settings to register (in `registerSettings`):
  - `autoMode` — world, Boolean, false, config true, name "Auto mode: run NPC turns without approval", hint stating it requires token execution and that the GM can opt an NPC out.
  - `autoRoll` — world, Boolean, false, config true, name "Auto-roll: press Lancer's roll and apply buttons for AI attacks".
  - `banterEnabled` — world, Boolean, false, config true, name "NPC banter".
  - `banterProvider` — client, String, `'openai'`, config true, choices `{openai:'Local / OpenAI compatible', anthropic:'Anthropic API (paid)'}`.
  - `banterModel` — client, String, `''`, config true.
  - Actor flag `lancer-npc-pilot.autoOptOut` (Boolean) — read only; set via `api.setAutoOptOut(actor, bool)`.
- Wiring in `initializePilot`:
  - Register `game.socket.on('module.lancer-npc-pilot', …)` for banners on **every** client (move the banner listener registration before the `if (!game.user?.isGM) return null;` line).
  - `deleteCombat` and `canvasTearDown` → `runner.cancel()` (clears banners everywhere).
  - `updateCombat` hook: on turn/round change → `runner.cancel()`; then if `shouldAutoRun(...)` → `runner.run(turnKey)`; else existing `promptOnTurn` behavior. Auto mode implies the turn prompt.
  - On `ready` (GM, responsible) → `warmUpModel` if `decisionMode==='model'` or `banterEnabled`.
  - Pass `choice.line=''` into execute when banter is enabled so the intent line is posted once, by banter, IC-styled.

- [ ] **Step 1: Write failing tests** for `warmUpModel` (success/failure notifications with exact copy; skip without secret; payload has no `snapshot`/board fields) and for settings registration defaults (all three world toggles default `false`; banter provider default `openai`).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run the full suite `node --test` → PASS (no regressions).
- [ ] **Step 5:** Commit `foundry: wire auto mode, banter settings and model warm-up`.

---

### Task 9: Optional auto-roll through Lancer's own steps

**Files:**
- Create: `foundry-module/scripts/adapter/auto-roll.mjs`
- Test: `foundry-module/test/auto-roll.test.mjs`, plus a conformance test gated on `PILOT_LANCER_SYSTEM` like `lancer-weapon-flow.test.mjs`

**Interfaces:**
- Produces: `prepareAutoRollAttack(flow, game) -> flow` — instance-local wrapper (same pattern as `prepareModeFlow`) that replaces only the `showAttackHUD` step with one that accepts the HUD's computed defaults without changing accuracy/difficulty, then lets `rollAttacks`/`printAttackCard` run natively. `autoRollDamage(attackMessage, game) -> Promise<damageMessage>` — starts Lancer's `DamageRollFlow` the same way the attack card's damage button does, with its `showDamageHUD` step auto-accepted. `autoApplyDamage(damageMessage, game)` — for each `targetDamageResults` entry, applies via the existing `applyNativeDamage` at multiplier 1 (no resist/2× choice — Pilot never picks a multiplier the table didn't).
- Guard: refuse (throw, which holds the turn) unless `game.system.version==='3.1.3'` and the flow's step list matches the reviewed list; the conformance test asserts `showAttackHUD`, `rollAttacks`, `printAttackCard`, `showDamageHUD`, `rollNormalDamage` exist in the installed source.
- Turn runner calls these only when `autoRoll` is on; otherwise unchanged.

- [ ] **Step 1: Write failing tests** with fake flows: HUD step replaced, roll and print steps untouched and called in order; unknown step list → throws; apply uses `applyNativeDamage` once per target with `resistance:false`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement, verifying step names against the installed Lancer source (`%LOCALAPPDATA%/FoundryVTT/Data/systems/lancer/lancer-actor-*.mjs`) before writing the wrappers. If `DamageRollFlow` can't be started from a saved attack message without UI, stop and report: that would change the spec's auto-roll scope.
- [ ] **Step 4:** Run with and without `PILOT_LANCER_SYSTEM` set → PASS / conformance skipped.
- [ ] **Step 5:** Commit `foundry: optionally press Lancer's own roll and apply steps for AI attacks`.

---

### Task 10: Docs, version and roadmap status

**Files:**
- Modify: `docs/foundry-adapter.md` (new "Auto mode and banter (development 0.10.0)" section: settings, what is and isn't automated, fallback behavior, End-turn control, unverified live gates), `docs/design.md` (short pointer paragraph), `docs/roadmap.md` (`play-auto-mode`, `play-banter` → `Status: active; 0.10.0 source implemented, live acceptance open.`), `README.md` if it lists features, `VERSION`, `package.json`, `foundry-module/module.json` (version + download URL `…/download/v0.10.0/lancer-npc-pilot.zip`).

- [ ] **Step 1:** Make the edits. Keep media rules: no screenshot claims without a real capture; add a `doc-media TODO` comment for the banner screenshot (purpose, capture acceptance: real Foundry banner on a disposable world, blocker: no live run yet).
- [ ] **Step 2:** Run `node --test` → all PASS. Record the pass count in the commit body.
- [ ] **Step 3:** Commit `docs: describe auto mode and banter for development 0.10.0`.

## Out of scope for this plan

Activating the next combatant; full NPC turns; Disengage; roster expansion; release/push; live Foundry acceptance (a separate, owner-authorized disposable-world pass).
