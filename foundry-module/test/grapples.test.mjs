import test from 'node:test';
import assert from 'node:assert/strict';
const core=await import('../scripts/core/grapples.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const snap=()=>({grid:{type:'square',width:10,height:10},tokens:[
 {id:'a',pos:{x:2,y:2},size:1,hp:[10,10]}, {id:'b',pos:{x:3,y:2},size:1,hp:[10,10]}]});
const link=()=>({id:'g',sourceTokenId:'a',targetTokenId:'b',sourceActorId:'a',targetActorId:'b',controllerTokenId:'a'});
test('paired grapple movement mirrors the controlled body and chooses a non-overlapping native step order',()=>{
 assert.equal(typeof core.grappleMovePlan,'function');
 const s=snap();s.tokens.forEach(t=>{t.side='friendly';t.occupiedCells={};
  for(let x=0;x<10;x++)for(let y=0;y<10;y++)t.occupiedCells[`${x},${y}`]=[{x,y}];});
 s.carryGeometry={a:{blockedMoves:[],blockedAnchorMoves:[]},b:{blockedMoves:[],blockedAnchorMoves:[]}};
 const r=core.grappleMovePlan(s,link(),'a',[{x:2,y:2},{x:1,y:2}]);
 assert.deepEqual(r.carriedPath,[{x:3,y:2},{x:2,y:2}]);assert.deepEqual(r.orders,[['a','b']]);assert.equal(r.cost,1);
 assert.equal(core.grappleMovePlan(s,link(),'b',[{x:3,y:2},{x:4,y:2}]),null);
 s.carryGeometry.b.blockedAnchorMoves=['3,2>2,2'];assert.equal(core.grappleMovePlan(s,link(),'a',[{x:2,y:2},{x:1,y:2}]),null);
});
test('active adjacent grapple forbids Boost/reactions and immobilizes the controlled side',()=>{
 assert.equal(typeof core.grappleRestrictions,'function');
 assert.deepEqual(core.grappleRestrictions(snap(),'a',[link()]),{engaged:true,boost:false,reaction:false,move:true,needsInput:false});
 assert.equal(core.grappleRestrictions(snap(),'b',[link()]).move,false);
 const s=snap();s.tokens[1].pos.x=5;assert.equal(core.grappleRestrictions(s,'a',[link()]).engaged,false);
 s.tokens[1].pos.x=3;s.tokens[1].hp[0]=0;assert.equal(core.grappleRestrictions(s,'a',[link()]).needsInput,true);
 assert.equal(core.grappleRestrictions(snap(),'a',[link(),{...link(),id:'second'}]).needsInput,true);
});
test('actual opposed Hull receipts change control; cancellation and ties cannot invent a winner',()=>{
 assert.equal(typeof core.grappleContestResult,'function');
 const receipt=(actorId,total)=>({status:'completed',observed:{actorId,path:'system.hull',total}});
 assert.equal(core.grappleContestResult(link(),receipt('a',12),receipt('b',15)).link.controllerTokenId,'b');
 assert.equal(core.grappleContestResult(link(),receipt('a',15),receipt('b',12)).link.controllerTokenId,'a');
 assert.equal(core.grappleContestResult(link(),receipt('a',12),receipt('b',12)).status,'awaiting-input');
 assert.equal(core.grappleContestResult(link(),receipt('a',12),{status:'cancelled',observed:null}).status,'cancelled');
 assert.equal(core.grappleContestResult(link(),receipt('a',NaN),receipt('b',12)).status,'failed');
});
