import { nativeFixture } from './helpers/native-policy-fixtures.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readDecisionConfig,resolvePolicyContext,bindActorPolicy } from '../scripts/adapter/policy-context.mjs';
import { NPC_POLICIES } from '../scripts/rules/npc-policies.mjs';
import { generateCandidates } from '../scripts/core/options.mjs';
import { normalizeBudget } from '../scripts/core/budgets.mjs';
test('exact native binding resolves metadata without exposing prose or granting special handlers',async()=>{
 const f=nativeFixture(),config=readDecisionConfig(f);const c=await resolvePolicyContext(f.board,config,f);
 assert.equal(c.state,'partial');assert.equal(c.policy.id,'cataphract-base-t1');
 assert.equal(c.capabilities.ramCannon.available,true);assert.equal(c.capabilities.impale.available,false);
 assert(!JSON.stringify(c).includes('synthetic-'));assert(c.coverageGaps.some(g=>g.includes('impale')));
});
test('CAT-09 source drift removes the affected capability and Ram choices, not independent ordinary movement',async()=>{
 const f=nativeFixture();f.mutate(a=>a.items.find(i=>i.system.lid==='npcf_impale_cataphract').system.effect='changed');
 let c=await resolvePolicyContext(f.board,readDecisionConfig(f),f);
 assert.equal(c.state,'partial');assert.equal(c.capabilities.ramCannon.available,true);
 assert(c.coverageGaps.some(g=>g.includes('source-unavailable:npcf_impale')));
 f.mutate(a=>a.items.find(i=>i.system.lid==='npcf_ram_cannon_cataphract').system.effect='changed');
 c=await resolvePolicyContext(f.board,readDecisionConfig(f),f);assert.equal(c.snapshot.tokens[0].weapons.length,0);
});
test('readiness-only changes keep exact rule identity and policy config stamps while board stamp changes',async()=>{
 const f=nativeFixture(),before=readDecisionConfig(f),a=await resolvePolicyContext(f.board,before,f);
 f.mutate(a=>a.items[1].system.loaded=false);const after=readDecisionConfig(f),b=await resolvePolicyContext(f.board,after,f);
 assert.equal(before.stamp,after.stamp);assert.deepEqual(a.sourceMatches,b.sourceMatches);
});
test('missing/ambiguous classes, forged flags and unexpected loadouts are unconfigured',async()=>{
 for(const edit of [a=>a.items[0].type='npc_feature',a=>a.items.push({...a.items[0],_id:'other'}),
   a=>delete a.flags['lancer-npc-pilot'].policyBinding,a=>a.flags['lancer-npc-pilot'].policyBinding.reviewState='reviewed',
   a=>a.items.push({_id:'opt',type:'npc_feature',system:{lid:'optional'}}),a=>a.system.tier=2]) {
   const f=nativeFixture();f.mutate(edit);const c=await resolvePolicyContext(f.board,readDecisionConfig(f),f);
   assert.equal(c.state,'unconfigured');
 }
});
test('hashing cancellation discards results, missing crypto refuses and source capture precedes awaits',async()=>{
 const f=nativeFixture(),abort=new AbortController();abort.abort();
 await assert.rejects(resolvePolicyContext(f.board,readDecisionConfig(f),{...f,signal:abort.signal}),/cancel|abort/i);
 const c=await resolvePolicyContext(f.board,readDecisionConfig(f),{...f,crypto:{}});assert.equal(c.state,'needs-input');
 let release;const original=f.crypto.subtle.digest;let calls=0;
 f.crypto.subtle.digest=async (...args)=>{if(++calls===1)await new Promise(r=>release=r);return original(...args);};
 const pending=resolvePolicyContext(f.board,readDecisionConfig(f),f);f.mutate(a=>a.items[2].system.effect='changed');release();
 const captured=await pending;assert(captured.sourceMatches.every(s=>s.matches));
});
test('GM binding stores identifiers only, requires one actual npc_class and rejects display names',async()=>{
 let saved;const actor={type:'npc',items:[{type:'npc_class',system:{lid:'npcc_cataphract'}}],
   setFlag:async (_m,k,v)=>{saved={k,v};}};
 const args={classId:'npcc_cataphract',policyId:'cataphract-base-t1'},game={user:{isGM:true}};
 assert.equal(await bindActorPolicy(actor,args,{game,registry:NPC_POLICIES}),true);
 assert.deepEqual(saved.v,args);
 await assert.rejects(bindActorPolicy(actor,{...args,classId:'Cataphract'},{game,registry:NPC_POLICIES}));
 await assert.rejects(bindActorPolicy(actor,args,{game:{user:{isGM:false}},registry:NPC_POLICIES}));
});

test('REQ-7 spent and restricted attack budgets change readiness and diagnostics without changing source identity',async()=>{
 const f=nativeFixture(),before=await resolvePolicyContext(f.board,readDecisionConfig(f),f);
 assert.equal(before.capabilities.ramCannon.available,true);
 assert(generateCandidates(before.snapshot).some(c=>c.action.kind==='attack'));
 const speed=f.board.snapshot.tokens[0].speed;
 for(const [full,quick,blocked] of [[false,false,[]],[true,true,['quick']],[false,true,[]]]) {
   const budget=normalizeBudget({move:speed,full,quick,protocol:true,reaction:true},{speed,blocked});
   f.board.snapshot.actionBudget=budget;
   const c=await resolvePolicyContext(f.board,readDecisionConfig(f),f);
   const eligible=quick && blocked.length===0;
   assert.equal(c.capabilities.ramCannon.available,eligible);
   assert.equal(c.capabilities.ramCannon.reviewed,true);
   assert.deepEqual(c.sourceMatches,before.sourceMatches);
   assert.deepEqual(c.snapshot.tokens[0].features,before.snapshot.tokens[0].features);
   assert.deepEqual(c.snapshot.tokens[0].weapons,before.snapshot.tokens[0].weapons);
   assert.equal(generateCandidates(c.snapshot).some(c=>c.action.kind==='attack'),eligible);
   assert.equal(c.coverageGaps.some(g=>/ram-cannon-unavailable:.*budget/.test(g)),!eligible);
 }
});
