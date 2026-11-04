import { generateCandidates } from '../core/options.mjs';
import { canonicalPlanKey, comparePolicyEvaluations,evaluatePolicyCandidate } from '../core/policy.mjs';
import { impalePlans,trampleContacts,shieldSource } from '../core/cataphract.mjs';
import { CATAPHRACT_MOVEMENT } from '../rules/cataphract.mjs';
import { grappleMovePlan } from '../core/grapples.mjs';

/** Pre-selection legal choices. No native object, save result or UI receipt
 * enters this pure-data path. Distance facts do not invent incoming danger.
 */
export function generatePolicyCandidates(context){
  const snapshot=context.snapshot,me=snapshot.tokens.find(t=>t.id===snapshot.activeTokenId),caps=context.capabilities??{};
  const options={candidateKey:canonicalPlanKey,compareCandidates:(a,b)=>comparePolicyEvaluations(evaluatePolicyCandidate(a,context),evaluatePolicyCandidate(b,context))};
  if(!context.specials)return generateCandidates(snapshot,options).filter(o=>['attack','boost','retreat','hold'].includes(o.action.kind));
  const trample=caps.trample?.available===true&&typeof caps.trample.itemId==='string';
  if(trample)options.movement=CATAPHRACT_MOVEMENT;
  const grapples=(context.specials.grapples??[]).filter(l=>[l.sourceTokenId,l.targetTokenId].includes(me.id));
  const ordinary=generateCandidates(snapshot,options).filter(o=>['attack','boost','retreat','hold'].includes(o.action.kind));
  const specials=!grapples.length&&caps.impale?.available?impalePlans(snapshot,{ready:true,itemId:caps.impale.itemId}):[];
  return [...ordinary,...specials].flatMap(candidate=>{
    const o=structuredClone(candidate),route=o.move?.path??[me.pos];let paired=null;
    if(grapples.length&&o.move){
      if(grapples.length!==1||!trample||(paired=grappleMovePlan(snapshot,grapples[0],me.id,route,CATAPHRACT_MOVEMENT))===null)return [];
      o.branches=[{id:`grapple:${grapples[0].id}`,kind:'paired-move',end:o.move.to,targetTokenIds:[paired.carriedTokenId],path:paired.carriedPath}];
    }
    const contacts=trampleContacts(snapshot,route).filter(c=>c.tokenId!==paired?.carriedTokenId);
    if(contacts.some(c=>snapshot.tokens.find(t=>t.id===c.tokenId)?.trampleEligible===false)||(!trample&&contacts.length))return [];
    if(contacts.some(c=>context.specials.targetShields?.[c.tokenId]&&shieldSource(snapshot,c.tokenId).knowledge!=='known'))return [];
    if(o.action.kind==='impale'){
      o.family='impale';o.branches=[{id:'save-success',kind:'save',itemId:o.action.itemId,end:o.move.to,targetTokenIds:o.action.targetTokenIds,path:[]},
        {id:`save-failure:pause-${o.action.pauseIndex}`,kind:'carry',itemId:o.action.itemId,end:o.move.to,targetTokenIds:o.action.targetTokenIds,path:o.action.carryPath}];
      o.facts.targetName=snapshot.tokens.find(t=>t.id===o.action.targetTokenIds[0])?.name??o.action.targetTokenIds[0];
    }
    if(trample)o.mechanics={id:'cataphract-t1',trampleItemId:caps.trample.itemId,targetShields:context.specials.targetShields??{},
      ...(paired?{grapple:{id:grapples[0].id,...paired}}:{})};
    o.facts.trampleContacts=contacts.map(c=>({tokenId:c.tokenId,pathIndex:c.pathIndex}));
    o.key=canonicalPlanKey(o);context.factsByPlanKey??={};
    if(caps.shield?.available){const shield=shieldSource(snapshot,me.id,o.move?.to);
      context.factsByPlanKey[o.key]={...(context.factsByPlanKey[o.key]??{}),shield:{populationComplete:shield.knowledge==='known',distances:shield.distances}};}
    return [o];
  });
}
