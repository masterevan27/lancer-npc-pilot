import test from 'node:test';
import assert from 'node:assert/strict';
import { createBanter, chatContent } from '../scripts/adapter/banter.mjs';

const tok = (o) => ({ id: 't', name: 'T', side: 'hostile', size: 1, pos: { x: 0, y: 0 }, hp: [10, 10], structure: [1, 1], armor: 0, evasion: 8, edef: 8, speed: 4, ...o });
const snapshot = { round: 2, activeTokenId: 'a', grid: { type: 'square', width: 20, height: 20 },
  tokens: [tok({ id: 'a', name: 'Sentinel' }), tok({ id: 'c', name: 'Cicada', side: 'friendly', pos: { x: 3, y: 0 } })] };

function setup({ enabled = true, replies = ['Cicada, hold still.'], fail } = {}) {
  const s = { requests: [], chats: [], banners: [], logs: [] };
  let i = 0;
  s.banter = createBanter({
    request: async (payload, settings, opts) => {
      s.requests.push({ payload, settings, opts });
      if (fail) throw Error(fail);
      return replies[Math.min(i++, replies.length - 1)];
    },
    postChat: async (line, token) => { s.chats.push({ line, token }); },
    banner: { show: v => s.banners.push(v) },
    readSnapshot: () => snapshot,
    readSpeaker: id => ({ actorId: 'actor-' + id, name: 'Sentinel', className: 'Striker', side: 'hostile', round: 2, portrait: 'p.png', token: { id } }),
    settings: () => ({ enabled, provider: 'openai', model: 'local', relayUrl: 'http://127.0.0.1:5090', secret: 'x' }),
    log: m => s.logs.push(m),
  });
  return s;
}
const policyReview = { mode: 'policy', choice: { line: '' } };
const modelReview = line => ({ mode: 'model', choice: { line } });
const option = { id: 'o1', action: { kind: 'hold' }, facts: {}, move: null };
const miss = { status: 'missed', targets: [{ hit: false }] };

test('disabled makes no request and posts nothing', async () => {
  const s = setup({ enabled: false });
  await s.banter.speakIntent(policyReview, option);
  await s.banter.speakReaction(miss, 'a');
  assert.equal(s.requests.length, 0); assert.equal(s.chats.length, 0); assert.equal(s.banners.length, 0);
});

test('model-mode line is reused without a request', async () => {
  const s = setup();
  await s.banter.speakIntent(modelReview('Hold still, Cicada.'), option);
  assert.equal(s.requests.length, 0);
  assert.equal(s.chats[0].line, 'Hold still, Cicada.');
  assert.deepEqual(s.chats[0].token, { id: 'a' });
  assert.equal(s.banners[0].kind, 'speech'); assert.equal(s.banners[0].quote, 'Hold still, Cicada.');
});

test('policy-mode request uses timeoutMs 4000, banter provider and small sampling body', async () => {
  const s = setup();
  await s.banter.speakIntent(policyReview, option);
  assert.equal(s.requests.length, 1);
  const r = s.requests[0];
  assert.equal(r.opts.timeoutMs, 4000); assert.equal(r.opts.maxTokens, 120); assert.equal(r.opts.temperature, 0.9);
  assert.equal(r.settings.provider, 'openai'); assert.equal(r.settings.model, 'local');
  assert.equal(s.chats[0].line, 'Cicada, hold still.');
});

test('request rejecting never throws and posts nothing', async () => {
  const s = setup({ fail: 'relay down' });
  await s.banter.speakIntent(policyReview, option);
  await s.banter.speakReaction(miss, 'a');
  assert.equal(s.chats.length, 0);
  assert.match(s.logs[0], /^banter dropped: relay down/);
});

test('intent line that claims an outcome is dropped', async () => {
  const s = setup({ replies: ['Direct hit, scratch one Cicada.'] });
  await s.banter.speakIntent(policyReview, option);
  assert.equal(s.chats.length, 0);
});

test('repeat lines are dropped and recent is capped at 6 per actor', async () => {
  const s = setup({ replies: ['Stand still please Cicada.', 'Stand still please Cicada.'] });
  await s.banter.speakIntent(policyReview, option);
  await s.banter.speakIntent(policyReview, option);
  assert.equal(s.chats.length, 1);
  assert.deepEqual(s.banter.recent.get('actor-a'), ['Stand still please Cicada.']);
  const words = ['alpha one', 'bravo two', 'charlie three', 'delta four', 'echo five', 'foxtrot six', 'golf seven', 'hotel eight'];
  const t = setup({ replies: words });
  for (let k = 0; k < words.length; k++) await t.banter.speakIntent(policyReview, option);
  assert.equal(t.banter.recent.get('actor-a').length, 6);
});

test('reaction is skipped for an unremarkable hit and uses 15000 ms for a miss', async () => {
  const s = setup({ replies: ['Lucky, Cicada.'] });
  await s.banter.speakReaction({ status: 'applied', targets: [{ hit: true, damage: 1, maxHp: 20 }] }, 'a');
  assert.equal(s.requests.length, 0);
  await s.banter.speakReaction(miss, 'a');
  assert.equal(s.requests[0].opts.timeoutMs, 15000);
  assert.match(s.requests[0].payload.messages[0].content, /reaction/);
  assert.equal(s.chats[0].line, 'Lucky, Cicada.');
});

test('reaction is not filtered by claimsOutcome', async () => {
  const s = setup({ replies: ['Direct hit, scratch one Cicada.'] });
  await s.banter.speakReaction({ status: 'applied', targets: [{ hit: true, destroyed: true }] }, 'a');
  assert.equal(s.chats.length, 1);
});

test('chat content is HTML-escaped', () => {
  assert.equal(chatContent('a <b>&"x"</b>'), '<p>a &lt;b&gt;&amp;&quot;x&quot;&lt;/b&gt;</p>');
});
