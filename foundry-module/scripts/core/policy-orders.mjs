import { cellKey, cellDistance } from './grid.mjs';
import { areEnemies, isDefeated } from './snapshot.mjs';
import { validateOrder,canonicalPlanKey } from './policy-data.mjs';

export const factsFor = (candidate, context) => context.factsByPlanKey?.[canonicalPlanKey(candidate)] ?? {};
export const PRESSURE_SCALE = 20; // Estimated HP pressure 0..20 maps to desirability 0..100.
export const pressure = c => Math.max(0,Math.min(1,(Number.isFinite(c.facts?.expectedDamage)?c.facts.expectedDamage:0)/PRESSURE_SCALE));
export function finalNativeCells(candidate, context, end = candidate.move?.to) {
  const me=context.snapshot.tokens.find(t=>t.id===context.snapshot.activeTokenId);
  const cells=end ? me?.occupiedCells?.[cellKey(end)] : me?.occupiedCells?.[cellKey(me.pos)];
  const result=cells; // Mandatory native geometry is never overridden by tactical facts.
  return Array.isArray(result) && result.length && result.every(c=>Number.isSafeInteger(c.x)&&Number.isSafeInteger(c.y)) ? result : null;
}
const response = (allowed,needsInput,reasons,utility=0) => ({allowed,needsInput,reasons,utility});
export function checkOrder(candidate, context) {
  const {order,snapshot}=context;
  if(!validateOrder(order,context).ok) return response(false,true,['invalid-order']);
  if(order.kind==='free') return response(true,false,[],0);
  const me=snapshot.tokens.find(t=>t.id===snapshot.activeTokenId),p=order.parameters;
  const unknown = code => order.mode==='hard' ? response(false,true,[code]) : response(true,false,[code],0);
  let target;
  if(['focus-target','protect-ally'].includes(order.kind)) {
    target=snapshot.tokens.find(t=>t.id===(p.targetTokenId ?? p.allyTokenId));
    if(!target || !me || isDefeated(target) || (order.kind==='focus-target' ? !areEnemies(me,target)
      : target.id===me.id || target.side!==me.side)) return response(false,true,['order-target-unavailable']);
  }
  const branches=[{end:candidate.move?.to ?? me.pos},...(candidate.branches ?? [])];
  const utilities=[];
  for(const branch of branches) {
    if(order.kind==='focus-target') {
      // Boost's target IDs describe a direction, not a hostile-targeted action.
      const ids=['boost','retreat','hold','hide'].includes(candidate.action.kind) ? []
        : branch.targetTokenIds ?? candidate.action.targetTokenIds ?? [];
      const targets=ids.map(id=>snapshot.tokens.find(t=>t.id===id));
      if(targets.some(t=>!t)) return unknown('order-target-unknown');
      if(order.mode==='hard' && targets.some(t=>areEnemies(me,t) && t.id!==target.id)) return response(false,false,['outside-focus-target']);
      utilities.push(ids.includes(target.id) && candidate.action.kind==='attack' ? Math.round(pressure(candidate)*100) : 0);
      continue;
    }
    if(!branch.end || !Number.isSafeInteger(branch.end.x) || !Number.isSafeInteger(branch.end.y)) return unknown('native-footprint-unknown');
    const cells=finalNativeCells(candidate,context,branch.end);
    if(!cells) return unknown('native-footprint-unknown');
    if(order.kind==='hold-area') {
      const area=new Set(p.areaCells.map(cellKey)), inside=cells.filter(c=>area.has(cellKey(c))).length;
      if(order.mode==='hard' && inside!==cells.length) return response(false,false,['outside-hold-area']);
      utilities.push(Math.round(100*inside/cells.length));
    } else {
      const allyCells=target.occupiedCells?.[cellKey(target.pos)];
      if(!Array.isArray(allyCells) || !allyCells.length) return unknown('native-distance-unknown');
      const distance=Math.min(...cells.flatMap(a=>allyCells.map(b=>cellDistance(snapshot.grid,a,b))));
      if(!Number.isFinite(distance)) return unknown('native-distance-unknown');
      const inside=distance<=p.maxEndDistance;
      if(order.mode==='hard' && !inside) return response(false,false,['outside-protect-radius']);
      const threats=factsFor(candidate,context).threatsToAlly;
      const useful=Array.isArray(threats) && candidate.action.kind==='attack'
        && (candidate.action.targetTokenIds ?? []).some(id=>threats.includes(id)
          && snapshot.tokens.some(t=>t.id===id&&areEnemies(me,t)&&!isDefeated(t)));
      utilities.push(inside ? 75 + (useful ? Math.round(25*pressure(candidate)) : 0)
        : Math.round(74/(1+distance-p.maxEndDistance)));
    }
  }
  return response(true,false,[order.kind],order.mode==='soft'?Math.min(...utilities):0);
}
