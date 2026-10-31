#!/usr/bin/env node
// Lancer NPC Pilot relay: a small local HTTP service between the Foundry
// module and the model providers. Node >= 20, built-ins only.

import { createServer } from 'node:http';
import { createHash, timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { loadConfig } from './config.mjs';
import { RelayError } from './providers/common.mjs';
import * as anthropic from './providers/anthropic.mjs';
import * as openai from './providers/openai.mjs';

export const PROVIDERS = Object.freeze({ anthropic, openai });

const VERSION = (() => {
  try { return readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim(); } catch { return 'unknown'; }
})();

const ALLOWED_HEADERS = 'Content-Type, X-Pilot-Secret';
const ALLOWED_METHODS = 'GET, POST, OPTIONS';

const sha = (s) => createHash('sha256').update(String(s)).digest();
/** Constant-time secret comparison (hashing equalizes lengths). */
export function secretMatches(given, expected) {
  if (typeof given !== 'string' || !given) return false;
  return timingSafeEqual(sha(given), sha(expected));
}

function sendJson(res, status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...extraHeaders,
  });
  res.end(payload);
}

function sendError(res, err, headers) {
  const status = err instanceof RelayError ? err.status : 500;
  const code = err instanceof RelayError ? err.code : 'internal_error';
  const message = err instanceof RelayError ? err.message : 'internal relay error';
  sendJson(res, status, { error: { code, message, ...(err?.extra ?? {}) } }, headers);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const declared = Number(req.headers['content-length']);
    if (Number.isFinite(declared) && declared > limit) {
      reject(new RelayError(413, 'body_too_large', `request body exceeds ${limit} bytes`));
      req.resume();
      return;
    }
    const chunks = [];
    let size = 0;
    let failed = false;
    req.on('data', (chunk) => {
      if (failed) return;
      size += chunk.length;
      if (size > limit) {
        failed = true;
        reject(new RelayError(413, 'body_too_large', `request body exceeds ${limit} bytes`));
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => { if (!failed) resolve(Buffer.concat(chunks).toString('utf8')); });
    req.on('error', (e) => { if (!failed) { failed = true; reject(e); } });
  });
}

const bad = (message) => new RelayError(400, 'invalid_request', message);

/**
 * Validate and normalize a /v1/decide body. Pure.
 * @returns {{provider:string, model?:string, system?:string, messages:{role:string,content:string}[], maxTokens:number, temperature?:number}}
 */
export function validateDecide(body, config) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw bad('body must be a JSON object');
  const { provider, model, system, messages, maxTokens, temperature } = body;
  if (typeof provider !== 'string' || !Object.hasOwn(PROVIDERS, provider)) {
    throw new RelayError(400, 'unknown_provider',
      `provider must be one of: ${Object.keys(PROVIDERS).join(', ')}`);
  }
  if (model !== undefined && model !== null &&
      (typeof model !== 'string' || !/^[\w.:/@-]{1,200}$/.test(model))) {
    throw bad('model must be a model id string');
  }
  if (system !== undefined && system !== null && typeof system !== 'string') throw bad('system must be a string');
  if (!Array.isArray(messages) || messages.length === 0) throw bad('messages must be a non-empty array');
  const clean = messages.map((m, i) => {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) throw bad(`messages[${i}].role must be "user" or "assistant"`);
    if (typeof m.content !== 'string' || !m.content) throw bad(`messages[${i}].content must be a non-empty string`);
    return { role: m.role, content: m.content };
  });
  if (clean.at(-1).role !== 'user') throw bad('the last message must have role "user"');
  let max = config.defaultMaxTokens;
  if (maxTokens !== undefined && maxTokens !== null) {
    if (!Number.isInteger(maxTokens) || maxTokens < 1 || maxTokens > config.maxTokensLimit) {
      throw bad(`maxTokens must be an integer from 1 to ${config.maxTokensLimit}`);
    }
    max = maxTokens;
  }
  const out = { provider, messages: clean, maxTokens: max };
  if (model) out.model = model;
  if (system) out.system = system;
  if (temperature !== undefined && temperature !== null) {
    if (typeof temperature !== 'number' || !(temperature >= 0 && temperature <= 2)) {
      throw bad('temperature must be a number from 0 to 2');
    }
    out.temperature = temperature;
  }
  return out;
}

export function health(config) {
  return {
    ok: true,
    service: 'lancer-npc-pilot-relay',
    version: VERSION,
    providers: {
      anthropic: anthropic.describe(config.anthropic),
      openai: openai.describe(config.openai),
    },
  };
}

/**
 * Create the relay HTTP server (not listening yet).
 * @param {ReturnType<typeof loadConfig>} config
 * @param {{fetchImpl?: typeof fetch, log?: (line: string) => void}} [deps]
 */
