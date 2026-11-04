// A public token option cannot forge an in-progress Pilot movement call.
const active=new WeakSet();
export const isApprovedPilotMove=document=>active.has(document);
export async function approvedPilotMove(document,waypoints,options){
  if(active.has(document))throw Error('This token already has an approved movement in progress.');
  active.add(document);
  try{return await document.move(waypoints,options);}finally{active.delete(document);}
}
