import { inertData, record } from '../core/policy-data.mjs';

const types=['Kinetic','Energy','Explosive','Burn','Heat','Variable'];
const count=n=>Number.isFinite(n)&&n>=0;
/** Called only by an approved handler. Native calculation owns mitigation and
 * document updates; the returned receipt describes its confirmed mutations.
 * Resistance uses native post-armor semantics, never the damage HUD half flag.
 */
export async function applyNativeDamage(actor,damage,{game,resistance=false,ap=false,paracausal=false,addBurn=true,verify=()=>{}}={}) {
  if(game?.system?.version!=='3.1.3'||typeof actor?.damageCalc!=='function'||typeof actor.hasHeatcap!=='function')
    throw Error('Native damage requires reviewed Lancer 3.1.3 support.');
  if(!record(damage)||!inertData(damage)||!Object.keys(damage).length||Object.entries(damage).some(([k,v])=>!types.includes(k)||!count(v))
    ||[resistance,ap,paracausal,addBurn].some(v=>typeof v!=='boolean'))throw Error('Invalid confirmed native damage.');
  const before={hp:actor.system.hp?.value,overshield:actor.system.overshield?.value,heat:actor.system.heat?.value??0,burn:actor.system.burn};
  if(!Number.isFinite(before.hp)||!count(before.overshield)||!count(before.heat)||!count(before.burn))throw Error('Native damage baseline is unavailable.');
  const mitigated=Object.fromEntries(types.map(k=>[k,damage[k]??0]));
  verify();
  const hpDamage=await actor.damageCalc(mitigated,{multiple:resistance?0.5:1,ap,paracausal,addBurn});
  if(!count(hpDamage)||types.some(k=>!count(mitigated[k])))throw Error('Unconfirmed native damage result.');
  const harm=mitigated.Kinetic+mitigated.Energy+mitigated.Explosive+mitigated.Variable+mitigated.Burn;
  const after={hp:before.hp-hpDamage,overshield:Math.max(0,before.overshield-harm),heat:before.heat+mitigated.Heat,burn:before.burn+(addBurn?mitigated.Burn:0)};
  const fields={hp:['system','hp','value'],overshield:['system','overshield','value'],heat:['system','heat','value'],burn:['system','burn']};
  const changes=[];
  for(const [key,path]of Object.entries(fields)){
    const actual=path.reduce((v,k)=>v?.[k],actor)??(key==='heat'?0:undefined);
    if(actual!==after[key])throw Error('The native damage result or target changed. Continue manually.');
    if(before[key]!==after[key])changes.push({path,before:before[key],after:after[key]});
  }
  return {status:'completed',observed:{actorId:actor.id,hpDamage,mitigated},changes};
}
