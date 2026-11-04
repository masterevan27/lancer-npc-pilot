import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../scripts/adapter/trample-history.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function fixture(){const data={};const actor={getFlag:(_m,k)=>data[k],setFlag:async(_m,k,v)=>{data[k]=structuredClone(v);}};return {data,actor};}
test('only an observed new native turn initializes Trample history; ready/reload cannot manufacture unused damage',async()=>{
 assert.equal(typeof mod.initializeTrampleTurn,'function');const f=fixture();
 assert.equal(mod.trampleHistory(f.actor,'turn-1').known,false);
 await mod.initializeTrampleTurn(f.actor,'turn-1',{nativeTurnEvent:true});
 assert.deepEqual(mod.trampleHistory(f.actor,'turn-1').targets,[]);
 await mod.claimTrampleTarget(f.actor,'turn-1','a');
 await mod.initializeTrampleTurn(f.actor,'turn-1',{nativeTurnEvent:true});
 assert.deepEqual(mod.trampleHistory(f.actor,'turn-1').targets,['a']);
 await assert.rejects(mod.initializeTrampleTurn(f.actor,'turn-2'),/native turn/i);
 assert.equal(mod.trampleHistory(f.actor,'turn-2').known,false);
 await mod.initializeTrampleTurn(f.actor,'turn-2',{nativeTurnEvent:true});assert.deepEqual(mod.trampleHistory(f.actor,'turn-2').targets,[]);
});
test('claims persist before damage, refuse duplicates, and manual/uncertain movement invalidates history',async()=>{
 assert.equal(typeof mod.initializeTrampleTurn,'function');const f=fixture();
 await mod.initializeTrampleTurn(f.actor,'t',{nativeTurnEvent:true});
 await mod.claimTrampleTarget(f.actor,'t','a');await assert.rejects(mod.claimTrampleTarget(f.actor,'t','a'),/claimed/i);
 await mod.invalidateTrampleHistory(f.actor,'t');assert.equal(mod.trampleHistory(f.actor,'t').known,false);
 assert.deepEqual(mod.trampleHistory(f.actor,'t').targets,['a']);
 await assert.rejects(mod.claimTrampleTarget(f.actor,'t','b'),/history/i);
});
