import test from 'node:test';
import assert from 'node:assert/strict';
import { createTurnRunner } from '../scripts/adapter/turn-runner.mjs';

const attackOption = {id: 'A', action: {kind: 'attack'}, move: null,
  facts: {targetName: 'Bob', weaponName: 'Rifle', hitChance: 0.5, critChance: 0.1, expectedDamage: 3, zeroHpChance: 0, targetHp: 5, targetHpMax: 10, distanceToTarget: 3}};
const moveOption = {id: 'M', action: {kind: 'boost'}, move: {to: {x: 1, y: 2}, cost: 2}, facts: {towardName: 'Bob', distanceBefore: 5, distanceAfter: 3}};
const mkReview = (opt, extra = {}) => ({state: 'ready', options: [opt], choice: {optionId: opt.id, source: 'model'}, ...extra});
const info = {name: 'Grunt', className: 'Striker', side: 'hostile', round: 2, portrait: 'p.png', speakerTokenId: 'T1', terrainReviewed: true, canExecute: true};
const wait = ms => new Promise(r => setTimeout(r, ms));

function rig(over = {}) {
  const calls = [];
  const banners = [];
  const d = {
    calls, banners,
    controller: {
      plan: async () => { calls.push('plan'); return over.review ?? mkReview(attackOption); },
      approve: async () => { calls.push('approve'); if (over.approvePending) await over.approvePending; if (over.approveThrows) throw new Error('boom'); return 'approveResult' in over ? over.approveResult : {status: 'handed-to-lancer'}; },
      cancel: () => calls.push('controller.cancel'),
    },
    banner: {show: v => { banners.push(v.kind); d.views.push(v); }, clear: () => banners.push('clear')}, views: [],
    actingMs: 5,
    observe: () => { calls.push('observe'); return {done: over.done ?? Promise.resolve({status: 'applied'}), dispose: () => calls.push('dispose')}; },
    endTurn: async () => { calls.push('endTurn'); },
    whisperGM: () => calls.push('whisper'),
    openReview: () => calls.push('openReview'),
    speakIntent: async () => { calls.push('speakIntent'); },
    speakReaction: () => { calls.push('speakReaction'); },
    readTurnInfo: () => ({...info}),
    log: t => calls.push('log:' + t),
  };
  return d;
}

test('attack path: plan, speakIntent, observe, approve, reaction, endTurn', async () => {
  const d = rig();
  const r = await createTurnRunner(d).run('k1');
  assert.equal(r, 'done');
  assert.deepEqual(d.calls.filter(c => !c.startsWith('dispose')), ['plan', 'speakIntent', 'observe', 'approve', 'speakReaction', 'endTurn']);
  assert.deepEqual(d.banners.slice(0, 2), ['thinking', 'acting']);
});

test('move-only path ends the turn without observing', async () => {
  const d = rig({review: mkReview(moveOption)});
  assert.equal(await createTurnRunner(d).run('k'), 'done');
  assert.ok(!d.calls.includes('observe'));
  assert.ok(!d.calls.includes('speakReaction'));
  assert.equal(d.calls.filter(c => c === 'endTurn').length, 1);
});

test('needs-input review holds, whispers, opens the dialog, never ends the turn', async () => {
  const d = rig({review: {state: 'needs-input', options: [], choice: {}}});
  assert.equal(await createTurnRunner(d).run('k'), 'held');
  for (const c of ['whisper', 'openReview']) assert.ok(d.calls.includes(c), c);
  assert.ok(!d.calls.includes('endTurn'));
  assert.ok(!d.calls.includes('approve'));
  assert.ok(d.banners.includes('held'));
});

test('approve throwing holds with the message', async () => {
  const d = rig({approveThrows: true});
  assert.equal(await createTurnRunner(d).run('k'), 'held');
  assert.ok(d.calls.includes('whisper'));
  assert.ok(!d.calls.includes('endTurn'));
  assert.ok(d.calls.includes('dispose'));
});

test('a false flow result holds', async () => {
  const d = rig({approveResult: false});
  assert.equal(await createTurnRunner(d).run('k'), 'held');
  assert.ok(!d.calls.includes('endTurn'));
});

