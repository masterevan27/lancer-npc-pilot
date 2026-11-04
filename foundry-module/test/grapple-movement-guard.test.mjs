import test from 'node:test';
import assert from 'node:assert/strict';
import { grappleEnvironment } from './helpers/grapple-fixture.mjs';
import { approvedPilotMove } from '../scripts/adapter/movement-authority.mjs';
const mod=await import('../scripts/adapter/grapple-movement-guard.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('every client blocks ordinary grapple dragging; a forged execution option cannot bypass the native guard',async()=>{
 assert.equal(typeof mod.registerGrappleMovementGuard,'function');const f=grappleEnvironment();
 await f.canvas.scene.setFlag('lancer-npc-pilot','grapples',[f.link]);f.game.user.isGM=false;mod.registerGrappleMovementGuard(f);
 const document=f.canvas.tokens.get('npc').document,hook=f.hooks.get('preMoveToken');
 assert.equal(hook(document,{method:'dragging'}, {movement:{npc:{method:'dragging'}},npcPilotExecutionId:'forged'}),false);
 assert.equal(hook(document,{method:'api'}, {movement:{npc:{method:'api'}}}),undefined);
 document.move=async(_path,options)=>{assert.equal(hook(document,{method:'dragging'},{movement:{npc:{method:'dragging'}}}),undefined);return true;};
 assert.equal(await approvedPilotMove(document,[{x:0,y:0}],{method:'dragging'}),true);
 assert.equal(hook(document,{method:'dragging'}, {movement:{npc:{method:'dragging'}}}),false);
});
