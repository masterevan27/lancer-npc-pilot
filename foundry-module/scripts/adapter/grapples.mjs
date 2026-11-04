import { inertData, record, canonicalData } from '../core/policy-data.mjs';
import { MODULE_ID } from './snapshot.mjs';

const linkValid=l=>record(l)&&inertData(l)&&['id','sourceTokenId','targetTokenId','sourceActorId','targetActorId','controllerTokenId']
  .every(k=>typeof l[k]==='string'&&l[k])&&l.sourceTokenId!==l.targetTokenId
  &&[l.sourceTokenId,l.targetTokenId].includes(l.controllerTokenId);
const owned=(e,id)=>e.flags?.[MODULE_ID]?.grapple?.id===id;
// Match captureExecutionState's native-document JSON projection, including
// omission of unset Foundry duration fields.
const clean=e=>{const copy=JSON.parse(JSON.stringify(e));delete copy._stats;return copy;};
const effects=actor=>{const data=actor.toObject().effects;if(!Array.isArray(data))throw Error('Native effect source is unavailable.');return data.map(clean);};
const same=(a,b)=>canonicalData(a)===canonicalData(b);
function effectData(link,tokenId){
  const controlled=link.controllerTokenId!==tokenId;
  return {name:controlled?'Impale — grappled':'Impale — controlling grapple',img:'icons/svg/net.svg',
    disabled:false,transfer:false,statuses:['engaged','npc-pilot-grapple',...(controlled?['immobilized']:[])],
    changes:[{key:'system.action_tracker.reaction',mode:5,value:'false',priority:50}],
    flags:{[MODULE_ID]:{grapple:{id:link.id,sourceTokenId:link.sourceTokenId,targetTokenId:link.targetTokenId,tokenId}}}};
}
const exact=(actual,data)=>actual.disabled===false&&actual.transfer===false&&same(actual.flags?.[MODULE_ID],data.flags[MODULE_ID])
  &&same(actual.statuses,data.statuses)&&same(actual.changes,data.changes);

/** Native documents, independently owned by Pilot. No Lancer Automations
 * private flags or synthetic hit events are used to establish a saved grapple.
 */
export async function createNativeGrappleEffect(actor,link,tokenId) {
  if(!linkValid(link)||![link.sourceTokenId,link.targetTokenId].includes(tokenId)
    ||actor?.id!==(tokenId===link.sourceTokenId?link.sourceActorId:link.targetActorId)
    ||typeof actor.createEmbeddedDocuments!=='function')throw Error('Invalid native grapple identity.');
  const before=effects(actor);
  if(before.some(e=>owned(e,link.id)))throw Error('An effect for this grapple already exists. Continue manually.');
  const data=effectData(link,tokenId);
  const created=await actor.createEmbeddedDocuments('ActiveEffect',[data]);
  if(!Array.isArray(created)||created.length!==1||typeof created[0]?.toObject!=='function')throw Error('Unconfirmed native grapple effect.');
  const actual=clean(created[0].toObject());
  if(!actual._id||!exact(actual,data)||!owned(actual,link.id)
    ||!same(effects(actor),[...before,actual]))throw Error('Native grapple creation changed unexpectedly. Continue manually.');
  return {status:'completed',observed:{actorId:actor.id,effectId:actual._id,grappleId:link.id},
    changes:[{path:['effects'],before,after:[...before,actual]}]};
}

export async function updateNativeGrappleEffect(actor,link,tokenId){
  if(!linkValid(link)||![link.sourceTokenId,link.targetTokenId].includes(tokenId)
    ||actor?.id!==(tokenId===link.sourceTokenId?link.sourceActorId:link.targetActorId)
    ||typeof actor.updateEmbeddedDocuments!=='function')throw Error('Invalid native grapple identity.');
  const before=effects(actor),matches=before.filter(e=>owned(e,link.id));
  if(matches.length!==1||matches[0].disabled)throw Error('The active owned grapple effect is missing or ambiguous.');
  const data=effectData(link,tokenId);
  // Foundry returns no updated documents for an unchanged effect. A native
  // contest retaining the existing controller needs no effect write at all.
  if(exact(matches[0],data)&&matches[0].name===data.name&&matches[0].img===data.img)
    return {status:'completed',observed:{actorId:actor.id,grappleId:link.id,controllerTokenId:link.controllerTokenId},changes:[]};
  const updated=await actor.updateEmbeddedDocuments('ActiveEffect',[{_id:matches[0]._id,...data}]);
  if(!Array.isArray(updated)||updated.length!==1)throw Error('Unconfirmed native grapple control update.');
  const actual=clean(updated[0].toObject()),after=before.map(e=>e._id===matches[0]._id?actual:e);
  if(actual._id!==matches[0]._id||!exact(actual,data)||!same(effects(actor),after))throw Error('Native grapple control changed unexpectedly.');
  return {status:'completed',observed:{actorId:actor.id,grappleId:link.id,controllerTokenId:link.controllerTokenId},
    changes:[{path:['effects'],before,after}]};
}

export async function removeNativeGrappleEffects(actor,grappleId) {
  if(typeof grappleId!=='string'||!grappleId||typeof actor?.deleteEmbeddedDocuments!=='function')throw Error('Invalid grapple release.');
  const before=effects(actor),remove=before.filter(e=>owned(e,grappleId));
  if(remove.length){
    const deleted=await actor.deleteEmbeddedDocuments('ActiveEffect',remove.map(e=>e._id));
    if(!Array.isArray(deleted)||!same(deleted.map(e=>e.toObject()._id).sort(),remove.map(e=>e._id).sort()))throw Error('Unconfirmed native grapple release.');
  }
  const after=before.filter(e=>!owned(e,grappleId));
  if(!same(effects(actor),after))throw Error('Native grapple release changed unexpectedly. Continue manually.');
  return {status:'completed',observed:{actorId:actor.id,grappleId,removedEffectIds:remove.map(e=>e._id)},
    changes:remove.length?[{path:['effects'],before,after}]:[]};
}
