import test from 'node:test';
import assert from 'node:assert/strict';
import { checkOrder } from '../scripts/core/policy-orders.mjs';
import { candidate, policyContext, policyScenario } from './helpers/policy-fixtures.mjs';
function area(mode='hard') {
 const c=policyScenario('CAT-12').context,me=c.snapshot.tokens.find(t=>t.id===c.snapshot.activeTokenId);
 me.occupiedCells={'0,0':[{x:0,y:0},{x:1,y:0}],'2,0':[{x:2,y:0},{x:3,y:0}]};
 c.order={...c.order,kind:'hold-area',mode,parameters:{areaCells:[{x:2,y:0},{x:3,y:0}]}};
 return c;
}
test('CAT-12 hard hold checks the whole final native body, not anchor or route',()=>{
 const c=area(),a=candidate('area',{move:{to:{x:2,y:0},path:[{x:0,y:0},{x:9,y:9},{x:2,y:0}],cost:2}});
 assert.equal(checkOrder(a,c).allowed,true); // legality belongs to mechanics, endpoint is inside
 c.order.parameters.areaCells.pop();assert.equal(checkOrder(a,c).allowed,false);
 c.order.parameters.areaCells=[{x:0,y:0},{x:1,y:0}];assert.equal(checkOrder(a,c).allowed,false);
 delete c.snapshot.tokens[0].occupiedCells;assert.equal(checkOrder(a,c).needsInput,true);
});
test('soft hold area uses rounded fraction of final native cells',()=>{
 const c=area('soft'),a=candidate('area',{move:{to:{x:2,y:0}}});
 assert.equal(checkOrder(a,c).utility,100);c.order.parameters.areaCells.pop();assert.equal(checkOrder(a,c).utility,50);
});
test('hard predicates apply to every represented branch',()=>{
 const c=area();const a=candidate('branch',{move:{to:{x:2,y:0}},branches:[{id:'cancel',end:{x:0,y:0}}]});
 assert.equal(checkOrder(a,c).allowed,false);
});
test('hard focus restricts hostile targets but permits ordinary movement and self actions',()=>{
 const c=policyContext(),hostiles=c.snapshot.tokens.filter(t=>t.id!==c.snapshot.activeTokenId&&t.side!==c.snapshot.tokens[0].side);
 const target=hostiles[0];c.order={...c.order,kind:'focus-target',mode:'hard',parameters:{targetTokenId:target.id}};
 assert.equal(checkOrder(candidate('focus',{action:{kind:'attack',targetTokenIds:[target.id]}}),c).allowed,true);
 assert.equal(checkOrder(candidate('hold',{action:{kind:'hold'}}),c).allowed,true);
 const other=hostiles.find(t=>t.id!==target.id);
 assert.equal(checkOrder(candidate('boost',{action:{kind:'boost',targetTokenIds:[other.id]}}),c).allowed,true);
 assert.equal(checkOrder(candidate('bad',{action:{kind:'attack',targetTokenIds:['unknown']}}),c).needsInput,true);
 c.order.parameters.targetTokenId='missing';assert.equal(checkOrder(candidate(),c).needsInput,true);
});
test('protect ally requires native distance and never invents threats; radius dominates pressure',()=>{
 const c=policyContext(),me=c.snapshot.tokens[0],ally=structuredClone(me);ally.id='ally';ally.pos={x:4,y:0};
 me.occupiedCells={'1,0':[{x:1,y:0}],'2,0':[{x:2,y:0}]};ally.occupiedCells={'4,0':[{x:4,y:0}]};c.snapshot.tokens.push(ally);
 c.order={...c.order,kind:'protect-ally',mode:'soft',parameters:{allyTokenId:'ally',maxEndDistance:2}};
 const inside=candidate('in',{move:{to:{x:2,y:0}}}),outside=candidate('out',{move:{to:{x:1,y:0}}});
 assert.equal(checkOrder(inside,c).utility,75);assert(checkOrder(inside,c).utility>checkOrder(outside,c).utility);
 c.order.mode='hard';assert.equal(checkOrder(outside,c).allowed,false);delete ally.occupiedCells;
 assert.equal(checkOrder(inside,c).needsInput,true);
});
