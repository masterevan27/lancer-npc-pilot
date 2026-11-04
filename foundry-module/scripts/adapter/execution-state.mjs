import { MODULE_ID } from './snapshot.mjs';

const plain=v=>JSON.parse(JSON.stringify(v));
function bookkeeping(doc){
  delete doc._stats;
  return doc;
}
function embeddedMetadata(actor){
  for(const key of ['items','effects'])for(const doc of actor[key]??[])delete doc._stats;
  return actor;
}
/** Full native source guard for multi-document steps. ActorDelta is represented
 * by its authoritative synthetic actor source rather than duplicated token data.
 * Coordinates, effects, items, resources and every unrelated flag stay guarded.
 */
export function captureExecutionState({game,canvas,extraActors=[]}) {
  const combat=game.combat,scene=canvas.scene,activeId=combat?.combatant?.tokenId;
  if(!scene||(combat&&(!activeId||combat.scene?.id!==scene.id)))throw Error('The active encounter changed.');
  const sceneData=bookkeeping(plain(scene.toObject()));delete sceneData.tokens;
  const grapples=plain(scene.getFlag?.(MODULE_ID,'grapples')??[]);
  if(sceneData.flags?.[MODULE_ID]){
    delete sceneData.flags[MODULE_ID].grapples;
    delete sceneData.flags[MODULE_ID].grappleOperation;
    if(!Object.keys(sceneData.flags[MODULE_ID]).length)delete sceneData.flags[MODULE_ID];
  }
  if(sceneData.flags&&!Object.keys(sceneData.flags).length)delete sceneData.flags;
  const tokens=Object.fromEntries(canvas.tokens.placeables.map(t=>{
    const token=bookkeeping(plain(t.document.toObject())),actor=t.actor?embeddedMetadata(bookkeeping(plain(t.actor.toObject()))):null;
    delete token.delta;delete token._movementHistory;
    for(const [ns,field]of [['lancer-automations','moveHistory'],['about-face','prevPos'],['about-face','direction']]){
      if(token.flags?.[ns]){delete token.flags[ns][field];if(!Object.keys(token.flags[ns]).length)delete token.flags[ns];}
    }
    if(token.flags&&!Object.keys(token.flags).length)delete token.flags;
    for(const axis of ['scaleX','scaleY'])if(Number.isFinite(token.texture?.[axis]))token.texture[axis]=Math.abs(token.texture[axis]);
    if(t.id===activeId&&actor?.flags?.[MODULE_ID]){
      for(const key of ['lastExecution','executionSession','trampleLedger'])delete actor.flags[MODULE_ID][key];
      if(!Object.keys(actor.flags[MODULE_ID]).length)delete actor.flags[MODULE_ID];
    }
    if(actor?.flags&&!Object.keys(actor.flags).length)delete actor.flags;
    return [t.id,{token,actor}];
  }));
  const detachedActors=Object.fromEntries(extraActors.map(actor=>[actor.uuid,
    embeddedMetadata(bookkeeping(plain(actor.toObject())))]));
  return {turn:combat?`${scene.id}:${combat.id}:${combat.round}:${combat.turn}:${activeId}`:`${scene.id}:no-combat`,scene:sceneData,
    combat:combat?bookkeeping(plain(combat.toObject())):null,tokens,grapples,
    ...(extraActors.length?{detachedActors}:{})};
}
