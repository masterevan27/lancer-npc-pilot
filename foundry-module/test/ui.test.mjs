import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderReview, showReview } from '../scripts/adapter/review.mjs';
import { initializePilot } from '../scripts/pilot.mjs';

const review = { snapshot: { activeTokenId: 'npc', tokens: [{ id: 'npc', name: '<img src=x onerror=alert(1)>' }] },
  options: [{ id: 'A', score: 1, action: { kind: 'hold' }, move: null, facts: {} }],
  choice: { optionId: 'A', source: 'fallback', reason: '<script>evil()</script>', line: '"<b>go</b>"' },
  warnings: ['<svg onload=bad>'] };

test('review escapes actor names, model text and warnings; shows source and exact path', () => {
  const html = renderReview(review, false);
  assert(!html.includes('<script>')); assert(!html.includes('<img')); assert(!html.includes('<svg'));
  assert(html.includes('&lt;script&gt;')); assert(html.includes('fallback')); assert(html.includes('disabled'));
});

test('Execute is absent when disabled and default dialog action is Skip', async () => {
  let config;
  await showReview(review, { DialogV2: { wait: async value => { config = value; return null; } }, canExecute: false });
  assert(!config.buttons.some(b => b.action === 'execute'));
  assert(config.buttons.some(b => b.action === 'skip' && b.default));
  assert(config.buttons.some(b => b.action === 'reask'));
});

test('partial-turn review exposes remaining shared actions and movement before approval', () => {
  const partial = structuredClone(review);
  partial.snapshot.actionBudget = { move: 2, quick: 1, full: false, protocol: false, reaction: true };
  const html = renderReview(partial, false);
  assert(html.includes('Movement remaining: 2'));
  assert(html.includes('Quick actions remaining: 1'));
  assert(html.includes('Full action available: no'));
});

test('player clients never receive a planning API or install hooks', () => {
  const api = initializePilot({ game: { user: { isGM: false } }, Hooks: { on: () => assert.fail('player hook') } });
  assert.equal(api, null);
});

test('module manifest and versioned files agree and every shipped entry exists', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../module.json', import.meta.url)));
  const version = fs.readFileSync(new URL('../../VERSION', import.meta.url), 'utf8').trim();
  const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));
  assert.equal(manifest.id, 'lancer-npc-pilot'); assert.equal(manifest.version, version); assert.equal(pkg.version, version);
  for (const path of [...manifest.esmodules, ...manifest.styles]) assert(fs.existsSync(new URL(`../${path}`, import.meta.url)));
  assert.equal(manifest.compatibility.minimum, '13');
});
