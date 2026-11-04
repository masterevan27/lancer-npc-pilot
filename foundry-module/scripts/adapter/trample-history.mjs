import { MODULE_ID } from './snapshot.mjs';
import { inertData, record, canonicalData } from '../core/policy-data.mjs';

const valid=(h,turn)=>record(h)&&inertData(h)&&h.schemaVersion===1&&h.turn===turn&&typeof h.known==='boolean'
  &&Array.isArray(h.targets)&&h.targets.every(t=>typeof t==='string'&&!!t)&&new Set(h.targets).size===h.targets.length;
export function trampleHistory(actor,turn) {
  const h=actor.getFlag(MODULE_ID,'trampleLedger');
  return valid(h,turn)?structuredClone(h):{schemaVersion:1,turn,known:false,targets:[]};
}
async function save(actor,h){
  await actor.setFlag(MODULE_ID,'trampleLedger',h);
  const actual=actor.getFlag(MODULE_ID,'trampleLedger');
  if(!valid(actual,h.turn)||canonicalData(actual)!==canonicalData(h))throw Error('Unconfirmed Trample history write. Continue manually.');
  return structuredClone(h);
}
/** Called only from the observed native turn-change hook, never from ready,
 * planning, reload, cancellation or a resource refresh.
 */
export async function initializeTrampleTurn(actor,turn,{nativeTurnEvent=false}={}) {
  if(nativeTurnEvent!==true||typeof turn!=='string'||!turn)throw Error('An observed native turn event is required.');
  const existing=actor.getFlag(MODULE_ID,'trampleLedger');
  if(record(existing)&&existing.turn===turn)return trampleHistory(actor,turn);
  return save(actor,{schemaVersion:1,turn,known:true,targets:[]});
}
/** A target is claimed BEFORE native damage. Claims are not damage outcomes;
 * uncertain/cancelled writes never restore the allowance automatically.
 */
export async function claimTrampleTarget(actor,turn,tokenId) {
  const before=trampleHistory(actor,turn);
  if(!before.known)throw Error('Trample movement/damage history is unknown. Continue manually.');
  if(typeof tokenId!=='string'||!tokenId||before.targets.includes(tokenId))throw Error('This Trample target was already claimed or is invalid.');
  return save(actor,{...before,targets:[...before.targets,tokenId]});
}
export async function invalidateTrampleHistory(actor,turn) {
  return save(actor,{...trampleHistory(actor,turn),known:false});
}
