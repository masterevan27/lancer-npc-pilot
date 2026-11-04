import test from 'node:test';
import assert from 'node:assert/strict';
import { environment } from './adapter.test.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';
const mod=await import('../scripts/adapter/carry-geometry.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('native carry geometry is read-only, target-specific and keeps directed wall evidence',()=>{
 assert.equal(typeof mod.collectCarryGeometry,'function');
 const env=environment(),target=env.canvas.tokens.placeables[1];
 const before=JSON.stringify(target.document.toObject()),snapshot=extractSnapshot(env).snapshot;
 target.checkCollision=(p,o)=>o.type==='move'&&o.origin.x===450&&o.origin.y===150&&p.x===550&&p.y===150;
 const result=mod.collectCarryGeometry(env,snapshot);
 assert.equal(JSON.stringify(target.document.toObject()),before);
 assert.deepEqual(result.positions.pc['5,1'],{x:500,y:100});
 assert.ok(snapshot.carryGeometry.pc.blockedAnchorMoves.includes('4,1>5,1'));
 assert.ok(!snapshot.carryGeometry.pc.blockedAnchorMoves.includes('5,1>4,1'));
 assert.deepEqual(snapshot.tokens[1].occupiedCells['5,1'],[{x:5,y:1}]);
});
