import { MODULE_ID } from './snapshot.mjs';
import { isApprovedPilotMove } from './movement-authority.mjs';

/** Registered on player clients as well as GM clients. External native API
 * forced movement remains available and may break adjacency; ordinary dragging
 * uses the GM's reviewed paired route instead of silently separating bodies.
 */
export function registerGrappleMovementGuard({canvas,Hooks,notifications}){
  Hooks.on('preMoveToken',(document,movement)=>{
    if(isApprovedPilotMove(document)||movement?.method==='api')return;
    const token=canvas.tokens?.placeables?.find(t=>t.document===document);
    if(!token)return;
    const links=canvas.scene?.getFlag(MODULE_ID,'grapples');
    if(!Array.isArray(links)||!links.some(l=>[l.sourceTokenId,l.targetTokenId].includes(token.id)))return;
    notifications?.warn('Pilot-owned grapple: ask the GM to use the reviewed paired-movement action, or end the grapple first.');
    return false;
  });
}
