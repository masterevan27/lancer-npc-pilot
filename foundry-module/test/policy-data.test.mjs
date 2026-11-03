import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePolicy, validateBinding, validateOrder } from '../scripts/core/policy-data.mjs';
import { NPC_POLICIES } from '../scripts/rules/npc-policies.mjs';

const trusted = NPC_POLICIES;
const policy = () => structuredClone(trusted['cataphract-base-t1']);
test('only an exact reviewed closed policy can use the maintained registry', () => {
  assert.deepEqual(validatePolicy(policy(), trusted), {ok:true,errors:[]});
  for (const edit of [p=>p.schemaVersion=2, p=>p.goals[0].weight=11,
    p=>p.goals[0].weight=NaN, p=>p.goals[0].weight=0, p=>p.goals[0].handler='execute',
    p=>p.goals.push(p.goals[0]), p=>delete p.goals[0], p=>p.reviewState='self-reviewed',
    p=>p.match.tiers=[2], p=>p.match.templateIds=['elite'], p=>p.match.optionalFeatures='all',
    p=>p.individualBounds.riskTolerance=[-Infinity,1], p=>p.search.extra=true]) {
    const forged=policy(); edit(forged); assert.equal(validatePolicy(forged,trusted).ok,false);
  }
  assert.equal(validatePolicy({...policy(), id:'forged', reviewState:'reviewed'},trusted).ok,false);
});
test('no getters execute, including nested records and sparse arrays', () => {
  let getterCalls=0; const forged=policy();
  Object.defineProperty(forged.goals[0], 'metricId', {get(){getterCalls++;return 'priority-access';},enumerable:true});
  assert.equal(validatePolicy(forged,trusted).ok,false); assert.equal(getterCalls,0);
  const order={}; Object.defineProperty(order,'schemaVersion',{get(){getterCalls++;return 1;},enumerable:true});
  assert.equal(validateOrder(order,{}).ok,false); assert.equal(getterCalls,0);
});
test('bindings pin class identity, policy revision and complete trusted sources', () => {
  const p=policy(); const b={schemaVersion:1,classId:'npcc_cataphract',policyId:p.id,policyRevision:1,sourceBindings:p.requirements};
  assert.equal(validateBinding(b,trusted).ok,true);
  for(const edit of [b=>b.classId='Cataphract',b=>b.policyRevision=2,b=>b.sourceBindings[0].sourceFingerprint='forged',
    b=>b.sourceBindings.pop(),b=>b.reviewState='reviewed']) {
    const copy=structuredClone(b);edit(copy);assert.equal(validateBinding(copy,trusted).ok,false);
  }
});
test('orders are closed, dense and bound to actor/turn', () => {
  const context={turn:'t1',snapshot:{activeTokenId:'npc'}};
  const o={schemaVersion:1,id:'free',revision:1,turn:'t1',actorTokenId:'npc',kind:'free',mode:'soft',parameters:{}};
  assert.equal(validateOrder(o,context).ok,true);
  for(const edit of [o=>o.mode='hard',o=>o.turn='old',o=>o.parameters.script='run',o=>o.revision=0]) {
    const copy=structuredClone(o);edit(copy);assert.equal(validateOrder(copy,context).ok,false);
  }
  const area={...o,kind:'hold-area',parameters:{areaCells:[{x:0,y:0},{x:0,y:0}]}};
  assert.equal(validateOrder(area,context).ok,false); delete area.parameters.areaCells[1];
  assert.equal(validateOrder(area,context).ok,false);
});
