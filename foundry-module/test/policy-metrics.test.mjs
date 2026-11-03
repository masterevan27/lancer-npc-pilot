import { canonicalPlanKey } from '../scripts/core/policy-data.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateMetric, explainEvaluation } from '../scripts/core/policy-metrics.mjs';
import { candidate, policyScenario } from './helpers/policy-fixtures.mjs';
test('CAT-01/02/03 useful shield positioning requires reviewed support and a complete population',()=>{
 const c=policyScenario('CAT-01').context,a=candidate();
 c.capabilities.shield={reviewed:true,available:true};
 c.factsByPlanKey[canonicalPlanKey(a)]={shield:{populationComplete:true,distances:[{tokenId:'pc1',distance:1},{tokenId:'pc2',distance:3}],usefulProtection:true}};
 assert.equal(evaluateMetric('shield-position',a,c).utility,100);
 c.factsByPlanKey[canonicalPlanKey(a)].shield.distances[1].distance=1;
 assert.equal(evaluateMetric('shield-position',a,c).utility,0);
 c.factsByPlanKey[canonicalPlanKey(a)].shield.populationComplete=false;
 const fact=evaluateMetric('shield-position',a,c);assert.equal(fact.knowledge,'unknown');assert.equal(fact.value,null);
 assert(fact.reasonCodes.includes('shield-context-unknown'));
 c.factsByPlanKey[canonicalPlanKey(a)].shield.populationComplete=true;c.factsByPlanKey[canonicalPlanKey(a)].shield.distances[1].distance=3;
 c.factsByPlanKey[canonicalPlanKey(a)].shield.usefulProtection=false;assert.equal(evaluateMetric('shield-position',a,c).utility,0);
 delete c.capabilities.shield;assert.equal(evaluateMetric('shield-position',a,c).knowledge,'unknown');
});
test('CAT-04/05 priority access needs supplied targets/areas and useful pressure, never distance traveled alone',()=>{
 const c=policyScenario('CAT-04').context,a=candidate();
 delete c.priority;
 assert.equal(evaluateMetric('priority-access',a,c).knowledge,'unknown');
 c.priority={targetTokenIds:['pc'],areaCells:[]};assert.equal(evaluateMetric('priority-access',a,c).utility,25);
 a.move={cost:9,to:{x:9,y:9}};assert.equal(evaluateMetric('priority-access',a,c).utility,25);
 c.priority.targetTokenIds=[];c.priority.areaCells=[{x:9,y:9}];
 c.factsByPlanKey[canonicalPlanKey(a)]={finalCells:[{x:9,y:9}]};assert.equal(evaluateMetric('priority-access',a,c).utility,100);
});
test('CAT-07/08 Trample never grants reaction immunity; unknown exposure remains unknown',()=>{
 const c=policyScenario('CAT-07').context,a=candidate();c.capabilities.trample={reviewed:true,available:true};
 c.factsByPlanKey={};
 const unknown=evaluateMetric('reaction-safety',a,c);assert.equal(unknown.knowledge,'unknown');assert.equal(unknown.value,null);
 c.factsByPlanKey[canonicalPlanKey(a)]={reaction:{reviewed:true,exposure:'exposed'}};assert.equal(evaluateMetric('reaction-safety',a,c).utility,0);
 c.factsByPlanKey[canonicalPlanKey(a)].reaction.exposure='unexposed';assert.equal(evaluateMetric('reaction-safety',a,c).utility,100);
 c.factsByPlanKey[canonicalPlanKey(a)].reaction.reviewed=false;assert.equal(evaluateMetric('reaction-safety',a,c).knowledge,'unknown');
});
test('CAT-09/10 only available reviewed hypothetical branches earn conditional displacement utility',()=>{
 const c=policyScenario('CAT-10').context,a=candidate('one',{family:'impale'});
 delete c.capabilities.impale;
 c.factsByPlanKey[canonicalPlanKey(a)]={displacement:{reviewed:true,branches:[{id:'conditional',objectiveUtility:80}]}};
 assert.equal(evaluateMetric('conditional-displacement',a,c).utility,0);
 assert(evaluateMetric('conditional-displacement',a,c).reasonCodes.includes('impale-unavailable'));
 c.capabilities.impale={reviewed:true,available:true};assert.equal(evaluateMetric('conditional-displacement',a,c).utility,80);
 c.factsByPlanKey[canonicalPlanKey(a)].displacement.branches[0].objectiveUtility=20;assert.equal(evaluateMetric('conditional-displacement',a,c).utility,20);
 const e={goalUtilities:[evaluateMetric('conditional-displacement',a,c)],reasonCodes:['displacement-conditional'],warnings:[]};
 const text=explainEvaluation(e,c).reason;assert.match(text,/conditional/i);assert.doesNotMatch(text,/applied|failed save|hit occurred|grappled/);
 assert.match(explainEvaluation({reasonCodes:['shield-position','reaction-context-unknown'],warnings:[]},c).reason,/estimated.*unknown/i);
 assert.equal(evaluateMetric('arbitrary-script',a,c).knowledge,'unknown');
});