export function createRelay(config, { fetchImpl = fetch, log = (l) => console.log(l) } = {}) {
  const allowed = new Set(config.allowedOrigins);

  return createServer(async (req, res) => {
    const started = Date.now();
    const url = new URL(req.url ?? '/', 'http://relay.local');
    let note = '';
    const done = (status) => log(`${new Date().toISOString()} ${req.method} ${url.pathname} ${status} ${Date.now() - started}ms${note}`);
    res.on('finish', () => done(res.statusCode));

    // --- CORS ---------------------------------------------------------
    const origin = req.headers.origin;
    const cors = {};
    if (origin !== undefined) {
      if (!allowed.has(origin)) {
        note = ` origin=${JSON.stringify(origin)} refused`;
        sendError(res, new RelayError(403, 'origin_not_allowed',
          'origin is not in PILOT_ALLOWED_ORIGINS'), { vary: 'Origin' });
        return;
      }
      cors['access-control-allow-origin'] = origin;
      cors.vary = 'Origin';
    }

    if (req.method === 'OPTIONS') {
      const headers = {
        ...cors,
        'access-control-allow-methods': ALLOWED_METHODS,
        'access-control-allow-headers': ALLOWED_HEADERS,
        'access-control-max-age': '600',
      };
      // Private Network Access (public/HTTPS page -> loopback) preflight.
      if (req.headers['access-control-request-private-network'] === 'true') {
        headers['access-control-allow-private-network'] = 'true';
      }
      res.writeHead(204, headers);
      res.end();
      return;
    }

    try {
      // --- Auth -------------------------------------------------------
      if (!secretMatches(req.headers['x-pilot-secret'], config.sharedSecret)) {
        throw new RelayError(401, 'unauthorized', 'missing or wrong X-Pilot-Secret header');
      }

      // --- Routes -----------------------------------------------------
      if (url.pathname === '/v1/health') {
        if (req.method !== 'GET') throw new RelayError(405, 'method_not_allowed', 'use GET');
        sendJson(res, 200, health(config), cors);
        return;
      }

      if (url.pathname === '/v1/decide') {
        if (req.method !== 'POST') throw new RelayError(405, 'method_not_allowed', 'use POST');
        const type = String(req.headers['content-type'] ?? '');
        if (!/^application\/json\b/i.test(type)) {
          throw new RelayError(415, 'unsupported_media_type', 'Content-Type must be application/json');
        }
        const raw = await readBody(req, config.maxBodyBytes);
        let body;
        try { body = JSON.parse(raw); } catch { throw bad('body is not valid JSON'); }
        const decision = validateDecide(body, config);
        const provider = PROVIDERS[decision.provider];
        const providerCfg = config[decision.provider];
        note = ` provider=${decision.provider} model=${decision.model || providerCfg.model}`;
        if (config.logPrompts) {
          log(`[prompt] ${JSON.stringify({ system: decision.system ?? null, messages: decision.messages })}`);
        }
        const result = await provider.decide(providerCfg, decision, {
          timeoutMs: config.upstreamTimeoutMs, fetchImpl,
        });
        if (result.usage?.inputTokens != null) {
          note += ` in=${result.usage.inputTokens} out=${result.usage.outputTokens}`;
        }
        if (config.logPrompts) log(`[reply] ${JSON.stringify(result.text)}`);
        sendJson(res, 200, result, cors);
        return;
      }

      throw new RelayError(404, 'not_found', `no route ${url.pathname}`);
    } catch (err) {
      if (!(err instanceof RelayError)) note += ` error=${err?.message ?? err}`;
      else if (err.status >= 500) note += ` ${err.code}`;
      if (res.headersSent) { res.destroy(); return; }
      sendError(res, err, cors);
    }
  });
}

const isLoopback = (h) => h === '127.0.0.1' || h === '::1' || h === 'localhost';

async function main() {
  let config;
  try {
    config = loadConfig();
  } catch (err) {
    console.error(`relay: refusing to start: ${err.message}`);
    process.exit(1);
  }
  if (config.sharedSecret.length < 16) {
    console.warn('relay: warning: PILOT_SHARED_SECRET is shorter than 16 characters');
  }
  if (!isLoopback(config.host)) {
    console.warn(`relay: warning: binding ${config.host}, not loopback; anything that can reach this port can try the secret`);
  }
  const server = createRelay(config);
  server.on('error', (err) => {
    console.error(`relay: ${err.message}`);
    process.exit(1);
  });
  server.listen(config.port, config.host, () => {
    const h = health(config).providers;
    console.log(`relay ${VERSION} listening on http://${config.host}:${config.port}`);
    console.log(`  anthropic: ${h.anthropic.configured ? `ready (${h.anthropic.model})` : 'no ANTHROPIC_API_KEY'}`);
    console.log(`  openai:    ${h.openai.baseUrl} (${h.openai.model})`);
    console.log(`  origins:   ${config.allowedOrigins.join(', ') || '(none)'}`);
    if (config.logPrompts) console.log('  PILOT_LOG_PROMPTS=1: prompts and replies are logged');
  });
  const stop = () => server.close(() => process.exit(0));
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
