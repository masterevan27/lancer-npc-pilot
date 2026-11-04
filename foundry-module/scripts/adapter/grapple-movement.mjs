import { gridInfo } from './geometry.mjs';
import { readToken, MODULE_ID } from './snapshot.mjs';
import { collectCarryGeometry } from './carry-geometry.mjs';
import { readActionBudget } from './budgets.mjs';
import { tokenDistance, cellKey, neighbors } from '../core/grid.mjs';
import { areEnemies, normStatus } from '../core/snapshot.mjs';
import { grappleMovePlan } from '../core/grapples.mjs';

/** Read-only geometry for either native participant, including player mechs.
 * This entry point never makes a PC eligible for NPC policy planning.
 */
export function readGrappleMove({game,canvas,constants},link,path){
  const scene=canvas.scene,active=game.combat?.combatant?.tokenId;
  if(!scene||!game.combat?.started||game.combat.scene?.id!==scene.id)throw Error('An active linked encounter is required.');
  const terrain=scene.getFlag(MODULE_ID,'terrain');
  if(terrain?.reviewed!==true||(scene.regions?.size??scene.regions?.length??0)>0)throw Error('Reviewed terrain without region movement is required.');
  const source=canvas.tokens.get(active);
  if(!source||![link.sourceTokenId,link.targetTokenId].includes(active))throw Error('Move the controlling participant on its active turn.');
  const budget=readActionBudget(source.actor);
  if(budget.blocked.includes('move'))throw Error('The active participant cannot move.');
  const native=canvas.tokens.placeables;
  if(native.some(t=>!t.actor||t.document.elevation!==source.document.elevation))throw Error('Unsupported actor or elevation in grapple movement.');
  const snapshot={grid:gridInfo(scene,canvas.grid,canvas.dimensions,constants),activeTokenId:active,
    tokens:native.map(t=>readToken(t,canvas.grid)),blocked:[...(terrain.blocked??[])],difficult:[...(terrain.difficult??[])],engagementMoves:[]};
  for(const t of snapshot.tokens)if(t.hp[0]<=0||t.defeated)snapshot.blocked.push(...t.occupiedCells[cellKey(t.pos)].map(cellKey));
  const other=active===link.sourceTokenId?link.targetTokenId:link.sourceTokenId;
  const radius=Math.max(8,budget.move);
  const {positions}=collectCarryGeometry({canvas,constants},snapshot,{tokenIds:[active,other],radius});
  const mover=snapshot.tokens.find(t=>t.id===active);
  const enemies=snapshot.tokens.filter(t=>t.id!==other&&areEnemies(mover,t)&&t.hp[0]>0&&!t.defeated
    &&!t.statuses.some(s=>normStatus(s)==='HIDDEN')&&t.size>=mover.size);
  for(const key of Object.keys(positions[active]??{})){
    const [x,y]=key.split(',').map(Number),from={x,y};
    if(enemies.some(t=>tokenDistance(snapshot.grid,mover,t,from)<=1))
      for(const to of neighbors(snapshot.grid,from))snapshot.engagementMoves.push(`${key}>${cellKey(to)}`);
  }
  const plan=grappleMovePlan(snapshot,link,active,path);
  if(!plan||plan.cost>budget.move)throw Error('The paired route, native walls, occupancy or movement budget is invalid.');
  return {plan,snapshot,positions,budget};
}
