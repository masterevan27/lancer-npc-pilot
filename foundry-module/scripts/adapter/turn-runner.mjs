// Runs one NPC turn hands-off. Everything Foundry-specific is injected.
// Auto mode ends only its own turn: it never activates or starts a combatant.
import { nextAutoStep, TurnLifecycle } from '../core/auto-mode.mjs';
import { bannerView } from '../core/banner.mjs';
import { describeOption } from '../core/prompt.mjs';

const noop = () => {};
const asyncNoop = async () => {};

export function createTurnRunner({
  controller, banner, observe, endTurn, whisperGM = noop, openReview = noop,
  speakIntent = asyncNoop, speakReaction = noop, readTurnInfo, log = noop, actingMs = 3000,
} = {}) {
  let current = null;

  const safe = fn => { try { fn(); } catch { /* cleanup must not throw */ } };

  function teardown(ctx) {
    ctx.aborted = true;
    if (ctx.waitTimer) { clearTimeout(ctx.waitTimer); ctx.waitTimer = null; }
    ctx.wake();
    if (ctx.observer) { const o = ctx.observer; ctx.observer = null; safe(() => o.dispose()); }
  }

  function cancelCtx(ctx) {
    if (ctx.aborted) return;
    ctx.cancelled = true;
    teardown(ctx);
    safe(() => controller.cancel());
    safe(() => banner.clear());
    safe(() => ctx.lifecycle.cancel());
  }

  async function run(turnKey) {
    if (current) cancelCtx(current);
    let wake;
    const abortSignal = new Promise(res => { wake = () => res({aborted: true}); });
    const ctx = {lifecycle: new TurnLifecycle(), aborted: false, ended: false, forced: false, observer: null, wake};
    current = ctx;
    const lc = ctx.lifecycle;
    const exit = () => (ctx.forced ? 'done' : 'cancelled');

    const hold = (why, review) => {
      if (ctx.aborted) return exit();
      safe(() => lc.hold(why));
      teardown0();
      safe(() => whisperGM(why));
      safe(() => banner.show(bannerView({kind: 'held', name: ctx.info?.name ?? 'NPC', why, side: ctx.info?.side, portrait: ctx.info?.portrait})));
      if (review) safe(() => openReview(review));
      return 'held';
    };
    const teardown0 = () => {
      if (ctx.waitTimer) { clearTimeout(ctx.waitTimer); ctx.waitTimer = null; }
      if (ctx.observer) { const o = ctx.observer; ctx.observer = null; safe(() => o.dispose()); }
    };

    try {
      const info = ctx.info = readTurnInfo();
      lc.start(turnKey);
      banner.show(bannerView({kind: 'thinking', name: info.name, className: info.className, side: info.side, round: info.round, portrait: info.portrait}));

      let review;
      try {
        review = await controller.plan({auto: true});
      } catch (err) {
        return hold(`Planning failed: ${err?.message ?? err}`);
      }
      if (ctx.aborted) return exit();

      const step = nextAutoStep(review, {canExecute: info.canExecute, terrainReviewed: info.terrainReviewed});
      if (step.action !== 'execute') return hold(step.why, review);

      const option = review.options.find(o => o.id === step.optionId);
      lc.decided();
      const fallback = review.choice?.source === 'fallback';
      if (fallback) log(`NPC Pilot: model unavailable, played the top-scoring option. ${review.choice.error ?? ''}`.trim());

      try { await speakIntent(review, option); } catch (err) { log(`NPC Pilot: intent banter failed: ${err?.message ?? err}`); }
      if (ctx.aborted) return exit();

      let summary = '';
      try { summary = describeOption(option); } catch { summary = option.label ?? String(option.id); }
      banner.show(bannerView({kind: 'acting', name: info.name, className: info.className, side: info.side, portrait: info.portrait,
        summary: fallback ? `Fallback · ${summary}` : summary}));

      const isAttack = option.action?.kind === 'attack';
      if (isAttack) {
        try { ctx.observer = observe(option, review); } catch (err) { return hold(`Could not observe the attack: ${err?.message ?? err}`); }
      }

      let result;
      try {
        result = await controller.approve(review, step.optionId);
      } catch (err) {
        return hold(err?.message ?? String(err));
      }
      if (ctx.aborted) return exit();
      if (result === false || result?.ok === false) return hold('The roll flow did not complete.');

      lc.handedOff({expectsAttack: isAttack});

      if (isAttack) {
        // The acting summary fades after its display time; keep an End turn control on screen for the rest of the wait.
        ctx.waitTimer = setTimeout(() => {
          ctx.waitTimer = null;
          if (ctx.aborted) return;
          safe(() => banner.show(bannerView({kind: 'waiting', name: info.name, className: info.className, side: info.side, portrait: info.portrait})));
        }, actingMs);
        let outcome;
        try {
          outcome = await Promise.race([ctx.observer.done, abortSignal]);
        } catch (err) {
          return hold(`Could not observe the attack: ${err?.message ?? err}`);
        }
        if (ctx.aborted) return exit();
        if (outcome?.status !== 'missed' && outcome?.status !== 'applied') {
          return hold('The attack result was ambiguous; resolve it manually.');
        }
        teardown0();
        safe(() => { const p = speakReaction(outcome, info.speakerTokenId); p?.catch?.(noop); });
        lc.resolved();
      }

      ctx.ended = true;
      try {
        await endTurn();
      } catch (err) {
        ctx.ended = false;
        log(`NPC Pilot: could not end the turn: ${err?.message ?? err}`);
        return hold(`Could not end the turn: ${err?.message ?? err}`);
      }
      return 'done';
    } catch (err) {
      return hold(err?.message ?? String(err));
    }
  }

  async function endTurnAnyway() {
    const ctx = current;
    if (!ctx || ctx.ended || ctx.cancelled) return;
    ctx.ended = true;
    ctx.forced = true;
    safe(() => ctx.lifecycle.forceEnd());
    teardown(ctx);
    safe(() => banner.clear());
    await endTurn();
  }

  function cancel() {
    if (current) cancelCtx(current);
  }

  return {run, endTurnAnyway, cancel};
}
