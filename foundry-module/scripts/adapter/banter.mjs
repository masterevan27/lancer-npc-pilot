// Banter adapter: asks the relay for a short in-character line, cleans it and
// posts it as the speaking token plus a speech banner. All Foundry access is
// injected. Never throws; failures are logged to the GM console only.
import { buildBanterContext, buildBanterPrompt, cleanBanterLine, claimsOutcome, contradictsOutcome, isRepeat, shouldReact } from '../core/banter.mjs';
import { bannerView } from '../core/banner.mjs';
import { escapeHtml } from './review.mjs';

const RECENT_MAX = 6;
const INTENT_TIMEOUT_MS = 4000;
const REACTION_TIMEOUT_MS = 15000;
const SAMPLING = { maxTokens: 120, temperature: 0.9 };

export const chatContent = line => '<p>' + escapeHtml(line) + '</p>';

/** Production chat sink: speaks as the token, in character, with no flavor or AI label. */
export const postChatMessage = (line, token) => ChatMessage.create({
  speaker: ChatMessage.getSpeaker({ token }),
  style: CONST.CHAT_MESSAGE_STYLES.IC,
  content: chatContent(line),
});

export function createBanter({ request, postChat, banner, readSnapshot, readSpeaker, settings, log = () => {} }) {
  const recent = new Map();
  let generation = 0;
  const drop = e => { try { log('banter dropped: ' + (e?.message ?? String(e))); } catch { /* never throw */ } };

  async function speak(tokenId, { phase, option, outcome, preset, filterClaims, checkOutcome, timeoutMs }) {
    const gen = generation;
    try {
      const cfg = settings();
      if (!cfg?.enabled) return;
      const who = readSpeaker(tokenId);
      const list = recent.get(who.actorId) ?? [];
      let raw = preset;
      if (!raw) {
        const context = buildBanterContext(readSnapshot(), { speakerTokenId: tokenId, phase, option, outcome });
        raw = await request(buildBanterPrompt(context, list), cfg, { timeoutMs, ...SAMPLING });
      }
      if (gen !== generation) return; // cancelled while the request was pending
      const line = cleanBanterLine(raw);
      if (!line) return;
      if (filterClaims && claimsOutcome(line)) return;
      if (checkOutcome && contradictsOutcome(line, outcome)) return;
      if (isRepeat(line, list)) return;
      await postChat(line, who.token);
      if (gen !== generation) return;
      recent.set(who.actorId, [...(recent.get(who.actorId) ?? list), line].slice(-RECENT_MAX));
      banner.show(bannerView({ kind: 'speech', name: who.name, className: who.className, side: who.side,
        round: who.round, portrait: who.portrait, line }));
    } catch (e) { drop(e); }
  }

  return {
    recent,
    /** Invalidates every in-flight line: a late reply publishes neither chat nor banner. */
    cancelPending() { generation++; },
    async speakIntent(review, option) {
      let tokenId;
      try {
        if (!settings()?.enabled) return;
        tokenId = readSnapshot().activeTokenId;
      } catch (e) { return drop(e); }
      const line = review?.choice?.line;
      const preset = review?.mode === 'model' && typeof line === 'string' && line.trim() ? line : null;
      await speak(tokenId, { phase: 'intent', option, preset, filterClaims: true, timeoutMs: INTENT_TIMEOUT_MS });
    },
    async speakReaction(outcome, speakerTokenId) {
      try { if (!shouldReact(outcome)) return; } catch (e) { return drop(e); }
      await speak(speakerTokenId, { phase: 'reaction', outcome, filterClaims: false, checkOutcome: true, timeoutMs: REACTION_TIMEOUT_MS });
    },
  };
}
