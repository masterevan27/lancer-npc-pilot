import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { shieldDamageSteps } from '../scripts/adapter/shield.mjs';
const adapter=await import('../scripts/adapter/native-damage.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('damage adapter delegates fixed damage to native calculation without writing HP itself',async()=>{
 assert.equal(typeof adapter.applyNativeDamage,'function');
 const calls=[],actor={id:'t',hasHeatcap:()=>true,system:{hp:{value:10},overshield:{value:0},heat:{value:0},burn:0},
  async damageCalc(d,options){calls.push({damage:{...d},options});d.Kinetic=2;this.system.hp.value-=2;return 2;}};
 const r=await adapter.applyNativeDamage(actor,{Kinetic:5},{game:{system:{version:'3.1.3'}},resistance:true});
 assert.equal(calls.length,1);assert.equal(calls[0].options.multiple,0.5);
 assert.equal(r.observed.hpDamage,2);assert.deepEqual(r.changes,[{path:['system','hp','value'],before:10,after:8}]);
 assert.equal(actor.system.hp.value,8);
 await assert.rejects(adapter.applyNativeDamage(actor,{Kinetic:'5'},{game:{system:{version:'3.1.3'}}}),/damage/i);
});
test('installed resistance applies after armor and does not stack existing resistance',{
 skip:!process.env.PILOT_LANCER_SYSTEM||typeof stripTypeScriptTypes!=='function',
},async()=>{
 assert.equal(typeof adapter.applyNativeDamage,'function');
 const root=process.env.PILOT_LANCER_SYSTEM,file=fs.readdirSync(root).find(f=>/^lancer-actor-.*\.mjs.map$/.test(f));
 const map=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
 const text=map.sourcesContent[map.sources.findIndex(p=>p.endsWith('/actor/lancer-actor.ts'))];
 const start=text.indexOf('  async damageCalc('),end=text.indexOf('\n  /* -------------------------------------------- */',start);
 const code=stripTypeScriptTypes(`({${text.slice(start,end)}})`);
 const native=vm.runInNewContext(code,{DamageType:Object.fromEntries(['Kinetic','Energy','Explosive','Burn','Heat','Variable'].map(x=>[x,x])),createChatMessageStep:async()=>{}}).damageCalc;
 for(const [armor,typed,shredded,paracausal,expected]of[[2,false,false,false,2],[2,true,false,false,2],[2,true,true,false,5],[2,false,false,true,5]]){
  const actor={id:'t',uuid:'a.t',system:{hp:{value:10},overshield:{value:0},heat:{value:0},burn:0,armor,statuses:{exposed:false,shredded},resistances:{kinetic:typed}},
   hasHeatcap:()=>true,damageCalc:native,async update(patch){for(const[p,v]of Object.entries(patch)){let a=this;const keys=p.split('.');for(const k of keys.slice(0,-1))a=a[k];a[keys.at(-1)]=v;}}};
  const r=await adapter.applyNativeDamage(actor,{Kinetic:5},{game:{system:{version:'3.1.3'}},resistance:true,paracausal});
  assert.equal(r.observed.hpDamage,expected);assert.equal(actor.system.hp.value,10-expected);
 }
 for(const [heatcap,multiple,addBurn,hp,heat,burn]of [[true,1,true,6,4,2],[true,1,false,6,4,0],
  [false,1,true,4,0,2],[true,0.5,true,6,2,2],[true,2,true,3,8,3]]){
  const actor={id:'t',uuid:'a.t',system:{hp:{value:10},overshield:{value:0},heat:{value:0},burn:0,armor:2,statuses:{exposed:false,shredded:false},resistances:{}},
   hasHeatcap:()=>heatcap,damageCalc:native,async update(patch){for(const[p,v]of Object.entries(patch)){let a=this;const keys=p.split('.');for(const k of keys.slice(0,-1))a=a[k];a[keys.at(-1)]=v;}}};
  const steps=shieldDamageSteps({damage:[{type:'Kinetic',amount:5},{type:'Heat',amount:4},{type:'Burn',amount:3}],ap:false,paracausal:false},
    {resistance:true,hasHeatcap:heatcap,multiple,addBurn});
  for(const step of steps)await adapter.applyNativeDamage(actor,step.damage,{...step,game:{system:{version:'3.1.3'}}});
  assert.equal(actor.system.hp.value,hp,`HP heatcap=${heatcap} multiplier=${multiple}`);
  assert.equal(actor.system.heat.value,heat);assert.equal(actor.system.burn,burn);
 }
});
