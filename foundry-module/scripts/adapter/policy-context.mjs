import { NPC_POLICIES } from '../rules/npc-policies.mjs';
import { canonicalRuleSource } from '../core/rule-source.mjs';
import { canonicalData, inertData, record } from '../core/policy-data.mjs';
import { resolvePolicy } from '../core/policy.mjs';
import { canSpend } from '../core/budgets.mjs';
import { MODULE_ID } from './snapshot.mjs';
import { cataphractReadiness } from '../rules/cataphract.mjs';
import { reviewCataphractSource } from './cataphract-source.mjs';

// Use the actor captured by the SAME synchronous board read. game.actors can
// refer to a different linked actor than an unlinked token's synthetic actor.
function capturedActor(board) {
  try {
    const native=JSON.parse(board.stamp);
    const matches=native.tokens?.filter(t=>(t.token?._id ?? t.token?.id)===board.snapshot.activeTokenId);
    return matches?.length===1 ? matches[0].actor : null;
  } catch { return null; }
}
export function readDecisionConfig({game,board}) {
  const actor=capturedActor(board),flags=actor?.flags?.[MODULE_ID] ?? {};
  const mode=game.settings.get(MODULE_ID,'decisionMode') ?? 'model';
  const binding=flags.policyBinding ?? null;
  const policy=binding && Object.hasOwn(NPC_POLICIES,binding.policyId) ? NPC_POLICIES[binding.policyId] : null;
  const order={schemaVersion:1,id:'free',revision:1,turn:board.turn,actorTokenId:board.snapshot.activeTokenId,
    kind:'free',mode:'soft',parameters:{}};
  const data={mode,binding,order,individual:flags.policyIndividual ?? {riskTolerance:0},policyRevision:policy?.revision ?? null};
  return {...data,stamp:canonicalData(data)};
}
const identifierBinding = b => record(b) && inertData(b) && Object.keys(b).length===2
  && typeof b.classId==='string' && typeof b.policyId==='string';
