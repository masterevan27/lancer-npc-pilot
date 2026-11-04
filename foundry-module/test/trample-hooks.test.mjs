import test from 'node:test';
import assert from 'node:assert/strict';
import { grappleEnvironment } from './helpers/grapple-fixture.mjs';
import { trampleHistory,claimTrampleTarget } from '../scripts/adapter/trample-history.mjs';
import { initializeTrampleTurn } from '../scripts/adapter/trample-history.mjs';
const mod=await import('../scripts/adapter/trample-hooks.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
test('native turn hooks initialize once, never on ready, and uncertain manual motion invalidates same-turn history',async()=>{
 assert.equal(typeof mod.registerTrampleHistory,'function');const f=grappleEnvironment(),actor=f.canvas.tokens.get('npc').actor;
 actor._source.flags['lancer-npc-pilot']={policyBinding:{classId:'npcc_cataphract',policyId:'cataphract-base-t1'}};
 mod.registerTrampleHistory(f);const turn=`${f.canvas.scene.id}:${f.game.combat.id}:${f.game.combat.round}:${f.game.combat.turn}:npc`;
 assert.equal(trampleHistory(actor,turn).known,false);
 await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});
 assert.equal(trampleHistory(actor,turn).known,true);await claimTrampleTarget(actor,turn,'pc');
 await f.hooks.get('updateCombat')(f.game.combat,{turn:f.game.combat.turn});assert.deepEqual(trampleHistory(actor,turn).targets,['pc']);
 await f.hooks.get('moveToken')(f.canvas.tokens.get('npc').document,{},{});
 assert.equal(trampleHistory(actor,turn).known,false);assert.deepEqual(trampleHistory(actor,turn).targets,['pc']);
});
test('rejoining an activation invalidates unobserved history without clearing persisted claims',async()=>{
 const f=grappleEnvironment(),actor=f.canvas.tokens.get('npc').actor;
 actor._source.flags['lancer-npc-pilot']={policyBinding:{classId:'npcc_cataphract',policyId:'cataphract-base-t1'}};
 const turn=`${f.canvas.scene.id}:${f.game.combat.id}:${f.game.combat.round}:${f.game.combat.turn}:npc`;
 await initializeTrampleTurn(actor,turn,{nativeTurnEvent:true});await claimTrampleTarget(actor,turn,'pc');
 const history=mod.registerTrampleHistory(f);await history.settled();
 assert.equal(trampleHistory(actor,turn).known,false);assert.deepEqual(trampleHistory(actor,turn).targets,['pc']);
});
