import test from 'node:test';
import assert from 'node:assert/strict';
import { environment } from './adapter.test.mjs';
const mod=await import('../scripts/adapter/execution-state.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('execution state retains every actor and coordinate while excluding only known bookkeeping',()=>{
 assert.equal(typeof mod.captureExecutionState,'function');
 const f=environment(),active=f.canvas.tokens.placeables[0];
 const baseline=mod.captureExecutionState(f);
 active.document.x+=100;assert.notDeepEqual(mod.captureExecutionState(f),baseline);active.document.x-=100;
 f.canvas.tokens.placeables[1].actor.system.hp.value--;assert.notDeepEqual(mod.captureExecutionState(f),baseline);
 f.canvas.tokens.placeables[1].actor.system.hp.value++;
 active.actor.flags['lancer-npc-pilot']={executionSession:{step:'pending'},lastExecution:'t',trampleLedger:{turn:'t',targets:[]}};
 assert.deepEqual(mod.captureExecutionState(f),baseline);
 active.actor.flags['lancer-npc-pilot'].policyBinding={policyId:'other'};
 assert.notDeepEqual(mod.captureExecutionState(f),baseline);
});
