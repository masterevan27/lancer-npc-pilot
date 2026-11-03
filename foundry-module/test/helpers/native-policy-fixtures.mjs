import { webcrypto } from 'node:crypto';
import { policyContext } from './policy-fixtures.mjs';
import { canonicalRuleSource } from '../../scripts/core/rule-source.mjs';
export function nativeFixture() {
 const c=policyContext(),p=c.policy,me=c.snapshot.tokens[0];
 const features=p.requirements.map((r,i)=>({_id:`feature-${i}`,type:'npc_feature',
   system:{lid:r.lid,type:i===0?'Weapon':'Trait',effect:`synthetic-${r.lid}`,loaded:true},_stats:{systemVersion:r.sourceVersion}}));
 me.weapons=me.weapons.map(w=>({...w,itemId:'feature-0'}));
 const actor={_id:me.actorId,system:{tier:1},flags:{'lancer-npc-pilot':{policyBinding:{classId:'npcc_cataphract',policyId:p.id}}},
   items:[{_id:'class-item',type:'npc_class',system:{lid:'npcc_cataphract'}},...features]};
 const board={snapshot:c.snapshot,turn:c.turn,stamp:JSON.stringify({tokens:[{token:{_id:me.id},actor}]}),terrainReviewed:true,warnings:[]};
 const game={user:{isGM:true},system:{id:'lancer',version:'3.1.3'},settings:{get:()=> 'policy'}};
 const known=new Map(features.map((f,i)=>[canonicalRuleSource(f.system),p.requirements[i].sourceFingerprint]));
 // Synthetic oracle only: never native source/execution evidence or a production hash bypass.
 const crypto={subtle:{digest:async (name,bytes)=>{
   const hash=known.get(new TextDecoder().decode(bytes));
   return hash?Uint8Array.from(hash.match(/../g),v=>parseInt(v,16)).buffer:webcrypto.subtle.digest(name,bytes);
 }}};
 const mutate=fn=>{const source=JSON.parse(board.stamp);fn(source.tokens[0].actor);board.stamp=JSON.stringify(source);};
 return {board,game,crypto,mutate};
}