test('ambiguous observation holds', async () => {
  const d = rig({done: Promise.resolve({status: 'ambiguous'})});
  assert.equal(await createTurnRunner(d).run('k'), 'held');
  assert.ok(!d.calls.includes('endTurn'));
  assert.ok(!d.calls.includes('speakReaction'));
});

test('missed outcome also triggers reaction and ends the turn', async () => {
  const d = rig({done: Promise.resolve({status: 'missed'})});
  assert.equal(await createTurnRunner(d).run('k'), 'done');
  assert.ok(d.calls.includes('speakReaction'));
});

test('fallback choice prefixes the summary and logs the error', async () => {
  const shown = [];
  const d = rig({review: mkReview(moveOption, {choice: {optionId: 'M', source: 'fallback', error: 'relay down'}})});
  d.banner.show = v => shown.push(v);
  await createTurnRunner(d).run('k');
  const acting = shown.find(v => v.kind === 'acting');
  assert.ok(acting.subtitle.startsWith('Fallback · '));
  assert.ok(d.calls.some(c => c.startsWith('log:') && c.includes('relay down')));
});

test('Review Focus 1: observer never completes, GM End turn ends exactly once and clears the banner', async () => {
  const d = rig({done: new Promise(() => {})});
  const runner = createTurnRunner(d);
  const p = runner.run('k');
  await wait(10);
  assert.ok(d.calls.includes('approve'));
  await runner.endTurnAnyway();
  assert.equal(await p, 'done');
  assert.equal(d.calls.filter(c => c === 'endTurn').length, 1);
  assert.equal(d.banners.at(-1), 'clear');
  assert.ok(d.calls.includes('dispose'));
});

test('Review Focus 1b: End turn after a hold ends once', async () => {
  const d = rig({approveResult: false});
  const runner = createTurnRunner(d);
  await runner.run('k');
  await runner.endTurnAnyway();
  assert.equal(d.calls.filter(c => c === 'endTurn').length, 1);
  assert.equal(d.banners.at(-1), 'clear');
});

test('Review Focus 2: cancel during plan never approves, clears banner, returns cancelled', async () => {
  let release;
  const d = rig();
  d.controller.plan = () => new Promise(res => { release = () => res(mkReview(attackOption)); });
  const runner = createTurnRunner(d);
  const p = runner.run('k');
  await wait(5);
  runner.cancel();
  release();
  assert.equal(await p, 'cancelled');
  assert.ok(!d.calls.includes('approve'));
  assert.ok(!d.calls.includes('endTurn'));
  assert.ok(d.calls.includes('controller.cancel'));
  assert.equal(d.banners.at(-1), 'clear');
});

test('cancel while waiting for the observer does not end the turn', async () => {
  const d = rig({done: new Promise(() => {})});
  const runner = createTurnRunner(d);
  const p = runner.run('k');
  await wait(10);
  runner.cancel();
  assert.equal(await p, 'cancelled');
  assert.ok(!d.calls.includes('endTurn'));
  assert.ok(d.calls.includes('dispose'));
});

test('a second run cancels the earlier one', async () => {
  const releases = [];
  const d = rig();
  d.controller.plan = () => new Promise(res => { releases.push(() => res(mkReview(moveOption))); });
  const runner = createTurnRunner(d);
  const p1 = runner.run('a');
  await wait(5);
  const p2 = runner.run('b');
  await wait(5);
  releases.forEach(r => r());
  assert.equal(await p1, 'cancelled');
  assert.equal(await p2, 'done');
  assert.equal(d.calls.filter(c => c === 'approve').length, 1);
  assert.equal(d.calls.filter(c => c === 'endTurn').length, 1);
});

test('plan throwing holds without ending the turn', async () => {
  const d = rig();
  d.controller.plan = async () => { throw new Error('nope'); };
  assert.equal(await createTurnRunner(d).run('k'), 'held');
  assert.ok(!d.calls.includes('endTurn'));
});

