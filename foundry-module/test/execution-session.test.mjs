import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../scripts/adapter/execution-session.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function fixture({nativeStatus='completed',external=false}={}) {
 const initial={turn:'t',npc:{x:0,hp:15},target:{x:3,hp:8}},state=structuredClone(initial),writes=[],effects=[];
 const io={read:()=>structuredClone(state),persist:async receipt=>{writes.push(structuredClone(receipt));},
  handlers:{move:async step=>{effects.push('move');state.npc.x=step.to;return {status:'completed',changes:[{path:['npc','x'],before:0,after:step.to}],observed:{}};},
   save:async()=>{effects.push('save');if(external)state.target.hp--;return {status:nativeStatus,changes:[],observed:nativeStatus==='completed'?{success:false}:null};},
   grapple:async()=>{effects.push('grapple');return {status:'completed',changes:[],observed:{}};}}};
 const plan={executionId:'e',turn:'t',steps:[{id:'move',handlerId:'move',to:1,writes:[['npc','x']]},
  {id:'save',handlerId:'save'},{id:'grapple',handlerId:'grapple',requires:{stepId:'save',success:false}}]};
 return {io,plan,initial,state,writes,effects};
}
test('session persists claims before each effect and keeps authoritative plan/state private',async()=>{
 assert.equal(typeof mod.ExecutionSession,'function');
 const f=fixture(),session=new mod.ExecutionSession(f.plan,f.initial,f.io);
 f.plan.steps[0].to=99;f.initial.npc.x=99;
 const receipt=await session.run();
 assert.equal(receipt.status,'completed');assert.equal(f.state.npc.x,1);
 assert.deepEqual(f.effects,['move','save','grapple']);
 assert.equal(f.writes[0].status,'pending');assert.equal(f.writes[0].stepId,'move');
 await assert.rejects(session.run(),/already|used/i);
});
test('cancelled or uncertain save never starts grapple; external target changes interrupt',async()=>{
 assert.equal(typeof mod.ExecutionSession,'function');
 for(const nativeStatus of ['cancelled','awaiting-input','failed']){
  const f=fixture({nativeStatus}),r=await new mod.ExecutionSession(f.plan,f.initial,f.io).run();
  assert.equal(r.status,nativeStatus);assert.deepEqual(f.effects,['move','save']);
 }
 const f=fixture({external:true});await assert.rejects(new mod.ExecutionSession(f.plan,f.initial,f.io).run(),/changed|transition/i);
 assert.deepEqual(f.effects,['move','save']);
});
test('unknown handlers, reordered prerequisites and malformed plans refuse before persistence',()=>{
 assert.equal(typeof mod.ExecutionSession,'function');
 for(const edit of [p=>p.steps[0].handlerId='invented',p=>p.steps[0].requires={stepId:'save',success:false},
  p=>p.steps.push({...p.steps[0]}),p=>p.steps[1].requires={stepId:'move',success:'false'}]){
  const f=fixture();edit(f.plan);assert.throws(()=>new mod.ExecutionSession(f.plan,f.initial,f.io));assert.equal(f.writes.length,0);
 }
});
test('receipt cannot rewrite unrelated fields or bypass stale pre-step state',async()=>{
 assert.equal(typeof mod.ExecutionSession,'function');
 const f=fixture();f.state.target.x=9;await assert.rejects(new mod.ExecutionSession(f.plan,f.initial,f.io).run(),/changed/i);assert.equal(f.effects.length,0);
 const g=fixture();g.io.handlers.move=async()=>({status:'completed',changes:[{path:['npc','x'],before:999,after:1}],observed:{}});
 await assert.rejects(new mod.ExecutionSession(g.plan,g.initial,g.io).run(),/transition/i);
 assert.equal(g.writes.at(-1).status,'failed');
 const h=fixture();h.io.handlers.move=async()=>{h.state.target.hp=1;return {status:'completed',changes:[{path:['target','hp'],before:8,after:1}],observed:{}};};
 await assert.rejects(new mod.ExecutionSession(h.plan,h.initial,h.io).run(),/transition/i);
});
