import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { buildConfig } from '../config.mjs';
import { createRelay } from '../server.mjs';
import { ANTHROPIC_VERSION } from '../providers/anthropic.mjs';
import { startMockUpstream, startRelay } from '../test-support/mock-upstream.mjs';

const SECRET = 'test-secret-0123456789';
const ORIGIN = 'https://foundry.lab.spiralfrenzy.com';
const FAKE_KEY = 'sk-ant-test-not-a-real-key';

let upstream;
let relay;
let config;

function makeConfig(overrides = {}) {
  return buildConfig({
    PILOT_SHARED_SECRET: SECRET,
    ANTHROPIC_API_KEY: FAKE_KEY,
    ANTHROPIC_BASE_URL: upstream.url,
    OPENAI_BASE_URL: `${upstream.url}/v1`,
    OPENAI_MODEL: 'gpt-oss:20b',
    PILOT_UPSTREAM_TIMEOUT_MS: '300',
    PILOT_MAX_BODY_BYTES: '4096',
    ...overrides,
  });
}

before(async () => {
  upstream = await startMockUpstream();
  config = makeConfig();
  relay = await startRelay(createRelay, config);
});
after(async () => { await relay.close(); await upstream.close(); });
beforeEach(() => { upstream.requests.length = 0; relay.lines.length = 0; });

const decideBody = (extra = {}) => ({
  provider: 'anthropic',
  system: 'You are an NPC pilot. Reply with JSON only.',
  messages: [{ role: 'user', content: 'Options: 1) attack 2) hide' }],
  ...extra,
});

function call(path, { method = 'POST', body, headers = {}, secret = SECRET, base = relay.url } = {}) {
  const h = { ...headers };
  if (secret) h['x-pilot-secret'] = secret;
  if (body !== undefined && !h['content-type']) h['content-type'] = 'application/json';
  return fetch(base + path, {
    method, headers: h,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

const anthropicReply = {
  id: 'msg_1', type: 'message', role: 'assistant', model: 'claude-sonnet-5-5',
  content: [{ type: 'thinking', thinking: '', signature: 'x' }, { type: 'text', text: '{"option":"1"}' }],
  stop_reason: 'end_turn', usage: { input_tokens: 42, output_tokens: 7 },
};

test('anthropic: forwards a Messages API request and normalizes the reply', async () => {
  upstream.setHandler(() => ({ body: anthropicReply }));
  const res = await call('/v1/decide', { body: decideBody({ maxTokens: 900, temperature: 0.3 }) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    text: '{"option":"1"}', provider: 'anthropic', model: 'claude-sonnet-5-5',
    stopReason: 'end_turn', usage: { inputTokens: 42, outputTokens: 7 }, ignored: ['temperature'],
  });
  assert.equal(upstream.requests.length, 1);
  const r = upstream.requests[0];
  assert.equal(r.url, '/v1/messages');
  assert.equal(r.headers['x-api-key'], FAKE_KEY);
  assert.equal(r.headers['anthropic-version'], ANTHROPIC_VERSION);
  assert.equal(r.headers['anthropic-beta'], 'server-side-fallback-2026-07-01');
  assert.deepEqual(r.body, {
    model: 'claude-sonnet-5-5', max_tokens: 900, fallbacks: 'default',
    system: 'You are an NPC pilot. Reply with JSON only.',
    messages: [{ role: 'user', content: 'Options: 1) attack 2) hide' }],
  });
  assert.ok(!('temperature' in r.body), 'temperature is rejected on API version 2026-10-21');
});

test('anthropic: model override, default max tokens, effort and no fallbacks for haiku', async () => {
  const cfg = makeConfig({ ANTHROPIC_EFFORT: 'low' });
  const r2 = await startRelay(createRelay, cfg);
  try {
    upstream.setHandler(() => ({ body: { ...anthropicReply, model: 'claude-haiku-5-5' } }));
    const res = await call('/v1/decide', { base: r2.url, body: decideBody({ model: 'claude-haiku-5-5' }) });
    assert.equal(res.status, 200);
    const sent = upstream.requests[0];
    assert.equal(sent.body.model, 'claude-haiku-5-5');
    assert.equal(sent.body.max_tokens, cfg.defaultMaxTokens);
    assert.deepEqual(sent.body.output_config, { effort: 'low' });
    assert.ok(!('fallbacks' in sent.body));
    assert.equal(sent.headers['anthropic-beta'], undefined);
  } finally { await r2.close(); }
});

test('anthropic: refusal becomes a clear error', async () => {
  upstream.setHandler(() => ({ body: { ...anthropicReply, content: [], stop_reason: 'refusal', stop_details: { type: 'refusal', category: 'cyber' } } }));
  const res = await call('/v1/decide', { body: decideBody() });
  assert.equal(res.status, 502);
  const j = await res.json();
  assert.equal(j.error.code, 'upstream_refusal');
  assert.match(j.error.message, /cyber/);
});

test('anthropic: missing key is reported as not configured', async () => {
  const r2 = await startRelay(createRelay, makeConfig({ ANTHROPIC_API_KEY: '' }));
  try {
    const res = await call('/v1/decide', { base: r2.url, body: decideBody() });
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'provider_not_configured');
    assert.equal(upstream.requests.length, 0);
  } finally { await r2.close(); }
});

test('openai: forwards chat completions with system first and temperature kept', async () => {
  upstream.setHandler(() => ({ body: {
    id: 'c1', model: 'gpt-oss:20b',
    choices: [{ index: 0, message: { role: 'assistant', content: '{"option":"2"}' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 30, completion_tokens: 5, total_tokens: 35 },
  } }));
  const res = await call('/v1/decide', { body: decideBody({ provider: 'openai', temperature: 0.4, maxTokens: 300 }) });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), {
    text: '{"option":"2"}', provider: 'openai', model: 'gpt-oss:20b',
    stopReason: 'stop', usage: { inputTokens: 30, outputTokens: 5 },
  });
  const r = upstream.requests[0];
  assert.equal(r.url, '/v1/chat/completions');
  assert.equal(r.headers.authorization, undefined, 'no key configured, no auth header');
  assert.deepEqual(r.body, {
    model: 'gpt-oss:20b', max_tokens: 300, stream: false, temperature: 0.4,
    messages: [
      { role: 'system', content: 'You are an NPC pilot. Reply with JSON only.' },
      { role: 'user', content: 'Options: 1) attack 2) hide' },
    ],
  });
});

test('openai: optional API key is sent as a bearer token', async () => {
  const r2 = await startRelay(createRelay, makeConfig({ OPENAI_API_KEY: 'local-key' }));
  try {
    upstream.setHandler(() => ({ body: { choices: [{ message: { content: 'ok' }, finish_reason: 'stop' }] } }));
    const res = await call('/v1/decide', { base: r2.url, body: decideBody({ provider: 'openai', model: 'qwen3:14b' }) });
    assert.equal(res.status, 200);
    assert.equal((await res.json()).model, 'qwen3:14b');
    assert.equal(upstream.requests[0].headers.authorization, 'Bearer local-key');
  } finally { await r2.close(); }
});

test('auth: missing or wrong secret is refused before any upstream call', async () => {
  for (const secret of [null, 'wrong', SECRET + 'x']) {
    const res = await call('/v1/decide', { secret, body: decideBody() });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).error.code, 'unauthorized');
  }
  const h = await call('/v1/health', { method: 'GET', secret: null });
  assert.equal(h.status, 401);
  assert.equal(upstream.requests.length, 0);
});

