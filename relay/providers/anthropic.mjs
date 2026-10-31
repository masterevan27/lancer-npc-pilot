// Anthropic Messages API provider (raw HTTPS; the relay has no runtime deps).

import { postJson, RelayError } from './common.mjs';

export const ANTHROPIC_VERSION = '2026-10-21';
// Server-side refusal fallback, "default" routing form.
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export const name = 'anthropic';

export function describe(cfg) {
  return {
    configured: Boolean(cfg.apiKey),
    keyPresent: Boolean(cfg.apiKey),
    model: cfg.model,
    baseUrl: cfg.baseUrl,
    effort: cfg.effort,
  };
}

/** Haiku models have no server-side fallback; skip the parameter there. */
function wantsFallbacks(cfg, model) {
  return cfg.fallbacks === 'default' && !/haiku/i.test(model);
}

export function buildRequest(cfg, req) {
  const model = req.model || cfg.model;
  const body = {
    model,
    max_tokens: req.maxTokens,
    messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
  };
  if (req.system) body.system = req.system;
  if (cfg.effort) body.output_config = { effort: cfg.effort };
  const headers = {
    'x-api-key': cfg.apiKey,
    'anthropic-version': ANTHROPIC_VERSION,
  };
  if (wantsFallbacks(cfg, model)) {
    body.fallbacks = 'default';
    headers['anthropic-beta'] = FALLBACK_BETA;
  }
  // API version 2026-10-21 rejects temperature/top_p/top_k on every model, so
  // a requested temperature is dropped and reported back as ignored.
  const ignored = req.temperature !== undefined ? ['temperature'] : [];
  return { url: `${cfg.baseUrl}/v1/messages`, headers, body, ignored };
}

export async function decide(cfg, req, { timeoutMs, fetchImpl }) {
  if (!cfg.apiKey) {
    throw new RelayError(503, 'provider_not_configured',
      'anthropic provider has no ANTHROPIC_API_KEY; set it in relay/.env');
  }
  const { url, headers, body, ignored } = buildRequest(cfg, req);
  const json = await postJson(url, { headers, body, timeoutMs, fetchImpl, provider: 'anthropic' });
  if (json.stop_reason === 'refusal') {
    throw new RelayError(502, 'upstream_refusal',
      `anthropic declined the request${json.stop_details?.category ? ` (${json.stop_details.category})` : ''}`);
  }
  if (!Array.isArray(json.content)) {
    throw new RelayError(502, 'upstream_bad_response', 'anthropic reply has no content array');
  }
  const text = json.content.filter((b) => b?.type === 'text').map((b) => b.text).join('');
  const out = {
    text,
    provider: name,
    model: json.model || body.model,
    stopReason: json.stop_reason ?? null,
    usage: {
      inputTokens: json.usage?.input_tokens ?? null,
      outputTokens: json.usage?.output_tokens ?? null,
    },
  };
  if (ignored.length) out.ignored = ignored;
  return out;
}
