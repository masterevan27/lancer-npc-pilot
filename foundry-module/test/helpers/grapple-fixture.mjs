import { environment } from '../adapter.test.mjs';

const copy=v=>JSON.parse(JSON.stringify(v));
export function grappleEnvironment(){
  const f=environment();let next=0;
  for(const token of f.canvas.tokens.placeables){
    const actor=token.actor,source={_id:actor.id,type:actor.type,system:{...copy(actor.system),tier:1,hull:1,save:12,burn:0,overshield:{value:0}},flags:{},items:[],effects:[]};
    actor.id=source._id;actor.uuid=`Actor.${actor.id}`;actor._source=source;
    Object.defineProperty(actor,'system',{get(){const data=copy(source.system);data.statuses={};
      for(const e of source.effects.filter(e=>!e.disabled)){for(const s of e.statuses??[])data.statuses[s]=true;
        if(e.changes?.some(c=>c.key==='system.action_tracker.reaction'&&c.value==='false'))data.action_tracker.reaction=false;}
      return data;},configurable:true});
    Object.defineProperty(actor,'statuses',{get(){return new Set(source.effects.filter(e=>!e.disabled).flatMap(e=>e.statuses??[]));},configurable:true});
    actor.toObject=()=>copy(source);
    actor.getFlag=(ns,key)=>source.flags[ns]?.[key];
    actor.setFlag=async(ns,key,value)=>{(source.flags[ns]??={})[key]=copy(value);return actor;};
    actor.update=async patch=>{for(const[p,v]of Object.entries(patch)){const keys=p.split('.');let o=source;for(const k of keys.slice(0,-1))o=o[k];o[keys.at(-1)]=copy(v);}return actor;};
    const document=e=>({id:e._id,toObject:()=>copy(e),flags:e.flags});
    Object.defineProperty(actor,'effects',{get:()=>source.effects.map(document),configurable:true});
    Object.defineProperty(actor,'items',{get(){const items=source.items.map(i=>({id:i._id,type:i.type,parent:actor,actor,system:i.system,toObject:()=>copy(i),
      currentProfile:()=>({range:i.system.range,damage:i.system.damage?.[0],accuracy:i.system.accuracy?.[0],attack:i.system.attack_bonus?.[0]})}));items.get=id=>items.find(i=>i.id===id);return items;},configurable:true});
    actor.createEmbeddedDocuments=async(type,records)=>{if(type!=='ActiveEffect')throw Error('unexpected document');const added=records.map(r=>({...copy(r),_id:`fx${++next}`}));source.effects.push(...added);return added.map(document);};
    actor.deleteEmbeddedDocuments=async(type,ids)=>{if(type!=='ActiveEffect')throw Error('unexpected document');const removed=source.effects.filter(e=>ids.includes(e._id));source.effects=source.effects.filter(e=>!ids.includes(e._id));return removed.map(document);};
    actor.updateEmbeddedDocuments=async(type,updates)=>{if(type!=='ActiveEffect')throw Error('unexpected document');return updates.map(u=>{const e=source.effects.find(e=>e._id===u._id);Object.assign(e,copy(u));return document(e);});};
    token.document.move=async points=>{const p=Array.isArray(points)?points.at(-1):points;token.document.x=p.x;token.document.y=p.y;return true;};
    token.document.uuid=`Scene.scene.Token.${token.id}`;
    token.document.actorLink=true;
  }
  f.canvas.tokens.placeables[1].document.x=200;
  f.game.user.id='gm';f.game.users={activeGM:{id:'gm'}};f.game.system.version='3.1.3';
  f.game.actors=new Map(f.canvas.tokens.placeables.map(t=>[t.actor.id,t.actor]));
  f.canvas.scene.getFlag=function(ns,key){return this.flags[ns]?.[key];};
  f.canvas.scene.setFlag=async function(ns,key,value){(this.flags[ns]??={})[key]=copy(value);return this;};
  const hooks=new Map();f.Hooks={on:(name,callback)=>hooks.set(name,callback)};f.hooks=hooks;
  f.withLock=async(_key,fn)=>fn();f.notifications={warn(){},error(){},info(){}};
  f.choice=true;f.DialogV2={confirm:async()=>f.choice};
  f.canExecute=()=>true;
  f.link={id:'g',sourceTokenId:'npc',targetTokenId:'pc',sourceActorId:'a-npc',targetActorId:'a-pc',controllerTokenId:'npc'};
  return f;
}
