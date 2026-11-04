import test from 'node:test';
import assert from 'node:assert/strict';
const rules=await import('../scripts/rules/cataphract.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const core=await import('../scripts/core/cataphract.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
import { NPC_POLICIES } from '../scripts/rules/npc-policies.mjs';

const actor=()=>({tier:1,classIds:['npcc_cataphract'],templateIds:[],features:NPC_POLICIES['cataphract-base-t1'].requirements.map((r,i)=>({...r,itemId:`i${i}`,charged:true,destroyed:false,disabled:false}))});
test('native NPC features omit the optional disabled extension without requiring Lancer Automations',()=>{
 for(const value of [undefined,null,false]){
  const a=actor();for(const f of a.features)f.disabled=value;
  const result=rules.cataphractReadiness(a,'3.1.3');
  for(const feature of ['trample','impale','shield'])assert.equal(result[feature].ready,true);
 }
 for(const value of [true,'false',0,{},[]]){
  const a=actor();for(const f of a.features)f.disabled=value;
  const result=rules.cataphractReadiness(a,'3.1.3');
  for(const feature of ['trample','impale','shield'])assert.equal(result[feature].ready,false);
 }
});
test('T1 source readiness is exact, unique and does not recharge or grant execution',()=>{
 assert.equal(typeof rules.cataphractReadiness,'function');
 const a=actor(),copy=structuredClone(a),r=rules.cataphractReadiness(a,'3.1.3');
 assert.equal(r.trample.ready,true);assert.equal(r.impale.ready,true);assert.equal(r.shield.ready,true);
 a.features[2].charged=false;assert.equal(rules.cataphractReadiness(a,'3.1.3').impale.ready,false);
 assert.equal(rules.cataphractReadiness(a,'3.1.3').trample.ready,true);
 assert.deepEqual(copy,actor());
 for(const edit of [a=>a.tier=2,a=>a.templateIds=['template'],a=>a.classIds.push('second'),a=>a.features.push({...a.features[1]})]){
  const x=actor();edit(x);assert.equal(rules.cataphractReadiness(x,'3.1.3').trample.ready,false);
 }
 for(const edit of [f=>f.sourceFingerprint='changed',f=>f.sourceVersion='3.1.2',f=>f.destroyed=true,f=>f.disabled=true]){
  const x=actor();edit(x.features[1]);assert.equal(rules.cataphractReadiness(x,'3.1.3').trample.ready,false);
  assert.equal(rules.cataphractReadiness(x,'3.1.3').shield.ready,true);
 }
 assert.equal(rules.cataphractReadiness(actor(),'3.2.0').trample.ready,false);
});
const scene=()=>({activeTokenId:'m',grid:{type:'square',width:10,height:4},tokens:[
 {id:'m',pos:{x:0,y:1},size:1,side:'hostile'},
 {id:'a',pos:{x:2,y:1},size:1,side:'friendly'},
 {id:'b',pos:{x:4,y:1},size:1,side:'neutral'},
 {id:'c',pos:{x:5,y:1},size:1,side:'hostile'}]});
test('Trample counts every crossed character once per turn across segments, including allies',()=>{
 assert.equal(typeof core.trampleContacts,'function');
 const snap=scene(),path=[0,1,2,3,4,5,6].map(x=>({x,y:1}));
 const contacts=core.trampleContacts(snap,path);
 assert.deepEqual(contacts.map(c=>[c.tokenId,c.pathIndex]),[['a',2],['b',4],['c',5]]);
 assert.deepEqual(core.trampleDamageDue(contacts,{turn:'t',targets:['a']},'t').map(c=>c.tokenId),['b','c']);
 assert.throws(()=>core.trampleDamageDue(contacts,{turn:'old',targets:['a']},'t'),/turn/i);
 assert.throws(()=>core.trampleDamageDue(contacts,null,'t'),/ledger/i);
 assert.throws(()=>core.trampleContacts(snap,[{x:0,y:1},{x:5,y:1}]),/route/i);
 snap.tokens[1].size=2;
 assert.equal(core.trampleContacts(snap,path).filter(c=>c.tokenId==='a').length,1);
 snap.tokens[1].occupiedCells={};
 assert.throws(()=>core.trampleContacts(snap,path),/footprint/i);
});
test('shield uses complete body distances and unique closest hostile identity without inventing usefulness',()=>{
 assert.equal(typeof core.shieldSource,'function');
 const snap=scene();
 assert.equal(core.shieldSource(snap,'m').closestHostileTokenId,'a');
 snap.tokens.push({id:'tie',pos:{x:0,y:3},size:1,side:'friendly'});
 assert.equal(core.shieldSource(snap,'m').closestHostileTokenId,null);
 assert.equal(core.shieldSource(snap,'m').knowledge,'known');
 snap.tokens.at(-1).defeated=true;
 assert.equal(core.shieldSource(snap,'m').closestHostileTokenId,'a');
 assert.equal(core.shieldSource(snap,'m',{x:5,y:3}).closestHostileTokenId,'a');
 snap.tokens[1].occupiedCells={};
 assert.equal(core.shieldSource(snap,'m').knowledge,'unknown');
});

test('Shield does not silently omit a zero-HP hostile awaiting native structure resolution',()=>{
 const snap=scene();snap.tokens[1].hp=[0,10];snap.tokens[1].structure=[2,4];
 assert.equal(core.shieldSource(snap,'m').knowledge,'unknown');
 snap.tokens[1].structure=[0,4];assert.equal(core.shieldSource(snap,'m').knowledge,'known');
});
