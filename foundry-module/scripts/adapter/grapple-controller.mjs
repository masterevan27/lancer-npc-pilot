import { MODULE_ID } from './snapshot.mjs';
import { captureExecutionState } from './execution-state.mjs';
import { ExecutionSession } from './execution-session.mjs';
import { removeNativeGrappleEffects, updateNativeGrappleEffect } from './grapples.mjs';
import { prepareHullCheck } from './native-flows.mjs';
import { grappleContestResult } from '../core/grapples.mjs';
import { readActionBudget } from './budgets.mjs';
import { spend } from '../core/budgets.mjs';
import { readGrappleMove } from './grapple-movement.mjs';
import { approvedPilotMove, isApprovedPilotMove } from './movement-authority.mjs';
import { gridInfo, tokenGeometry } from './geometry.mjs';
import { tokenDistance, cellKey } from '../core/grid.mjs';
import { inertData, record, canonicalData } from '../core/policy-data.mjs';
import { escapeHtml } from './review.mjs';

const responsible=game=>game.user?.isGM===true&&game.users?.activeGM?.id===game.user.id;
function links(scene){
  const value=scene.getFlag(MODULE_ID,'grapples')??[];
  if(!Array.isArray(value)||!inertData(value)||value.some(l=>!record(l)||typeof l.id!=='string'
    ||!['sourceTokenId','targetTokenId','sourceActorId','targetActorId','controllerTokenId'].every(k=>typeof l[k]==='string'&&l[k])))
    throw Error('Grapple records require manual review.');
  return structuredClone(value);
}
function adjacent(link,{canvas,constants}){
  const a=canvas.tokens.get(link.sourceTokenId),b=canvas.tokens.get(link.targetTokenId);
  if(!a||!b||a.actor?.id!==link.sourceActorId||b.actor?.id!==link.targetActorId)return false;
  if(nativeEnded(link,{canvas}))return false;
  if(a.document.elevation!==b.document.elevation)throw Error('Grapple elevation requires manual review.');
  const grid=gridInfo(canvas.scene,canvas.grid,canvas.dimensions,constants);
  const token=t=>{const g=tokenGeometry(t,canvas.grid);return {pos:g.cell,size:t.actor.system.size,occupiedCells:{[cellKey(g.cell)]:g.cellsAt(g.cell)}};};
  return tokenDistance(grid,token(a),token(b))<=1;
}
function nativeEnded(link,{canvas,game}){
  return [link.sourceTokenId,link.targetTokenId].some(id=>{
    const actor=canvas.tokens.get(id)?.actor;
    return !actor||actor.system.destroyed===true||(Number.isFinite(actor.system.structure?.value)&&actor.system.structure.value<=0)
      ||(game?.combat?.combatants?.contents??game?.combat?.combatants??[]).some(c=>c.tokenId===id&&c.defeated);
  });
}

/** Standalone, GM-only lifecycle. Pilot never writes another module's grapple
 * state. These free releases/mandatory expiries remove only Pilot-owned effects.
 * Carry and opposed-check handlers share these same persistent relations.
 */
