import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldAutoRun, nextAutoStep, TurnLifecycle } from '../scripts/core/auto-mode.mjs';

test('auto runs only when every gate is open', () => {
  const ok = {autoMode:true,executionEnabled:true,isResponsibleGM:true,actorOptOut:false,isNpc:true,side:'hostile'};
  assert.equal(shouldAutoRun(ok).auto, true);
  assert.equal(shouldAutoRun({...ok,side:'friendly'}).auto, true);
  for (const k of ['autoMode','executionEnabled','isResponsibleGM','isNpc']) {
    const r = shouldAutoRun({...ok,[k]:false});
    assert.equal(r.auto, false, k);
    assert.ok(r.reason.length > 0, k);
  }
  assert.equal(shouldAutoRun({...ok,actorOptOut:true}).auto, false);
  assert.equal(shouldAutoRun({...ok,side:'neutral'}).auto, false);
});

test('nextAutoStep executes only a ready review with a chosen option', () => {
  const r = {state:'ready',options:[{id:'A'}],choice:{optionId:'A'}};
  const g = {canExecute:true,terrainReviewed:true};
  assert.deepEqual(nextAutoStep(r,g), {action:'execute',optionId:'A'});
  assert.equal(nextAutoStep({...r,state:'partial'},g).action,'execute');
  assert.equal(nextAutoStep({...r,state:'needs-input'},g).action,'review');
  assert.equal(nextAutoStep({...r,choice:{optionId:null}},g).action,'review');
  assert.equal(nextAutoStep({...r,choice:{optionId:'Z'}},g).action,'review');
  assert.equal(nextAutoStep({...r,choice:undefined},g).action,'review');
  assert.equal(nextAutoStep({...r,options:[]},g).action,'review');
  assert.equal(nextAutoStep(null,g).action,'review');
  assert.equal(nextAutoStep(r,{canExecute:false,terrainReviewed:true}).action,'review');
  assert.equal(nextAutoStep(r,{canExecute:true,terrainReviewed:false}).action,'review');
  assert.ok(nextAutoStep({...r,state:'needs-input'},g).why.length > 0);
});

test('lifecycle: attack turn waits for resolution; move-only turn finishes at hand-off', () => {
  const l = new TurnLifecycle();
  l.start('t1'); l.decided();
  assert.equal(l.handedOff({expectsAttack:true}), 'awaiting-resolution');
  assert.equal(l.resolved(), 'done');
  l.start('t2'); l.decided();
  assert.equal(l.handedOff({expectsAttack:false}), 'done');
  l.start('t3'); assert.throws(() => l.resolved(), /Invalid turn transition: thinking -> done/);
  l.start('t4'); l.decided(); l.handedOff({expectsAttack:true});
  assert.equal(l.hold('cancelled flow'), 'held'); assert.equal(l.forceEnd(), 'done');
  l.start('t5'); assert.equal(l.cancel(), 'cancelled');
  assert.equal(l.turnKey, 't5');
});

test('lifecycle: illegal moves throw and start resets from any state', () => {
  const l = new TurnLifecycle();
  assert.equal(l.state, 'idle');
  assert.throws(() => l.decided(), /Invalid turn transition: idle -> acting/);
  l.start('a'); l.cancel();
  assert.throws(() => l.hold('x'), /Invalid turn transition: cancelled -> held/);
  assert.equal(l.start('b'), 'thinking');
  assert.equal(l.turnKey, 'b');
});