test('health: reports providers and key presence, never the key', async () => {
  const res = await call('/v1/health', { method: 'GET' });
  assert.equal(res.status, 200);
  const text = await res.text();
  assert.ok(!text.includes(FAKE_KEY));
  assert.ok(!text.includes(SECRET));
  const j = JSON.parse(text);
  assert.equal(j.ok, true);
  assert.equal(j.providers.anthropic.configured, true);
  assert.equal(j.providers.anthropic.keyPresent, true);
  assert.equal(j.providers.anthropic.model, 'claude-sonnet-5-5');
  assert.equal(j.providers.openai.configured, true);
  assert.equal(j.providers.openai.keyPresent, false);
  assert.equal(j.providers.openai.model, 'gpt-oss:20b');
});

test('cors: allowed origin gets ACAO on responses', async () => {
  const res = await call('/v1/health', { method: 'GET', headers: { origin: ORIGIN } });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.match(res.headers.get('vary'), /Origin/);
  const unauth = await call('/v1/health', { method: 'GET', secret: null, headers: { origin: ORIGIN } });
  assert.equal(unauth.status, 401);
  assert.equal(unauth.headers.get('access-control-allow-origin'), ORIGIN, 'browser can read the error');
});

test('cors: preflight with Private Network Access', async () => {
  const res = await fetch(relay.url + '/v1/decide', {
    method: 'OPTIONS',
    headers: {
      origin: ORIGIN,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type,x-pilot-secret',
      'access-control-request-private-network': 'true',
    },
  });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
  assert.equal(res.headers.get('access-control-allow-private-network'), 'true');
  assert.match(res.headers.get('access-control-allow-methods'), /POST/);
  assert.match(res.headers.get('access-control-allow-headers'), /X-Pilot-Secret/i);
  assert.match(res.headers.get('access-control-allow-headers'), /Content-Type/i);
});

test('cors: preflight without PNA request omits the PNA header', async () => {
  const res = await fetch(relay.url + '/v1/decide', {
    method: 'OPTIONS', headers: { origin: ORIGIN, 'access-control-request-method': 'POST' },
  });
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-private-network'), null);
});

test('cors: other origins are refused, preflight and request', async () => {
  const pre = await fetch(relay.url + '/v1/decide', {
    method: 'OPTIONS',
    headers: { origin: 'https://evil.example', 'access-control-request-method': 'POST', 'access-control-request-private-network': 'true' },
  });
  assert.equal(pre.status, 403);
  assert.equal(pre.headers.get('access-control-allow-origin'), null);
  assert.equal(pre.headers.get('access-control-allow-private-network'), null);
  const res = await call('/v1/decide', { body: decideBody(), headers: { origin: 'https://evil.example' } });
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error.code, 'origin_not_allowed');
  assert.equal(upstream.requests.length, 0);
});

