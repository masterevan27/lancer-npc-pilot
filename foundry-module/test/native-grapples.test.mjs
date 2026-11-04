import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../scripts/adapter/grapples.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function actor(){let effects=[{_id:'other',name:'External Immobilized',statuses:['immobilized'],flags:{other:{kept:true}}}];return {
 id:'a',toObject:()=>({effects:structuredClone(effects)}),
 async createEmbeddedDocuments(type,records){assert.equal(type,'ActiveEffect');const added=records.map((r,i)=>({...structuredClone(r),_id:`own${i}`}));effects.push(...added);return added.map(r=>({toObject:()=>structuredClone(r)}));},
 async deleteEmbeddedDocuments(type,ids){assert.equal(type,'ActiveEffect');const removed=effects.filter(e=>ids.includes(e._id));effects=effects.filter(e=>!ids.includes(e._id));return removed.map(r=>({toObject:()=>structuredClone(r)}));}
 ,async updateEmbeddedDocuments(type,updates){assert.equal(type,'ActiveEffect');return updates.map(u=>{const e=effects.find(e=>e._id===u._id);Object.assign(e,structuredClone(u));return {toObject:()=>structuredClone(e)};});}
};}
const link={id:'g',sourceTokenId:'source',targetTokenId:'target',sourceActorId:'a',targetActorId:'b',controllerTokenId:'source'};
test('native optional duration fields normalize to the same JSON source as execution snapshots',async()=>{
 const a=actor(),create=a.createEmbeddedDocuments;
 a.createEmbeddedDocuments=(type,records)=>create(type,records.map(r=>({...r,
  duration:{seconds:undefined,rounds:undefined,turns:undefined,startRound:1,startTurn:1}})));
 const receipt=await mod.createNativeGrappleEffect(a,link,'source');
 assert.equal(receipt.status,'completed');
 assert.deepEqual(receipt.changes[0].after[1].duration,{startRound:1,startTurn:1});
 await mod.updateNativeGrappleEffect(a,{...link,controllerTokenId:'target'},'source');
 await mod.removeNativeGrappleEffects(a,'g');
 assert.equal(a.toObject().effects.length,1);
});
test('Pilot creates native owned grapple effects and removes only its own relation',async()=>{
 assert.equal(typeof mod.createNativeGrappleEffect,'function');const a=actor();
 const r=await mod.createNativeGrappleEffect(a,link,'source');
 assert.equal(r.status,'completed');const data=a.toObject().effects[1];
 assert.equal(data.flags['lancer-npc-pilot'].grapple.id,'g');assert(data.statuses.includes('engaged'));
 assert(!data.statuses.includes('immobilized'));assert(data.changes.some(c=>c.key==='system.action_tracker.reaction'&&c.value==='false'));
 await assert.rejects(mod.createNativeGrappleEffect(a,link,'source'),/already|existing/i);
 const removed=await mod.removeNativeGrappleEffects(a,'g');assert.equal(removed.status,'completed');
 assert.deepEqual(a.toObject().effects,[{_id:'other',name:'External Immobilized',statuses:['immobilized'],flags:{other:{kept:true}}}]);
});
test('controlled target gets native immobilization and cannot use another actor identity',async()=>{
 assert.equal(typeof mod.createNativeGrappleEffect,'function');const a=actor();a.id='b';
 await mod.createNativeGrappleEffect(a,link,'target');assert(a.toObject().effects[1].statuses.includes('immobilized'));
 const b=actor();await assert.rejects(mod.createNativeGrappleEffect(b,link,'target'),/identity/i);
});

test('native hooks cannot disable or rebind an effect while reporting a completed grapple',async()=>{
 for(const edit of [r=>({...r,disabled:true}),r=>({...r,flags:{'lancer-npc-pilot':{grapple:{...r.flags['lancer-npc-pilot'].grapple,targetTokenId:'different'}}}})]){
  const a=actor(),create=a.createEmbeddedDocuments;
  a.createEmbeddedDocuments=(type,records)=>create(type,records.map(edit));
  await assert.rejects(mod.createNativeGrappleEffect(a,link,'source'),/changed|unconfirmed/i);
 }
});

test('confirmed control changes update only the owned grapple effect and preserve unrelated immobilization',async()=>{
 assert.equal(typeof mod.updateNativeGrappleEffect,'function');const a=actor();await mod.createNativeGrappleEffect(a,link,'source');
 await mod.updateNativeGrappleEffect(a,{...link,controllerTokenId:'target'},'source');
 assert(a.toObject().effects[1].statuses.includes('immobilized'));
 assert.equal(a.toObject().effects[0]._id,'other');
});

test('unchanged native grapple control completes without a no-op embedded-document update',async()=>{
 const a=actor();await mod.createNativeGrappleEffect(a,link,'source');let calls=0;
 a.updateEmbeddedDocuments=async()=>{calls++;return [];};
 const before=structuredClone(a.toObject());
 const r=await mod.updateNativeGrappleEffect(a,link,'source');
 assert.equal(r.status,'completed');assert.equal(calls,0);assert.deepEqual(r.changes,[]);assert.deepEqual(a.toObject(),before);
});
