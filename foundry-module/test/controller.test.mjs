import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PilotController, requestDecision } from '../scripts/adapter/controller.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/open-map.json', import.meta.url)));
function setup(request = async () => '{"option":"A","reason":"Cover"}') {
  const board = { snapshot: structuredClone(fixture), stamp: 'a', turn: 'turn1', terrainReviewed: true, warnings: [] };
  const calls = [];
  const controller = new PilotController({ read: () => structuredClone(board), request,
    canExecute: () => true, execute: async (...args) => { calls.push(args); } });
  return { board, calls, controller };
}

test('planning is read-only, and approval executes exactly one stored option', async () => {
  const { controller, calls } = setup(); const review = await controller.plan();
  assert.equal(calls.length, 0);
  assert.equal(review.choice.source, 'model');
  await controller.approve(review, review.choice.optionId);
  assert.equal(calls.length, 1);
  await assert.rejects(controller.approve(review, 'A'), /expired|used/);
});

test('bad ids retry once then visibly fall back; no model-supplied action is executed', async () => {
  let count = 0;
  const { controller, calls } = setup(async payload => { count++; assert(payload.messages.length >= 1); return '{"option":"evil","action":"roll"}'; });
  const review = await controller.plan();
  assert.equal(count, 2); assert.equal(review.choice.source, 'fallback');
  assert.equal(calls.length, 0); assert(review.options.every(o => o.action.kind !== 'hide'));
});

test('changed board, changed turn, disabled execution and unreviewed terrain prevent all mutation', async () => {
  for (const change of [s => { s.board.stamp = 'b'; }, s => { s.board.turn = 'turn2'; },
    s => { s.controller.canExecute = () => false; }, s => { s.board.terrainReviewed = false; }]) {
    const s = setup(); const review = await s.controller.plan(); change(s);
    await assert.rejects(s.controller.approve(review, 'A'));
    assert.equal(s.calls.length, 0);
  }
});

test('edited review objects cannot change the stored action or bypass approval', async () => {
  const { controller, calls } = setup(); const review = await controller.plan();
  review.options[0].action.kind = 'malicious';
  await controller.approve(review, 'A');
  assert.notEqual(calls[0][0].action.kind, 'malicious');
  await assert.rejects(controller.approve({ ...review }, 'A'));
});

test('skipping invalidates approval and a transport failure never triggers fallback execution', async () => {
  const s = setup(); const review = await s.controller.plan(); s.controller.cancel();
  await assert.rejects(s.controller.approve(review, 'A'));
  assert.equal(s.calls.length, 0);
  const bad = setup(async () => { throw Error('offline'); });
  await assert.rejects(bad.controller.plan(), /offline/); assert.equal(bad.calls.length, 0);
});

test('a later request supersedes an earlier model response and execution locks the turn', async () => {
  let release; let count = 0;
  const s = setup(async () => ++count === 1 ? await new Promise(r => { release = r; }) : '{"option":"A"}');
  const old = s.controller.plan(); const review = await s.controller.plan();
  release('{"option":"A"}'); await assert.rejects(old, /cancel|supersed/i);
  await s.controller.approve(review, 'A');
  await assert.rejects(s.controller.plan(), /already/);
});

test('relay client sends auth only in a header and refuses insecure nonlocal URLs', async () => {
  let sent;
  const fetchImpl = async (url, init) => { sent = { url, init }; return { ok: true, json: async () => ({ text: '{"option":"A"}' }) }; };
  const settings = { relayUrl: 'http://127.0.0.1:5090', secret: 'test-secret', provider: 'openai', model: 'local', timeoutMs: 100 };
  const result = await requestDecision({ system: 's', messages: [{ role: 'user', content: 'u' }] }, settings, { fetchImpl });
  assert.equal(result, '{"option":"A"}'); assert.equal(sent.init.headers['X-Pilot-Secret'], 'test-secret');
  assert(!sent.init.body.includes('test-secret')); assert.equal(sent.init.credentials, 'omit');
  await assert.rejects(requestDecision({}, { ...settings, relayUrl: 'http://remote.example' }, { fetchImpl }), /HTTPS|loopback/);
});

test('the eight displayed alternatives retain tactical variety after unsupported actions are removed', async () => {
  const s = setup(); const mover = s.board.snapshot.tokens.find(t => t.id === s.board.snapshot.activeTokenId);
  const weapon = structuredClone(mover.weapons[0]);
  mover.weapons = Array.from({ length: 15 }, (_, i) => ({ ...weapon, itemId: `weapon-${i}` }));
  const review = await s.controller.plan();
  assert.equal(review.options.length, 8);
  assert.deepEqual(new Set(review.options.map(o => o.category)), new Set(['aggressive', 'defensive', 'reposition']));
});
