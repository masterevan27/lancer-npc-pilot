// Closed inert records only. Inspect descriptors before reading any untrusted value.
export const record = v => v !== null && typeof v === 'object' && !Array.isArray(v)
  && [Object.prototype, null].includes(Object.getPrototypeOf(v));
export function inertData(value, { allowUndefined = false } = {}, ancestors = new Set()) {
  if (value === null || ['string','boolean'].includes(typeof value)) return true;
  if (value === undefined) return allowUndefined;
  if (typeof value === 'number') return Number.isFinite(value);
  if ((!Array.isArray(value) && !record(value)) || ancestors.has(value)) return false;
  if (Array.isArray(value) && Object.getPrototypeOf(value)!==Array.prototype) return false;
  const props = Object.getOwnPropertyDescriptors(value);
  if (Reflect.ownKeys(props).some(k => typeof k !== 'string')) return false;
  if (Array.isArray(value) && (Object.keys(props).length !== value.length + 1
    || Array.from({length:value.length},(_,i)=>String(i)).some(k=>!Object.hasOwn(props,k)))) return false;
  ancestors.add(value);
  for (const [key, p] of Object.entries(props)) {
    if (Array.isArray(value) && key === 'length') continue;
    if (!Object.hasOwn(p,'value') || !p.enumerable || (Array.isArray(value) && p.value===undefined)
      || !inertData(p.value, {allowUndefined},ancestors)) return false;
  }
  ancestors.delete(value); return true;
}
export function canonicalData(value) {
  if (!inertData(value)) throw TypeError('Expected inert finite JSON data.');
  const sort = v => Array.isArray(v) ? v.map(sort) : record(v)
    ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,sort(v[k])])) : v;
  return JSON.stringify(sort(value));
}
export function canonicalPlanKey(candidate) {
  const unique = values => [...new Set(values ?? [])].sort((a,b)=>a<b?-1:a>b?1:0);
  const a=candidate.action;
  return canonicalData({kind:a.kind,sourceIds:unique([a.itemId,a.abilityId,...(a.sourceIds ?? [])].filter(Boolean)),
    mode:a.mode ?? null,targets:unique(a.targetTokenIds),endpoint:candidate.move?.to ?? null,
    path:candidate.move?.path ?? [],branches:(candidate.branches ?? []).map(b=>({id:b.id,kind:b.kind ?? null,
      sourceId:b.itemId ?? null,end:b.end ?? null,targets:unique(b.targetTokenIds),path:b.path ?? []}))});
}
const text = v => typeof v === 'string' && v.length > 0 && v.length <= 500;
const positive = v => Number.isSafeInteger(v) && v > 0;
const closed = (v, keys) => record(v) && Object.keys(v).length === keys.length && keys.every(k=>Object.hasOwn(v,k));
const list = (v,check) => Array.isArray(v) && v.every(check) && new Set(v.map(x=>canonicalData(x))).size === v.length;
const result = (ok,path='',code='invalid-data',message='Invalid or unreviewed policy data.') => ({ok,errors:ok?[]:[{path,code,message}]});
const source = s => closed(s,['lid','sourceVersion','sourceFingerprint']) && text(s.lid) && text(s.sourceVersion)
  && /^[a-f0-9]{64}$/.test(s.sourceFingerprint);
const sourceList = v => list(v,source) && new Set(v.map(s=>s.lid)).size === v.length;
export const METRIC_IDS = Object.freeze(['priority-access','shield-position','reaction-safety','conditional-displacement']);
export function validatePolicy(data, registry = {}) {
  if (!inertData(data) || !closed(data,['schemaVersion','id','revision','reviewState','role','sourceRefs','match','requirements','goals','individualBounds','search'])) return result(false);
  const p=data;
  const valid=p.schemaVersion===1 && text(p.id) && positive(p.revision) && p.reviewState==='reviewed'
    && text(p.role) && list(p.sourceRefs,text) && p.sourceRefs.length>0
    && closed(p.match,['classIds','tiers','templateIds','optionalFeatures'])
    && list(p.match.classIds,text) && p.match.classIds.length===1
    && list(p.match.tiers,t=>[1,2,3].includes(t)) && p.match.tiers.length>0
    && list(p.match.templateIds,text) && p.match.optionalFeatures==='none'
    && sourceList(p.requirements) && p.requirements.length>0
    && list(p.goals,g=>closed(g,['id','metricId','weight','families','sourceRefs']) && text(g.id)
      && METRIC_IDS.includes(g.metricId) && Number.isInteger(g.weight) && g.weight>=1 && g.weight<=10
      && list(g.families,text) && list(g.sourceRefs,text))
    && new Set(p.goals.map(g=>g.id)).size===p.goals.length
    && closed(p.individualBounds,['riskTolerance']) && canonicalData(p.individualBounds.riskTolerance)==='[-1,1]'
    && closed(p.search,['maxOptions','maxCandidates']) && positive(p.search.maxOptions) && p.search.maxOptions<=8 && positive(p.search.maxCandidates);
  if (!valid) return result(false);
  // A review string grants nothing: every byte of the record must match maintained data.
  const maintained=Object.hasOwn(registry,p.id) ? registry[p.id] : null;
  return result(!!maintained && canonicalData(maintained)===canonicalData(p),'policy','unreviewed-policy');
}
export function validateBinding(data, registry = {}) {
  if (!inertData(data) || !closed(data,['schemaVersion','classId','policyId','policyRevision','sourceBindings'])) return result(false,'binding');
  const p=Object.hasOwn(registry,data.policyId)?registry[data.policyId]:null;
  return result(data.schemaVersion===1 && !!p && validatePolicy(p,registry).ok
    && p.match.classIds.includes(data.classId) && data.policyRevision===p.revision
    && sourceList(data.sourceBindings) && canonicalData(data.sourceBindings)===canonicalData(p.requirements),'binding','incompatible-binding');
}
export function validateOrder(o, context = {}) {
  if (!inertData(o) || !closed(o,['schemaVersion','id','revision','turn','actorTokenId','kind','mode','parameters'])) return result(false,'order');
  if (o.schemaVersion!==1 || !text(o.id) || !positive(o.revision) || !text(o.turn) || !text(o.actorTokenId)
    || !['hard','soft'].includes(o.mode) || (context.turn!==undefined && o.turn!==context.turn)
    || (context.snapshot && o.actorTokenId!==context.snapshot.activeTokenId)) return result(false,'order','stale-or-invalid-order');
  const p=o.parameters;
  const cell = c => closed(c,['x','y']) && Number.isSafeInteger(c.x) && Number.isSafeInteger(c.y);
  const valid = o.kind==='free' ? o.mode==='soft' && closed(p,[])
    : o.kind==='focus-target' ? closed(p,['targetTokenId']) && text(p.targetTokenId)
    : o.kind==='hold-area' ? closed(p,['areaCells']) && list(p.areaCells,cell) && p.areaCells.length>0
    : o.kind==='protect-ally' ? closed(p,['allyTokenId','maxEndDistance']) && text(p.allyTokenId)
      && Number.isFinite(p.maxEndDistance) && p.maxEndDistance>=0 : false;
  return result(valid,'order','invalid-order');
}
