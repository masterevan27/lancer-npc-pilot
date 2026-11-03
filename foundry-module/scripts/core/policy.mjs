import { canonicalData, canonicalPlanKey, inertData, record, validateBinding, validatePolicy, validateOrder } from './policy-data.mjs';
export { canonicalPlanKey } from './policy-data.mjs';
import { checkOrder } from './policy-orders.mjs';
import { evaluateMetric } from './policy-metrics.mjs';
import { optionId } from './options.mjs';
import { NPC_POLICIES } from '../rules/npc-policies.mjs';
const lexical = (a,b) => a<b?-1:a>b?1:0;
const uniqueSorted = v => [...new Set(v ?? [])].sort(lexical);

export function resolvePolicy(snapshot, bindings, registry) {
  const refuse = gap => ({state:'unconfigured',policy:null,gaps:[gap]});
  if(!record(snapshot) || !inertData(snapshot,{allowUndefined:true}) || !inertData(bindings) || !Array.isArray(bindings)
    || !bindings.every(record)) return refuse('invalid-binding-data');
  // Trusted extraction uses undefined for absent optional stats; normalize its
  // JSON representation without weakening policy/binding record validation.
  const plain=JSON.parse(JSON.stringify(snapshot));
  const me=Array.isArray(plain.tokens) ? plain.tokens.find(t=>record(t)&&t.id===plain.activeTokenId) : null;
  if(!me || !Array.isArray(me.classIds) || me.classIds.length!==1) return refuse('ambiguous-binding');
  const matches=bindings.filter(b=>b.classId===me.classIds[0]);
  if(matches.length!==1) return refuse(matches.length?'ambiguous-binding':'missing-binding');
  const binding=matches[0];if(!validateBinding(binding,registry).ok) return refuse('incompatible-binding');
  const policy=registry[binding.policyId];
  if(!policy.match.tiers.includes(me.tier) || !Array.isArray(me.templateIds)
    || canonicalData(uniqueSorted(me.templateIds))!==canonicalData(uniqueSorted(policy.match.templateIds))) return refuse('unsupported-tier-or-template');
  if(!Array.isArray(me.features) || me.features.some(f=>!record(f)||!policy.requirements.some(r=>r.lid===f.lid))
    || new Set(me.features.map(f=>f.lid)).size!==me.features.length) return refuse('unexpected-loadout');
  const gaps=policy.requirements.flatMap(r=>{
    const f=me.features.find(f=>f.lid===r.lid);
    return f && f.sourceVersion===r.sourceVersion && f.sourceFingerprint===r.sourceFingerprint ? [] : [`source-unavailable:${r.lid}`];
  });
  return {state:gaps.length?'partial':'ready',policy,gaps};
}
export function evaluatePolicyCandidate(candidate, context) {
  const order=checkOrder(candidate,context),family=candidate.family ?? candidate.action.kind;
  const goals=context.policy.goals.filter(g=>g.families.includes('*') || g.families.includes(family));
  const goalUtilities=goals.map(g=>({...evaluateMetric(g.metricId,candidate,context),goalId:g.id,weight:g.weight}));
  const total=goalUtilities.reduce((n,g)=>n+g.weight,0);
  const classUtility=total?goalUtilities.reduce((n,g)=>n+g.weight*g.utility,0)/total:0;
  const risk=context.individual?.riskTolerance ?? 0;
  // Personality expresses preference for known risk only, after order/class.
  const exposure=goalUtilities.find(g=>g.id==='reaction-safety');
  const individual=exposure?.knowledge==='known' ? risk*(exposure.utility===0?1:-1) : 0;
  const reasonCodes=[...order.reasons,...goalUtilities.flatMap(g=>g.reasonCodes),...(!total?['no-applicable-goals']:[])];
  return {planKey:canonicalPlanKey(candidate),policyRevision:context.policy.revision,orderRevision:context.order.revision,
    allowed:order.allowed,needsInput:order.needsInput,rank:[order.utility,classUtility,individual,candidate.score],
    moveCost:candidate.move?.cost ?? 0,goalUtilities,reasonCodes:[...new Set(reasonCodes)],
    warnings:goalUtilities.filter(g=>g.knowledge==='unknown').map(g=>`${g.id}: unknown; utility 0 retains weight ${g.weight}.`)};
}
export function comparePolicyEvaluations(a,b) {
  for(let i=0;i<4;i++) if(a.rank[i]!==b.rank[i]) return b.rank[i]-a.rank[i];
  return a.moveCost-b.moveCost || lexical(a.planKey,b.planKey);
}
// Display labels are not mechanical content; source IDs and numeric facts are.
function mechanicalContent(candidate,key) {
  const facts=Object.fromEntries(Object.entries(candidate.facts ?? {}).filter(([k])=>!/(?:Name|^name)$/.test(k)));
  return canonicalData({planKey:key,family:candidate.family ?? candidate.action.kind,
    moveCost:candidate.move?.cost ?? 0,score:candidate.score,facts});
}
export function selectPolicyDecision(candidates,context,limits={}) {
  const empty=(state,reason)=>({state,policyId:null,policyRevision:null,orderRevision:null,contextStamp:null,
    selectedKey:null,candidates:[],evaluations:[],diagnostics:[reason],omittedFamilies:[],search:{truncated:false}});
  if(!record(context) || Object.values(Object.getOwnPropertyDescriptors(context)).some(p=>!Object.hasOwn(p,'value')))
    return empty('unconfigured','invalid-context');
  if(!context.policy || !validatePolicy(context.policy,context.registry ?? NPC_POLICIES).ok) return empty('unconfigured','unreviewed-policy');
  if(!record(limits) || !inertData(limits) || Object.keys(limits).some(k=>!['maxOptions','maxCandidates'].includes(k)))
    return empty('needs-input','invalid-search-limits');
  const maxOptions=Object.hasOwn(limits,'maxOptions')?limits.maxOptions:context.policy.search.maxOptions;
  const maxCandidates=Object.hasOwn(limits,'maxCandidates')?limits.maxCandidates:context.policy.search.maxCandidates;
  if(!inertData(context.coverageGaps ?? []) || !Array.isArray(context.coverageGaps ?? [])
    || !(context.coverageGaps ?? []).every(g=>typeof g==='string')) return empty('needs-input','invalid-coverage-gaps');
  const diagnostics=[...(context.coverageGaps ?? [])];
  const base={policyId:context.policy?.id ?? null,policyRevision:context.policy?.revision ?? null,
    orderRevision:context.order?.revision ?? null,contextStamp:context.contextStamp ?? null,
    selectedKey:null,candidates:[],evaluations:[],diagnostics,omittedFamilies:[],search:{maxCandidates,maxOptions,truncated:false,
      limitations:['One shortest path per endpoint; alternate routes are not enumerated.','One move and one supported action only.']}};
  const refuse=(state,reason)=>({...base,state,diagnostics:[...diagnostics,reason]});
  const individual=context.individual===undefined?{}:context.individual;
  if(!validateOrder(context.order,context).ok || !record(individual) || !inertData(individual)
    || Object.keys(individual).some(k=>k!=='riskTolerance')
    || (Object.hasOwn(individual,'riskTolerance') && (typeof individual.riskTolerance!=='number'
      || !Number.isFinite(individual.riskTolerance) || Math.abs(individual.riskTolerance)>1)))
    return refuse('needs-input','invalid-order-or-individual');
  if(!inertData(context.factsByPlanKey ?? {}) || !record(context.snapshot) || !inertData(context.snapshot,{allowUndefined:true}))
    return refuse('needs-input','invalid-facts-or-snapshot');
  if(!Number.isSafeInteger(maxOptions)||maxOptions<1||maxOptions>8||!Number.isSafeInteger(maxCandidates)||maxCandidates<1)
    return refuse('needs-input','invalid-search-limits');
  if(!inertData(candidates) || !Array.isArray(candidates)) return refuse('needs-input','invalid-candidates');
  const byKey=new Map();
  try {
    for(const c of candidates) {
      if(!record(c) || !record(c.action) || !Number.isFinite(c.score) || (c.move && (!Number.isFinite(c.move.cost) || c.move.cost<0))) return refuse('needs-input','invalid-candidate');
      const key=canonicalPlanKey(c),content=mechanicalContent(c,key);
      const old=byKey.get(key);
      if(old && old.content!==content) return refuse('needs-input','conflicting-plan-key');
      if(!old) byKey.set(key,{candidate:c,key,content});
    }
  } catch { return refuse('needs-input','invalid-candidate'); }
  // Bound evaluation deterministically by structural identity, never caller order.
  const all=[...byKey.values()].sort((a,b)=>lexical(a.key,b.key));
  let searched;
  try {
    searched=all.slice(0,maxCandidates).map(p=>({...p,evaluation:evaluatePolicyCandidate(p.candidate,context),
      candidate:{...p.candidate,key:p.key,family:p.candidate.family ?? p.candidate.action.kind}}));
  } catch {return refuse('needs-input','invalid-candidate-facts');}
  const eligible=searched.filter(p=>p.evaluation.allowed&&!p.evaluation.needsInput)
    .sort((a,b)=>comparePolicyEvaluations(a.evaluation,b.evaluation));
  const truncated=all.length>maxCandidates;
  base.search={...base.search,truncated,evaluated:searched.length,total:all.length};
  if(truncated) diagnostics.push(`search-limit:${searched.length}/${all.length} unique candidates`);
  if(!eligible.length) {
    const omittedFamilies=uniqueSorted(all.map(p=>p.candidate.family ?? p.candidate.action.kind));
    return {...base,state:'needs-input',omittedFamilies,diagnostics:[...diagnostics,
      ...new Set(searched.flatMap(p=>p.evaluation.reasonCodes)),
      ...(omittedFamilies.length?[`omitted-families:${omittedFamilies.join(',')}`]:[]),'no-order-compliant-supported-plan']};
  }
  const picked=[eligible[0]],families=uniqueSorted(eligible.map(p=>p.candidate.family));
  for(const family of families) {
    const best=eligible.find(p=>p.candidate.family===family);
    if(picked.length<maxOptions && !picked.includes(best)) picked.push(best);
  }
  for(const p of eligible) if(picked.length<maxOptions&&!picked.includes(p)) picked.push(p);
  picked.sort((a,b)=>comparePolicyEvaluations(a.evaluation,b.evaluation));
  const omittedFamilies=uniqueSorted(all.map(p=>p.candidate.family ?? p.candidate.action.kind))
    .filter(f=>!picked.some(p=>p.candidate.family===f));
  if(omittedFamilies.length) diagnostics.push(`omitted-families:${omittedFamilies.join(',')}`);
  return {...base,state:diagnostics.length?'partial':'ready',diagnostics,omittedFamilies,
    selectedKey:picked[0].evaluation.planKey,candidates:picked.map((p,i)=>({...p.candidate,id:optionId(i)})),
    evaluations:picked.map(p=>p.evaluation),search:{...base.search,truncated,evaluated:searched.length,total:all.length}};
}
