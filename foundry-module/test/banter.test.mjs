import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  hpBand, buildBanterContext, buildBanterPrompt, cleanBanterLine, claimsOutcome, isRepeat, shouldReact,
} from '../scripts/core/banter.mjs';
import { LINE_MAX_WORDS } from '../scripts/core/prompt.mjs';

const tok = (o) => ({ id: 't', name: 'T', side: 'hostile', size: 1, pos: { x: 0, y: 0 }, hp: [10, 10], structure: [1, 1], armor: 0, evasion: 8, edef: 8, speed: 4, ...o });
const snap = (tokens) => ({ round: 1, activeTokenId: 'a', grid: { type: 'square', width: 20, height: 20 }, tokens });

test('hpBand thresholds', () => {
  assert.equal(hpBand([10, 10], [1, 1]), 'fresh');
  assert.equal(hpBand([8, 10], [1, 1]), 'fresh');
  assert.equal(hpBand([7, 10], [1, 1]), 'damaged');
  assert.equal(hpBand([3, 10], [1, 1]), 'damaged');
  assert.equal(hpBand([2, 10], [1, 1]), 'badly damaged');
  assert.equal(hpBand([5, 10], [1, 2]), 'badly damaged');
  assert.equal(hpBand([10, 10], [0, 2]), 'destroyed');
  assert.equal(hpBand([10, 10], undefined), 'fresh');
  assert.equal(hpBand([0, 10], [1, 1]), 'badly damaged');
});

test('buildBanterContext lists visible allies and enemies with distances', () => {
  const s = snap([
    tok({ id: 'a', name: 'Sentinel', side: 'hostile', pos: { x: 0, y: 0 }, classIds: ['npc_class_striker'] }),
    tok({ id: 'b', name: 'Wing', side: 'hostile', pos: { x: 3, y: 0 }, hp: [2, 10] }),
    tok({ id: 'c', name: 'Cicada', side: 'friendly', pos: { x: 0, y: 5 } }),
    tok({ id: 'd', name: 'Ghost', side: 'friendly', pos: { x: 0, y: 2 }, hidden: true }),
    tok({ id: 'e', name: 'Wreck', side: 'friendly', pos: { x: 1, y: 1 }, defeated: true }),
    tok({ id: 'f', name: 'Bystander', side: 'neutral', pos: { x: 1, y: 0 } }),
  ]);
  const c = buildBanterContext(s, { speakerTokenId: 'a', phase: 'intent', persona: 'Cocky.' });
  assert.deepEqual(c.speaker, { name: 'Sentinel', className: 'npc_class_striker', side: 'hostile', band: 'fresh' });
  assert.deepEqual(c.allies, [{ name: 'Wing', band: 'badly damaged', distance: 3 }]);
  assert.deepEqual(c.enemies, [{ name: 'Cicada', band: 'fresh', distance: 5 }]);
  assert.equal(c.action, null);
  assert.equal(c.outcome, null);
  assert.equal(c.persona, 'Cocky.');
});

test('buildBanterContext describes option and carries outcome', () => {
  const s = snap([tok({ id: 'a', name: 'Sentinel' })]);
  const option = { facts: { targetName: 'Cicada', weaponName: 'Rifle', hitChance: 0.5, critChance: 0.05, expectedDamage: 3, zeroHpChance: 0, targetHp: 10, targetHpMax: 10, distanceToTarget: 3 }, move: null, action: { kind: 'attack', targetTokenIds: ['c'] } };
  const outcome = { status: 'missed', targets: [] };
  const c = buildBanterContext(s, { speakerTokenId: 'a', phase: 'reaction', option, outcome });
  assert.match(c.action, /attack Cicada with Rifle/);
  assert.deepEqual(c.outcome, outcome);
  assert.equal(c.persona, null);
  assert.throws(() => buildBanterContext(s, { speakerTokenId: 'zz', phase: 'intent' }));
});

test('buildBanterContext works on the open-map fixture', () => {
  const s = JSON.parse(readFileSync(new URL('./fixtures/open-map.json', import.meta.url), 'utf8'));
  const c = buildBanterContext(s, { speakerTokenId: s.activeTokenId, phase: 'intent' });
  assert.equal(c.speaker.name, 'Assault Mk II');
  for (const e of [...c.allies, ...c.enemies]) assert.ok(Number.isFinite(e.distance));
});

