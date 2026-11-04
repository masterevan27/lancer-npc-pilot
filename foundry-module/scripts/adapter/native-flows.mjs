/** Instance-local adapters. No dice creation, registry or prototype changes. */
export function prepareHullSave(actor,saveTarget,game,{verify=()=>{}}={}) {
  if(!Number.isSafeInteger(saveTarget)||saveTarget<1)throw Error('A current native save target is required.');
  return prepareNativeHull(actor,game,{verify,saveTarget});
}
export function prepareHullCheck(actor,game,{verify=()=>{}}={}) {
  return prepareNativeHull(actor,game,{verify,saveTarget:null});
}
function prepareNativeHull(actor,game,{verify,saveTarget}) {
  const Flow=game.lancer?.flows?.get('StatRollFlow');
  const required=['initStatRollData','showStatRollHUD','rollCheck','printStatRollCard'];
  if(game.system?.version!=='3.1.3'||typeof Flow!=='function'||typeof Flow.prototype.getStep!=='function'
    ||typeof Flow.prototype.begin!=='function'||!Array.isArray(Flow.steps)
    ||Flow.steps.length!==required.length||Flow.steps.some((s,i)=>s!==required[i]))
    throw Error('Hull saves require reviewed Lancer 3.1.3 flow support.');
  if(!actor?.id||!Number.isFinite(actor.system?.hull))throw Error('A native Hull actor is required.');
  const flow=new Flow(actor,{path:'system.hull',title:saveTarget===null?'Grapple — Hull contest':'Impale — Hull save (+1 difficulty)'});
  const getStep=flow.getStep.bind(flow);let difficulty=null,used=false;
  const check=state=>{
    verify();
    if(state.actor!==actor||state.item!==null||state.data?.path!=='system.hull')throw Error('Native save identity changed.');
  };
  for(const key of required)if(typeof getStep(key)!=='function')throw Error('Reviewed native save step is unavailable.');
  flow.getStep=key=>async (state,args)=>{
    check(state);
    if(key==='rollCheck'&&state.data.acc_diff?.base?.difficulty!==difficulty)throw Error('Native save difficulty changed.');
    const result=await getStep(key)(state,args);
    check(state);
    if(result!==false&&key==='initStatRollData') {
      const base=state.data.acc_diff?.base;
      if(!base||!Number.isSafeInteger(base.difficulty)||base.difficulty<0)throw Error('Invalid native save initialization.');
      base.difficulty+=saveTarget===null?0:1;difficulty=base.difficulty;
    }
    return result;
  };
  return Object.freeze({async resolve(){
    if(used)throw Error('This native save was already used.');used=true;
    verify();
    if(await flow.begin()!==true)return {status:'cancelled',observed:null};
    check(flow.state);
    const roll=flow.state.data?.result?.roll;
    if(!roll||typeof roll.toJSON!=='function'||roll.toJSON()?.evaluated!==true||!Number.isFinite(roll.total)
      ||flow.state.data.acc_diff?.base?.difficulty!==difficulty)throw Error('Invalid or unconfirmed native save roll.');
    return {status:'completed',observed:{actorId:actor.id,path:'system.hull',total:roll.total,
      ...(saveTarget===null?{}:{saveTarget,success:roll.total>=saveTarget}),difficulty}};
  }});
}
