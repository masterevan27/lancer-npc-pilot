import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateOptions } from '../scripts/core/options.mjs';
import { buildPrompt, describeOption } from '../scripts/core/prompt.mjs';
import { clip, extractJson, interpretReply, normalizeId, retryMessage } from '../scripts/core/reply.mjs';
import { FIXTURES, loadFixture } from './helpers/fixtures.mjs';

for (const name of FIXTURES) {
  test(`buildPrompt (${name}): system rules, battlefield, every option listed`, () => {
    const snap = loadFixture(name);
    const options = generateOptions(snap);
    const { system, messages } = buildPrompt(snap, options);
    assert.match(system, /JSON only/);
    assert.match(system, /"option"/);
    assert.match(system, /Never invent/);
    assert.match(system, /Do not describe hits, misses, damage/);
    assert.equal(messages.length, 1);
    assert.equal(messages[0].role, 'user');
    const body = messages[0].content;
    const me = snap.tokens.find((t) => t.id === snap.activeTokenId);
    assert.ok(body.includes(me.name));
    for (const o of options) assert.ok(body.includes(`${o.id}. ${describeOption(o)}.`));
    assert.ok(!/undefined|NaN/.test(body), body);
    assert.ok(!/undefined|NaN/.test(system));
  });
}

test('persona: explicit option overrides the token persona', () => {
  const snap = loadFixture('melee-duel');
  const opts = generateOptions(snap);
  assert.match(buildPrompt(snap, opts).system, /Berserker: always closes to melee/);
  assert.match(buildPrompt(snap, opts, { persona: 'Coward.' }).system, /Persona: Coward\./);
});

test('describeOption reads in plain words', () => {
  const [top] = generateOptions(loadFixture('open-map'));
  const d = describeOption(top);
  assert.match(d, /^Move 2 spaces to \(6,8\), then attack Lancaster "Mule" with Assault Rifle; hit \d+%/);
  assert.match(d, /hard cover/);
});

const OPTIONS = [{ id: 'A', score: 5 }, { id: 'B', score: 7 }, { id: 'C', score: 1 }];

test('extractJson tolerates fences, prose and nested braces', () => {
  assert.deepEqual(extractJson('{"option":"A","reason":"x","line":""}'), { option: 'A', reason: 'x', line: '' });
  assert.equal(extractJson('```json\n{"option": "B", "reason": "r"}\n```').option, 'B');
  assert.equal(extractJson('Sure! Here you go: {"option": "C", "reason": "a {curly} reason", "line": "Die!"} Hope that helps.').option, 'C');
  assert.equal(extractJson('{"thinking": {"a": 1}} then {"option": "A"}').option, 'A');
  assert.equal(extractJson('no json here'), null);
  assert.equal(extractJson(null), null);
});

test('normalizeId', () => {
  assert.equal(normalizeId(' b. '), 'B');
  assert.equal(normalizeId('Option C'), 'C');
  assert.equal(normalizeId('(A)'), 'A');
  assert.equal(normalizeId(3), null);
});

test('interpretReply: valid pick', () => {
  const res = interpretReply('{"option": "a", "reason": "Closest kill.", "line": "Hold still, pilot."}', OPTIONS);
  assert.equal(res.status, 'ok');
  assert.equal(res.optionId, 'A');
  assert.equal(res.source, 'model');
  assert.equal(res.line, 'Hold still, pilot.');
});

test('interpretReply: bad id -> retry once, then fall back to the top-scored option', () => {
  const first = interpretReply('{"option": "Z", "reason": "?"}', OPTIONS, { attempt: 0 });
  assert.equal(first.status, 'retry');
  assert.match(first.error, /not one of A, B, C/);
  assert.match(retryMessage(first.error, OPTIONS), /JSON only/);
  const second = interpretReply('I attack!', OPTIONS, { attempt: 1 });
  assert.equal(second.status, 'fallback');
  assert.equal(second.optionId, 'B', 'highest score, not first in list');
  assert.equal(second.source, 'fallback');
});

test('interpretReply: clips long text and strips control characters', () => {
  const long = Array.from({ length: 40 }, (_, i) => `w${i}`).join(' ');
  const res = interpretReply(JSON.stringify({ option: 'C', reason: long, line: `Hi\u0007 there\n\nfriend` }), OPTIONS);
  assert.equal(res.reason.split(' ').length, 25);
  assert.ok(res.reason.endsWith('…'));
  assert.equal(res.line, 'Hi there friend');
  assert.equal(clip(undefined, 5), '');
});

test('interpretReply: no options -> fallback with null', () => {
  const res = interpretReply('{"option":"A"}', []);
  assert.equal(res.status, 'fallback');
  assert.equal(res.option, null);
});
