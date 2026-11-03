import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_POLICIES } from '../scripts/rules/npc-policies.mjs';
import { NPC_CATALOGUE } from '../scripts/rules/npc-catalogue.mjs';
import { validatePolicy } from '../scripts/core/policy-data.mjs';
import { checkOrder } from '../scripts/core/policy-orders.mjs';
import { evaluateMetric } from '../scripts/core/policy-metrics.mjs';
import { canonicalPlanKey,selectPolicyDecision,resolvePolicy } from '../scripts/core/policy.mjs';
import { resolvePolicyContext,readDecisionConfig } from '../scripts/adapter/policy-context.mjs';
import { policyContext,candidate,binding } from './helpers/policy-fixtures.mjs';
import { nativeFixture } from './helpers/native-policy-fixtures.mjs';
test('review R2 mandatory geometry cannot be overridden by facts or inherited by missing branch endpoints',()=>{
 const c=policyContext(),me=c.snapshot.tokens[0],a=candidate('one');
 me.occupiedCells[`${me.pos.x},${me.pos.y}`]=[{...me.pos},{x:me.pos.x+1,y:me.pos.y}];
 c.order={...c.order,kind:'hold-area',mode:'hard',parameters:{areaCells:[{...me.pos}]}};
 c.factsByPlanKey.one={finalCells:[{...me.pos}]};c.factsByPlanKey[canonicalPlanKey(a)]=c.factsByPlanKey.one;
 assert.equal(checkOrder(a,c).allowed,false);
 c.order.parameters.areaCells.push({x:me.pos.x+1,y:me.pos.y});a.branches=[{id:'unknown-end'}];
 assert.equal(checkOrder(a,c).needsInput,true);
});
test('review R3 facts use canonical identity, so candidate aliases cannot change rank',()=>{
 const c=policyContext(),a=candidate('one'),b={...a,key:'two'};
 c.factsByPlanKey.one={reaction:{reviewed:true,exposure:'unexposed'}};
 const first=selectPolicyDecision([a,b],c),second=selectPolicyDecision([b,a],c);
 assert.deepEqual(first.evaluations,second.evaluations);
 c.factsByPlanKey[canonicalPlanKey(a)]={reaction:{reviewed:true,exposure:'unexposed'}};
 assert.equal(selectPolicyDecision([a,b],c).evaluations[0].rank[1],300/8);
 assert.equal(selectPolicyDecision([a,{...b,score:999}],c).state,'needs-input');
});
test('review R4 trusted adapter optional undefined stats do not invalidate an unrelated class binding',async()=>{
 const f=nativeFixture();f.board.snapshot.tokens[1].stress=undefined;
 const c=await resolvePolicyContext(f.board,readDecisionConfig(f),f);assert.equal(c.state,'partial');
});
test('review R5 malformed policy inputs never execute getters, throw or acquire numeric defaults',()=>{
 let calls=0;const c=policyContext(),bad={};Object.defineProperty(bad,'search',{get(){calls++;throw Error('getter');},enumerable:true});
 assert.doesNotThrow(()=>selectPolicyDecision([candidate()],{...c,policy:bad}));assert.equal(calls,0);
 assert.doesNotThrow(()=>selectPolicyDecision([candidate()],{...c,policy:{}}));
 for(const individual of [42,[],{riskTolerance:null},{riskTolerance:'0'}]) {
   assert.equal(selectPolicyDecision([candidate()],{...c,individual}).state,'needs-input');
 }
 const policy=structuredClone(c.policy),proto=Object.create(Array.prototype);
 Object.defineProperty(proto,'every',{get(){calls++;return Array.prototype.every;}});Object.setPrototypeOf(policy.goals,proto);
 assert.equal(validatePolicy(policy,NPC_POLICIES).ok,false);assert.equal(calls,0);
 for(const bindings of [[null],[42],[{}]]) assert.equal(resolvePolicy(c.snapshot,bindings,NPC_POLICIES).state,'unconfigured');
 assert.equal(selectPolicyDecision([candidate()],c,{maxOptions:null}).state,'needs-input');
});
test('review R6 inventory refresh cannot silently re-review policy revision one',async()=>{
 const p=NPC_POLICIES['cataphract-base-t1'],entry=NPC_CATALOGUE.find(f=>f.lid===p.requirements[0].lid);
 const old=entry.sourceFingerprint;entry.sourceFingerprint='a'.repeat(64);
 try {
   const fresh=await import('../scripts/rules/npc-policies.mjs?inventory-drift-regression');
   assert.deepEqual(fresh.NPC_POLICIES[p.id].requirements,p.requirements);
   const c=policyContext();c.snapshot.tokens[0].features[0].sourceFingerprint=entry.sourceFingerprint;
   assert.equal(resolvePolicy(c.snapshot,[binding()],fresh.NPC_POLICIES).state,'partial');
 } finally {entry.sourceFingerprint=old;}
});
test('review R7 shield completeness must include every eligible known hostile identity',()=>{
 const c=policyContext(),a=candidate();c.capabilities.shield={reviewed:true,available:true};
 for(const distances of [[{tokenId:'does-not-exist',distance:1}],[{tokenId:'pc1',distance:1}]]) {
   c.factsByPlanKey.one={shield:{populationComplete:true,usefulProtection:true,distances}};
   c.factsByPlanKey[canonicalPlanKey(a)]=c.factsByPlanKey.one;
   assert.equal(evaluateMetric('shield-position',a,c).knowledge,'unknown');
 }
});
test('review R8 bounded no-choice reports actual search counts, omitted family and failed hard predicate',()=>{
 const c=policyContext(),a=candidate('outside'),b=candidate('inside',{family:'boost',action:{kind:'boost'},
   move:{to:{x:6,y:10},path:[],cost:1}});
 c.order={...c.order,kind:'hold-area',mode:'hard',parameters:{areaCells:[{x:6,y:10}]}};
 const d=selectPolicyDecision([b,a],c,{maxCandidates:1});
 assert.equal(d.state,'needs-input');assert.equal(d.selectedKey,null);assert.equal(d.search.truncated,true);
 assert.equal(d.search.evaluated,1);assert.equal(d.search.total,2);assert(d.omittedFamilies.includes('boost'));
 assert(d.diagnostics.includes('outside-hold-area'));assert(d.diagnostics.some(x=>x.startsWith('search-limit:')));
});
