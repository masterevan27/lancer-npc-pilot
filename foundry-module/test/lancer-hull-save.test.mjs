import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { prepareHullSave } from '../scripts/adapter/native-flows.mjs';

test('installed Lancer native Hull initialization/HUD/roll/cancellation remain authoritative',{
 skip:!process.env.PILOT_LANCER_SYSTEM||typeof stripTypeScriptTypes!=='function',
},async()=>{
 const dir=process.env.PILOT_LANCER_SYSTEM;
 const file=fs.readdirSync(dir).find(f=>/^lancer-actor-.*\.mjs.map$/.test(f));
 const map=JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
 const source=name=>{
  const index=map.sources.findIndex(p=>p.endsWith(`/flows/${name}.ts`));assert(index>=0);
  return stripTypeScriptTypes(map.sourcesContent[index].replace(/^import[\s\S]*?;\r?\n/gm,'').replace(/\bexport /g,''));
 };
 for(const cancel of [false,true]){
  const hud=[],rolls=[];
  class LancerActor{constructor(){this.id='t';this.system={hull:3};}}
  class LancerItem{}
  class NativeRoll{constructor(formula){rolls.push(formula);}async evaluate(){this.total=9;return this;}async getTooltip(){return 'synthetic conformance roll';}toJSON(){return {evaluated:true,total:this.total};}}
  const game={system:{id:'lancer',version:'3.1.3'},lancer:{flows:new Map(),flowSteps:new Map()}};
  const ctx={LancerActor,LancerItem,game,Roll:NativeRoll,Hooks:{callAll(){}},LANCER:{log_prefix:'test'},console:{log(){}},
   resolveDotpath:(a,p)=>p.split('.').reduce((a,k)=>a[k],a),
   AccDiffHudData:{fromParams:()=>({base:{accuracy:1,difficulty:2,get total(){return this.accuracy-this.difficulty;}}})},
   openSlidingHud:async (kind,data)=>{hud.push({kind,difficulty:data.base.difficulty});if(cancel)throw Error('cancel');return data;},
   renderTemplateStep:async()=>{}};
  const exports=vm.runInNewContext(`const Flow=(()=>{${source('flow')}\nreturn Flow;})();\n(()=>{${source('stat')}\nreturn {StatRollFlow,registerStatSteps};})();`,ctx);
  exports.registerStatSteps(game.lancer.flowSteps);game.lancer.flows.set('StatRollFlow',exports.StatRollFlow);
  const receipt=await prepareHullSave(new LancerActor(),12,game).resolve();
  assert.deepEqual(hud,[{kind:'hase',difficulty:3}]);
  assert.equal(receipt.status,cancel?'cancelled':'completed');
  assert.equal(rolls.length,cancel?0:1);
  if(!cancel){assert.equal(receipt.observed.total,9);assert.equal(receipt.observed.success,false);assert.equal(rolls[0],'1d20+3 + -2d6kh1');}
 }
});
