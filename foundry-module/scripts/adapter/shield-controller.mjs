import { MODULE_ID, readToken } from './snapshot.mjs';
import { captureExecutionState } from './execution-state.mjs';
import { ExecutionSession } from './execution-session.mjs';
import { reviewCataphractSource } from './cataphract-source.mjs';
import { gridInfo } from './geometry.mjs';
import { shieldSource } from '../core/cataphract.mjs';
import { shieldDamageSteps } from './shield.mjs';
import { applyNativeDamage } from './native-damage.mjs';
import { canonicalData } from '../core/policy-data.mjs';
import { escapeHtml } from './review.mjs';

const same=(a,b)=>canonicalData(a)===canonicalData(b);
const responsible=game=>game.user?.isGM===true&&game.users?.activeGM?.id===game.user.id;
// Foundry speaker data can contain unset optional fields such as alias.
const nativeCard=message=>JSON.parse(JSON.stringify({speaker:message.speaker,damage:message.flags?.lancer?.damageData??null}));
/** Only newly observed native damage cards may enter this source-specific
 * path. Reload/old cards and ambiguous speakers retain an explicit manual gap.
 */
export function createShieldController({game,canvas,constants,Hooks,DialogV2,withLock,notifications,canExecute=()=>false,crypto=globalThis.crypto}={}){
  if(!game?.user?.isGM)return null;
  const observed=new Map();
  const requireGM=()=>{if(!responsible(game))throw Error('Only the active GM may apply Shield damage.');
    if(!canExecute())throw Error('Execution is disabled.');};
  const api={async apply(messageId,targetUuid,{multiple=1,addBurn=true}={}){
    requireGM();
    if(game.modules?.get('lancer-automations')?.active)
      throw Error('Lancer Automations damage coexistence requires manual Shield resolution. No damage was applied.');
    const message=game.messages.get(messageId),captured=observed.get(messageId);
    if(!message||!captured)throw Error('A fresh native damage card observed in this session is required. Continue manually.');
    const current=()=>{requireGM();if(game.messages.get(messageId)!==message||!same(nativeCard(message),captured.card))throw Error('Native damage source or payload changed.');
      return captureExecutionState({game,canvas});};
    if(!same(current(),captured.state))throw Error('The board changed since the native damage card. Continue manually.');
    const speaker=message.speaker,source=canvas.tokens.get(speaker.token),target=canvas.tokens.placeables.find(t=>t.document.uuid===targetUuid);
    // Native Lancer 3.1.3 omits scene even for a token-backed speaker. The
    // fresh card's captured board and exact token/actor still bind its source.
    if((speaker.scene!=null&&speaker.scene!==canvas.scene.id)||!source||source.actor?.id!==speaker.actor||!target?.actor||target===source)
      throw Error('A unique native source token and target are required.');
    if(canvas.tokens.placeables.some(t=>t!==target&&t.actor===target.actor))throw Error('A shared target actor requires manual application.');
    // Foundry toObject() adds non-enumerable migration accessors. Use the
    // native JSON boundary, retaining item version metadata for source review.
    const readiness=await reviewCataphractSource(JSON.parse(JSON.stringify(target.actor.toObject())),game.system.version,{crypto});
    if(!same(current(),captured.state))throw Error('The board changed during Shield source review.');
    if(!readiness.readiness.shield.ready)throw Error('Exact reviewed Shield source/readiness is unavailable. Continue manually.');
    const rows=captured.card.damage?.targetDamageResults?.filter(r=>r.target===targetUuid);
    if(rows?.length!==1)throw Error('A unique native target damage payload is required.');
    const snapshot={grid:gridInfo(canvas.scene,canvas.grid,canvas.dimensions,constants),tokens:canvas.tokens.placeables.map(t=>readToken(t,canvas.grid))};
    for(const t of snapshot.tokens)if((game.combat?.combatants?.contents??game.combat?.combatants??[]).some(c=>c.tokenId===t.id&&c.defeated))t.defeated=true;
    const geometry=shieldSource(snapshot,target.id);
    if(geometry.knowledge!=='known')throw Error('Complete Shield hostile-distance geometry is required.');
    const resistance=geometry.closestHostileTokenId===source.id;
    // Shield protects against the unique nearest hostile, per its exact source.
    const damageSteps=shieldDamageSteps(rows[0],{resistance,hasHeatcap:target.actor.hasHeatcap(),multiple,addBurn});
    const previous=message.getFlag(MODULE_ID,'shieldClaims')??[];
    if(!Array.isArray(previous)||previous.includes(targetUuid))throw Error('This native card target was already claimed. Continue manually.');
    const confirmed=await DialogV2.confirm({window:{title:'NPC Pilot — Point-Defense Shield damage'},
      content:`<p>Apply the confirmed native damage from ${escapeHtml(source.name??source.id)} to ${escapeHtml(target.name??target.id)}?</p>
        <p>${rows[0].damage.map(d=>`${escapeHtml(d.amount)} ${escapeHtml(d.type)}`).join(', ')}. Native multiplier: ${escapeHtml(multiple)}. Add Burn: ${addBurn?'yes':'no'}.</p>
        <p>Shield resistance: ${resistance?'yes (unique nearest hostile)':'no'}. Native armor, typed resistances, Shredded and Paracausal remain authoritative. Heat receives no extra resistance from Shield.</p>`});
    if(!confirmed)return {status:'cancelled'};
    return withLock(`lancer-npc-pilot:${canvas.scene.id}:mechanics`,async()=>{
      if(!same(current(),captured.state)||!same(message.getFlag(MODULE_ID,'shieldClaims')??[],previous))throw Error('The damage card or board changed before application.');
      let journal=null,claims=[...previous,targetUuid];
      const read=()=>{const state=current();if(!same(message.getFlag(MODULE_ID,'shieldClaims'),claims)
        ||(journal!==null&&!same(message.getFlag(MODULE_ID,'shieldOperation'),journal)))throw Error('The Shield application claim changed.');return state;};
      const handlers={},steps=damageSteps.map((step,i)=>{
        const id=`damage-${i}`;handlers[id]=async(_step,{verify})=>{
          const r=await applyNativeDamage(target.actor,step.damage,{...step,game,verify});
          return {...r,changes:r.changes.map(c=>({...c,path:['tokens',target.id,'actor',...c.path]}))};};
        return {id,handlerId:id,writes:[['system','hp','value'],['system','overshield','value'],['system','heat','value'],['system','burn']]
          .map(path=>['tokens',target.id,'actor',...path])};
      });
      // Validate before persisting the write-ahead target claim.
      const session=new ExecutionSession({executionId:`shield:${messageId}:${targetUuid}`,turn:captured.state.turn,steps},captured.state,{read,handlers,persist:async r=>{
        await message.setFlag(MODULE_ID,'shieldOperation',r);journal=structuredClone(r);
        if(!same(message.getFlag(MODULE_ID,'shieldOperation'),journal))throw Error('Unconfirmed Shield journal.');}});
      await message.setFlag(MODULE_ID,'shieldClaims',claims);
      if(!same(message.getFlag(MODULE_ID,'shieldClaims'),claims))throw Error('Unconfirmed Shield target claim.');
      const receipt=await session.run();
      if(receipt.status==='completed')captured.state=current();
      return receipt;
    });
  }};
  Hooks?.on('createChatMessage',message=>{
    if(!responsible(game)||!message.flags?.lancer?.damageData)return;
    try{observed.set(message.id,{card:nativeCard(message),state:captureExecutionState({game,canvas})});
      if(observed.size>100)observed.delete(observed.keys().next().value);
    }catch(error){notifications?.warn(error.message);}
  });
  Hooks?.on('renderChatMessageHTML',(message,html)=>{
    // A capture listener replaces only Shield-bearing targets' native Apply
    // clicks. The native payload and multiplier remain the source of input.
    for(const group of html.querySelectorAll?.('.lancer-damage-button-group')??[]){
      const target=canvas.tokens.placeables.find(t=>t.document.uuid===group.dataset.target);
      if(![...(target?.actor?.items??[])].some(i=>i.system?.lid==='npcf_point_defense_shield_cataphract'))continue;
      group.addEventListener('click',event=>{
        if(!event.target.closest?.('.lancer-damage-apply'))return;
        event.preventDefault();event.stopImmediatePropagation();
        void api.apply(message.id,group.dataset.target,{multiple:Number(group.querySelector('select')?.value??1),addBurn:group.dataset.addBurn==='true'})
          .catch(error=>notifications?.error(error.message));
      },{capture:true});
    }
  });
  return api;
}
