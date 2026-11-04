import { canonicalData, inertData, record } from '../core/policy-data.mjs';

const text=x=>typeof x==='string'&&!!x;
const path=p=>Array.isArray(p)&&p.length>0&&p.every(k=>(typeof k==='string'||Number.isSafeInteger(k))
  &&!['__proto__','constructor','prototype'].includes(k));
const statuses=new Set(['completed','cancelled','awaiting-input','interrupted','failed']);
const same=(a,b)=>canonicalData(a)===canonicalData(b);

/** One controller-owned run. Persisted pending claims prohibit replay after
 * cancellation, reload or an uncertain native write. UI data is never a receipt.
 * Handlers report exact native mutations; every other board field stays guarded.
 */
export class ExecutionSession {
  #plan;#expected;#io;#used=false;#receipts=[];
  constructor(plan,initial,io) {
    if(!record(plan)||!inertData(plan)||!text(plan.executionId)||!text(plan.turn)||!Array.isArray(plan.steps)
      ||!plan.steps.length||plan.steps.length>256||!record(initial)||!inertData(initial)
      ||initial.turn!==plan.turn||typeof io?.read!=='function'||typeof io?.persist!=='function'||!record(io.handlers))
      throw Error('Invalid authoritative execution plan or state.');
    const ids=new Set();
    for(const step of plan.steps){
      if(!record(step)||!text(step.id)||ids.has(step.id)||!text(step.handlerId)
        ||!Object.hasOwn(io.handlers,step.handlerId)||typeof io.handlers[step.handlerId]!=='function'
        ||(step.writes!==undefined&&(!Array.isArray(step.writes)||!step.writes.every(path)))
        ||(step.requires!==undefined&&(!record(step.requires)||!ids.has(step.requires.stepId)
          ||typeof step.requires.success!=='boolean'||Object.keys(step.requires).some(k=>!['stepId','success'].includes(k)))))
        throw Error('Unknown handler, malformed step or invalid continuation prerequisite.');
      ids.add(step.id);
    }
    this.#plan=structuredClone(plan);this.#expected=structuredClone(initial);
    this.#io={read:io.read,persist:io.persist,handlers:{...io.handlers}};
  }
  #check(){
    const actual=this.#io.read();
    if(!inertData(actual)||!same(actual,this.#expected))throw Error('The board changed during execution. Continue manually.');
  }
  #transition(step,receipt){
    if(!record(receipt)||!inertData(receipt)||!statuses.has(receipt.status)||!Array.isArray(receipt.changes))
      throw Error('Invalid native transition receipt.');
    const next=structuredClone(this.#expected),seen=new Set();
    for(const change of receipt.changes){
      if(!record(change)||!path(change.path)||!Object.hasOwn(change,'before')||!Object.hasOwn(change,'after')
        ||!(step.writes??[]).some(p=>same(p,change.path))||seen.has(canonicalData(change.path)))
        throw Error('Unapproved native transition.');
      seen.add(canonicalData(change.path));
      let parent=next;
      for(const key of change.path.slice(0,-1)){
        if(!parent||!Object.hasOwn(parent,key))throw Error('Invalid native transition path.');parent=parent[key];
      }
      const key=change.path.at(-1);
      if(!parent||!Object.hasOwn(parent,key)||!same(parent[key],change.before))throw Error('Invalid native transition baseline.');
      parent[key]=structuredClone(change.after);
    }
    this.#expected=next;this.#check();
  }
  async run(){
    if(this.#used)throw Error('This execution session was already used.');this.#used=true;
    for(const step of this.#plan.steps){
      this.#check();
      if(step.requires){
        const previous=this.#receipts.find(r=>r.stepId===step.requires.stepId);
        if(previous?.status!=='completed'||typeof previous.observed?.success!=='boolean')throw Error('Unconfirmed native continuation result.');
        if(previous.observed.success!==step.requires.success)continue;
      }
      const identity={executionId:this.#plan.executionId,turn:this.#plan.turn,stepId:step.id};
      // A rejected/uncertain claim is never retried or followed by an effect.
      await this.#io.persist({...identity,status:'pending'});this.#check();
      let receipt;
      try{
        receipt=await this.#io.handlers[step.handlerId](structuredClone(step),{verify:()=>this.#check()});
        this.#transition(step,receipt);
      }catch(error){
        await this.#io.persist({...identity,status:'failed'});throw error;
      }
      this.#receipts.push({...identity,...structuredClone(receipt)});
      await this.#io.persist({...identity,status:receipt.status});this.#check();
      if(receipt.status!=='completed')return {executionId:this.#plan.executionId,status:receipt.status,receipts:structuredClone(this.#receipts)};
    }
    return {executionId:this.#plan.executionId,status:'completed',receipts:structuredClone(this.#receipts)};
  }
}
