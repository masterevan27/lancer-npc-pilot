import { tokenGeometry, insideScene } from './geometry.mjs';
import { cellKey, neighbors, translateCell } from '../core/grid.mjs';
import { sweptWallBlocked } from './swept.mjs';

/** Native hypothetical target geometry; never moves or updates a document.
 * Collected only for the requested special slice. Source hashing/legality still
 * independently decides whether any plan may use it.
 */
export function collectCarryGeometry({canvas,constants},snapshot,{tokenIds=null,radius=8}={}) {
  const positions={};snapshot.carryGeometry={};
  if(!Number.isSafeInteger(radius)||radius<1||radius>36)throw Error('Unsupported native carry radius.');
  for(const target of snapshot.tokens.filter(t=>tokenIds?tokenIds.includes(t.id):t.id!==snapshot.activeTokenId)){
    const token=canvas.tokens.get(target.id),geometry=tokenGeometry(token,canvas.grid),map=positions[target.id]={};
    const evidence=snapshot.carryGeometry[target.id]={blockedMoves:[],blockedAnchorMoves:[]};
    const prepare=c=>{
      const p=geometry.positionAt(c);
      if(!insideScene(p,geometry.dimensions,canvas.dimensions.sceneRect))return false;
      const cells=geometry.cellsAt(c);if(!cells?.length)return false;
      map[cellKey(c)]=p;target.occupiedCells[cellKey(c)]=cells;return true;
    };
    const walls=canvas.walls?.placeables;
    if(!Array.isArray(walls))throw Error('Native carry wall geometry is unavailable.');
    for(let y=Math.max(0,target.pos.y-radius);y<=Math.min(snapshot.grid.height-1,target.pos.y+radius);y++){
      for(let x=Math.max(0,target.pos.x-radius);x<=Math.min(snapshot.grid.width-1,target.pos.x+radius);x++){
        const from={x,y};if(!prepare(from))continue;
        for(const to of neighbors(snapshot.grid,from)){
          const edge=`${cellKey(from)}>${cellKey(to)}`;
          if(!prepare(to)){evidence.blockedAnchorMoves.push(edge);continue;}
          const a=map[cellKey(from)],b=map[cellKey(to)];
          if((walls.length&&sweptWallBlocked(geometry.polygonAt(from),{x:b.x-a.x,y:b.y-a.y},walls,constants.WALL_MOVEMENT_TYPES))
            ||token.checkCollision(geometry.centerAt(to),{origin:geometry.centerAt(from),type:'move',mode:'any'})!==false){
            evidence.blockedAnchorMoves.push(edge);continue;
          }
          const source=target.occupiedCells[cellKey(from)],destination=target.occupiedCells[cellKey(to)];
          for(const cell of source){
            const next=translateCell(snapshot.grid,cell,from,to);
            if(!destination.some(c=>cellKey(c)===cellKey(next))){evidence.blockedAnchorMoves.push(edge);break;}
            const start=source.length===1?geometry.centerAt(from):canvas.grid.getCenterPoint({i:cell.y,j:cell.x});
            const end=destination.length===1?geometry.centerAt(to):canvas.grid.getCenterPoint({i:next.y,j:next.x});
            if(token.checkCollision(end,{origin:start,type:'move',mode:'any'})!==false)evidence.blockedMoves.push(`${cellKey(cell)}>${cellKey(next)}`);
          }
        }
      }
    }
  }
  return {positions};
}
