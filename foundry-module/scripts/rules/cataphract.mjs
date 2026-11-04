import { NPC_POLICIES } from './npc-policies.mjs';
import { inertData, record } from '../core/policy-data.mjs';

// Readiness is not an executable descriptor or GM approval. The maintained
// source tuples are pinned independently of catalogue regeneration.
const requirements=NPC_POLICIES['cataphract-base-t1'].requirements;
const ids={trample:'npcf_trample_cataphract',impale:'npcf_impale_cataphract',shield:'npcf_point_defense_shield_cataphract'};
export const CATAPHRACT_MOVEMENT=Object.freeze({passCharacters:true,ignoreEngagement:true});
export function cataphractReadiness(actor,systemVersion) {
  const valid=record(actor) && inertData(actor,{allowUndefined:true}) && actor.tier===1
    && actor.classIds?.length===1 && actor.classIds[0]==='npcc_cataphract'
    && Array.isArray(actor.templateIds) && !actor.templateIds.length && Array.isArray(actor.features)
    && actor.features.every(f=>record(f)&&requirements.some(r=>r.lid===f.lid));
  return Object.fromEntries(Object.entries(ids).map(([name,lid])=>{
    const required=requirements.find(r=>r.lid===lid),features=valid?actor.features.filter(f=>f.lid===lid):[];
    const f=features.length===1?features[0]:null;
    const sourceVerified=!!f && systemVersion===required.sourceVersion && f.sourceVersion===required.sourceVersion
      && f.sourceFingerprint===required.sourceFingerprint && typeof f.itemId==='string' && !!f.itemId;
    // Native Lancer NPC features have no disabled field; Automations adds it.
    const enabled=f&&(f.disabled===false||f.disabled===undefined||f.disabled===null);
    const ready=sourceVerified && f.destroyed===false && enabled && (name!=='impale'||f.charged===true);
    return [name,{sourceVerified,ready,itemId:sourceVerified?f.itemId:null,
      reason:!sourceVerified?'Exact T1 base source is missing, altered or ambiguous.':!ready?'Feature readiness requires manual play.':null}];
  }));
}