test('endTurnAnyway after cancel does not end the turn', async () => {
  const d = rig({review: mkReview(moveOption)});
  const runner = createTurnRunner(d);
  await runner.run('k');
  const e = rig();
  const d2 = rig({done: new Promise(() => {})});
  const r2 = createTurnRunner(d2);
  const p = r2.run('k');
  await wait(10);
  r2.cancel();
  await p;
  await r2.endTurnAnyway();
  assert.ok(!d2.calls.includes('endTurn'));
});

test('endTurn rejecting whispers the original error without an invalid transition', async () => {
  const d = rig({review: mkReview(moveOption)});
  const whispers = [];
  d.whisperGM = t => whispers.push(t);
  d.endTurn = async () => { throw new Error('advance failed'); };
  const r = await createTurnRunner(d).run('k');
  assert.equal(r, 'held');
  assert.equal(whispers.length, 1);
  assert.match(whispers[0], /advance failed/);
  assert.ok(!whispers[0].includes('Invalid turn transition'));
});

test('waiting banner with End turn is shown while the attack awaits resolution, and End turn ends once', async () => {
  const d = rig({done: new Promise(() => {})});
  const runner = createTurnRunner(d);
  const p = runner.run('k');
  await wait(40);
  const last = d.views.at(-1);
  assert.equal(last.kind, 'waiting');
  assert.equal(last.showEndTurn, true);
  assert.equal(last.autoHideMs, null);
  await runner.endTurnAnyway();
  assert.equal(await p, 'done');
  assert.equal(d.calls.filter(c => c === 'endTurn').length, 1);
  assert.equal(d.banners.at(-1), 'clear');
});

test('no waiting banner appears once the outcome resolves quickly', async () => {
  const d = rig();
  const runner = createTurnRunner(d);
  assert.equal(await runner.run('k'), 'done');
  await wait(20);
  assert.ok(!d.banners.includes('waiting'));
});

test('waiting banner with End turn appears while approve() still awaits the native HUD (final review 6)', async () => {
  let release; const approvePending = new Promise(r => { release = r; });
  const d = rig({approvePending, done: new Promise(() => {})});
  const runner = createTurnRunner(d);
  const p = runner.run('k');
  await wait(40);
  assert.deepEqual(d.banners.filter(b => b !== 'clear').slice(0, 3), ['thinking', 'acting', 'waiting']);
  release(); await wait(10);
  await runner.endTurnAnyway(); await p;
  assert.equal(d.banners.filter(b => b === 'waiting').length, 1, 'the waiting banner is not shown twice');
});

test('an attack-cancelled hand-off holds the turn instead of completing it (final review 6)', async () => {
  const d = rig({approveResult: {status: 'attack-cancelled'}});
  assert.equal(await createTurnRunner(d).run('k'), 'held');
  assert.ok(d.calls.includes('whisper'));
  assert.ok(d.banners.includes('held'));
  assert.ok(!d.calls.includes('endTurn'));
  assert.ok(!d.calls.includes('speakReaction'));
  assert.ok(d.calls.includes('dispose'));
});

test('cancel and End turn anyway cancel pending banter; a naturally ended turn keeps its reaction (final review 8)', async () => {
  const d1 = rig({done: new Promise(() => {})}); d1.cancelBanter = () => d1.calls.push('cancelBanter');
  const r1 = createTurnRunner(d1); const p1 = r1.run('k'); await wait(20);
  r1.cancel(); await p1;
  assert.ok(d1.calls.includes('cancelBanter'), 'cancel');
  const d2 = rig({done: new Promise(() => {})}); d2.cancelBanter = () => d2.calls.push('cancelBanter');
  const r2 = createTurnRunner(d2); const p2 = r2.run('k'); await wait(20);
  await r2.endTurnAnyway(); await p2;
  assert.ok(d2.calls.includes('cancelBanter'), 'endTurnAnyway');
  const d3 = rig(); d3.cancelBanter = () => d3.calls.push('cancelBanter');
  const r3 = createTurnRunner(d3);
  assert.equal(await r3.run('k'), 'done');
  r3.cancel(); // the next combatant's turn start invalidates the finished turn
  assert.ok(!d3.calls.includes('cancelBanter'), 'the finished turn reaction is not swallowed');
});
