import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCandidates } from '../scripts/core/options.mjs';
import { canonicalPlanKey,evaluatePolicyCandidate,comparePolicyEvaluations,selectPolicyDecision } from '../scripts/core/policy.mjs';
import { policyScenario } from './helpers/policy-fixtures.mjs';
import { loadFixture,FIXTURES } from './helpers/fixtures.mjs';
import { createHash } from 'node:crypto';
function setup() {
 const c=policyScenario('CAT-15').context,s=c.snapshot,me=s.tokens[0];
 me.occupiedCells=Object.fromEntries(Array.from({length:400},(_,i)=>{const x=i%20,y=Math.floor(i/20);return [`${x},${y}`,[{x,y}]];}));
 c.order={...c.order,kind:'hold-area',mode:'soft',parameters:{areaCells:[{x:6,y:10}]}};
 const hooks={candidateKey:canonicalPlanKey,compareCandidates:(a,b)=>comparePolicyEvaluations(evaluatePolicyCandidate(a,c),evaluatePolicyCandidate(b,c))};
 return {c,s,hooks};
}
test('CAT-15 policy-best legal endpoint survives before generic weapon-target dedup',()=>{
 const {c,s,hooks}=setup(),legacy=generateCandidates(s),policy=generateCandidates(s,hooks);
 const wanted=policy.filter(a=>a.action.kind==='attack'&&a.move?.to.x===6&&a.move?.to.y===10);
 assert(wanted.length>0);assert(!legacy.some(a=>a.action.kind==='attack'&&a.move?.to.x===6&&a.move?.to.y===10));
 const decision=selectPolicyDecision(policy,c);assert.equal(decision.candidates[0].move.to.x,6);assert.equal(decision.candidates[0].move.to.y,10);
 assert(decision.search.limitations.some(s=>s.includes('shortest path')));
});
test('CAT-16 generator hooks preserve family choices and limited shortlist reports omissions',()=>{
 const {c,s,hooks}=setup(),all=generateCandidates(s,hooks);
 const d=selectPolicyDecision(all,c,{maxOptions:1});assert.equal(d.candidates.length,1);assert(d.omittedFamilies.length>0);
});
test('CAT-17 policy generation is invariant under token/weapon enumeration order',()=>{
 const {c,s,hooks}=setup();const keys=()=>selectPolicyDecision(generateCandidates(s,hooks),c).candidates.map(c=>c.key);
 const before=keys();s.tokens.reverse();s.tokens.find(t=>t.id===s.activeTokenId).weapons.reverse();assert.deepEqual(keys(),before);
});
test('no hooks preserves current model fixtures byte for byte',()=>{
 // Captured from baseline dc6f3b9's actual module, not the new implementation.
 const hashes={'open-map':'ae4e06e79e3b76def2b181ab5ce665837cb8cdf8d9580782a103ec76d556870c',
  'walled-corridor':'5f963bcb1a0b532b9a43d55a19db2a2c7d32d3122068d001ab349233633c4363',
  'melee-duel':'58b6ea21b03b54ad59d0d93ed27200779f6ca48c2af9b7414294af76e6e4012a',
  'hex-map':'c6355cc49f754d4235ae84c7a52f4c725993df27b75eb182318c6f219a02321f'};
 for(const f of FIXTURES) assert.equal(createHash('sha256').update(JSON.stringify(generateCandidates(loadFixture(f)))).digest('hex'),hashes[f]);
});
test('CAT-06/09 policy hooks cannot invent Trample, Impale or occupied endpoints',()=>{
 const {s,hooks}=setup(),me=s.tokens[0];
 me.features=[{lid:'npcf_trample_cataphract'},{lid:'npcf_impale_cataphract'}];
 const options=generateCandidates(s,hooks);
 assert(options.every(o=>['attack','boost','retreat','hide','hold'].includes(o.action.kind)));
 for(const o of options) if(o.move) assert(!s.tokens.some(t=>t.id!==me.id&&t.pos.x===o.move.to.x&&t.pos.y===o.move.to.y));
});
