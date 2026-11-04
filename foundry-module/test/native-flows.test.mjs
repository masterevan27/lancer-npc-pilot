import test from 'node:test';
import assert from 'node:assert/strict';
const native=await import('../scripts/adapter/native-flows.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function fixture({cancel=false,total=11,edit=()=>{}}={}) {
 const target={id:'target',system:{hull:2}},calls=[];
 const steps={initStatRollData:async state=>{state.data.bonus=state.actor.system.hull;state.data.acc_diff={base:{accuracy:0,difficulty:2}};return true;},
  showStatRollHUD:async state=>{calls.push(state.data.acc_diff.base.difficulty);edit(state);return !cancel;},
  rollCheck:async state=>{state.data.result={roll:{total,toJSON:()=>({evaluated:true,total})}};return true;},printStatRollCard:async()=>true};
 class StatRollFlow {static steps=Object.keys(steps);constructor(actor,data){this.state={actor,item:null,data};}getStep(n){return steps[n];}
  async begin(){for(const name of this.constructor.steps)if(await this.getStep(name)(this.state)===false)return false;return true;}}
 const game={system:{version:'3.1.3'},lancer:{flows:new Map([['StatRollFlow',StatRollFlow]])}};
 return {game,target,calls,steps,StatRollFlow};
}
test('native Hull save preserves initialization, adds difficulty and consumes only the completed actual roll',async()=>{
 assert.equal(typeof native.prepareHullSave,'function');
 const f=fixture(),flow=native.prepareHullSave(f.target,12,f.game);
 const receipt=await flow.resolve();
 assert.deepEqual(f.calls,[3]);assert.equal(receipt.status,'completed');
 assert.deepEqual(receipt.observed,{actorId:'target',path:'system.hull',total:11,saveTarget:12,difficulty:3,success:false});
 assert.deepEqual(f.StatRollFlow.steps,['initStatRollData','showStatRollHUD','rollCheck','printStatRollCard']);
 const other=new f.StatRollFlow(f.target,{path:'system.hull'});await other.begin();assert.deepEqual(f.calls,[3,2]);
 await assert.rejects(flow.resolve(),/already|used/i);
});
test('cancelled native save, edited difficulty/path and invalid roll cannot create a failed-save result',async()=>{
 assert.equal(typeof native.prepareHullSave,'function');
 const c=fixture({cancel:true}),receipt=await native.prepareHullSave(c.target,12,c.game).resolve();
 assert.equal(receipt.status,'cancelled');assert.equal(receipt.observed,null);
 for(const edit of [s=>s.data.acc_diff.base.difficulty=0,s=>s.data.path='system.agility',s=>s.actor={id:'other'},s=>s.data.acc_diff.base.difficulty=4]){
  const f=fixture({edit});await assert.rejects(native.prepareHullSave(f.target,12,f.game).resolve(),/changed|invalid/i);
 }
 const f=fixture({total:NaN});await assert.rejects(native.prepareHullSave(f.target,12,f.game).resolve(),/roll/i);
});
test('Hull save fails before native flow on unsupported runtime, ordering or DC',()=>{
 assert.equal(typeof native.prepareHullSave,'function');
 for(const edit of [f=>f.game.system.version='3.2.0',f=>f.StatRollFlow.steps.reverse()]){
  const f=fixture();edit(f);assert.throws(()=>native.prepareHullSave(f.target,12,f.game),/reviewed|support/i);
 }
 const f=fixture();assert.throws(()=>native.prepareHullSave(f.target,NaN,f.game),/target/i);
});

test('native Hull contest check retains ordinary difficulty and never invents a save target',async()=>{
 assert.equal(typeof native.prepareHullCheck,'function');
 const f=fixture(),r=await native.prepareHullCheck(f.target,f.game).resolve();
 assert.deepEqual(f.calls,[2]);assert.equal(r.status,'completed');
 assert.deepEqual(r.observed,{actorId:'target',path:'system.hull',total:11,difficulty:2});
});
