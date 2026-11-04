import { inertData, record } from '../core/policy-data.mjs';

const types=['Kinetic','Energy','Explosive','Burn','Heat','Variable'];
/** Native AppliedDamage parses each amount before summing like types. Shield
 * resists damage; Heat is separate unless native heatless conversion makes it
 * Energy. Native user-selected half applies independently to Heat as well.
 */
export function shieldDamageSteps(payload,{resistance,hasHeatcap,multiple=1,addBurn=true}={}){
  if(!record(payload)||!inertData(payload)||!Array.isArray(payload.damage)||!payload.damage.length
    ||[payload.ap,payload.paracausal,resistance,hasHeatcap,addBurn].some(v=>typeof v!=='boolean')
    ||![0.5,1,2].includes(multiple))throw Error('Unsupported native damage payload or modifier.');
  const damage={};
  for(const component of payload.damage){
    if(!record(component)||!types.includes(component.type)||!Number.isFinite(component.amount)||component.amount<0)
      throw Error('Unsupported confirmed native damage component.');
    const amount=parseInt(String(component.amount),10);
    if(!Number.isSafeInteger(amount))throw Error('Unsupported native damage amount.');
    damage[component.type]=(damage[component.type]??0)+amount*(multiple===2?2:1);
    if(!Number.isSafeInteger(damage[component.type]))throw Error('Unsupported native damage total.');
  }
  const step=(d,r)=>({damage:d,resistance:r,ap:payload.ap,paracausal:payload.paracausal,addBurn});
  if(multiple===0.5)return [step(damage,true)];
  if(!resistance||!hasHeatcap||!damage.Heat)return [step(damage,resistance)];
  const heat=damage.Heat;delete damage.Heat;
  return [...(Object.keys(damage).length?[step(damage,true)]:[]),step({Heat:heat},false)];
}
