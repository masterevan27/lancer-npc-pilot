import { factsFor, finalNativeCells, pressure } from './policy-orders.mjs';
import { cellKey } from './grid.mjs';
import { areEnemies,isDefeated } from './snapshot.mjs';
const fact = (id,knowledge,value,utility,code) => ({id,unit:'desirability',knowledge,value,utility,reasonCodes:[code]});
const unknown = (id,code) => fact(id,'unknown',null,0,code);
const utility = n => Number.isInteger(n) && n>=0 && n<=100;
export function evaluateMetric(metricId,candidate,context) {
  const f=factsFor(candidate,context),caps=context.capabilities ?? {};
  switch(metricId) {
    case 'priority-access': {
      const p=context.priority;
      if(!p || (!p.targetTokenIds?.length && !p.areaCells?.length)) return unknown(metricId,'priority-context-unknown');
      const target=(candidate.action.targetTokenIds ?? []).some(id=>p.targetTokenIds?.includes(id));
      const cells=finalNativeCells(candidate,context);
      const area=new Set((p.areaCells ?? []).map(cellKey));
      const areaUtility=area.size && cells ? Math.round(100*cells.filter(c=>area.has(cellKey(c))).length/cells.length) : 0;
      if(area.size && !cells && !target) return unknown(metricId,'native-footprint-unknown');
      const u=Math.max(target && candidate.action.kind==='attack'?Math.round(100*pressure(candidate)):0,areaUtility);
      return fact(metricId,'known',u,u,'priority-access');
    }
    case 'shield-position': {
      if(caps.shield?.reviewed!==true || caps.shield?.available!==true) return unknown(metricId,'shield-support-unavailable');
      const s=f.shield;
      const me=context.snapshot.tokens.find(t=>t.id===context.snapshot.activeTokenId);
      const hostiles=context.snapshot.tokens.filter(t=>me && areEnemies(me,t) && !isDefeated(t));
      if(!s || s.populationComplete!==true || !Array.isArray(s.distances) || !s.distances.length
        || !s.distances.every(d=>typeof d.tokenId==='string'&&Number.isFinite(d.distance)&&d.distance>=0)
        || new Set(s.distances.map(d=>d.tokenId)).size!==s.distances.length
        || s.distances.length!==hostiles.length || hostiles.some(t=>!s.distances.some(d=>d.tokenId===t.id))) return unknown(metricId,'shield-context-unknown');
      const min=Math.min(...s.distances.map(d=>d.distance));
      if(s.distances.filter(d=>d.distance===min).length!==1) return fact(metricId,'known',0,0,'shield-tie');
      if(typeof s.usefulProtection!=='boolean') return unknown(metricId,'shield-danger-unknown');
      const u=s.usefulProtection?100:0;return fact(metricId,'known',u,u,u?'shield-position':'shield-not-useful');
    }
    case 'reaction-safety': {
      const r=f.reaction;
      if(r?.reviewed!==true || !['unexposed','exposed'].includes(r.exposure)) return unknown(metricId,'reaction-context-unknown');
      const u=r.exposure==='unexposed'?100:0;return fact(metricId,'known',u,u,u?'reaction-unexposed':'reaction-exposed');
    }
    case 'conditional-displacement': {
      if(caps.impale?.reviewed!==true || caps.impale?.available!==true) return unknown(metricId,'impale-unavailable');
      const d=f.displacement;
      if(d?.reviewed!==true || !Array.isArray(d.branches) || !d.branches.length
        || !d.branches.every(b=>typeof b.id==='string'&&utility(b.objectiveUtility))) return unknown(metricId,'displacement-context-unknown');
      const u=Math.min(...d.branches.map(b=>b.objectiveUtility)); // Conservative across represented conditional branches, no save probability.
      return fact(metricId,'known',u,u,'displacement-conditional');
    }
    default:return unknown(metricId,'metric-unregistered');
  }
}
const TEMPLATES=Object.freeze({
 'priority-access':'Estimated access to the supplied priority target or area.',
 'priority-context-unknown':'Priority target or area is unknown; no rear area inferred.',
 'shield-position':'Estimated useful shield positioning, conditional on reviewed native passive resolution.',
 'shield-tie':'Closest-hostile distances tie; no shield positioning benefit estimated.',
 'shield-not-useful':'Unique proximity has no known useful protection benefit.',
 'shield-support-unavailable':'Reviewed shield support is unavailable; protection is unknown.',
 'shield-context-unknown':'Shield distance population is unknown.',
 'shield-danger-unknown':'Useful incoming protection is unknown.',
 'reaction-context-unknown':'Reaction exposure is unknown; resolve reactions manually.',
 'reaction-unexposed':'The reviewed route has no known reaction exposure; interruption still requires revalidation.',
 'reaction-exposed':'The reviewed route has known reaction exposure; Trample grants no reaction immunity.',
 'impale-unavailable':'Impale is unavailable; no displacement benefit estimated.',
 'displacement-context-unknown':'Conditional displacement context is unknown.',
 'displacement-conditional':'Conditional displacement opportunity; native save and choices must resolve first.',
 'no-applicable-goals':'No applicable class goals; class utility is zero.',
 'native-footprint-unknown':'Final native footprint is unknown.',
 'hold-area':'Final footprint evaluated against the supplied area.',
 'focus-target':'Estimated pressure on the supplied focus target.',
 'protect-ally':'Position favors the supplied ally radius; this is no protection guarantee.',
});
export function explainEvaluation(evaluation) {
 const codes=[...new Set(evaluation.reasonCodes ?? evaluation.goalUtilities?.flatMap(g=>g.reasonCodes) ?? [])];
 return {reason:codes.map(c=>TEMPLATES[c]).filter(Boolean).join(' ') || 'Ranked supported ordinary options using the known facts.',
   warnings:[...(evaluation.warnings ?? [])]};
}