export function createGrappleController({game,canvas,constants,Hooks,DialogV2,withLock,notifications,canExecute=()=>false}={}){
  if(!game?.user?.isGM)return null;
  const requireGM=()=>{if(!responsible(game))throw Error('Only the active GM may manage a grapple.');};
  const requireExecution=()=>{requireGM();if(!canExecute())throw Error('Execution is disabled.');};
  let startWindow=null,refreshes=[],turnStatus=null;
  // Lancer 3.1.3 launches these native writes from updateCombat without
  // awaiting them. Each may advance the window once; every other write closes
  // it. In particular, spending and then restoring actions cannot reopen it.
  function observeRefresh(actor){
    if(!startWindow)return;
    const current=captureExecutionState({game,canvas});
    if(canonicalData(current)===canonicalData(startWindow))return;
    const index=refreshes.findIndex(r=>{
      if(canvas.tokens.get(r.tokenId)?.actor!==actor)return false;
      const expected=structuredClone(startWindow);
      Object.assign(expected.tokens[r.tokenId].actor.system.action_tracker,r.patch);
      return canonicalData(expected)===canonicalData(current);
    });
    if(index<0){startWindow=null;refreshes=[];return;}
    refreshes.splice(index,1);startWindow=current;
  }
  function refreshed(){
    const actor=canvas.tokens.get(game.combat?.combatant?.tokenId)?.actor,t=actor?.toObject().system?.action_tracker;
    return t?.full===true&&t.quick===true&&t.protocol===true&&t.reaction===true&&t.move===actor.system.speed;
  }
  function observeTurnStatus(combatant){
    if(!startWindow)return;
    const current=captureExecutionState({game,canvas});
    if(canonicalData(current)===canonicalData(startWindow))return;
    const expected=structuredClone(startWindow),entry=expected.combat?.combatants?.find(c=>c._id===combatant.id);
    const actual=current.combat?.combatants?.find(c=>c._id===combatant.id);
    if(turnStatus?.id===combatant.id&&combatant.parent===game.combat&&entry&&actual){
      // Ruler Integration 7.3 records Array.from(actor.statuses) asynchronously
      // at activation. Accept that exact captured value once, with only its
      // Combatant metadata timestamp; all other flags and documents stay guarded.
      ((entry.flags??={})['lancer-speed-provider']??={})['turn-status']=turnStatus.statuses;
      if(Object.hasOwn(actual,'_stats'))entry._stats=structuredClone(actual._stats);
      if(canonicalData(expected)===canonicalData(current)){startWindow=current;turnStatus=null;return;}
    }
    startWindow=null;turnStatus=null;refreshes=[];
  }
  async function opposed(id,escape){
    requireExecution();const scene=canvas.scene,initial=captureExecutionState({game,canvas}),link=links(scene).find(l=>l.id===id);
    const active=game.combat?.combatant?.tokenId;
    if(!link||!game.combat?.started||![link.sourceTokenId,link.targetTokenId].includes(active)
      ||(escape&&active!==link.targetTokenId))throw Error('Use this action on the appropriate active participant’s turn.');
    if(links(scene).filter(l=>[l.sourceTokenId,l.targetTokenId].some(t=>[link.sourceTokenId,link.targetTokenId].includes(t))).length!==1
      ||link.phase==='carrying'||link.phase==='pending'||nativeEnded(link,{canvas,game})||!adjacent(link,{canvas,constants}))throw Error('This grapple requires manual review.');
    const source=canvas.tokens.get(link.sourceTokenId),target=canvas.tokens.get(link.targetTokenId);
    if(source.actor===target.actor||canvas.tokens.placeables.some(t=>t!==source&&t!==target&&[source.actor,target.actor].includes(t.actor)))
      throw Error('Shared actors require manual grapple resolution.');
    if(!escape&&(source.actor.system.size!==target.actor.system.size||!startWindow||!refreshed()
      ||canonicalData(startWindow)!==canonicalData(initial)))throw Error('A same-size contest requires the observed start-of-turn window.');
    const acting=canvas.tokens.get(active).actor,budget=readActionBudget(acting);
    if(acting.statuses.has('stunned'))throw Error('Stunned characters cannot contest a grapple.');
    const executionId=`grapple:${id}:${initial.turn}:${escape?'escape':'control'}`;
    const claims=scene.getFlag(MODULE_ID,'grappleClaims');
    if(claims!==undefined&&claims!==null&&(!record(claims)||!inertData(claims)||typeof claims.turn!=='string'
      ||!Array.isArray(claims.ids)||claims.ids.some(id=>typeof id!=='string')||new Set(claims.ids).size!==claims.ids.length))throw Error('Invalid grapple attempt history.');
    if(claims?.turn===initial.turn&&claims.ids?.includes(executionId))throw Error('This grapple attempt was already reserved. Continue manually.');
    const projected=escape?spend(budget,{quick:1}):null;
    const confirmed=await DialogV2.confirm({window:{title:escape?'NPC Pilot — break free':'NPC Pilot — contest grapple control'},
      content:escape?'<p>Spend one quick action, then resolve both native Hull checks. Only the defender’s actual win ends the grapple. Cancellation retains the spent action.</p>'
        :'<p>Resolve both native Hull checks at the start of this turn. The actual winner controls movement. A tie goes to the participant initiating this contest.</p>'});
    if(!confirmed)return {status:'cancelled'};
    return withLock(`lancer-npc-pilot:${scene.id}:mechanics`,async()=>{
      requireExecution();if(canvas.scene!==scene||canonicalData(captureExecutionState({game,canvas}))!==canonicalData(initial))throw Error('The board changed before the grapple action.');
      if(!escape&&(!startWindow||!refreshed()||canonicalData(startWindow)!==canonicalData(initial)))
        throw Error('The observed start-of-turn window closed before approval.');
      let journal=null;
      const read=()=>{requireExecution();if(canvas.scene!==scene)throw Error('The viewed scene changed.');
        if(journal!==null&&canonicalData(scene.getFlag(MODULE_ID,'grappleOperation'))!==canonicalData(journal))throw Error('The grapple journal changed.');
        return captureExecutionState({game,canvas});};
      let sourceReceipt,targetReceipt,result;
      const steps=[],handlers={};
      const add=(name,writes,handler,requires)=>{steps.push({id:name,handlerId:name,writes,...(requires?{requires}:{})});handlers[name]=handler;};
      let verifyCheck=()=>{};
      const a=prepareHullCheck(source.actor,game,{verify:()=>verifyCheck()}),b=prepareHullCheck(target.actor,game,{verify:()=>verifyCheck()});
      // Native checks receive the session's live guard, including across the HUD await.
      const checkStep=(flow,save)=>async(_step,{verify})=>{
        verifyCheck=verify;const r=await flow.resolve();save(r);return {...r,changes:[]};};
      if(escape)add('reserve-quick',[['tokens',active,'actor','system','action_tracker']],async()=>{
        const before=structuredClone(acting.toObject().system.action_tracker);await acting.update({'system.action_tracker':projected.nativeTracker});
        return {status:'completed',observed:{},changes:[{path:['tokens',active,'actor','system','action_tracker'],before,after:projected.nativeTracker}]};});
      add('source-check',[],checkStep(a,r=>sourceReceipt=r));
      add('target-check',[],checkStep(b,r=>targetReceipt=r));
      add('result',[],async()=>{result=grappleContestResult(link,sourceReceipt,targetReceipt,{initiatorTokenId:active});
        return {status:result.status,observed:{success:result.status==='completed'&&(!escape||result.link.controllerTokenId===link.targetTokenId)},changes:[]};});
      for(const token of [source,target])add(`effects-${token.id}`,[['tokens',token.id,'actor','effects']],async()=>{
        const r=escape?await removeNativeGrappleEffects(token.actor,id):await updateNativeGrappleEffect(token.actor,result.link,token.id);
        return {...r,changes:r.changes.map(c=>({...c,path:['tokens',token.id,'actor',...c.path]}))};
      },{stepId:'result',success:true});
      add('relation',[['grapples']],async()=>{const before=links(scene),after=escape?before.filter(l=>l.id!==id):before.map(l=>l.id===id?result.link:l);
        await scene.setFlag(MODULE_ID,'grapples',after);return {status:'completed',observed:{},changes:[{path:['grapples'],before,after}]};
      },{stepId:'result',success:true});
      const claim={turn:initial.turn,ids:[...(claims?.turn===initial.turn?claims.ids:[]),executionId]};
      if(!Array.isArray(claim.ids)||!inertData(claim))throw Error('Invalid grapple attempt history.');
      const claimed=structuredClone(initial);
      ((claimed.scene.flags??={})[MODULE_ID]??={}).grappleClaims=claim;
      await scene.setFlag(MODULE_ID,'grappleClaims',claim);
      if(canonicalData(scene.getFlag(MODULE_ID,'grappleClaims'))!==canonicalData(claim))throw Error('Unconfirmed grapple attempt reservation.');
      if(canonicalData(read())!==canonicalData(claimed))throw Error('The board changed during grapple reservation. Continue manually.');
      startWindow=null;
      const session=new ExecutionSession({executionId,turn:initial.turn,steps},claimed,{read,handlers,persist:async r=>{
        await scene.setFlag(MODULE_ID,'grappleOperation',r);journal=structuredClone(r);
        if(canonicalData(scene.getFlag(MODULE_ID,'grappleOperation'))!==canonicalData(journal))throw Error('Unconfirmed grapple journal.');}});
      return session.run();
    });
  }
  async function drop(id,deletedDocument,approvalGuard=()=>{},mandatory=false){
    requireGM();
    const scene=canvas.scene;
    return withLock(`lancer-npc-pilot:${scene.id}:mechanics`,async()=>{
      requireGM();approvalGuard();if(canvas.scene!==scene){if(mandatory)return false;throw Error('The viewed scene changed.');}
      const current=links(scene),link=current.find(l=>l.id===id);
      if(!link)return false;
      if(mandatory){
        if((link.phase==='carrying'||link.phase==='pending')&&!nativeEnded(link,{canvas,game}))return false;
        if(!nativeEnded(link,{canvas,game})&&adjacent(link,{canvas,constants}))return false;
      }
      const participants=[[link.sourceTokenId,link.sourceActorId,'source'],[link.targetTokenId,link.targetActorId,'target']].map(([tokenId,actorId,side])=>{
        const token=canvas.tokens.get(tokenId);
        if(token?.actor?.id===actorId)return {actor:token.actor,path:['tokens',tokenId,'actor']};
        const deleted=deletedDocument?.id===tokenId?deletedDocument:null;
        const linked=deleted?deleted.actorLink:link[`${side}ActorLinked`];
        if(linked===false)return null; // A deleted synthetic actor no longer has persistent effects.
        const actor=linked===true?game.actors?.get(actorId):null;
        if(linked===true&&!actor&&typeof game.actors?.get==='function'&&link[`${side}ActorUuid`])return null;
        if(!actor||actor.id!==actorId||(link[`${side}ActorUuid`]&&actor.uuid!==link[`${side}ActorUuid`]))
          throw Error('Missing grapple participant requires manual effect cleanup before unlinking.');
        return {actor,path:['detachedActors',actor.uuid]};
      }).filter(Boolean);
      const extraActors=participants.filter(p=>p.path[0]==='detachedActors').map(p=>p.actor);
      let journal=null;
      const read=()=>{requireGM();approvalGuard();if(canvas.scene!==scene)throw Error('The viewed scene changed.');
        if(journal!==null&&canonicalData(scene.getFlag(MODULE_ID,'grappleOperation'))!==canonicalData(journal))throw Error('The grapple operation changed.');
        return captureExecutionState({game,canvas,extraActors});};
      const initial=read(),steps=[],handlers={};
      for(const [index,{actor,path}]of participants.entries()){
        const stepId=`release-${index}`;
        steps.push({id:stepId,handlerId:stepId,writes:[[...path,'effects']]});
        handlers[stepId]=async()=>{const r=await removeNativeGrappleEffects(actor,id);return {...r,changes:r.changes.map(c=>({...c,path:[...path,...c.path]}))};};
      }
      steps.push({id:'unlink',handlerId:'unlink',writes:[['grapples']]});
      handlers.unlink=async()=>{const before=links(scene),after=before.filter(l=>l.id!==id);await scene.setFlag(MODULE_ID,'grapples',after);
        return {status:'completed',observed:{grappleId:id},changes:[{path:['grapples'],before,after}]};};
      const session=new ExecutionSession({executionId:`release:${id}:${initial.turn}`,turn:initial.turn,steps},initial,{read,handlers,
        persist:async r=>{await scene.setFlag(MODULE_ID,'grappleOperation',r);journal=structuredClone(r);
          if(canonicalData(scene.getFlag(MODULE_ID,'grappleOperation'))!==canonicalData(journal))throw Error('Unconfirmed grapple journal.');}});
      await session.run();return true;
    },{wait:mandatory});
  }
  const api={
    breakFree:id=>opposed(id,true),
    contest:id=>opposed(id,false),
    async move(id,path){
      requireExecution();const scene=canvas.scene,link=links(scene).find(l=>l.id===id),initial=captureExecutionState({game,canvas});
      if(game.modules?.get('lancer-automations')?.active)
        throw Error('Lancer Automations engagement coexistence requires manual paired movement. No action was spent.');
      if(!link||link.phase==='carrying'||link.phase==='pending'||nativeEnded(link,{canvas,game}))throw Error('This grapple requires manual recovery.');
      const active=game.combat?.combatant?.tokenId,source=canvas.tokens.get(active);
      if([...(source?.actor?.items??[])].some(i=>i.system?.lid==='npcf_trample_cataphract'))
        throw Error('Trample paired movement requires the reviewed Cataphract execution path.');
      const board=readGrappleMove({game,canvas,constants},link,path),route=structuredClone(path);
      const confirmed=await DialogV2.confirm({window:{title:'NPC Pilot — move grapple'},
        content:`<p>Move both grapple participants along the reviewed mirrored route (${board.plan.cost} movement). Confirm target-specific movement restrictions and resolve reactions manually. Native walls and occupied endpoints have been checked.</p>`});
      if(!confirmed)return {status:'cancelled'};
      return withLock(`lancer-npc-pilot:${scene.id}:mechanics`,async()=>{
        requireExecution();if(canvas.scene!==scene||canonicalData(captureExecutionState({game,canvas}))!==canonicalData(initial))throw Error('The board changed before grapple movement.');
        let journal=null;
        const read=()=>{requireExecution();if(canvas.scene!==scene)throw Error('The viewed scene changed.');
          if(journal!==null&&canonicalData(scene.getFlag(MODULE_ID,'grappleOperation'))!==canonicalData(journal))throw Error('The grapple journal changed.');
          return captureExecutionState({game,canvas});};
        const steps=[],handlers={};
        const add=(name,writes,handler)=>{steps.push({id:name,handlerId:name,writes});handlers[name]=handler;};
        const relation=phase=>async()=>{const before=links(scene),after=before.map(l=>l.id===id?{...l,phase}:l);
          await scene.setFlag(MODULE_ID,'grapples',after);return {status:'completed',observed:{},changes:[{path:['grapples'],before,after}]};};
        add('begin-carry',[['grapples']],relation('carrying'));
        const projected=spend(board.budget,{move:board.plan.cost});
        add('reserve-movement',[['tokens',active,'actor','system','action_tracker']],async()=>{
          const before=structuredClone(source.actor.toObject().system.action_tracker);await source.actor.update({'system.action_tracker':projected.nativeTracker});
          return {status:'completed',observed:{},changes:[{path:['tokens',active,'actor','system','action_tracker'],before,after:projected.nativeTracker}]};});
        for(let i=1;i<route.length;i++)for(const tokenId of board.plan.orders[i-1]){
          const destination=tokenId===active?route[i]:board.plan.carriedPath[i],point=board.positions[tokenId]?.[cellKey(destination)];
          if(!point)throw Error('Native paired waypoint is unavailable.');
          add(`move-${i}-${tokenId}`,[['tokens',tokenId,'token','x'],['tokens',tokenId,'token','y']],async()=>{
            const token=canvas.tokens.get(tokenId),document=token.document,before={x:document.x,y:document.y};
            await approvedPilotMove(document,[{x:point.x,y:point.y}],{method:'api',npcPilotExecutionId:`grapple:${id}`});
            await token.movementAnimationPromise;
            if(document.x!==point.x||document.y!==point.y)throw Error('Native grapple movement was interrupted.');
            return {status:'completed',observed:{tokenId},changes:['x','y'].filter(k=>before[k]!==point[k])
              .map(k=>({path:['tokens',tokenId,'token',k],before:before[k],after:point[k]}))};
          });
        }
        add('end-carry',[['grapples']],relation('active'));
        const session=new ExecutionSession({executionId:`grapple-move:${id}:${initial.turn}`,turn:initial.turn,steps},initial,{read,handlers,persist:async r=>{
          await scene.setFlag(MODULE_ID,'grappleOperation',r);journal=structuredClone(r);
          if(canonicalData(scene.getFlag(MODULE_ID,'grappleOperation'))!==canonicalData(journal))throw Error('Unconfirmed grapple journal.');}});
        startWindow=null;return session.run();
      });
    },
    async release(id){
      requireExecution();const scene=canvas.scene,turn=captureExecutionState({game,canvas}).turn;
      const link=links(scene).find(l=>l.id===id);if(!link)throw Error('This grapple is no longer active.');
      const combat=game.combat;
      if(combat?.started&&combat.combatant?.tokenId!==link.sourceTokenId)throw Error('End Grapple is a free action on the active grappler’s turn.');
      const actor=canvas.tokens.get(link.sourceTokenId)?.actor;
      if(actor?.statuses?.has('stunned'))throw Error('The active grappler cannot take free actions while Stunned.');
      const confirmed=await DialogV2.confirm({window:{title:'NPC Pilot — end grapple'},
        content:`<p>End the grapple between ${escapeHtml(canvas.tokens.get(link.sourceTokenId)?.name??link.sourceTokenId)} and ${escapeHtml(canvas.tokens.get(link.targetTokenId)?.name??link.targetTokenId)}? Only this grapple’s effects will be removed.</p>`});
      if(!confirmed)return false;
      requireExecution();if(canvas.scene!==scene||captureExecutionState({game,canvas}).turn!==turn
        ||canonicalData(links(scene).find(l=>l.id===id)??null)!==canonicalData(link))throw Error('The grapple, scene or active turn changed.');
      return drop(id,undefined,requireExecution);
    },
    async cleanup(deletedDocument){
      if(!responsible(game)||!canvas.scene)return;
      for(const link of links(canvas.scene)){
        if((link.phase==='carrying'||link.phase==='pending')&&!nativeEnded(link,{canvas,game}))continue;
        let keep;try{keep=adjacent(link,{canvas,constants});}catch(error){notifications?.warn(error.message);continue;}
        if(nativeEnded(link,{canvas,game})||!keep)await drop(link.id,deletedDocument,undefined,true);
      }
    },
  };
  const cleanup=document=>api.cleanup(document).catch(e=>notifications?.error(e.message));
  Hooks?.on('deleteToken',cleanup);
  Hooks?.on('deleteActor',()=>cleanup());
  Hooks?.on('updateActor',(actor,changes)=>{
    observeRefresh(actor);
    if(!canvas.tokens?.placeables?.some(t=>t.actor===actor))return;
    const keys=['hp','structure','destroyed'];
    if(keys.some(k=>Object.hasOwn(changes.system??{},k)||Object.hasOwn(changes,`system.${k}`)
      ||Object.keys(changes).some(p=>p.startsWith(`system.${k}.`))))return cleanup();
  });
  Hooks?.on('updateCombatant',(combatant,changes)=>{
    observeTurnStatus(combatant);
    if(Object.hasOwn(changes,'defeated'))return cleanup();
  });
  Hooks?.on('updateToken',(document,changes)=>{
    if(['x','y','elevation'].some(k=>Object.hasOwn(changes,k)))startWindow=null;
    if(isApprovedPilotMove(document)||!['x','y','elevation'].some(k=>Object.hasOwn(changes,k)))return;
    cleanup();
  });
  // Native turn banners and ordinary conversation spend no actions. Native
  // rolls/damage and action flows still close the window before resolution.
  Hooks?.on('createChatMessage',message=>{if(message?.rolls?.length||message?.flags?.lancer)startWindow=null;});
  for(const name of game.lancer?.flows?.keys?.()??[]){
    if(['ActionTrackFlow','NPCRechargeFlow'].includes(name))continue;
    Hooks?.on(`lancer.preFlow.${name}`,()=>{startWindow=null;});
  }
  Hooks?.on('updateCombat',(combat,changes)=>{
    startWindow=null;refreshes=[];turnStatus=null;
    if(responsible(game)&&combat===game.combat&&combat.started&&combat.combatant?.tokenId&&('turn'in changes||'round'in changes)){
      startWindow=captureExecutionState({game,canvas});
      const ruler=game.modules?.get('lancer-speed-provider');
      if(ruler?.active&&ruler.version==='7.3')turnStatus={id:combat.combatant.id,
        statuses:[...canvas.tokens.get(combat.combatant.tokenId).actor.statuses]};
      const previous=(combat.combatants?.contents??combat.combatants??[])
        .find(c=>c.id===combat.previous?.combatantId)?.tokenId;
      for(const [tokenId,{actor}]of Object.entries(startWindow.tokens)){
        if(!actor?.system?.action_tracker)continue;
        refreshes.push({tokenId,patch:{reaction:true}});
        if(tokenId===combat.combatant.tokenId)refreshes.push({tokenId,patch:{protocol:true,
          move:canvas.tokens.get(tokenId).actor.system.speed,full:true,quick:true,reaction:true}});
        else if(tokenId===previous)refreshes.push({tokenId,patch:{protocol:false,move:0,full:false,quick:false,reaction:true}});
      }
    }
    return cleanup();
  });
  // Movement handlers perform follow/release review before adjacency cleanup.
  return api;
}
