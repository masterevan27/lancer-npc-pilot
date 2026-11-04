import test from 'node:test';
import assert from 'node:assert/strict';
import * as core from '../scripts/core/cataphract.mjs';
import { HEX_LAYOUTS, neighbors, cellKey, translateCell } from '../scripts/core/grid.mjs';
import { normalizeBudget } from '../scripts/core/budgets.mjs';
function fixture(layout='square'){
 const grid=layout==='square'?{type:'square',width:30,height:30}:{type:'hex',hexLayout:layout,width:30,height:30};
 const start={x:10,y:10},first=neighbors(grid,start)[0],at=n=>{let c=start;for(let i=0;i<n;i++)c=translateCell(grid,c,start,first);return c;};
 const source={id:'m',pos:start,size:1,side:'hostile',statuses:[],saveTarget:12},target={id:'t',pos:at(2),size:1,side:'friendly',statuses:[],hull:1};
 const snapshot={activeTokenId:'m',grid,tokens:[source,target],actionBudget:normalizeBudget({move:4,full:true,quick:true,protocol:true,reaction:true},{speed:8}),
  carryGeometry:{t:{blockedMoves:[],blockedAnchorMoves:[]}}};
 snapshot.losFrom=Object.fromEntries(Array.from({length:9},(_,i)=>[cellKey(at(i)),{t:true}]));
 return {snapshot,at};
}
for(const layout of ['square',...HEX_LAYOUTS])test(`Impale straight routes include legal native conditional carried paths: ${layout}`,()=>{
 assert.equal(typeof core.impalePlans,'function');
 const f=fixture(layout),plans=core.impalePlans(f.snapshot,{itemId:'impale',ready:true});
 const p=plans.find(p=>cellKey(p.move.to)===cellKey(f.at(5))&&p.action.targetTokenIds[0]==='t');
 assert(p);assert.equal(p.action.kind,'impale');assert.equal(p.action.pauseIndex,1);
 assert.equal(p.action.carryPath.length,5);
 assert.deepEqual(p.action.carryPath.at(-1),f.at(6));
 assert.equal(p.move.cost,5);assert.equal(f.snapshot.actionBudget.move,4);
 f.snapshot.blockedAnchorMoves=[`${cellKey(f.at(3))}>${cellKey(f.at(4))}`];
 assert(!core.impalePlans(f.snapshot,{itemId:'impale',ready:true}).some(p=>cellKey(p.move.to)===cellKey(f.at(5))));
});
test('Impale refuses missing target geometry, blocked carried endpoints, unavailable charge/actions and immobility',()=>{
 assert.equal(typeof core.impalePlans,'function');
 const f=fixture();
 assert.equal(core.impalePlans(f.snapshot,{itemId:'impale',ready:false}).length,0);
 delete f.snapshot.carryGeometry.t;assert.equal(core.impalePlans(f.snapshot,{itemId:'impale',ready:true}).length,0);
 f.snapshot.carryGeometry.t={blockedMoves:[],blockedAnchorMoves:['12,10>13,10']};
 assert(!core.impalePlans(f.snapshot,{itemId:'impale',ready:true}).some(p=>p.action.carryPath.length>1));
 f.snapshot.tokens[0].statuses=['IMMOBILIZED'];assert.equal(core.impalePlans(f.snapshot,{itemId:'impale',ready:true}).length,0);
});

test('missing hypothetical target occupancy excludes that branch without losing other legal Impale routes',()=>{
 const f=fixture();const t=f.snapshot.tokens[1];t.occupiedCells={};
 for(let x=0;x<30;x++)for(let y=0;y<30;y++)if(x!==16||y!==10)t.occupiedCells[`${x},${y}`]=[{x,y}];
 const plans=core.impalePlans(f.snapshot,{itemId:'impale',ready:true});
 assert(plans.some(p=>p.move.to.x===4+10&&p.move.to.y===10));
 assert(!plans.some(p=>p.move.to.x===15&&p.move.to.y===10&&p.action.carryPath.at(-1).x===16));
});

test('Impale requires known native line of sight at first contact and never selects a Hidden target',()=>{
 const f=fixture();f.snapshot.losFrom={};assert.equal(core.impalePlans(f.snapshot,{itemId:'impale',ready:true}).length,0);
 const g=fixture();g.snapshot.tokens[1].statuses=['HIDDEN'];assert.equal(core.impalePlans(g.snapshot,{itemId:'impale',ready:true}).length,0);
});
