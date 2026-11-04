import { cellKey, tokenFootprint, tokenDistance, neighbors, translateCell } from './grid.mjs';
import { areEnemies, isDefeated, hasStatus } from './snapshot.mjs';
import { pathCost, movementContext, canEnd, stepCost } from './reach.mjs';
import { canSpend } from './budgets.mjs';
import { inertData, record } from './policy-data.mjs';
import { CATAPHRACT_MOVEMENT } from '../rules/cataphract.mjs';

const available=t=>!isDefeated(t) && !(Array.isArray(t.hp)&&t.hp[0]<=0);
const validSnapshot=s=>record(s)&&inertData(s,{allowUndefined:true})&&Array.isArray(s.tokens)
  && s.tokens.every(t=>record(t)&&typeof t.id==='string'&&t.id && record(t.pos))
  && new Set(s.tokens.map(t=>t.id)).size===s.tokens.length;
function cells(snapshot,token,pos=token.pos) {
  const result=tokenFootprint(snapshot.grid,token,pos);
  if(!result.length || result.some(c=>!Number.isSafeInteger(c.x)||!Number.isSafeInteger(c.y)))
    throw Error('Native footprint is unavailable.');
  return result;
}

/** Pure contacts for a legal complete route; never authorizes movement/damage. */
export function trampleContacts(snapshot,path) {
  if(!validSnapshot(snapshot)||!inertData(path))throw Error('Invalid observed route data.');
  const mover=snapshot.tokens.find(t=>t.id===snapshot.activeTokenId);
  const others=snapshot.tokens.filter(t=>t!==mover&&available(t));
  // Missing occupancy must refuse instead of silently omitting a character.
  const footprints=others.map(t=>({token:t,cells:new Set(cells(snapshot,t).map(cellKey))}));
  if(!mover || pathCost(snapshot,mover.id,path,CATAPHRACT_MOVEMENT)===null)throw Error('Invalid complete Trample route.');
  const seen=new Set(),contacts=[];
  for(let i=1;i<path.length;i++) {
    const body=cells(snapshot,mover,path[i]);
    for(const f of footprints)if(!seen.has(f.token.id)&&body.some(c=>f.cells.has(cellKey(c)))) {
      seen.add(f.token.id);contacts.push({tokenId:f.token.id,pathIndex:i});
    }
  }
  return contacts;
}

/** The caller persists claims before native damage; an unknown ledger refuses. */
export function trampleDamageDue(contacts,ledger,turn) {
  if(!record(ledger)||!inertData(ledger)||typeof turn!=='string'||!turn||ledger.turn!==turn
    ||!Array.isArray(ledger.targets)||ledger.targets.some(t=>typeof t!=='string'||!t)
    ||new Set(ledger.targets).size!==ledger.targets.length)throw Error('A verified same-turn Trample ledger is required.');
  if(!Array.isArray(contacts)||!inertData(contacts)||contacts.some(c=>!record(c)||typeof c.tokenId!=='string'||!c.tokenId
    ||!Number.isSafeInteger(c.pathIndex)||c.pathIndex<1))throw Error('Invalid Trample contacts.');
  const seen=new Set(ledger.targets);
  return contacts.filter(c=>{if(seen.has(c.tokenId))return false;seen.add(c.tokenId);return true;}).map(c=>({...c}));
}

/** Distance identity only. Incoming danger/usefulness is a separate input. */
export function shieldSource(snapshot,defenderId,position) {
  const unknown={knowledge:'unknown',closestHostileTokenId:null,distances:[]};
  if(!validSnapshot(snapshot))return unknown;
  if(snapshot.tokens.some(t=>!isDefeated(t)&&Array.isArray(t.hp)&&t.hp[0]<=0))return unknown;
  const defender=snapshot.tokens.find(t=>t.id===defenderId);
  if(!defender||!available(defender))return unknown;
  try {
    cells(snapshot,defender,position??defender.pos);
    const hostiles=snapshot.tokens.filter(t=>t!==defender&&available(t)&&areEnemies(defender,t));
    const distances=hostiles.map(t=>{cells(snapshot,t);return {tokenId:t.id,distance:tokenDistance(snapshot.grid,defender,t,position??defender.pos)};});
    if(distances.some(d=>!Number.isFinite(d.distance)))return unknown;
    const min=Math.min(...distances.map(d=>d.distance)),nearest=distances.filter(d=>d.distance===min);
    return {knowledge:'known',closestHostileTokenId:nearest.length===1?nearest[0].tokenId:null,distances};
  }catch{return unknown;}
}

