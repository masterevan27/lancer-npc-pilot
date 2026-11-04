import test from 'node:test';
import assert from 'node:assert/strict';
import { policyContext } from './helpers/policy-fixtures.mjs';
import { canonicalPlanKey } from '../scripts/core/policy-data.mjs';
const mod=await import('../scripts/adapter/policy-candidates.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
function fixture(){const c=policyContext(),me=c.snapshot.tokens[0],target=c.snapshot.tokens[1];
 c.snapshot.tokens=[me,target];me.pos={x:1,y:1};me.saveTarget=12;target.pos={x:2,y:1};target.hull=1;target.impaleEligible=target.trampleEligible=true;
 for(const t of c.snapshot.tokens)t.occupiedCells=Object.fromEntries(Array.from({length:400},(_,i)=>[`${i%20},${Math.floor(i/20)}`,[{x:i%20,y:Math.floor(i/20)}]]));
 c.snapshot.carryGeometry=Object.fromEntries(c.snapshot.tokens.map(t=>[t.id,{blockedMoves:[],blockedAnchorMoves:[]}])) ;
 c.snapshot.losFrom=Object.fromEntries(Object.keys(me.occupiedCells).map(k=>[k,{[target.id]:true}]));
 c.specials={targetShields:{},grapples:[]};c.capabilities={trample:{available:true,itemId:'trample'},impale:{available:true,itemId:'impale'},shield:{available:true}};return c;}
test('policy sees reviewed pass-through routes and native-save Impale branches before selection',()=>{
 assert.equal(typeof mod.generatePolicyCandidates,'function');const c=fixture(),options=mod.generatePolicyCandidates(c);
 assert(options.some(o=>o.action.kind==='impale'));assert(options.some(o=>o.mechanics?.id==='cataphract-t1'&&o.action.kind!=='impale'&&o.facts.trampleContacts.length));
 for(const o of options.filter(o=>o.action.kind==='impale')){assert.equal(o.branches.length,2);assert.equal(o.key,canonicalPlanKey(o));
  assert.equal(c.factsByPlanKey[o.key].shield.usefulProtection,undefined);}
});
test('unknown target passives exclude harmful contact and forced movement while preserving ordinary plans',()=>{
 const c=fixture();c.snapshot.tokens[1].impaleEligible=c.snapshot.tokens[1].trampleEligible=false;
 const options=mod.generatePolicyCandidates(c);assert(options.length);assert(!options.some(o=>o.action.kind==='impale'));
 assert(options.every(o=>!o.facts.trampleContacts?.length));
});
