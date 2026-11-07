// Loads a local model before the first turn. Sends a fixed prompt with no board data.
// Only local (openai-compatible) models are warmed: warm-up never spends money.
export const WARMUP_TIMEOUT_MS = 180000;
const OK = 'NPC Pilot: model warmed up.';
const FAILED = 'NPC Pilot: model warm-up failed — the first AI turn may be slow.';

export async function warmUpModel({ request, providers = [], notifications } = {}) {
  const seen = new Set();
  const entries = [];
  for (const p of providers) {
    if (!p || p.provider !== 'openai' || !p.secret) continue;
    const key = `${p.relayUrl}|${p.provider}|${p.model ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key); entries.push(p);
  }
  if (!entries.length) return false;
  let ok = true;
  for (const entry of entries) {
    try {
      await request({ messages: [{ role: 'user', content: 'Reply with OK.' }], maxTokens: 1 }, entry,
        { timeoutMs: WARMUP_TIMEOUT_MS, maxTokens: 1 });
    } catch { ok = false; }
  }
  try { (ok ? notifications?.info : notifications?.warn)?.call(notifications, ok ? OK : FAILED); } catch { /* ignore */ }
  return ok;
}
