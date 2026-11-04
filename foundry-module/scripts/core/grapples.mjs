import { tokenDistance, tokenFootprint, cellKey, translateCell } from './grid.mjs';
import { movementContext, stepCost, canEnd, pathCost } from './reach.mjs';
import { isDefeated } from './snapshot.mjs';
import { inertData, record } from './policy-data.mjs';

const free=()=>({engaged:false,boost:true,reaction:true,move:true,needsInput:false});
const refused=()=>({engaged:true,boost:false,reaction:false,move:false,needsInput:true});
const text=x=>typeof x==='string'&&!!x;
const valid=link=>record(link)&&inertData(link)&&['id','sourceTokenId','targetTokenId','sourceActorId','targetActorId','controllerTokenId'].every(k=>text(link[k]))
  &&link.sourceTokenId!==link.targetTokenId&&[link.sourceTokenId,link.targetTokenId].includes(link.controllerTokenId);
const living=t=>t&&!isDefeated(t)&&Array.isArray(t.hp)&&t.hp[0]>0;

/** Paired native waypoint plan. Every intermediate body placement must be
 * legal, including the first document moved in each mirrored pair.
 */
export function grappleMovePlan(snapshot,link,tokenId,path,exceptions={}){
  try{
    if(!valid(link)||!inertData(path)||!grappleRestrictions(snapshot,tokenId,[link]).move)return null;
    const mover=snapshot.tokens.find(t=>t.id===tokenId),other=snapshot.tokens.find(t=>t.id===(tokenId===link.sourceTokenId?link.targetTokenId:link.sourceTokenId));
    if(!mover||!other||!Array.isArray(path)||path.length<2)return null;
    const geometry=id=>snapshot.carryGeometry?.[id];
    if(!geometry(mover.id)||!geometry(other.id))return null;
    const view=(t,ignored)=>({...snapshot,activeTokenId:t.id,tokens:snapshot.tokens.filter(x=>x.id!==ignored),
      blockedMoves:geometry(t.id).blockedMoves,blockedAnchorMoves:geometry(t.id).blockedAnchorMoves,
      engagementMoves:t.id===mover.id?snapshot.engagementMoves:[]});
    const sourceView=view(mover,other.id),targetView=view(other,mover.id);
    const cost=pathCost(sourceView,mover.id,path,exceptions);if(cost===null)return null;
    const carriedPath=path.map(p=>translateCell(snapshot.grid,other.pos,mover.pos,p));
    const a=movementContext(sourceView,mover,exceptions),b=movementContext(targetView,other,{ignoreEngagement:true}),orders=[];
    const body=(t,p)=>{const cells=tokenFootprint(snapshot.grid,t,p);if(!cells.length)throw Error('Missing native body');return cells;};
    const overlap=(left,right)=>left.some(c=>right.some(d=>cellKey(c)===cellKey(d)));
    for(let i=1;i<path.length;i++){
      if(stepCost(b,carriedPath[i-1],carriedPath[i])===null||!canEnd(b,carriedPath[i])||!canEnd(a,path[i]))return null;
      const sourceNext=body(mover,path[i]),targetNext=body(other,carriedPath[i]);
      if(overlap(sourceNext,targetNext)||tokenDistance(snapshot.grid,mover,other,path[i],carriedPath[i])>1)return null;
      if(!overlap(targetNext,body(mover,path[i-1])))orders.push([other.id,mover.id]);
      else if(!overlap(sourceNext,body(other,carriedPath[i-1])))orders.push([mover.id,other.id]);
      else return null;
    }
    return {cost,carriedTokenId:other.id,carriedPath,orders};
  }catch{return null;}
}

/** Pilot-owned relations only. Unknown/multiple grapples stay manual rather
 * than competing with a different module's multi-character grapple engine.
 */
export function grappleRestrictions(snapshot,tokenId,links) {
  if(!record(snapshot)||!inertData(snapshot,{allowUndefined:true})||!Array.isArray(snapshot.tokens)
    ||!Array.isArray(links)||!inertData(links)||!links.every(valid))return refused();
  const active=[];
  for(const link of links.filter(l=>[l.sourceTokenId,l.targetTokenId].includes(tokenId))){
    const a=snapshot.tokens.find(t=>t.id===link.sourceTokenId),b=snapshot.tokens.find(t=>t.id===link.targetTokenId);
    if([a,b].some(t=>t&&!isDefeated(t)&&Array.isArray(t.hp)&&t.hp[0]<=0))return refused();
    if(!living(a)||!living(b))continue;
    let distance;try{distance=tokenDistance(snapshot.grid,a,b);}catch{return refused();}
    if(!Number.isFinite(distance))return refused();
    if(distance>1)continue;
    if(!Number.isFinite(a.size)||!Number.isFinite(b.size))return refused();
    const controller=a.size>b.size?a.id:b.size>a.size?b.id:link.controllerTokenId;
    active.push({link,controller});
  }
  if(!active.length)return free();
  if(active.length>1)return refused();
  return {engaged:true,boost:false,reaction:false,move:active[0].controller===tokenId,needsInput:false};
}

/** Compare native receipts only. Core Book p13 awards ties to the contest's
 * actual initiator. Unknown initiation requires input; cancellation is intact.
 */
export function grappleContestResult(link,sourceReceipt,targetReceipt,{initiatorTokenId=null}={}) {
  if(!valid(link))return {status:'failed',link:null};
  if([sourceReceipt,targetReceipt].some(r=>r?.status==='cancelled'))return {status:'cancelled',link:structuredClone(link)};
  const good=(r,actorId)=>record(r)&&inertData(r)&&r.status==='completed'&&r.observed?.actorId===actorId
    &&r.observed.path==='system.hull'&&Number.isFinite(r.observed.total);
  if(!good(sourceReceipt,link.sourceActorId)||!good(targetReceipt,link.targetActorId))return {status:'failed',link:structuredClone(link)};
  const a=sourceReceipt.observed.total,b=targetReceipt.observed.total;
  if(a===b&&![link.sourceTokenId,link.targetTokenId].includes(initiatorTokenId))return {status:'awaiting-input',link:structuredClone(link)};
  return {status:'completed',link:{...structuredClone(link),controllerTokenId:a===b?initiatorTokenId:a>b?link.sourceTokenId:link.targetTokenId}};
}
