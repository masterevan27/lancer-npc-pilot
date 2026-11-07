// Banter adapter: asks the relay for a short in-character line, cleans it and
// posts it as the speaking token plus a speech banner. All Foundry access is
// injected. Never throws; failures are logged to the GM console only.
import { buildBanterContext, buildBanterPrompt, cleanBanterLine, claimsOutcome, isRepeat, shouldReact } from '../core/banter.mjs';
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
  const drop = e => { try { log('banter dropped: ' + (e?.message ?? String(e))); } catch { /* never throw */ } };

  async function speak(tokenId, { phase, option, outcome, preset, filterClaims, timeoutMs }) {
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
      const line = cleanBanterLine(raw);
      if (!line) return;
      if (filterClaims && claimsOutcome(line)) return;
      if (isRepeat(line, list)) return;
      recent.set(who.actorId, [...list, line].slice(-RECENT_MAX));
      await postChat(line, who.token);
      banner.show(bannerView({ kind: 'speech', name: who.name, className: who.className, side: who.side,
        round: who.round, portrait: who.portrait, line }));
    } catch (e) { drop(e); }
  }

  return {
    recent,
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
      if (!shouldReact(outcome)) return;
      await speak(speakerTokenId, { phase: 'reaction', outcome, filterClaims: false, timeoutMs: REACTION_TIMEOUT_MS });
    },
  };
}