test('validation: unknown provider', async () => {
  for (const provider of ['gemini', '__proto__', undefined]) {
    const res = await call('/v1/decide', { body: decideBody({ provider }) });
    assert.equal(res.status, 400);
    assert.equal((await res.json()).error.code, 'unknown_provider');
  }
});

test('validation: bad bodies get 400/413/415 with JSON errors', async () => {
  const cases = [
    [{ body: '{not json' }, 400, 'invalid_request'],
    [{ body: decideBody({ messages: [] }) }, 400, 'invalid_request'],
    [{ body: decideBody({ messages: [{ role: 'system', content: 'x' }] }) }, 400, 'invalid_request'],
    [{ body: decideBody({ messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] }) }, 400, 'invalid_request'],
    [{ body: decideBody({ maxTokens: 0 }) }, 400, 'invalid_request'],
    [{ body: decideBody({ maxTokens: 10_000_000 }) }, 400, 'invalid_request'],
    [{ body: decideBody({ temperature: 5 }) }, 400, 'invalid_request'],
    [{ body: decideBody({ model: 'bad model id; rm' }) }, 400, 'invalid_request'],
    [{ body: decideBody({ system: 'x'.repeat(5000) }) }, 413, 'body_too_large'],
    [{ body: 'hello', headers: { 'content-type': 'text/plain' } }, 415, 'unsupported_media_type'],
  ];
  for (const [opts, status, code] of cases) {
    const res = await call('/v1/decide', opts);
    assert.equal(res.status, status, `${code}: ${JSON.stringify(opts).slice(0, 80)}`);
    assert.equal((await res.json()).error.code, code);
  }
  assert.equal(upstream.requests.length, 0);
});

test('routing: 404 and 405', async () => {
  assert.equal((await call('/nope', { method: 'GET' })).status, 404);
  assert.equal((await call('/v1/decide', { method: 'GET' })).status, 405);
  assert.equal((await call('/v1/health', { body: {} })).status, 405);
});

test('upstream error status is surfaced as 502 with the upstream message', async () => {
  upstream.setHandler(() => ({ status: 429, body: { type: 'error', error: { type: 'rate_limit_error', message: 'slow down' } } }));
  const res = await call('/v1/decide', { body: decideBody() });
  assert.equal(res.status, 502);
  const j = await res.json();
  assert.equal(j.error.code, 'upstream_error');
  assert.equal(j.error.upstreamStatus, 429);
  assert.match(j.error.message, /HTTP 429: slow down/);
  assert.ok(!JSON.stringify(j).includes(FAKE_KEY));
});

test('upstream non-JSON or malformed replies are 502', async () => {
  upstream.setHandler(() => ({ body: '<html>oops</html>' }));
  let res = await call('/v1/decide', { body: decideBody({ provider: 'openai' }) });
  assert.equal(res.status, 502);
  assert.equal((await res.json()).error.code, 'upstream_bad_response');
  upstream.setHandler(() => ({ body: { choices: [] } }));
  res = await call('/v1/decide', { body: decideBody({ provider: 'openai' }) });
  assert.equal((await res.json()).error.code, 'upstream_bad_response');
});

test('upstream timeout is 504', async () => {
  upstream.setHandler(() => ({ hang: true }));
  for (const provider of ['anthropic', 'openai']) {
    const res = await call('/v1/decide', { body: decideBody({ provider }) });
    assert.equal(res.status, 504);
    const j = await res.json();
    assert.equal(j.error.code, 'upstream_timeout');
    assert.match(j.error.message, /300 ms/);
  }
});

test('upstream unreachable is 502', async () => {
  const r2 = await startRelay(createRelay, makeConfig({ OPENAI_BASE_URL: 'http://127.0.0.1:1/v1' }));
  try {
    const res = await call('/v1/decide', { base: r2.url, body: decideBody({ provider: 'openai' }) });
    assert.equal(res.status, 502);
    assert.equal((await res.json()).error.code, 'upstream_unreachable');
  } finally { await r2.close(); }
});

test('logging: no prompt text unless PILOT_LOG_PROMPTS=1', async () => {
  upstream.setHandler(() => ({ body: anthropicReply }));
  await (await call('/v1/decide', { body: decideBody() })).json();
  const joined = relay.lines.join('\n');
  assert.ok(relay.lines.length >= 1);
  assert.ok(!joined.includes('Options: 1) attack'));
  assert.ok(!joined.includes('NPC pilot'));
  assert.ok(!joined.includes('{\\"option'));
  assert.ok(!joined.includes(FAKE_KEY));

  const r2 = await startRelay(createRelay, makeConfig({ PILOT_LOG_PROMPTS: '1' }));
  try {
    await (await call('/v1/decide', { base: r2.url, body: decideBody() })).json();
    const all = r2.lines.join('\n');
    assert.ok(all.includes('Options: 1) attack'));
    assert.ok(!all.includes(FAKE_KEY));
  } finally { await r2.close(); }
});
