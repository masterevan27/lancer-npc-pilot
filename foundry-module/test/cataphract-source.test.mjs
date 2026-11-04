import test from 'node:test';
import assert from 'node:assert/strict';
import { nativeFixture } from './helpers/native-policy-fixtures.mjs';
const mod=await import('../scripts/adapter/cataphract-source.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('source read hashes captured plain native records and never returns rules prose',async()=>{
 assert.equal(typeof mod.reviewCataphractSource,'function');const f=nativeFixture();
 const a=JSON.parse(f.board.stamp).tokens[0].actor;
 for(const item of a.items.filter(i=>i.type==='npc_feature'))Object.assign(item.system,{charged:true,destroyed:false,disabled:false});
 const r=await mod.reviewCataphractSource(a,'3.1.3',{crypto:f.crypto});
 assert.equal(r.readiness.trample.ready,true);assert.equal(r.readiness.impale.ready,true);assert.equal(r.readiness.shield.ready,true);
 assert(!JSON.stringify(r).includes('synthetic-'));
 a.items[2].system.effect='drift';const d=await mod.reviewCataphractSource(a,'3.1.3',{crypto:f.crypto});
 assert.equal(d.readiness.trample.ready,false);assert.equal(d.readiness.shield.ready,true);
 await assert.rejects(mod.reviewCataphractSource(a,'3.1.3',{crypto:{}}),/SHA|crypto/i);
});
