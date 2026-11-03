import { canonicalPlanKey } from '../../scripts/core/policy-data.mjs';
import { readFileSync } from 'node:fs';
import { loadFixture } from './fixtures.mjs';
import { NPC_POLICIES } from '../../scripts/rules/npc-policies.mjs';
import { normalizeBudget } from '../../scripts/core/budgets.mjs';
const scenarios=JSON.parse(readFileSync(new URL('../fixtures/policies/cataphract-v1.json',import.meta.url)));
export function policyScenario(id) {
  const scenario=scenarios.find(s=>s.id===id); if(!scenario) throw Error(`Unknown scenario ${id}`);
  const context=policyContext(),me=context.snapshot.tokens[0];
  const target=context.snapshot.tokens.find(t=>t.side!==me.side);
  const a=candidate('one',{action:{kind:'attack',itemId:me.weapons[0].itemId,targetTokenIds:[target.id]}});
  // Explicit synthetic facts for each scenario; these are never handler grants.
  if(['CAT-01','CAT-02','CAT-03'].includes(id)) {
    context.capabilities.shield={reviewed:true,available:true};
    context.factsByPlanKey[canonicalPlanKey(a)]={shield:{populationComplete:id!=='CAT-03',usefulProtection:true,
      distances:[{tokenId:'pc1',distance:1},{tokenId:'pc2',distance:id==='CAT-02'?1:3}]}};
  }
  if(id==='CAT-04') context.priority={targetTokenIds:[target.id],areaCells:[]};
  if(id==='CAT-07') context.factsByPlanKey[canonicalPlanKey(a)]={reaction:{reviewed:true,exposure:'exposed'}};
  if(id==='CAT-10') {context.capabilities.impale={reviewed:true,available:true};a.family='impale';
    context.factsByPlanKey[canonicalPlanKey(a)]={displacement:{reviewed:true,branches:[{id:'hypothetical',objectiveUtility:80}]}};}
  return {...structuredClone(scenario),context,binding:binding(),candidates:[a]};
}
export function policyContext() {
  const snapshot=loadFixture('open-map'), me=snapshot.tokens.find(t=>t.id===snapshot.activeTokenId);
  const policy=NPC_POLICIES['cataphract-base-t1'];
  me.classIds=['npcc_cataphract'];me.templateIds=[];me.tier=1;
  me.features=structuredClone(policy.requirements);
  me.occupiedCells=Object.fromEntries(Array.from({length:400},(_,i)=>{const x=i%20,y=Math.floor(i/20);return [`${x},${y}`,[{x,y}]];}));
  for(const t of snapshot.tokens.slice(1)) t.occupiedCells={[`${t.pos.x},${t.pos.y}`]:[{...t.pos}]};
  snapshot.actionBudget=normalizeBudget({move:me.speed,full:true,quick:true,protocol:true,reaction:true},{speed:me.speed});
  return {snapshot,policy,turn:'fixture-turn',order:{schemaVersion:1,id:'free',revision:1,turn:'fixture-turn',
    actorTokenId:me.id,kind:'free',mode:'soft',parameters:{}},individual:{riskTolerance:0},
    capabilities:{},factsByPlanKey:{},contextStamp:'fixture-context',coverageGaps:[]};
}
export function candidate(key='one',extra={}) {
 return {key,family:'attack',action:{kind:'attack',itemId:'weapon',targetTokenIds:['pc']},move:null,
   facts:{expectedDamage:5},score:5,category:'aggressive',...extra};
}
export function binding() {
 const p=NPC_POLICIES['cataphract-base-t1'];
 return {schemaVersion:1,classId:'npcc_cataphract',policyId:p.id,policyRevision:p.revision,sourceBindings:structuredClone(p.requirements)};
}
