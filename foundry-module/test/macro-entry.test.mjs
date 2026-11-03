import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const guide = readFileSync(new URL('../../docs/foundry-adapter.md', import.meta.url), 'utf8');
const command = guide.match(/As GM, create a Script macro containing:[\s\S]*?```js\s*([\s\S]*?)```/)[1];
const run = new (Object.getPrototypeOf(async function () {}).constructor)('game', 'ui', command);

test('documented macro tells a genuine player it is GM-only without accessing the planning API', async () => {
  const notices = [];
  await run({ user: { isGM: false }, modules: { get() { assert.fail('Player must not request the API.'); } } },
    { notifications: { info: s => notices.push(s) } });
  assert.equal(notices.length, 1); assert.match(notices[0], /GM.only/i);
});

test('documented macro explains unavailable module and invokes a ready GM API exactly once', async () => {
  const notices = []; let calls = 0;
  const ui = { notifications: { warn: s => notices.push(s) } };
  await run({ user: { isGM: true }, modules: { get: () => undefined } }, ui);
  assert.equal(notices.length, 1); assert.match(notices[0], /unavailable/i);
  await run({ user: { isGM: true }, modules: { get: () => ({ api: { planTurn: async () => calls++ } }) } }, ui);
  assert.equal(calls, 1); assert.equal(notices.length, 1);
});
