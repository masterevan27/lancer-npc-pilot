import { canonicalRuleSource } from '../core/rule-source.mjs';
import { inertData, record } from '../core/policy-data.mjs';
import { cataphractReadiness } from '../rules/cataphract.mjs';

/** Pass actor.toObject(), not a live DataModel. Capture every rule string
 * before awaiting hashing; return identity/readiness only, never rules prose.
 */
export async function reviewCataphractSource(actor,systemVersion,{crypto=globalThis.crypto}={}) {
  if(!record(actor)||!inertData(actor,{allowUndefined:true})||!Array.isArray(actor.items))throw Error('Invalid plain native actor source.');
  if(!crypto?.subtle?.digest)throw Error('Web Crypto SHA-256 is required for reviewed special mechanics.');
  const data={tier:Number(actor.system?.tier),
    classIds:actor.items.filter(i=>i.type==='npc_class').map(i=>i.system?.lid??''),
    templateIds:actor.items.filter(i=>i.type==='npc_template').map(i=>i.system?.lid??'')};
  const captured=actor.items.filter(i=>i.type==='npc_feature').map(i=>{
    let source=null;try{source=canonicalRuleSource(i.system);}catch{/* Missing source remains unavailable. */}
    return {itemId:i._id??i.id??'',lid:i.system?.lid??'',sourceVersion:i._stats?.systemVersion??'unrecorded',source,
      charged:i.system?.charged??null,destroyed:i.system?.destroyed??null,disabled:i.system?.disabled??null};
  });
  data.features=await Promise.all(captured.map(async f=>{
    const digest=f.source===null?null:await crypto.subtle.digest('SHA-256',new TextEncoder().encode(f.source));
    const {source,...rest}=f;
    return {...rest,sourceFingerprint:digest===null?'unavailable':Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('')};
  }));
  return {...data,readiness:cataphractReadiness(data,systemVersion)};
}
