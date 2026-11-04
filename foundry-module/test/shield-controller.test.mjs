import test from 'node:test';
import assert from 'node:assert/strict';
import { grappleEnvironment } from './helpers/grapple-fixture.mjs';
import { nativeFixture } from './helpers/native-policy-fixtures.mjs';
const mod=await import('../scripts/adapter/shield-controller.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function fixture(){
 const f=grappleEnvironment(),n=nativeFixture(),source=f.canvas.tokens.get('npc'),target=f.canvas.tokens.get('pc');
 const extra=grappleEnvironment().canvas.tokens.get('npc');extra.id='other';extra.document.x=600;extra.actor.id='other-actor';extra.actor.uuid='Actor.other-actor';extra.actor._source._id=extra.actor.id;
 f.canvas.tokens.placeables.push(extra);
 const a=JSON.parse(n.board.stamp).tokens[0].actor;target.actor._source.items=a.items;
 for(const item of target.actor._source.items.filter(i=>i.type==='npc_feature'))Object.assign(item.system,{charged:true,destroyed:false,disabled:false});
 target.actor._source.system.heat={value:0,max:10};target.actor.hasHeatcap=()=>true;
 f.calls=[];target.actor.damageCalc=async(d,opts)=>{f.calls.push(opts);for(const k of Object.keys(d))d[k]=Math.ceil(d[k]*(opts.multiple===0.5?0.5:1));
  const harm=d.Kinetic+d.Burn;target.actor._source.system.hp.value-=harm;target.actor._source.system.heat.value+=d.Heat;
  if(opts.addBurn)target.actor._source.system.burn+=d.Burn;return harm;};
 const flags={lancer:{damageData:{targetDamageResults:[{target:target.document.uuid,damage:[{type:'Kinetic',amount:5},{type:'Heat',amount:4}],ap:false,paracausal:false}]}}};
 const message={id:'card',speaker:{scene:f.canvas.scene.id,token:source.id,actor:source.actor.id},flags,
  getFlag:(ns,k)=>flags[ns]?.[k],async setFlag(ns,k,v){(flags[ns]??={})[k]=structuredClone(v);return this;}};
 f.game.messages=new Map([['card',message]]);f.crypto=n.crypto;f.enabled=true;f.canExecute=()=>f.enabled;
 return Object.assign(f,{message,source,target});
}
test('a fresh native card applies source-specific Shield resistance after GM approval and preserves Heat',async()=>{
 assert.equal(typeof mod.createShieldController,'function');const f=fixture(),api=mod.createShieldController(f);
 // Native ChatMessage speaker data includes an unset optional alias field.
 f.message.speaker.alias=undefined;
 // Lancer 3.1.3's native createChatMessageStep omits speaker.scene.
 f.message.speaker.scene=null;
 await f.hooks.get('createChatMessage')(f.message);
 const r=await api.apply('card',f.target.document.uuid,{multiple:1,addBurn:true});
 assert.equal(r.status,'completed');assert.equal(f.target.actor.system.hp.value,7);assert.equal(f.target.actor.system.heat.value,4);
 assert.deepEqual(f.calls.map(c=>c.multiple),[0.5,1]);
 await assert.rejects(api.apply('card',f.target.document.uuid,{multiple:1,addBurn:true}),/already|claimed|changed/);
});
test('reload, ambiguous source, stale source position, cancelled approval and disabled execution cannot apply Shield damage',async()=>{
 assert.equal(typeof mod.createShieldController,'function');
 for(const scenario of ['reload','source','foreign-scene','stale','cancel','disabled']){
  const f=fixture(),api=mod.createShieldController(f);
  if(scenario!=='reload')await f.hooks.get('createChatMessage')(f.message);
  if(scenario==='source')delete f.message.speaker.token;
  if(scenario==='foreign-scene')f.message.speaker.scene='another-scene';
  if(scenario==='stale')f.source.document.x=500;
  if(scenario==='cancel')f.choice=false;
  if(scenario==='disabled')f.enabled=false;
  if(scenario==='cancel')assert.equal((await api.apply('card',f.target.document.uuid,{multiple:1,addBurn:true})).status,'cancelled');
  else await assert.rejects(api.apply('card',f.target.document.uuid,{multiple:1,addBurn:true}),/fresh|source|changed|disabled/);
  assert.equal(f.calls.length,0);
 }
});

test('native Actor.toObject migration shims stay outside the strict Shield rule-source review',async()=>{
 const f=fixture(),toObject=f.target.actor.toObject;let reads=0;
 f.target.actor.toObject=()=>{const a=toObject();Object.defineProperty(a.flags,'exportSource',{
  enumerable:false,configurable:true,get(){reads++;throw Error('Deprecated Foundry shim must not be read');}});return a;};
 const api=mod.createShieldController(f);await f.hooks.get('createChatMessage')(f.message);
 const receipt=await api.apply('card',f.target.document.uuid);
 assert.equal(receipt.status,'completed');assert.equal(reads,0);
 assert.deepEqual(f.calls.map(c=>c.multiple),[0.5,1]);
});

test('installed Foundry v13 exportSource shim reproduces the raw source rejection without invoking its getter',{
 skip:!process.env.PILOT_FOUNDRY_CODE,
},async()=>{
 const {pathToFileURL}=await import('node:url'),{resolve}=await import('node:path');
 const {DocumentStatsField}=await import(pathToFileURL(resolve(process.env.PILOT_FOUNDRY_CODE,'common/data/fields.mjs')).href);
 const {inertData}=await import('../scripts/core/policy-data.mjs');
 const f=fixture(),toObject=f.target.actor.toObject;let reads=0;
 f.target.actor.toObject=()=>{const a=toObject();DocumentStatsField._shimData({_logDataFieldMigration(){reads++;throw Error('Deprecated shim invoked');}},a);return a;};
 const raw=f.target.actor.toObject(),descriptor=Object.getOwnPropertyDescriptor(raw.flags,'exportSource');
 assert.equal(descriptor.enumerable,false);assert.equal(typeof descriptor.get,'function');
 assert.equal(inertData(raw,{allowUndefined:true}),false);
 const api=mod.createShieldController(f);await f.hooks.get('createChatMessage')(f.message);
 assert.equal((await api.apply('card',f.target.document.uuid)).status,'completed');assert.equal(reads,0);
});

test('Automations damage coexistence refuses before claims, costs or partial Shield damage',async()=>{
 const f=fixture();f.game.modules=new Map([['lancer-automations',{active:true}]]);
 const api=mod.createShieldController(f);await f.hooks.get('createChatMessage')(f.message);
 const before=JSON.stringify([f.target.actor.toObject(),f.message.flags]);
 await assert.rejects(api.apply('card',f.target.document.uuid),/Automations.*manual/i);
 assert.equal(f.calls.length,0);assert.equal(JSON.stringify([f.target.actor.toObject(),f.message.flags]),before);
});