/** Bounded straight-ray plans. Native target wall/body geometry is mandatory;
 * failed-save placement mirrors the initial adjacent offset, never teleports
 * a target to a guessed free cell. This is not an execution authorization.
 */
export function impalePlans(snapshot,capability) {
  if(!validSnapshot(snapshot)||capability?.ready!==true||typeof capability.itemId!=='string'
    ||!canSpend(snapshot.actionBudget,{full:1}).ok)return [];
  const me=snapshot.tokens.find(t=>t.id===snapshot.activeTokenId);
  if(!me||!available(me)||!Number.isSafeInteger(me.saveTarget)||me.saveTarget<1
    ||['IMMOBILIZED','SLOWED','STUNNED'].some(s=>hasStatus(me,s)))return [];
  const ctx=movementContext(snapshot,me,CATAPHRACT_MOVEMENT),out=[];
  for(const first of neighbors(snapshot.grid,me.pos)){
    const route=[{...me.pos}];let cost=0;
    for(let n=1;n<=8;n++){
      const last=route.at(-1),to=translateCell(snapshot.grid,last,me.pos,first),step=stepCost(ctx,last,to);
      if(step===null||cost+step>8)break;cost+=step;route.push(to);
      if(!canEnd(ctx,to))continue;
      const contacts=trampleContacts(snapshot,route);
      for(const target of snapshot.tokens.filter(t=>t!==me&&available(t)&&t.impaleEligible!==false&&Number.isFinite(t.hull)&&!hasStatus(t,'HIDDEN'))){
        const contact=contacts.find(c=>c.tokenId===target.id);
        if(!contact&&tokenDistance(snapshot.grid,me,target,to)!==1)continue;
        const pauseIndex=contact?contact.pathIndex-1:route.length-1;
        if(!canEnd(ctx,route[pauseIndex]))continue;
        if(snapshot.losFrom?.[cellKey(route[pauseIndex])]?.[target.id]!==true)continue;
        const geometry=snapshot.carryGeometry?.[target.id];
        if(!record(geometry)||!Array.isArray(geometry.blockedMoves)||!Array.isArray(geometry.blockedAnchorMoves))continue;
        const carryPath=route.slice(pauseIndex).map(p=>translateCell(snapshot.grid,target.pos,route[pauseIndex],p));
        const targetSnapshot={...snapshot,activeTokenId:target.id,tokens:snapshot.tokens.filter(t=>t!==me),
          blockedMoves:geometry.blockedMoves,blockedAnchorMoves:geometry.blockedAnchorMoves,engagementMoves:[]};
        const targetContext=movementContext(targetSnapshot,target,{ignoreEngagement:true});
        let legal=true;
        for(let i=0;i<carryPath.length;i++){
          let body,moverBody;
          try{body=cells(snapshot,target,carryPath[i]);moverBody=new Set(cells(snapshot,me,route[pauseIndex+i]).map(cellKey));}
          catch{legal=false;break;}
          if(body.some(c=>moverBody.has(cellKey(c)))||!canEnd(targetContext,carryPath[i])
            ||(i>0&&stepCost(targetContext,carryPath[i-1],carryPath[i])===null)){legal=false;break;}
        }
        if(!legal)continue;
        out.push({move:{to:{...to},path:structuredClone(route),cost},action:{kind:'impale',itemId:capability.itemId,
          targetTokenIds:[target.id],pauseIndex,carryPath,saveTarget:me.saveTarget},category:'reposition',score:-0.05*cost,
          facts:{moveCost:cost,usesBoost:false,conditionalDisplacement:true}});
      }
    }
  }
  return out;
}