export async function bindActorPolicy(actor,binding,{game,registry=NPC_POLICIES}={}) {
  if(!game?.user?.isGM) throw Error('GM only.');
  if(!actor || actor.type!=='npc' || !identifierBinding(binding)) throw Error('Choose a native NPC and known class/policy identifiers.');
  const p=Object.hasOwn(registry,binding.policyId)?registry[binding.policyId]:null;
  const classes=[...(actor.items ?? [])].filter(i=>i.type==='npc_class');
  if(!p || !p.match.classIds.includes(binding.classId) || classes.length!==1 || classes[0].system?.lid!==binding.classId)
    throw Error('Bind exactly one native npc_class LID supported by the maintained policy; display names cannot bind.');
  await actor.setFlag(MODULE_ID,'policyBinding',{classId:binding.classId,policyId:binding.policyId});return true;
}
export async function resolvePolicyContext(board,config,{game,crypto=globalThis.crypto,signal}={}) {
  const cancelled=()=>{if(signal?.aborted) throw Error('Policy planning cancelled.');};cancelled();
  const snapshot=structuredClone(board.snapshot),me=snapshot.tokens.find(t=>t.id===snapshot.activeTokenId);
  const base={snapshot,policy:null,order:config.order,individual:config.individual,capabilities:{},factsByPlanKey:{},
    turn:board.turn,contextStamp:config.stamp,coverageGaps:[],sourceMatches:[]};
  const refuse=(state,gap)=>({...base,state,coverageGaps:[gap]});
  const actor=capturedActor(board),binding=config.binding;
  if(!actor || !me || !identifierBinding(binding)) return refuse('unconfigured','missing-or-invalid-binding: bind the native NPC class with the GM API.');
  const policy=Object.hasOwn(NPC_POLICIES,binding.policyId)?NPC_POLICIES[binding.policyId]:null;
  const classes=actor.items?.filter(i=>i.type==='npc_class') ?? [];
  if(!policy || classes.length!==1 || classes[0].system?.lid!==binding.classId || config.policyRevision!==policy.revision)
    return refuse('unconfigured','ambiguous-or-incompatible-native-class');
  if(!crypto?.subtle?.digest) return refuse('needs-input','Web Crypto SHA-256 is unavailable; use a secure GM browser or play manually.');
  // Capture all plain source strings before the first await. Never retain prose
  // in returned context, logs, settings, or anything sent to the model relay.
  const features=(actor.items ?? []).filter(i=>i.type==='npc_feature').map(item=>{
    let source=null;try {source=canonicalRuleSource(item.system);} catch { /* Feature remains a source gap. */ }
    return {itemId:item._id ?? item.id,lid:item.system?.lid ?? '',sourceVersion:item._stats?.systemVersion ?? 'unrecorded',source,
      destroyed:item.system?.destroyed??null,disabled:item.system?.disabled??null,charged:item.system?.charged??null};
  });
  me.tier=Number(actor.system?.tier);
  me.classIds=classes.map(i=>i.system?.lid ?? '');
  me.templateIds=(actor.items ?? []).filter(i=>i.type==='npc_template').map(i=>i.system?.lid ?? '');
  me.features=await Promise.all(features.map(async f=>{
    const digest=f.source===null ? null : await crypto.subtle.digest('SHA-256',new TextEncoder().encode(f.source));
    cancelled();const sourceFingerprint=digest===null?'unavailable':Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
    return {lid:f.lid,sourceVersion:f.sourceVersion,sourceFingerprint,itemId:f.itemId,destroyed:f.destroyed,disabled:f.disabled,charged:f.charged};
  }));
  cancelled();
  const fullBinding={schemaVersion:1,...binding,policyRevision:policy.revision,sourceBindings:policy.requirements};
  const resolved=resolvePolicy(snapshot,[fullBinding],NPC_POLICIES);
  if(resolved.state==='unconfigured') return refuse('unconfigured',resolved.gaps.join('; '));
  const sourceMatches=policy.requirements.map(r=>({lid:r.lid,matches:me.features.some(f=>f.lid===r.lid
    && f.sourceVersion===r.sourceVersion && f.sourceFingerprint===r.sourceFingerprint && game.system?.version===r.sourceVersion)}));
  const matched=lid=>sourceMatches.find(s=>s.lid===lid)?.matches===true;
  const approvedIds=new Set(features.filter(f=>matched(f.lid)).map(f=>f.itemId));
  // Source drift cannot leave an ordinary extracted weapon secretly executable.
  me.weapons=me.weapons.filter(w=>approvedIds.has(w.itemId));
  const ramSource=matched('npcf_ram_cannon_cataphract');
  const attackBudget=canSpend(snapshot.actionBudget,{quick:1});
  const ram=ramSource && me.weapons.length>0 && attackBudget.ok;
  const ramGap=!ramSource ? 'ram-cannon-unavailable: exact reviewed source is unavailable.'
    : !me.weapons.length ? 'ram-cannon-unavailable: ordinary weapon readiness requires manual play.'
      : !attackBudget.ok ? `ram-cannon-unavailable: ordinary attack budget: ${attackBudget.reason}` : null;
  const ready=cataphractReadiness(me,game.system?.version),history=actor.flags?.[MODULE_ID]?.trampleLedger;
  const knownHistory=history?.schemaVersion===1&&history.turn===board.turn&&history.known===true&&Array.isArray(history.targets)
    &&history.targets.every(id=>typeof id==='string'&&id)&&new Set(history.targets).size===history.targets.length;
  const geometry=board.cataphractGeometry===true&&!!board.carryPositions;
  const trample=ready.trample.ready&&geometry&&knownHistory;
  const nativeImpale=board.nativeAutomation?.attacks===true&&board.nativeAutomation?.limited_loading===true
    &&typeof game.lancer?.flows?.get('SystemFlow')==='function'&&typeof game.lancer?.flows?.get('StatRollFlow')==='function';
  const capabilities={ramCannon:{reviewed:ramSource,available:ram},
    trample:{reviewed:ready.trample.sourceVerified,available:trample,itemId:ready.trample.itemId},
    impale:{reviewed:ready.impale.sourceVerified,available:ready.impale.ready&&trample&&nativeImpale&&canSpend(snapshot.actionBudget,{full:1}).ok,itemId:ready.impale.itemId},
    shield:{reviewed:ready.shield.sourceVerified,available:ready.shield.ready&&geometry,itemId:ready.shield.itemId}};
  const nativeTokens=JSON.parse(board.stamp).tokens??[],targetShields={};
  if(geometry)for(const target of snapshot.tokens.filter(t=>t.id!==me.id)){
    const entries=nativeTokens.filter(t=>(t.token?._id??t.token?.id)===target.id),native=entries.length===1?entries[0].actor:null;
    // Unreviewed target passives/immunities cannot be inferred from prose.
    const basic=native&&(target.excludedWeapons?.length??0)===0&&Array.isArray(native.items)&&native.items.every(i=>['npc_class','npc_feature','mech_weapon'].includes(i.type)
      &&(i.type!=='npc_feature'||i.system?.type==='Weapon'))&&!(native.effects??[]).some(e=>e.disabled!==true);
    let exact=false;
    if(native&&Array.isArray(native.items)&&native.items.some(i=>i.system?.lid==='npcc_cataphract')){
      const reviewed=await reviewCataphractSource(native,game.system.version,{crypto});cancelled();
      exact=policy.requirements.every(r=>reviewed.features.some(f=>f.lid===r.lid&&f.sourceVersion===r.sourceVersion&&f.sourceFingerprint===r.sourceFingerprint))
        &&!(native.effects??[]).some(e=>e.disabled!==true);
      if(exact&&reviewed.readiness.shield.ready)targetShields[target.id]=reviewed.readiness.shield.itemId;
    }
    target.impaleEligible=!!(basic||exact);target.trampleEligible=!!(basic||exact);
  }
  const coverageGaps=[...resolved.gaps,...sourceMatches.filter(s=>!s.matches).map(s=>`source-unavailable:${s.lid}`),
    ...(!trample?['trample-unavailable: exact ready source, native special geometry and known activation history are required.']:[]),
    ...(!capabilities.impale.available?['impale-unavailable: ready recharge, Full action, Trample history and native automation/flows are required.']:[]),
    ...(!capabilities.shield.available?['shield-support-unavailable: exact ready source and native geometry are required.']:[]),
    'Incoming threat usefulness and reactions remain unknown without supplied reviewed context.',
    ...(geometry&&snapshot.tokens.some(t=>t.id!==me.id&&t.impaleEligible===false)
      ?['Target passives, active effects or identities outside the reviewed slice require manual Trample contact and Impale resolution.']:[]),
    ...(ramGap?[ramGap]:[])];
  const grapples=JSON.parse(board.stamp).scene?.flags?.[MODULE_ID]?.grapples??[];
  return {...base,policy,state:'partial',sourceMatches,capabilities,...(geometry?{specials:{targetShields,grapples}}:{}),coverageGaps:[...new Set(coverageGaps)],
    contextStamp:canonicalData({configuration:config.stamp,sources:sourceMatches})};
}
