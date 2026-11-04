import test from 'node:test';
import assert from 'node:assert/strict';
import { movementContext, stepCost, canEnd, pathCost } from '../scripts/core/reach.mjs';
import { neighbors, cellKey, HEX_LAYOUTS } from '../scripts/core/grid.mjs';
import { environment } from './adapter.test.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';
import { generateCandidates } from '../scripts/core/options.mjs';
import { loadFixture } from './helpers/fixtures.mjs';

for (const layout of ['square', ...HEX_LAYOUTS]) {
  test(`explicit passage ignores engagement but preserves walls and endpoints: ${layout}`, () => {
    const grid=layout==='square'?{type:'square',width:12,height:12}:{type:'hex',hexLayout:layout,width:12,height:12};
    const a={x:4,y:4},b=neighbors(grid,a)[0],c=neighbors(grid,b)[0];
    const mover={id:'m',pos:a,size:1,side:'hostile',speed:3};
    const snapshot={grid,tokens:[mover,{id:'t',pos:b,size:1,side:'friendly'}],engagementMoves:[`${cellKey(a)}>${cellKey(b)}`]};
    const exceptions={passCharacters:true,ignoreEngagement:true};
    assert.equal(stepCost(movementContext(snapshot,mover),a,b),null);
    assert.equal(stepCost(movementContext(snapshot,mover,exceptions),a,b),1);
    assert.equal(canEnd(movementContext(snapshot,mover,exceptions),b),false);
    assert.equal(pathCost(snapshot,'m',[a,b,c],exceptions),2);
    assert.equal(pathCost(snapshot,'m',[a,b],exceptions),null);
    snapshot.blockedAnchorMoves=[`${cellKey(a)}>${cellKey(b)}`];
    assert.equal(stepCost(movementContext(snapshot,mover,exceptions),a,b),null);
    snapshot.blockedAnchorMoves=[];
    snapshot.blockedMoves=[`${cellKey(a)}>${cellKey(b)}`];
    assert.equal(stepCost(movementContext(snapshot,mover,exceptions),a,b),null);
    snapshot.blockedMoves=[];snapshot.blocked=[cellKey(b)];
    assert.equal(stepCost(movementContext(snapshot,mover,exceptions),a,b),null);
  });
}

test('engagement remains a separate restriction even when no character occupies destination', () => {
  const mover={id:'m',pos:{x:1,y:1},size:1,side:'hostile'};
  const snapshot={grid:{type:'square',width:5,height:5},tokens:[mover],engagementMoves:['1,1>2,1']};
  assert.equal(stepCost(movementContext(snapshot,mover),mover.pos,{x:2,y:1}),null);
  assert.equal(stepCost(movementContext(snapshot,mover,{ignoreEngagement:true}),mover.pos,{x:2,y:1}),1);
});

test('adapter records wall evidence even when that same edge is engaged', () => {
  const env=environment(),active=env.canvas.tokens.placeables[0];
  env.canvas.tokens.placeables[1].document.x=200;
  const clear=extractSnapshot(env).snapshot;
  assert.ok(clear.engagementMoves?.includes('1,1>1,2'));
  assert.ok(!clear.blockedAnchorMoves.includes('1,1>1,2'));
  active.checkCollision=(p,o)=>o.type==='move' && o.origin.x===150 && o.origin.y===150 && p.x===150 && p.y===250;
  const wall=extractSnapshot(env).snapshot;
  assert.ok(wall.engagementMoves.includes('1,1>1,2'));
  assert.ok(wall.blockedAnchorMoves.includes('1,1>1,2'));
});

test('reviewed candidate generation can retain a crossing route without changing default movement',()=>{
  const snap=loadFixture('walled-corridor');
  snap.tokens.find(t=>t.id==='npc1').speed=5;
  const blocker=snap.tokens.find(t=>t.pos.x===3&&t.pos.y===4);blocker.side='friendly';
  const ordinary=generateCandidates(snap);
  const reviewed=generateCandidates(snap,{movement:{passCharacters:true,ignoreEngagement:true},
    candidateKey:c=>JSON.stringify({m:c.move,a:c.action})});
  assert(!ordinary.some(c=>c.move?.path.some(p=>p.x===3&&p.y===4)));
  assert(reviewed.some(c=>c.move?.path.some(p=>p.x===3&&p.y===4)));
});
