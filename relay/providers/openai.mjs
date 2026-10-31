// OpenAI-compatible chat completions provider (Ollama, KoboldCPP, ...).

import { postJson, RelayError } from './common.mjs';

export const name = 'openai';

export function describe(cfg) {
  return {
    configured: Boolean(cfg.baseUrl),
    keyPresent: Boolean(cfg.apiKey),
    model: cfg.model,
    baseUrl: cfg.baseUrl,
  };
}

export function buildRequest(cfg, req) {
  const messages = [];
  if (req.system) messages.push({ role: 'system', content: req.system });
  for (const m of req.messages) messages.push({ role: m.role, content: m.content });
  const body = {
    model: req.model || cfg.model,
    messages,
    max_tokens: req.maxTokens,
    stream: false,
  };
  if (req.temperature !== undefined) body.temperature = req.temperature;
  const headers = {};
  if (cfg.apiKey) headers.authorization = `Bearer ${cfg.apiKey}`;
  return { url: `${cfg.baseUrl}/chat/completions`, headers, body };
}

export async function decide(cfg, req, { timeoutMs, fetchImpl }) {
  const { url, headers, body } = buildRequest(cfg, req);
  const json = await postJson(url, { headers, body, timeoutMs, fetchImpl, provider: 'openai' });
  const choice = Array.isArray(json.choices) ? json.choices[0] : null;
  const content = choice?.message?.content;
  if (typeof content !== 'string') {
    throw new RelayError(502, 'upstream_bad_response', 'openai reply has no choices[0].message.content');
  }
  return {
    text: content,
    provider: name,
    model: json.model || body.model,
    stopReason: choice.finish_reason ?? null,
    usage: {
      inputTokens: json.usage?.prompt_tokens ?? null,
      outputTokens: json.usage?.completion_tokens ?? null,
    },
  };
}
