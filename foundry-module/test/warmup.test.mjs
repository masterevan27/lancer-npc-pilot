import test from 'node:test';
import assert from 'node:assert/strict';
import { warmUpModel, WARMUP_TIMEOUT_MS } from '../scripts/adapter/warmup.mjs';
import { registerSettings } from '../scripts/pilot.mjs';

const local = { provider: 'openai', model: 'qwen', relayUrl: 'http://127.0.0.1:5090', secret: 's' };
function rig(over = {}) {
  const s = { calls: [], info: [], warn: [] };
  s.request = async (payload, entry, opts) => { s.calls.push({ payload, entry, opts }); if (over.fail) throw new Error('down'); return 'OK'; };
  s.notifications = { info: m => s.info.push(m), warn: m => s.warn.push(m) };
  return s;
}

test('success notifies with the exact copy and sends a board-free payload', async () => {
  const s = rig();
  assert.equal(await warmUpModel({ request: s.request, providers: [local], notifications: s.notifications }), true);
  assert.deepEqual(s.info, ['NPC Pilot: model warmed up.']);
  assert.equal(s.calls.length, 1);
  assert.deepEqual(s.calls[0].payload, { messages: [{ role: 'user', content: 'Reply with OK.' }], maxTokens: 1 });
  assert.equal(s.calls[0].opts.timeoutMs, 180000); assert.equal(WARMUP_TIMEOUT_MS, 180000);
  assert.equal(s.calls[0].opts.maxTokens, 1);
  const text = JSON.stringify(s.calls[0].payload);
  assert(!/snapshot|board|system|token(?!s)/i.test(text));
});

test('failure warns with the exact copy and returns false', async () => {
  const s = rig({ fail: true });
  assert.equal(await warmUpModel({ request: s.request, providers: [local], notifications: s.notifications }), false);
  assert.deepEqual(s.warn, ['NPC Pilot: model warm-up failed — the first AI turn may be slow.']);
  assert.deepEqual(s.info, []);
});

test('anthropic is never warmed; nothing to warm is silent', async () => {
  const s = rig();
  assert.equal(await warmUpModel({ request: s.request, notifications: s.notifications,
    providers: [{ ...local, provider: 'anthropic' }] }), false);
  assert.equal(await warmUpModel({ request: s.request, notifications: s.notifications, providers: [] }), false);
  assert.equal(s.calls.length, 0); assert.deepEqual([...s.info, ...s.warn], []);
});

test('missing secret skips silently', async () => {
  const s = rig();
  assert.equal(await warmUpModel({ request: s.request, notifications: s.notifications,
    providers: [{ ...local, secret: '' }] }), false);
  assert.equal(s.calls.length, 0); assert.deepEqual([...s.info, ...s.warn], []);
});

test('duplicate decision and banter models are warmed once; mixed providers warm only local', async () => {
  const s = rig();
  await warmUpModel({ request: s.request, notifications: s.notifications,
    providers: [local, { ...local }, { ...local, provider: 'anthropic', model: 'c' }, { ...local, model: 'other' }] });
  assert.equal(s.calls.length, 2);
  assert.deepEqual(s.info, ['NPC Pilot: model warmed up.']);
});

test('one failure among several warms warns once', async () => {
  const s = rig();
  let n = 0;
  const request = async (...a) => { if (n++ === 1) throw new Error('x'); return s.request(...a); };
  assert.equal(await warmUpModel({ request, notifications: s.notifications, providers: [local, { ...local, model: 'b' }] }), false);
  assert.equal(s.warn.length, 1); assert.equal(s.info.length, 0);
});

test('new world toggles default off and banter provider defaults to local', () => {
  const settings = new Map();
  registerSettings({ settings: { register: (_m, k, v) => settings.set(k, v) }, keybindings: { register() {} } });
  for (const k of ['autoMode', 'banterEnabled']) {
    assert.equal(settings.get(k).default, false, k); assert.equal(settings.get(k).scope, 'world'); assert.equal(settings.get(k).config, true);
  }
  assert.equal(settings.has('autoRoll'), false, 'auto-roll is deferred; no setting is registered');
  const p = settings.get('banterProvider');
  assert.equal(p.default, 'openai'); assert.equal(p.scope, 'client');
  assert.deepEqual(Object.keys(p.choices), ['openai', 'anthropic']);
  assert.equal(settings.get('banterModel').default, ''); assert.equal(settings.get('banterModel').scope, 'client');
});