test('buildBanterPrompt intent never allows results', () => {
  const ctx = { speaker: { name: 'Sentinel', className: null, side: 'hostile', band: 'fresh' }, allies: [], enemies: [{ name: 'Cicada', band: 'fresh', distance: 4 }], action: 'Attack Cicada', outcome: null, persona: 'Cocky.' };
  const p = buildBanterPrompt(ctx, ['Look out!']);
  assert.equal(typeof p.system, 'string');
  assert.equal(p.messages.length, 1);
  assert.equal(p.messages[0].role, 'user');
  assert.match(p.system, new RegExp(`${LINE_MAX_WORDS} words`));
  assert.match(p.system, /never state|do not state/i);
  assert.match(p.messages[0].content, /Cicada/);
  assert.match(p.messages[0].content, /Look out!/);
  assert.match(p.messages[0].content, /Cocky\./);
  assert.match(p.messages[0].content, /Sentinel/);
});

test('buildBanterPrompt reaction includes the recorded outcome only', () => {
  const ctx = { speaker: { name: 'Sentinel', className: null, side: 'hostile', band: 'fresh' }, allies: [], enemies: [], action: null, outcome: { status: 'applied', targets: [{ name: 'Cicada', hit: true, crit: false, damage: 4, maxHp: 10, destroyed: false }] }, persona: null };
  const p = buildBanterPrompt(ctx, []);
  assert.match(p.messages[0].content, /Cicada/);
  assert.match(p.messages[0].content, /"damage":4|damage[: ]+4/);
  assert.match(p.system, /only/i);
});

test('cleanBanterLine junk cases', () => {
  assert.equal(cleanBanterLine('```json\n{"line":"x"}\n```'), null);
  assert.equal(cleanBanterLine('"Look out, Cicada!"'), 'Look out, Cicada!');
  assert.equal(cleanBanterLine('Sentinel: <b>Hold</b> the line *revs engine*'), 'Hold the line');
  assert.equal(cleanBanterLine(Array(30).fill('word').join(' ')), null);
  assert.equal(cleanBanterLine(''), null);
  assert.equal(cleanBanterLine(null), null);
  assert.equal(cleanBanterLine('  *grins*  '), null);
  assert.equal(cleanBanterLine('{"line":"x"}'), null);
});

test('cleanBanterLine keeps exactly 20 words, drops 21, collapses whitespace', () => {
  const w = (n) => Array(n).fill('go').join(' ');
  assert.equal(cleanBanterLine(w(20)), w(20));
  assert.equal(cleanBanterLine(w(21)), null);
  assert.equal(cleanBanterLine('Hold\n\n  the   line'), 'Hold the line');
  assert.equal(cleanBanterLine('```\nStay sharp\n```'), 'Stay sharp');
});

test('claimsOutcome', () => {
  assert.equal(claimsOutcome('Hang on Cicada, I got him!'), false);
  assert.equal(claimsOutcome('Scratch one!'), true);
  assert.equal(claimsOutcome('Direct hit!'), true);
  assert.equal(claimsOutcome("You're finished, Cicada."), true);
  assert.equal(claimsOutcome("You're done for."), true);
  assert.equal(claimsOutcome('I killed it.'), true);
  assert.equal(claimsOutcome("He's down."), true);
  assert.equal(claimsOutcome('Let me see you dodge this.'), false);
});

test('isRepeat', () => {
  assert.equal(isRepeat('Look out, Cicada!', ['look out cicada']), true);
  assert.equal(isRepeat('Hold the line', ['Look out, Cicada!']), false);
  assert.equal(isRepeat('hold the line now', ['hold the line']), true);
  assert.equal(isRepeat('anything', []), false);
  assert.equal(isRepeat('a b c d e f', ['a b c x y z']), false);
});

test('shouldReact', () => {
  const t = (o) => ({ tokenUuid: 'u', name: 'N', hit: true, crit: false, damage: 1, maxHp: 10, destroyed: false, ...o });
  assert.equal(shouldReact({ status: 'pending', targets: [] }), false);
  assert.equal(shouldReact({ status: 'ambiguous', targets: [t()] }), false);
  assert.equal(shouldReact({ status: 'missed', targets: [t({ hit: false, damage: null })] }), true);
  assert.equal(shouldReact({ status: 'applied', targets: [t({ destroyed: true })] }), true);
  assert.equal(shouldReact({ status: 'applied', targets: [t({ crit: true })] }), true);
  assert.equal(shouldReact({ status: 'applied', targets: [t({ damage: 0 })] }), true);
  assert.equal(shouldReact({ status: 'applied', targets: [t({ damage: 2 })] }), false);
  assert.equal(shouldReact({ status: 'applied', targets: [t({ damage: 3 })] }), true);
  assert.equal(shouldReact({ status: 'applied', targets: [t({ damage: null })] }), false);
  assert.equal(shouldReact(null), false);
});
