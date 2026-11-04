import test from 'node:test';
import assert from 'node:assert/strict';
import { grappleEnvironment } from './helpers/grapple-fixture.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';
import { collectCarryGeometry } from '../scripts/adapter/carry-geometry.mjs';
import { initializeTrampleTurn } from '../scripts/adapter/trample-history.mjs';
import { impalePlans } from '../scripts/core/cataphract.mjs';
import { readFileSync } from 'node:fs';
const mod=await import('../scripts/adapter/cataphract-executor.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
async function fixture({save=false,cancel=false}={}){
 const f=grappleEnvironment(),source=f.canvas.tokens.placeables[0],target=f.canvas.tokens.placeables[1];
 source.actor._source.items=[{_id:'trample',type:'npc_feature',system:{lid:'npcf_trample_cataphract',type:'Trait',destroyed:false,disabled:false}},
  {_id:'impale',type:'npc_feature',system:{lid:'npcf_impale_cataphract',type:'System',charged:true,destroyed:false,disabled:false}}];
 await f.canvas.scene.setFlag('lancer-npc-pilot','terrain',{reviewed:true});
 await initializeTrampleTurn(source.actor,extractSnapshot(f).turn,{nativeTurnEvent:true});
 const board=extractSnapshot(f);board.carryPositions=collectCarryGeometry(f,board.snapshot).positions;
 const read=()=>{const b=extractSnapshot(f);b.carryPositions=collectCarryGeometry(f,b.snapshot).positions;return b;};
 // Source snapshot is captured after hypothetical geometry collection, just as in production.
 const nativeStamp=board.stamp;board.stamp=read().stamp;
 const sourceMove=source.document.move;f.moves=[];
 source.document.move=async points=>{f.moves.push('source');return sourceMove(points);};
 const targetMove=target.document.move;target.document.move=async points=>{f.moves.push('target');return targetMove(points);};
 target.actor._source.system.armor=0;
 target.actor.hasHeatcap=()=>true;
 target.actor.damageCalc=async(damage,{multiple})=>{f.damageCalls=(f.damageCalls??0)+1;const amount=Math.ceil(damage.Kinetic/(multiple===0.5?2:1));damage.Kinetic=amount;
  await target.actor.update({'system.hp.value':target.actor.system.hp.value-amount});return amount;};
 class StatRollFlow{static steps=['initStatRollData','showStatRollHUD','rollCheck','printStatRollCard'];constructor(actor,data){this.state={actor,item:null,data};}
  getStep(key){return async state=>{if(key==='initStatRollData')state.data.acc_diff={base:{difficulty:0}};
   if(key==='showStatRollHUD'&&cancel)return false;
   if(key==='rollCheck')state.data.result={roll:{total:save?15:5,toJSON:()=>({evaluated:true})}};return true;};}
  async begin(){for(const k of this.constructor.steps)if(await this.getStep(k)(this.state)===false)return false;return true;}}
 class SystemFlow{static steps=['initSystemUseData','checkItemDestroyed','checkItemLimited','checkItemCharged','applySelfHeat','updateItemAfterAction','printSystemCard'];
  constructor(item){this.state={item,actor:item.parent,data:{}};}getStep(){return async()=>true;}async begin(){if(f.automation.limited_loading&&f.automation.attacks)this.state.item.system.charged=false;return true;}}
 f.automation={limited_loading:true,attacks:true};f.game.settings={get:(ns,key)=>ns==='lancer'&&key==='automationOptions'?f.automation:undefined};
 f.game.lancer={flows:new Map([['StatRollFlow',StatRollFlow],['SystemFlow',SystemFlow]])};
 return Object.assign(f,{source,target,board:read(),read});
}

test('production special extraction includes native carried placements and pause LOS without changing ordinary extraction',async()=>{
 const f=await fixture();const ordinary=extractSnapshot(f),special=extractSnapshot(f,{cataphractGeometry:true});
 assert.equal(ordinary.carryPositions,undefined);assert(special.carryPositions.pc);
 assert(special.snapshot.carryGeometry.pc);assert(special.snapshot.carryGeometry.npc);
 assert.equal(special.snapshot.losFrom['4,1'].pc,true);
 assert.notEqual(special.stamp,ordinary.stamp);
});
test('approved crossing applies native Trample damage once and preserves ordinary remaining resources',async()=>{
 assert.equal(typeof mod.executeCataphract,'function');const f=await fixture();
 const option={move:{to:{x:3,y:1},path:[{x:1,y:1},{x:2,y:1},{x:3,y:1}],cost:2},action:{kind:'hold'},facts:{usesBoost:false},
  mechanics:{id:'cataphract-t1',trampleItemId:'trample'}};
 const receipt=await mod.executeCataphract(option,f.board,{line:''},{...f,postLine:async()=>{},verifyDecision:()=>{}});
 assert.equal(receipt.status,'completed');assert.equal(f.target.actor.system.hp.value,8);assert.equal(f.damageCalls,1);
 assert.equal(f.source.actor.system.action_tracker.move,0);assert.equal(f.source.actor.system.action_tracker.quick,true);
 assert.deepEqual(f.source.actor.getFlag('lancer-npc-pilot','trampleLedger').targets,['pc']);
 await assert.rejects(mod.executeCataphract(option,f.read(),{line:''},{...f,postLine:async()=>{}}),/reserved|already/i);
});
for(const save of [true,false])test(`native Impale ${save?'successful':'failed'} save controls grapple/carry branch and does not spend ordinary movement`,async()=>{
 assert.equal(typeof mod.executeCataphract,'function');const f=await fixture({save});
 const option=impalePlans(f.board.snapshot,{ready:true,itemId:'impale'}).find(p=>p.move.to.x===4&&p.move.to.y===1&&p.action.targetTokenIds[0]==='pc');
 assert(option);option.mechanics={id:'cataphract-t1',trampleItemId:'trample'};
 const r=await mod.executeCataphract(option,f.board,{line:''},{...f,postLine:async()=>{}});
 assert.equal(r.status,'completed');assert.equal(f.source.document.x,400);assert.equal(f.source.actor.system.action_tracker.move,2);
 assert.equal(f.source.actor.system.action_tracker.full,false);assert.equal(f.source.actor.system.action_tracker.quick,false);
 assert.equal(f.source.actor.items.get('impale').system.charged,false);
 if(save){assert.equal(f.target.document.x,200);assert.equal(f.target.actor.effects.length,0);assert.equal(f.target.actor.system.hp.value,8);}
 else{assert.equal(f.target.document.x,500);assert.equal(f.target.actor.effects.length,1);assert.equal(f.source.actor.effects.length,1);
  assert.equal(f.target.actor.system.hp.value,10);assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples').length,1);}
});
test('native Impale cancellation creates no grapple or carry and keeps its reservation',async()=>{
 assert.equal(typeof mod.executeCataphract,'function');const f=await fixture({cancel:true});
 const option=impalePlans(f.board.snapshot,{ready:true,itemId:'impale'}).find(p=>p.move.to.x===4&&p.move.to.y===1);
 option.mechanics={id:'cataphract-t1',trampleItemId:'trample'};
 const r=await mod.executeCataphract(option,f.board,{line:''},{...f,postLine:async()=>{}});
 assert.equal(r.status,'cancelled');assert.deepEqual(f.moves,[]);assert.equal(f.source.actor.effects.length,0);
 assert.equal(f.source.actor.getFlag('lancer-npc-pilot','lastExecution'),f.board.turn);
});

test('after Impale carries a larger target, ordinary grapple control belongs to the larger character',async()=>{
 const f=await fixture();const d=f.target.document;d.width=d.height=2;f.target.actor._source.system.size=2;
 d.getOccupiedGridSpaceOffsets=(p={})=>{const x=Math.floor((p.x??d.x)/100),y=Math.floor((p.y??d.y)/100);return [0,1].flatMap(dy=>[0,1].map(dx=>({i:y+dy,j:x+dx})));};
 const board=f.read(),option=impalePlans(board.snapshot,{ready:true,itemId:'impale'}).find(p=>p.move.to.x===4&&p.move.to.y===1);
 assert(option);option.mechanics={id:'cataphract-t1',trampleItemId:'trample'};
 await mod.executeCataphract(option,board,{line:''},{...f,postLine:async()=>{}});
 assert.equal(f.canvas.scene.getFlag('lancer-npc-pilot','grapples')[0].controllerTokenId,'pc');
 assert(f.source.actor.statuses.has('immobilized'));assert(!f.target.actor.statuses.has('immobilized'));
});

test('disabled native recharge automation refuses Impale before reservation or Full-action spending',async()=>{
 const f=await fixture();f.automation.limited_loading=false;
 const option=impalePlans(f.board.snapshot,{ready:true,itemId:'impale'}).find(p=>p.move.to.x===4&&p.move.to.y===1);
 option.mechanics={id:'cataphract-t1',trampleItemId:'trample'};
 await assert.rejects(mod.executeCataphract(option,f.board,{line:''},{...f,postLine:async()=>{}}),/automation|recharge/i);
 assert.equal(f.source.actor.system.action_tracker.full,true);assert.equal(f.source.actor.system.action_tracker.quick,true);
 assert.equal(f.source.actor.items.get('impale').system.charged,true);
 assert.equal(f.source.actor.getFlag('lancer-npc-pilot','lastExecution'),undefined);
});

test('shared native actors refuse before gameplay or turn reservation',async()=>{
 const f=await fixture(),copy={...f.target,id:'copy'};copy.document={...f.target.document};f.canvas.tokens.placeables.push(copy);
 const board=f.read(),option={move:null,action:{kind:'hold'},facts:{usesBoost:false},mechanics:{id:'cataphract-t1',trampleItemId:'trample'}};
 await assert.rejects(mod.executeCataphract(option,board,{line:''},{...f}),/shared|multiple/i);
 assert.equal(f.source.actor.getFlag('lancer-npc-pilot','lastExecution'),undefined);assert.equal(f.damageCalls,undefined);
});
test('unknown Shield population cannot silently become full Trample damage',async()=>{
 const f=await fixture(),waiting=grappleEnvironment().canvas.tokens.get('pc');waiting.id='waiting';waiting.document.id='waiting';
 waiting.actor.id='pending';waiting.actor.uuid='Actor.pending';waiting.actor._source._id='pending';waiting.actor._source.system.hp.value=0;
 waiting.actor._source.system.structure.value=3;waiting.document.x=700;waiting.document.y=700;f.canvas.tokens.placeables.push(waiting);
 const board=f.read(),option={move:{to:{x:3,y:1},path:[{x:1,y:1},{x:2,y:1},{x:3,y:1}],cost:2},action:{kind:'hold'},facts:{usesBoost:false},
 mechanics:{id:'cataphract-t1',trampleItemId:'trample',targetShields:{pc:'shield'}}};
 await assert.rejects(mod.executeCataphract(option,board,{line:''},{...f}),/Shield|population|pending/);
 assert.equal(f.damageCalls,undefined);assert.equal(f.source.actor.getFlag('lancer-npc-pilot','lastExecution'),undefined);
});

test('native Ram Cannon remains a terminal handoff after guarded Trample movement, with no invented native outcome receipt',async()=>{
 const f=await fixture(),ram=JSON.parse(readFileSync(new URL('./fixtures/ram-cannon.json',import.meta.url)));
 f.source.actor._source.items.push({...ram,_id:'ram'});
 class Flow{static steps=['initAttackData','showAttackHUD','rollAttacks'];constructor(item){this.state={item,data:{}};}
  getStep(){return async state=>{state.data.acc_diff={weapon:{}};return true;};}
  async begin(){await this.getStep('initAttackData')(this.state);f.nativeHandedOff=true;
    f.target.actor._source.system.hp.value=3;return true;}}
 f.game.lancer.flows.set('WeaponAttackFlow',Flow);f.canvas.tokens.setTargets=async()=>{};
 const board=f.read(),option={move:null,action:{kind:'attack',itemId:'ram',mode:'melee',targetTokenIds:['pc']},facts:{usesBoost:false},
  mechanics:{id:'cataphract-t1',trampleItemId:'trample'}};
 const r=await mod.executeCataphract(option,board,{line:''},{...f});
 assert.equal(r.status,'handed-to-lancer');assert.equal(f.nativeHandedOff,true);assert.equal(f.target.actor.system.hp.value,3);
 assert.equal(f.source.actor.system.action_tracker.full,false);assert.equal(f.source.actor.system.action_tracker.quick,true);
});

test('distant noncontacts do not exhaust the execution step budget in a 36-token scene',async()=>{
 const f=await fixture();f.canvas.dimensions={width:3000,height:3000,sceneRect:{x:0,y:0,width:3000,height:3000}};
 f.source.actor._source.system.speed=8;f.source.actor._source.system.action_tracker.move=8;
 for(let i=0;i<34;i++){
  const t=grappleEnvironment().canvas.tokens.placeables[1];t.id=`extra${i}`;t.document.id=t.id;t.actor.id=`actor${i}`;
  t.actor._source._id=t.actor.id;t.actor.uuid=`Actor.${t.actor.id}`;t.document.x=2000;t.document.y=2000;
  t.document.toObject=()=>({id:t.id,x:t.document.x,y:t.document.y,elevation:0});
  f.canvas.tokens.placeables.push(t);
 }
 const board=f.read(),option={move:{to:{x:9,y:1},path:Array.from({length:9},(_,i)=>({x:i+1,y:1})),cost:8},
  action:{kind:'hold'},facts:{usesBoost:false},mechanics:{id:'cataphract-t1',trampleItemId:'trample'}};
 const r=await mod.executeCataphract(option,board,{line:''},{...f,postLine:async()=>{}});
 assert.equal(r.status,'completed');assert.equal(f.source.document.x,900);assert.equal(f.damageCalls,1);
});

test('active Automations refuses special movement before reserving or changing any native document',async()=>{
 const f=await fixture();f.game.modules=new Map([['lancer-automations',{active:true,version:'4.5.5.2'}]]);
 const option={move:{to:{x:3,y:1},path:[{x:1,y:1},{x:2,y:1},{x:3,y:1}],cost:2},action:{kind:'hold'},facts:{usesBoost:false},
  mechanics:{id:'cataphract-t1',trampleItemId:'trample'}};
 const before=JSON.stringify(f.canvas.tokens.placeables.map(t=>[t.document.toObject(),t.actor.toObject()]));
 await assert.rejects(mod.executeCataphract(option,f.board,{line:''},{...f,postLine:async()=>{}}),/Automations.*manual/i);
 assert.equal(JSON.stringify(f.canvas.tokens.placeables.map(t=>[t.document.toObject(),t.actor.toObject()])),before);
 assert.deepEqual(f.moves,[]);assert.equal(f.damageCalls,undefined);
});
