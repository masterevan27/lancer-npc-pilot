import test from 'node:test';
import assert from 'node:assert/strict';
import { PilotController } from '../scripts/adapter/controller.mjs';
import { readDecisionConfig,resolvePolicyContext } from '../scripts/adapter/policy-context.mjs';
import { canonicalData } from '../scripts/core/policy-data.mjs';
import { showReview,renderReview } from '../scripts/adapter/review.mjs';
import { nativeFixture } from './helpers/native-policy-fixtures.mjs';
function setup() {
 const f=nativeFixture(),calls=[];let requestCalls=0;
 const state={...f,configPatch:{}};
 const config=board=>{const c={...readDecisionConfig({game:f.game,board}),...state.configPatch};
   c.stamp=canonicalData({mode:c.mode,binding:c.binding,policyRevision:c.policyRevision,order:c.order,individual:c.individual});return c;};
 const controller=new PilotController({read:()=>structuredClone(f.board),canExecute:()=>true,
   readDecisionConfig:config,resolvePolicyContext:(board,conf,opts)=>resolvePolicyContext(board,conf,{...f,...opts}),
   request:async()=>{requestCalls++;throw Error('disconnected relay');},execute:async (...args)=>calls.push(args)});
 return Object.assign(state,{controller,calls,requests:()=>requestCalls});
}
test('CAT-19 disconnected policy mode makes no request and planning executes nothing; valid approval uses stored action once',async()=>{
 const s=setup(),r=await s.controller.plan();assert.equal(s.requests(),0);assert.equal(s.calls.length,0);
 assert.equal(r.mode,'policy');assert.equal(r.state,'partial');assert.equal(r.choice.source,'policy');
 const authoritative=structuredClone(r.options.find(o=>o.id===r.choice.optionId));const id=r.choice.optionId;
 r.options[0].action.kind='forged';r.choice.source='forged';r.choice.line='forged';
 await s.controller.approve(r,id);assert.equal(s.calls.length,1);assert.deepEqual(s.calls[0][0],authoritative);
 assert.equal(s.calls[0][2].source,'policy');assert.equal(s.calls[0][2].line,'');
 await assert.rejects(s.controller.approve(r,id),/expired|used/);assert.equal(s.calls.length,1);
});
test('CAT-19 unconfigured/needs-input reviews have no Execute, model calls or implicit fallback',async()=>{
 for(const edit of [s=>s.mutate(a=>delete a.flags['lancer-npc-pilot'].policyBinding),
   s=>s.configPatch.order={schemaVersion:1,id:'hold',revision:1,turn:s.board.turn,actorTokenId:s.board.snapshot.activeTokenId,
     kind:'hold-area',mode:'hard',parameters:{areaCells:[{x:99,y:99}]}},
   s=>s.configPatch.individual={riskTolerance:5}]) {
   const s=setup();edit(s);const r=await s.controller.plan();assert.equal(r.options.length,0);assert.equal(r.choice.optionId,null);
   assert.equal(s.requests(),0);await assert.rejects(s.controller.approve(r,'A'));assert.equal(s.calls.length,0);
   let dialog;await showReview(r,{DialogV2:{wait:async config=>{dialog=config;}},canExecute:true});
   assert(!dialog.buttons.some(b=>b.action==='execute'));assert(dialog.buttons.some(b=>b.action==='manual'));
 }
});
test('CAT-20 mode/order/binding/policy/board/budget/terrain changes after review refuse before mutation',async()=>{
 const edits=[s=>s.configPatch.mode='model',s=>s.configPatch.policyRevision=9,
   s=>s.configPatch.order={...readDecisionConfig(s).order,revision:2},
   s=>s.mutate(a=>a.flags['lancer-npc-pilot'].policyBinding.classId='other'),
   s=>s.board.stamp+=' ',s=>s.board.turn='next',s=>{s.board.snapshot.actionBudget={move:0};s.board.stamp+='budget';},
   s=>s.board.terrainReviewed=false];
 for(const edit of edits){const s=setup(),r=await s.controller.plan();edit(s);await assert.rejects(s.controller.approve(r,r.choice.optionId));assert.equal(s.calls.length,0);}
});
test('CAT-20 changes during hashing discard the entire proposal',async()=>{
 for(const change of [s=>s.configPatch.mode='model',s=>s.configPatch.policyRevision=9,
   s=>s.configPatch.order={...readDecisionConfig(s).order,revision:2},
   s=>s.mutate(a=>a.flags['lancer-npc-pilot'].policyBinding.policyId='missing'),
   s=>s.board.stamp+='changed',s=>s.board.turn='next',s=>{s.board.snapshot.actionBudget={move:0};s.board.stamp+='budget';}]) {
   const s=setup();let release,entered;const gate=new Promise(r=>entered=r),original=s.controller.resolvePolicyContext;
   s.controller.resolvePolicyContext=async(...args)=>{entered();await new Promise(r=>release=r);return original(...args);};
   const pending=s.controller.plan();await gate;change(s);release();await assert.rejects(pending,/changed|expired|cancel|supersed/i);
   assert.equal(s.calls.length,0);assert.equal(s.requests(),0);
 }
});
test('superseded source results never revive an expired review',async()=>{
 const s=setup();let release;const original=s.controller.resolvePolicyContext;let count=0;
 s.controller.resolvePolicyContext=async(...args)=>{if(++count===1)await new Promise(r=>release=r);return original(...args);};
 const old=s.controller.plan(),fresh=await s.controller.plan();release();await assert.rejects(old,/cancel|supersed/i);
 await s.controller.approve(fresh,fresh.choice.optionId);assert.equal(s.calls.length,1);
});
test('policy review escapes explanations, policy IDs and diagnostics; shows Re-plan and no relay prerequisite',async()=>{
 const s=setup(),r=await s.controller.plan();r.diagnostics.push('<svg onload=evil>');r.policyId='<img src=x>';
 r.choice.reason='<script>evil</script>';const html=renderReview(r,true);
 assert(!html.includes('<script>'));assert(!html.includes('<svg'));assert(!html.includes('<img'));assert(html.includes('&lt;svg'));
 let dialog;await showReview(r,{DialogV2:{wait:async c=>{dialog=c;}},canExecute:true});
 assert.equal(dialog.buttons.find(b=>b.action==='reask').label,'Re-plan');
 assert(!dialog.buttons.some(b=>b.label==='Relay settings'));
});
test('review R1 approval carries a private configuration/permission verifier across an awaited execution lock',async()=>{
 for(const edit of [s=>s.configPatch.mode='model',s=>s.controller.canExecute=()=>false]) {
   const s=setup(),r=await s.controller.plan();let release;
   const gate=new Promise(resolve=>release=resolve);
   s.controller.execute=async(...args)=>{await gate;args[3]?.verifyDecision(s.board);s.calls.push(args);};
   const pending=s.controller.approve(r,r.choice.optionId);edit(s);release();
   await assert.rejects(pending,/configuration|disabled|changed/i);assert.equal(s.calls.length,0);
 }
});
