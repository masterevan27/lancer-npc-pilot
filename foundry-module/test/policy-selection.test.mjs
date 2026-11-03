import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePolicy,canonicalPlanKey,evaluatePolicyCandidate,comparePolicyEvaluations,selectPolicyDecision } from '../scripts/core/policy.mjs';
import { NPC_POLICIES } from '../scripts/rules/npc-policies.mjs';
import { candidate,policyScenario,policyContext,binding } from './helpers/policy-fixtures.mjs';
test('CAT-18 exact identity/loadout resolves independently from feature source drift',()=>{
 const c=policyContext(),me=c.snapshot.tokens[0];
 assert.equal(resolvePolicy(c.snapshot,[binding()],NPC_POLICIES).state,'ready');
 me.features[2].sourceFingerprint='changed';const partial=resolvePolicy(c.snapshot,[binding()],NPC_POLICIES);
 assert.equal(partial.state,'partial');assert(partial.gaps.some(g=>g.includes('impale')));
 for(const edit of [m=>m.classIds.push('other'),m=>m.tier=2,m=>m.templateIds=['elite'],
   m=>m.features.push({lid:'optional'}),m=>m.classIds=['Cataphract']]) {
   const s=structuredClone(c.snapshot);edit(s.tokens[0]);assert.equal(resolvePolicy(s,[binding()],NPC_POLICIES).state,'unconfigured');
 }
 assert.equal(resolvePolicy(c.snapshot,[],NPC_POLICIES).state,'unconfigured');
 assert.equal(resolvePolicy(c.snapshot,[binding(),binding()],NPC_POLICIES).state,'unconfigured');
});
test('unknown goals retain their weights and no applicable goals never produce NaN',()=>{
 const c=policyContext(),a=candidate();c.factsByPlanKey[canonicalPlanKey(a)]={reaction:{reviewed:true,exposure:'unexposed'}};
 const e=evaluatePolicyCandidate(a,c);assert.equal(e.rank[1],300/8); // priority 3 + shield 2 + reaction 3
 assert(e.goalUtilities.some(g=>g.knowledge==='unknown'&&g.weight===2));
 const noGoals={...c,policy:{...c.policy,goals:[]}};
 const zero=evaluatePolicyCandidate(a,noGoals);assert.equal(zero.rank[1],0);assert(zero.reasonCodes.includes('no-applicable-goals'));
});
test('CAT-13/14 lexicographic order beats class, class beats personality and basic score',()=>{
 const orderPreferred={rank:[75,0,-1,1],moveCost:0,planKey:'a'},classPreferred={rank:[0,100,1,999],moveCost:0,planKey:'b'};
 assert(comparePolicyEvaluations(orderPreferred,classPreferred)<0);
 assert(comparePolicyEvaluations({...orderPreferred,rank:[0,50,-1,0]}, {...classPreferred,rank:[0,40,1,999]})<0);
 const c=policyScenario('CAT-14').context;c.individual.riskTolerance=2;
 assert.equal(selectPolicyDecision([candidate()],c).state,'needs-input');
 c.individual={riskTolerance:NaN};assert.equal(selectPolicyDecision([candidate()],c).selectedKey,null);
});
test('CAT-13 actual soft protection outranks higher class/attack utility, retaining the alternative',()=>{
 const c=policyContext(),me=c.snapshot.tokens[0],ally=structuredClone(me);ally.id='ally';ally.pos={x:1,y:1};
 ally.occupiedCells={'1,1':[{x:1,y:1}]};c.snapshot.tokens.push(ally);
 c.order={...c.order,kind:'protect-ally',parameters:{allyTokenId:'ally',maxEndDistance:1}};
 const inside=candidate('inside',{move:{to:{x:2,y:1},path:[],cost:1},score:0}),outside=candidate('outside',{move:{to:{x:4,y:1},path:[],cost:1},score:999});
 c.factsByPlanKey[canonicalPlanKey(inside)]={reaction:{reviewed:true,exposure:'exposed'}};
 c.factsByPlanKey[canonicalPlanKey(outside)]={reaction:{reviewed:true,exposure:'unexposed'}};
 const d=selectPolicyDecision([outside,inside],c);assert.equal(d.candidates[0].move.to.x,2);assert.equal(d.candidates.length,2);
 c.order.kind='free';c.order.parameters={};c.individual.riskTolerance=1;
 assert.equal(selectPolicyDecision([inside,outside],c).candidates[0].move.to.x,4);
});
test('CAT-12 no hard-compliant choice returns needs-input without relaxing order',()=>{
 const c=policyScenario('CAT-12').context;c.order={...c.order,mode:'hard',kind:'hold-area',parameters:{areaCells:[{x:99,y:99}]}};
 const d=selectPolicyDecision([candidate()],c);assert.equal(d.state,'needs-input');assert.equal(d.selectedKey,null);
});
test('CAT-16 shortlist retains best, reports omitted families and deterministic search bounds',()=>{
 const c=policyScenario('CAT-16').context;
 const list=['hold','retreat','boost','attack'].map((kind,i)=>candidate(kind,{family:kind,action:{kind},score:i}));
 const d=selectPolicyDecision(list,c,{maxOptions:1,maxCandidates:99});
 assert.equal(d.candidates.length,1);assert.equal(d.candidates[0].family,'attack');
 assert.deepEqual(d.omittedFamilies,['boost','hold','retreat']);assert.equal(d.state,'partial');
 const limited=selectPolicyDecision(list,c,{maxOptions:8,maxCandidates:2});assert.equal(limited.search.truncated,true);
 assert.deepEqual(limited.candidates.map(x=>x.key),selectPolicyDecision(list.reverse(),c,{maxCandidates:2}).candidates.map(x=>x.key));
 assert.equal(selectPolicyDecision(list,c,{maxOptions:0}).state,'needs-input');
});
test('CAT-17 canonical keys ignore labels and input order, preserve mode/path/branch identities',()=>{
 const c=policyScenario('CAT-17').context;
 const a=candidate('display-a',{action:{kind:'attack',itemId:'w1',targetTokenIds:['b','a']}});
 const renamed={...a,key:'renamed',id:'Z',facts:{...a.facts,targetName:'Renamed'},action:{...a.action,targetTokenIds:['a','b']}};
 assert.equal(canonicalPlanKey(a),canonicalPlanKey(renamed));
 assert.notEqual(canonicalPlanKey(a),canonicalPlanKey({...a,action:{...a.action,mode:'melee'}}));
 assert.notEqual(canonicalPlanKey(a),canonicalPlanKey({...a,branches:[{id:'choice',end:{x:1,y:1}}]}));
 const b=candidate('other',{action:{kind:'attack',itemId:'w2',targetTokenIds:['b']}});
 const first=selectPolicyDecision([a,b],c),second=selectPolicyDecision([b,renamed],c);
 assert.deepEqual(first.candidates.map(x=>x.key),second.candidates.map(x=>x.key));
 assert.deepEqual(first.evaluations.map(e=>e.reasonCodes),second.evaluations.map(e=>e.reasonCodes));
 assert.equal(selectPolicyDecision([a,renamed],c).candidates.length,1);
 assert.equal(selectPolicyDecision([a,{...a,score:999}],c).state,'needs-input');
});
test('invalid policy/configuration never chooses any fallback',()=>{
 const c=policyContext();c.policy={...c.policy,reviewState:'forged'};
 const d=selectPolicyDecision([candidate()],c);assert.equal(d.state,'unconfigured');assert.equal(d.selectedKey,null);
});
test('candidate search cap bounds metric evaluation, rather than just truncating displayed results',()=>{
 const c=policyContext();let reads=0;c.factsByPlanKey=new Proxy({}, {get(){reads++;return {};}});
 const candidates=Array.from({length:30},(_,i)=>candidate(String(i),{action:{kind:'hold',itemId:String(i)}}));
 selectPolicyDecision(candidates,c,{maxCandidates:2});assert(reads<=2*4);
});
