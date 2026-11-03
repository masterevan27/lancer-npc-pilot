import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync,readFileSync } from 'node:fs';
import { policyScenario } from './helpers/policy-fixtures.mjs';
import { evaluateMetric } from '../scripts/core/policy-metrics.mjs';
test('CAT-01–20 each has synthetic inputs, a specific expectation, and an owning suite or explicit native gate',()=>{
 const ids=new Set();
 for(let i=1;i<=20;i++) {
   const s=policyScenario(`CAT-${String(i).padStart(2,'0')}`);ids.add(s.id);
   assert.equal(s.policyRevision,1);assert.equal(s.metricVersion,1);assert.equal(s.synthetic,true);
   assert(Object.keys(s.inputs).length);assert(s.expected.relation);assert(s.expected.reason);
   assert(s.context.snapshot.grid);assert(s.context.snapshot.actionBudget);assert(s.context.snapshot.tokens[0].occupiedCells);
   assert(s.binding.sourceBindings.length===4);assert(s.candidates.length);
   if(s.layer==='mechanics-gated') assert(s.gate);
   if(s.suite) assert(existsSync(new URL(s.suite,import.meta.url)));
   else assert.equal(s.id,'CAT-11');
 }
 assert.equal(ids.size,20);
 assert.match(policyScenario('CAT-11').gate,/native|Native/);
});
test('fixture shield and uncertainty relations exercise facts without claiming native effects',()=>{
 const scores=['CAT-01','CAT-02','CAT-03'].map(id=>{const s=policyScenario(id);return evaluateMetric('shield-position',s.candidates[0],s.context);});
 assert(scores[0].utility>scores[1].utility);assert.equal(scores[1].utility,0);assert.equal(scores[2].knowledge,'unknown');
});
