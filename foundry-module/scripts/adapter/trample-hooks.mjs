import { MODULE_ID } from './snapshot.mjs';
import { initializeTrampleTurn,invalidateTrampleHistory,trampleHistory } from './trample-history.mjs';
import { isApprovedPilotMove } from './movement-authority.mjs';

export function registerTrampleHistory({game,canvas,Hooks,withLock,notifications}){
  let pending=Promise.resolve();
  const responsible=()=>game.user?.isGM===true&&game.users?.activeGM?.id===game.user.id;
  const current=()=>{
    const combat=game.combat,scene=canvas.scene,token=canvas.tokens.get(combat?.combatant?.tokenId);
    if(!combat?.started||combat.scene?.id!==scene?.id||!token?.actor)return null;
    const binding=token.actor.getFlag(MODULE_ID,'policyBinding');
    if(binding?.policyId!=='cataphract-base-t1'||binding.classId!=='npcc_cataphract')return null;
    return {actor:token.actor,document:token.document,turn:`${scene.id}:${combat.id}:${combat.round}:${combat.turn}:${token.id}`};
  };
  const act=async(captured,initialize)=>{
    if(!captured||!responsible())return;
    return withLock(`lancer-npc-pilot:${captured.turn}`,async()=>{
      if(!responsible())return;
      const fresh=current();if(!fresh||fresh.turn!==captured.turn||fresh.actor!==captured.actor)return;
      if(initialize)await initializeTrampleTurn(fresh.actor,fresh.turn,{nativeTurnEvent:true});
      else await invalidateTrampleHistory(fresh.actor,fresh.turn);
    });
  };
  const handle=operation=>operation.catch(e=>notifications?.error(e.message));
  Hooks.on('updateCombat',(combat,changes)=>{
    if(combat!==game.combat||!('turn'in changes||'round'in changes))return;
    pending=handle(act(current(),true));return pending;
  });
  Hooks.on('moveToken',document=>{
    if(isApprovedPilotMove(document))return;
    const captured=current();if(captured?.document!==document)return;
    return handle(act(captured,false));
  });
  // Joining/reloading cannot prove what happened while this client was absent.
  // Preserve all claims and invalidate knowledge; never grant a fresh allowance.
  const joined=current();
  if(joined&&trampleHistory(joined.actor,joined.turn).known)pending=handle(act(joined,false));
  return {settled:()=>pending};
}
