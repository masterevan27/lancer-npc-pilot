import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalRuleSource, RULE_FIELDS } from '../scripts/core/rule-source.mjs';
import { createHash } from 'node:crypto';
import { summarizeCatalog } from '../../tools/audit-npc-catalog.mjs';
const oldSort=v=>Array.isArray(v)?v.map(oldSort):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,oldSort(v[k])])):v;
test('canonical rule sources preserve the previous selected fields, absence and array order', () => {
 const s={lid:'test',type:'Weapon',effect:'synthetic',range:[{val:3,type:'Range'}],actions:[{z:2,a:1}],cost:undefined,loaded:true};
 const old=JSON.stringify(oldSort(Object.fromEntries(RULE_FIELDS.filter(k=>s[k]!==undefined).map(k=>[k,s[k]]))));
 assert.equal(canonicalRuleSource(s),old);
 assert.equal(canonicalRuleSource({...s,loaded:false,uses:0}),old);
 assert.equal(canonicalRuleSource(Object.fromEntries(Object.entries(s).reverse())),old);
 assert.notEqual(canonicalRuleSource({...s,effect:'changed'}),old);
 assert.notEqual(canonicalRuleSource({...s,actions:[2,1]}),canonicalRuleSource({...s,actions:[1,2]}));
 const f=summarizeCatalog([{type:'npc_feature',name:'synthetic',system:s,_stats:{systemVersion:'3.1.3'}}]).features[0];
 assert.equal(f.sourceFingerprint,createHash('sha256').update(old).digest('hex'));
});
test('malformed and accessor sources are refused before serialization', () => {
 let calls=0;const s={lid:'test'}; Object.defineProperty(s,'effect',{get(){calls++;return 'x';},enumerable:true});
 assert.throws(()=>canonicalRuleSource(s));assert.equal(calls,0);
 for(const value of [{range:[,1]},{effect:NaN},{effect:()=>1},{effect:new Date()}]) assert.throws(()=>canonicalRuleSource(value));
});
