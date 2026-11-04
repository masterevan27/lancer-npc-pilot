import { MODULE_ID } from './snapshot.mjs';
import { tokenGeometry } from './geometry.mjs';
import { isResponsibleGM } from './executor.mjs';
import { captureExecutionState } from './execution-state.mjs';
import { ExecutionSession } from './execution-session.mjs';
import { prepareHullSave } from './native-flows.mjs';
import { prepareModeFlow } from './weapon-flow.mjs';
import { createNativeGrappleEffect, updateNativeGrappleEffect } from './grapples.mjs';
import { applyNativeDamage } from './native-damage.mjs';
import { trampleHistory, claimTrampleTarget } from './trample-history.mjs';
import { pathCost, movementContext, stepCost } from '../core/reach.mjs';
import { CATAPHRACT_MOVEMENT } from '../rules/cataphract.mjs';
import { impalePlans, shieldSource, trampleContacts } from '../core/cataphract.mjs';
import { tokenFootprint, cellKey } from '../core/grid.mjs';
import { spend } from '../core/budgets.mjs';
import { canonicalData } from '../core/policy-data.mjs';
import { approvedPilotMove } from './movement-authority.mjs';
import { grappleMovePlan } from '../core/grapples.mjs';

const same=(a,b)=>canonicalData(a)===canonicalData(b);
const completed=(observed={},changes=[])=>({status:'completed',observed,changes});
const prefix=(r,path)=>({...r,changes:r.changes.map(c=>({...c,path:[...path,...c.path]}))});

/** Only controller-owned, source-verified policy choices reach this function.
 * Native steps and returned documents own outcomes. A persistent turn claim
 * survives cancellation/reload; no outcome or resource is reset for retry.
 */
