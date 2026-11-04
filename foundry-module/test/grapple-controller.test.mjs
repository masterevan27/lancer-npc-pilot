import test from 'node:test';
import assert from 'node:assert/strict';
import { grappleEnvironment } from './helpers/grapple-fixture.mjs';
import { createNativeGrappleEffect } from '../scripts/adapter/grapples.mjs';
import { readActionBudget } from '../scripts/adapter/budgets.mjs';
const mod=await import('../scripts/adapter/grapple-controller.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
async function linked(){const f=grappleEnvironment();await f.canvas.scene.setFlag('lancer-npc-pilot','grapples',[f.link]);
 for(const t of f.canvas.tokens.placeables)await createNativeGrappleEffect(t.actor,f.link,t.id);return f;}
function hullFlows(f,totals,{cancelAt=-1,edit=()=>{}}={}){
 let index=0;const steps={initStatRollData:async s=>{s.data.acc_diff={base:{difficulty:0}};return true;},
 showStatRollHUD:async s=>{edit(s);return index!==cancelAt;},
 rollCheck:async s=>{const total=totals[index++];s.data.result={roll:{total,toJSON:()=>({evaluated:true})}};return true;},printStatRollCard:async()=>true};
 class Flow{static steps=Object.keys(steps);constructor(actor,data){this.state={actor,item:null,data};}getStep(n){return steps[n];}
 async begin(){for(const n of Flow.steps)if(await this.getStep(n)(this.state)===false)return false;return true;}}
 f.game.lancer={flows:new Map([['StatRollFlow',Flow]])};return f;
}

test('both owned grapple participants lose Boost and reactions without losing available quick actions',async()=>{
 const f=await linked();for(const t of f.canvas.tokens.placeables){const b=readActionBudget(t.actor);
 assert.ok(b.blocked.includes('boost'));assert.ok(b.blocked.includes('reaction'));assert.ok(!b.blocked.includes('quick'));}
});

test('defender escape spends one quick action before native opposed checks and releases only on its actual win',async()=>{
 const f=hullFlows(await linked(),[4,15]);f.game.combat.combatant.tokenId='pc';
 const api=mod.createGrappleController(f),actor=f.canvas.tokens.get('pc').actor;
 const r=await api.breakFree('g');assert.equal(r.status,'completed');
 assert.equal(actor.system.action_tracker.full,false);assert.equal(actor.system.action_tracker.quick,true);
 assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
});

test('cancelled escape retains reservation and grapple; no native result is guessed',async()=>{
 for(const opts of [{cancelAt:0}]){
 const f=hullFlows(await linked(),[8,8],opts);f.game.combat.combatant.tokenId='pc';const api=mod.createGrappleController(f);
 const r=await api.breakFree('g');assert.equal(r.status,'cancelled');
 assert.equal(f.canvas.tokens.get('pc').actor.system.action_tracker.full,false);
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples').length,1);
 await assert.rejects(api.breakFree('g'),/already|reserved|attempt/);
 }
});

test('Core Book p13 contested ties go to the actual initiator: the escaping defender wins its tied check',async()=>{
 const f=hullFlows(await linked(),[8,8]);f.game.combat.combatant.tokenId='pc';const api=mod.createGrappleController(f);
 const r=await api.breakFree('g');assert.equal(r.status,'completed');
 assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
});

test('same-size control contest needs an observed start window and changes only owned effects on native win',async()=>{
 const f=hullFlows(await linked(),[3,17]);for(const t of f.canvas.tokens.placeables)t.actor._source.system.size=1;
 const api=mod.createGrappleController(f);await assert.rejects(api.contest('g'),/start|window/);
 await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
 const r=await api.contest('g');assert.equal(r.status,'completed');
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples')[0].controllerTokenId,'pc');
 assert.ok(f.canvas.tokens.get('npc').actor.statuses.has('immobilized'));
 assert.ok(!f.canvas.tokens.get('pc').actor.statuses.has('immobilized'));
 await assert.rejects(api.contest('g'),/already|start|window|attempt/);
});

test('approved paired movement moves both native bodies without overlap and spends only the controller’s movement',async()=>{
 const f=await linked();f.link.controllerTokenId='npc';await f.canvas.scene.setFlag('lancer-npc-pilot','terrain',{reviewed:true});
 const source=f.canvas.tokens.get('npc'),target=f.canvas.tokens.get('pc');
 const api=mod.createGrappleController(f),r=await api.move('g',[{x:1,y:1},{x:0,y:1}]);
 assert.equal(r.status,'completed');assert.equal(source.document.x,0);assert.equal(target.document.x,100);
 assert.equal(source.actor.system.action_tracker.move,1);assert.equal(target.actor.system.action_tracker.move,2);
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples').length,1);
});
test('standalone grapple API is GM-only and release requires the acting grappler approval',async()=>{
 assert.equal(typeof mod.createGrappleController,'function');const f=await linked();
 const api=mod.createGrappleController(f);f.choice=false;assert.equal(await api.release('g'),false);
 assert.equal(f.canvas.tokens.placeables[0].actor.effects.length,1);
 f.choice=true;assert.equal(await api.release('g'),true);
 assert.equal(f.canvas.tokens.placeables[0].actor.effects.length,0);assert.equal(f.canvas.tokens.placeables[1].actor.effects.length,0);
 assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
 f.game.user.isGM=false;assert.equal(mod.createGrappleController(f),null);
});
test('release cannot act for another active token; broken-adjacency cleanup releases only owned effects',async()=>{
 assert.equal(typeof mod.createGrappleController,'function');const f=await linked(),api=mod.createGrappleController(f);
 f.game.combat.combatant.tokenId='pc';await assert.rejects(api.release('g'),/active|turn/i);
 f.game.combat.combatant.tokenId='npc';f.canvas.tokens.placeables[1].document.x=600;
 await api.cleanup();assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
 assert.equal(f.canvas.tokens.placeables[0].actor.effects.length,0);
});

test('deleting a linked token removes its owned effect from the surviving world actor before unlinking',async()=>{
 const f=await linked(),api=mod.createGrappleController(f),deleted=f.canvas.tokens.placeables[1];
 f.canvas.tokens.placeables.splice(1,1);
 await api.cleanup(deleted.document);
 assert.equal(deleted.actor.effects.length,0);
 assert.equal(f.canvas.tokens.placeables[0].actor.effects.length,0);
 assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
});

test('missing linkage evidence keeps the relation for manual recovery instead of guessing a world actor',async()=>{
 const f=await linked(),api=mod.createGrappleController(f),deleted=f.canvas.tokens.placeables[1];
 f.canvas.tokens.placeables.splice(1,1);
 await assert.rejects(api.cleanup(),/manual effect cleanup/);
 assert.equal(deleted.actor.effects.length,1);
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples').length,1);
});

test('deleting an unlinked token never removes effects from its inherited world actor',async()=>{
 const f=await linked(),api=mod.createGrappleController(f),deleted=f.canvas.tokens.placeables[1];
 deleted.document.actorLink=false;f.canvas.tokens.placeables.splice(1,1);
 await api.cleanup(deleted.document);
 assert.equal(deleted.actor.effects.length,1);
 assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
});

test('deleting a linked world Actor releases the surviving participant even if its defunct token remains',async()=>{
 const f=await linked(),api=mod.createGrappleController(f),deleted=f.canvas.tokens.get('pc');
 f.link.targetActorLinked=true;f.link.targetActorUuid=deleted.actor.uuid;
 await f.canvas.scene.setFlag('lancer-npc-pilot','grapples',[f.link]);
 f.game.actors.delete(deleted.actor.id);deleted.actor=null;
 await api.cleanup();assert.equal(f.canvas.tokens.get('npc').actor.effects.length,0);
 assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
});

test('native destruction and zero structure expire owned grapples, including nested or flattened actor updates',async()=>{
 for(const [patch,change]of [[{'system.destroyed':true},{system:{destroyed:true}}],
  [{'system.structure.value':0},{'system.structure.value':0}]]){
  const f=await linked(),api=mod.createGrappleController(f),target=f.canvas.tokens.get('pc').actor;
  await target.update(patch);const hook=f.hooks.get('updateActor');assert.equal(typeof hook,'function');await hook(target,change);
  assert.equal(f.canvas.tokens.get('npc').actor.effects.length,0);assert.deepEqual(f.canvas.scene.getFlag('lancer-npc-pilot','grapples'),[]);
 }
});
test('mandatory cleanup waits behind a native effects session and rechecks current defeat before removing effects',async()=>{
 const f=await linked();let resume;const gate=new Promise(r=>resume=r),options=[];
 f.withLock=async(_key,fn,opts)=>{options.push(opts);if(opts?.wait)await gate;return fn();};
 const api=mod.createGrappleController(f),target=f.canvas.tokens.get('pc').actor;
 await target.update({'system.destroyed':true});const p=f.hooks.get('updateActor')(target,{'system.destroyed':true});
 await Promise.resolve();assert.equal(f.canvas.tokens.get('npc').actor.effects.length,1);assert.equal(options[0]?.wait,true);
 await target.update({'system.destroyed':false});resume();await p;
 assert.equal(f.canvas.tokens.get('npc').actor.effects.length,1);assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples').length,1);
});
test('zero HP awaits native structure resolution instead of inventing destruction of a multi-structure participant',async()=>{
 const f=await linked(),api=mod.createGrappleController(f),target=f.canvas.tokens.get('pc').actor;
 await target.update({'system.structure.value':3,'system.hp.value':0});await api.cleanup();
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples').length,1);
});

test('native asynchronous turn refresh and non-roll turn banners preserve the control window',async()=>{
 const f=hullFlows(await linked(),[3,17]);for(const t of f.canvas.tokens.placeables)t.actor._source.system.size=1;
 const active=f.canvas.tokens.get('npc').actor;
 active._source.system.action_tracker={...active._source.system.action_tracker,move:0,full:false,quick:false,protocol:false,reaction:false};
 const api=mod.createGrappleController(f);
 await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
 await assert.rejects(api.contest('g'),/start|window|refresh/);
 const tracker={...active._source.system.action_tracker,protocol:true,move:active.system.speed,full:true,quick:true,reaction:true};
 await active.update({'system.action_tracker':tracker});await f.hooks.get('updateActor')(active,{'system.action_tracker':tracker});
 await f.hooks.get('createChatMessage')({speaker:{actor:active.id},content:'Native turn banner',rolls:[]});
 assert.equal((await api.contest('g')).status,'completed');
});

test('control refresh cannot absorb spending, HP changes, a roll or a second refresh after spending',async()=>{
 for(const scenario of ['spend','hp','roll','spend-restore']){
  const f=hullFlows(await linked(),[3,17]);for(const t of f.canvas.tokens.placeables)t.actor._source.system.size=1;
  const api=mod.createGrappleController(f),active=f.canvas.tokens.get('npc').actor;
  await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
  if(scenario==='roll')await f.hooks.get('createChatMessage')({rolls:[{total:15}]});
  else {const patch=scenario==='hp'?{'system.hp.value':1}:{'system.action_tracker':{...active._source.system.action_tracker,full:false}};
   await active.update(patch);await f.hooks.get('updateActor')(active,patch);
   if(scenario==='spend-restore'){const patch={'system.action_tracker':{...active._source.system.action_tracker,full:true}};
    await active.update(patch);await f.hooks.get('updateActor')(active,patch);}}
  await assert.rejects(api.contest('g'),/start|window/);
 }
});

test('Automations paired movement is refused before approval, movement or resource writes',async()=>{
 const f=await linked();f.game.modules=new Map([['lancer-automations',{active:true}]]);
 const before=JSON.stringify(f.canvas.tokens.placeables.map(t=>[t.document.toObject(),t.actor.toObject()]));
 const api=mod.createGrappleController(f);
 await assert.rejects(api.move('g',[{x:1,y:1},{x:0,y:1}]),/Automations.*manual/i);
 assert.equal(JSON.stringify(f.canvas.tokens.placeables.map(t=>[t.document.toObject(),t.actor.toObject()])),before);
});

test('a native flow opened during control approval closes the window even without board changes',async()=>{
 const f=hullFlows(await linked(),[3,17]);for(const t of f.canvas.tokens.placeables)t.actor._source.system.size=1;
 const api=mod.createGrappleController(f);await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
 f.DialogV2.confirm=async()=>{f.hooks.get('lancer.preFlow.StatRollFlow')();return true;};
 await assert.rejects(api.contest('g'),/start|window/);
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grappleClaims'),undefined);
});

test('moving away then back cannot reopen a control window',async()=>{
 const f=hullFlows(await linked(),[3,17]);for(const t of f.canvas.tokens.placeables)t.actor._source.system.size=1;
 const api=mod.createGrappleController(f);await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
 const token=f.canvas.tokens.get('npc');token.document.x=0;await f.hooks.get('updateToken')(token.document,{x:0});
 token.document.x=100;await f.hooks.get('updateToken')(token.document,{x:100});
 await assert.rejects(api.contest('g'),/start|window|grapple/);
});

test('paired movement awaits the native movement animation before reading committed coordinates',async()=>{
 const f=await linked();await f.canvas.scene.setFlag('lancer-npc-pilot','terrain',{reviewed:true});
 for(const token of f.canvas.tokens.placeables){const move=token.document.move;
  token.document.move=async points=>{token.movementAnimationPromise=new Promise((resolve,reject)=>setImmediate(()=>{Promise.resolve(move(points)).then(resolve,reject);}));return true;};}
 const api=mod.createGrappleController(f),r=await api.move('g',[{x:1,y:1},{x:0,y:1}]);
 assert.equal(r.status,'completed');assert.equal(f.canvas.tokens.get('npc').document.x,0);assert.equal(f.canvas.tokens.get('pc').document.x,100);
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples')[0].phase,'active');
});

test('reviewed native ruler start-status capture advances only the observed turn window',async()=>{
 for(const scenario of ['native','wrong-status','other-flag','version','restore-after-drift']){
  const f=hullFlows(await linked(),[3,17]);for(const t of f.canvas.tokens.placeables)t.actor._source.system.size=1;
  f.game.modules=new Map([['lancer-speed-provider',{active:true,version:scenario==='version'?'7.4':'7.3'}]]);
  const c={id:'native-c',parent:f.game.combat,_source:{_id:'native-c',flags:{},_stats:{modifiedTime:1}}};f.game.combat.combatant.id=c.id;
  const toObject=f.game.combat.toObject;f.game.combat.toObject=()=>({...toObject.call(f.game.combat),combatants:[structuredClone(c._source)]});
  const api=mod.createGrappleController(f);await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
  c._source.flags['lancer-speed-provider']={'turn-status':scenario==='wrong-status'?['unknown']:[...f.canvas.tokens.get('npc').actor.statuses]};c._source._stats.modifiedTime=2;
  if(scenario==='other-flag')c._source.flags.unrelated=true;
  await f.hooks.get('updateCombatant')(c,{flags:structuredClone(c._source.flags)});
  if(scenario==='restore-after-drift'){const saved=structuredClone(c._source.flags);c._source.flags.unrelated=true;
   await f.hooks.get('updateCombatant')(c,{flags:structuredClone(c._source.flags)});c._source.flags=saved;
   await f.hooks.get('updateCombatant')(c,{flags:saved});}
  if(scenario==='native')assert.equal((await api.contest('g')).status,'completed');
  else await assert.rejects(api.contest('g'),/start|window/);
 }
});