export async function executeCataphract(option,board,choice,{game,canvas,read,withLock,verifyDecision=()=>{},postLine=async()=>{}}){
  if(!isResponsibleGM(game))throw Error('Only the active GM may execute a Pilot plan.');
  return withLock(`lancer-npc-pilot:${board.turn}`,()=>withLock(`lancer-npc-pilot:${canvas.scene.id}:mechanics`,async()=>{
    const fresh=read();verifyDecision(fresh);
    if(!isResponsibleGM(game)||fresh.turn!==board.turn||fresh.stamp!==board.stamp||!fresh.terrainReviewed)throw Error('The board changed before execution. Re-plan.');
    const source=canvas.tokens.get(board.snapshot.activeTokenId),actor=source?.actor;
    const tokens=canvas.tokens.placeables;
    if(tokens.some((t,i)=>tokens.slice(i+1).some(other=>t.actor===other.actor||(t.actor?.uuid&&t.actor.uuid===other.actor?.uuid))))
      throw Error('Shared native actors on multiple scene tokens require manual mechanics resolution.');
    if(!actor||actor.getFlag(MODULE_ID,'lastExecution')===board.turn)throw Error('This turn was already reserved. Continue manually.');
    if(option.mechanics?.id!=='cataphract-t1'||!actor.items.get(option.mechanics.trampleItemId))throw Error('Reviewed Trample ownership is unavailable.');
    if(!trampleHistory(actor,board.turn).known)throw Error('Trample history is unknown. Continue manually until the next native activation.');
    const kind=option.action.kind,isImpale=kind==='impale';
    const existingLinks=canvas.scene.getFlag(MODULE_ID,'grapples')??[];
    if(!Array.isArray(existingLinks))throw Error('Grapple records require manual review.');
    const ownedLinks=existingLinks.filter(l=>[l.sourceTokenId,l.targetTokenId].includes(source.id));
    let paired=null;
    if(ownedLinks.length){
      if(isImpale||ownedLinks.length!==1||ownedLinks[0].phase!=='active'||option.facts.usesBoost)throw Error('This grapple requires manual play.');
      if(option.move){paired=grappleMovePlan(board.snapshot,ownedLinks[0],source.id,option.move.path,CATAPHRACT_MOVEMENT);
        if(!paired||!same(option.mechanics.grapple,{id:ownedLinks[0].id,...paired}))throw Error('The approved paired grapple route is no longer legal.');}
    }else if(option.mechanics.grapple)throw Error('The approved grapple no longer exists.');
    if(!['attack','boost','retreat','hold','impale'].includes(kind))throw Error('Unsupported Cataphract action.');
    const me=board.snapshot.tokens.find(t=>t.id===source.id),route=option.move?.path??[me.pos];
    if(route.length>1&&game.modules?.get('lancer-automations')?.active)
      throw Error('Lancer Automations engagement coexistence requires manual special movement. No action was spent.');
    const routeSnapshot=paired?{...board.snapshot,tokens:board.snapshot.tokens.filter(t=>t.id!==paired.carriedTokenId)}:board.snapshot;
    const routeCost=pathCost(routeSnapshot,source.id,route,CATAPHRACT_MOVEMENT);
    if(routeCost===null||routeCost!==(option.move?.cost??0))throw Error('The approved movement route is invalid.');
    for(const contact of trampleContacts(board.snapshot,route))if(option.mechanics.targetShields?.[contact.tokenId]
      &&shieldSource(board.snapshot,contact.tokenId).knowledge!=='known')throw Error('Shield population awaits native resolution. Continue manually.');
    const position=(id,c)=>{
      const p=id===source.id?board.positions?.[cellKey(c)]:board.carryPositions?.[id]?.[cellKey(c)];
      if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y))throw Error('Approved native waypoint geometry is unavailable.');return {x:p.x,y:p.y};
    };
    route.forEach(c=>position(source.id,c));
    paired?.carriedPath.forEach(c=>position(paired.carriedTokenId,c));
    const target=isImpale?canvas.tokens.get(option.action.targetTokenIds?.[0]):null;
    let systemFlow=null,saveFlow=null,link=null;
    const attackFlow=kind==='attack'?prepareModeFlow(actor.items.get(option.action.itemId),actor,option.action.mode,game):null;
    if(isImpale){
      const legal=impalePlans(board.snapshot,{ready:true,itemId:option.action.itemId});
      if(!legal.some(p=>same(p.action,option.action)&&same(p.move,option.move)))throw Error('The approved Impale branch is no longer legal.');
      if(!target||target.actor===actor)throw Error('The Impale target is unavailable or shares the source actor.');
      option.action.carryPath.forEach(c=>position(target.id,c));
      const item=actor.items.get(option.action.itemId),Flow=game.lancer?.flows?.get('SystemFlow');
      const steps=['initSystemUseData','checkItemDestroyed','checkItemLimited','checkItemCharged','applySelfHeat','updateItemAfterAction','printSystemCard'];
      const automation=game.settings?.get('lancer','automationOptions');
      if(automation?.limited_loading!==true||automation?.attacks!==true)throw Error('Native recharge automation requires Lancer attacks and limited/loading automation. No action was spent.');
      if(!item||item.parent!==actor||item.system.charged!==true||typeof Flow!=='function'||typeof Flow.prototype.begin!=='function'
        ||typeof Flow.prototype.getStep!=='function'||!Array.isArray(Flow.steps)||!same(Flow.steps,steps))throw Error('Reviewed native Impale activation is unavailable.');
      systemFlow=new Flow(item);
      saveFlow=prepareHullSave(target.actor,option.action.saveTarget,game,{verify:()=>verifyFrame()});
      const existing=canvas.scene.getFlag(MODULE_ID,'grapples')??[];
      if(!Array.isArray(existing)||existing.some(g=>[source.id,target.id].some(id=>[g.sourceTokenId,g.targetTokenId].includes(id))))throw Error('Existing or multiple grapples require manual play.');
      link={id:`${board.turn}:impale:${target.id}`,sourceTokenId:source.id,targetTokenId:target.id,
        sourceActorId:actor.id,targetActorId:target.actor.id,
        sourceActorUuid:actor.uuid,targetActorUuid:target.actor.uuid,
        sourceActorLinked:source.document.actorLink===true,targetActorLinked:target.document.actorLink===true,
        controllerTokenId:source.id,phase:'carrying'};
    }
    let projected=structuredClone(board.snapshot.actionBudget);
    projected=spend(projected,isImpale?{full:1}:option.facts.usesBoost?{boost:1}:kind==='attack'?{quick:1}:{});
    if(!isImpale&&routeCost>projected.move)throw Error('Not enough remaining movement.');
    const executionId=`pilot:${board.turn}`,steps=[],handlers={};let expectedJournal=null,expectedLedger=trampleHistory(actor,board.turn),reserved=false;
    const frame=()=>{
      if(!isResponsibleGM(game))throw Error('The active GM changed. Continue manually.');
      if(reserved&&actor.getFlag(MODULE_ID,'lastExecution')!==board.turn)throw Error('The turn reservation changed. Continue manually.');
      const state=captureExecutionState({game,canvas});
      if(isImpale){const a=game.settings?.get('lancer','automationOptions');if(a?.limited_loading!==true||a?.attacks!==true)throw Error('Native recharge automation changed during execution.');}
      const stamp=JSON.stringify({tokens:canvas.tokens.placeables.map(t=>({token:t.document.toObject(),actor:t.actor.toObject()}))});
      verifyDecision({...board,turn:state.turn,stamp});
      if(expectedJournal!==null&&!same(actor.getFlag(MODULE_ID,'executionSession'),expectedJournal))throw Error('The execution journal changed.');
      if(!same(trampleHistory(actor,board.turn),expectedLedger))throw Error('Trample history changed during execution.');
      return state;
    };
    let verifyFrame=()=>{};
    const add=(id,handler,writes=[],requires)=>{steps.push({id,handlerId:id,writes,...(requires?{requires}:{})});handlers[id]=handler;};
    const actorPath=['tokens',source.id,'actor'];
    const trackerWrites=['move','full','quick','protocol'].map(k=>[...actorPath,'system','action_tracker',k]);
    const writeTracker=async next=>{
      const current=actor.system.action_tracker,before=actor.toObject().system.action_tracker,patch={},changes=[];
      for(const key of ['move','full','quick','protocol'])if(current[key]!==next[key]){
        patch[`system.action_tracker.${key}`]=next[key];changes.push({path:[...actorPath,'system','action_tracker',key],before:before[key],after:next[key]});
      }
      if(Object.keys(patch).length)await actor.update(patch);
      return completed({},changes);
    };
    const reservedTracker=structuredClone(projected.nativeTracker);
    add('reserve-actions',()=>writeTracker(reservedTracker),trackerWrites);
    if(isImpale){
      const index=actor.toObject().items.findIndex(i=>(i._id??i.id)===option.action.itemId);
      add('activate-impale',async()=>{
        const result=await systemFlow.begin();if(result!==true)return {status:'cancelled',observed:null,changes:[]};
        if(actor.items.get(option.action.itemId).system.charged!==false)throw Error('Native Impale recharge spending was not confirmed.');
        return completed({resourceSpent:true},[{path:[...actorPath,'items',index,'system','charged'],before:true,after:false}]);
      },[[...actorPath,'items',index,'system','charged']]);
    }
    const saved={stepId:'save',success:false};
    const linkWrite=async value=>{
      const before=structuredClone(canvas.scene.getFlag(MODULE_ID,'grapples')??[]);
      const after=[...before.filter(g=>g.id!==value.id),structuredClone(value)];
      await canvas.scene.setFlag(MODULE_ID,'grapples',after);return completed({grappleId:value.id},[{path:['grapples'],before,after}]);
    };
    const saveAndGrapple=()=>{
      add('save',async()=>({...await saveFlow.resolve(),changes:[]}));
      add('grapple-record',()=>linkWrite(link),[['grapples']],saved);
      for(const t of [source,target])add(`grapple-effect-${t.id}`,async()=>prefix(await createNativeGrappleEffect(t.actor,link,t.id),['tokens',t.id,'actor']),
        [['tokens',t.id,'actor','effects']],saved);
    };
    if(paired)add('begin-paired-grapple',()=>linkWrite({...ownedLinks[0],phase:'carrying'}),[['grapples']]);
    const nativeMove=(token,to)=>async()=>{
      const before={x:token.document.x,y:token.document.y};
      const result=await approvedPilotMove(token.document,[to],{autoRotate:false,method:'api',npcPilotExecutionId:executionId});await token.movementAnimationPromise;
      const after={x:token.document.x,y:token.document.y};
      if(result!==true||after.x!==to.x||after.y!==to.y)throw Error('Native movement was interrupted. Continue manually.');
      return completed({tokenId:token.id},['x','y'].filter(k=>before[k]!==after[k]).map(k=>({path:['tokens',token.id,'token',k],before:before[k],after:after[k]})));
    };
    const movementContextForCost=movementContext(routeSnapshot,me,CATAPHRACT_MOVEMENT);
    if(isImpale&&option.action.pauseIndex===0)saveAndGrapple();
    const scheduledContacts=new Set();
    for(let i=1;i<route.length;i++){
      if(isImpale&&i>option.action.pauseIndex){
        const carried=position(target.id,option.action.carryPath[i-option.action.pauseIndex]);
        add(`carry-${i}`,nativeMove(target,carried),[['tokens',target.id,'token','x'],['tokens',target.id,'token','y']],saved);
      }
      if(paired){
        for(const id of paired.orders[i-1])add(`paired-move-${i}-${id}`,nativeMove(canvas.tokens.get(id),position(id,id===source.id?route[i]:paired.carriedPath[i])),
          [['tokens',id,'token','x'],['tokens',id,'token','y']]);
      }else add(`move-${i}`,nativeMove(source,position(source.id,route[i])),[['tokens',source.id,'token','x'],['tokens',source.id,'token','y']]);
      if(!isImpale){
        projected=spend(projected,{move:stepCost(movementContextForCost,route[i-1],route[i])});const next=structuredClone(projected.nativeTracker);
        add(`movement-cost-${i}`,()=>writeTracker(next),trackerWrites);
      }
      for(const other of board.snapshot.tokens.filter(t=>t.id!==source.id)){
        const footprint=new Set(tokenFootprint(board.snapshot.grid,other).map(cellKey));
        if(scheduledContacts.has(other.id)||!tokenFootprint(board.snapshot.grid,me,route[i]).some(c=>footprint.has(cellKey(c))))continue;
        scheduledContacts.add(other.id);
        const t=canvas.tokens.get(other.id),writes=[['tokens',other.id,'actor','system','hp','value'],['tokens',other.id,'actor','system','overshield','value'],
          ['tokens',other.id,'actor','system','heat','value'],['tokens',other.id,'actor','system','burn']];
        add(`trample-${i}-${other.id}`,async()=>{
          if(!t?.actor||t.actor.system.hp.value<=0||t.actor.system.destroyed||expectedLedger.targets.includes(other.id))return completed({skipped:true});
          // Transit contact needs occupied cells, not attack LOS from coincident
          // centers. Query only native current body geometry at this boundary.
          const m=tokenGeometry(source,canvas.grid),o=tokenGeometry(t,canvas.grid),cells=new Set(o.cellsAt(o.cell).map(cellKey));
          if(!m.cellsAt(m.cell).some(c=>cells.has(cellKey(c))))return completed({skipped:true});
          expectedLedger=await claimTrampleTarget(actor,board.turn,other.id);
          const shield=option.mechanics.targetShields?.[other.id]?shieldSource({...board.snapshot,
            tokens:board.snapshot.tokens.map(state=>{const native=canvas.tokens.get(state.id),g=tokenGeometry(native,canvas.grid);
              return {...state,pos:g.cell,hp:[native.actor.system.hp.value,state.hp[1]],occupiedCells:{[cellKey(g.cell)]:g.cellsAt(g.cell)}};})},other.id):null;
          if(shield&&shield.knowledge!=='known')throw Error('Shield population changed or awaits native resolution. Continue manually.');
          const resistance=shield?.closestHostileTokenId===source.id;
          const r=await applyNativeDamage(t.actor,{Kinetic:2},{game,resistance,verify:()=>verifyFrame()});
          return prefix(r,['tokens',other.id,'actor']);
        },writes);
      }
      if(isImpale&&i===option.action.pauseIndex)saveAndGrapple();
    }
    if(paired)add('finish-paired-grapple',()=>linkWrite({...ownedLinks[0],phase:'active'}),[['grapples']]);
    if(isImpale){
      const finalLink=()=>({...link,phase:'active',controllerTokenId:target.actor.system.size>actor.system.size?target.id:source.id});
      for(const t of [source,target])add(`finish-effect-${t.id}`,async()=>{
        if(finalLink().controllerTokenId===link.controllerTokenId)return completed({unchanged:true});
        return prefix(await updateNativeGrappleEffect(t.actor,finalLink(),t.id),['tokens',t.id,'actor']);
      },[['tokens',t.id,'actor','effects']],saved);
      add('finish-grapple',()=>linkWrite(finalLink()),[['grapples']],saved);
    }
    const handoffAttack=async()=>{
      const current=read(),id=option.action.targetTokenIds?.[0],targetState=current.snapshot.tokens.find(t=>t.id===id),cell=route.at(-1);
      if(!targetState||targetState.hp[0]<=0||targetState.defeated||current.snapshot.losFrom[cellKey(cell)]?.[id]!==true)throw Error('Attack target or line of sight changed.');
      await canvas.tokens.setTargets(option.action.targetTokenIds,{mode:'replace'});verifyFrame();
      const value={executionId,turn:board.turn,stepId:'attack',status:'handed-to-lancer'};
      await actor.setFlag(MODULE_ID,'executionSession',value);expectedJournal=structuredClone(value);verifyFrame();
      const result=await attackFlow.begin();return {status:result===false?'cancelled':'handed-to-lancer',nativeAttackHandedOff:true};
    };
    if(choice.line)add('intent',async()=>{await postLine(choice.line,source);return completed();});
    const initial=frame();
    // Native wrappers receive the session's current exact-state guard; UI data
    // cannot submit or edit a result receipt.
    for(const key of Object.keys(handlers)){
      const handler=handlers[key];handlers[key]=async(step,io)=>{verifyFrame=io.verify;return handler(step,io);};
    }
    const session=new ExecutionSession({executionId,turn:board.turn,steps},initial,{read:frame,handlers,
      persist:async value=>{await actor.setFlag(MODULE_ID,'executionSession',value);expectedJournal=structuredClone(value);}});
    // Validate the entire bounded session before reserving any native state.
    await actor.setFlag(MODULE_ID,'lastExecution',board.turn);
    if(actor.getFlag(MODULE_ID,'lastExecution')!==board.turn)throw Error('The native turn reservation was not confirmed.');
    reserved=true;
    const receipt=await session.run();
    // Native attack resolution is terminal ownership transfer. No later Pilot
    // step may interpret its roll or accept broad native mutations as a receipt.
    if(receipt.status==='completed'&&kind==='attack')return handoffAttack();
    return receipt;
  }));
}
