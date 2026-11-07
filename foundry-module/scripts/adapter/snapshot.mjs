import { cellKey, tokenDistance, translateCell, neighbors } from '../core/grid.mjs';
import { reachableCells } from '../core/reach.mjs';
import { normStatus, validateSnapshot } from '../core/snapshot.mjs';
import { gridInfo, tokenGeometry, insideScene } from './geometry.mjs';
import { readNpcWeapons } from './weapons.mjs';
import { coverageDiagnostic } from '../core/coverage.mjs';
import { readActionBudget } from './budgets.mjs';
import { sweptWallBlocked } from './swept.mjs';
import { collectCarryGeometry } from './carry-geometry.mjs';
import { CATAPHRACT_MOVEMENT } from '../rules/cataphract.mjs';

export const MODULE_ID = 'lancer-npc-pilot';
const ACTIVE_STATUSES = new Set(['IMPAIRED', 'IMMOBILIZED', 'SLOWED', 'STUNNED', 'LOCKON', 'SHREDDED', 'EXPOSED', 'ENGAGED']);
const pair = value => [Number(value?.value), Number(value?.max)];
const number = value => Number(value);
const plain = value => JSON.parse(JSON.stringify(value));

// Coverage explanations only. Native-derived stats are already read above;
// these warnings must never apply prose effects or grant executable handlers.
function featureWarnings(tokens) {
  return tokens.flatMap(token => [...(token.actor.items ?? [])]
    .filter(item => item.type === 'npc_feature' && item.system?.type !== 'Weapon')
    .map(item => {
      const kind = item.system?.type;
      const gap = kind === 'Trait'
        ? 'Unreviewed passive or activated mechanics require manual verification; native-derived stats are retained.'
        : kind === 'Reaction'
          ? 'Reaction requires manual resolution.'
          : ['Tech', 'System'].includes(kind)
            ? 'Ability requires manual resolution.'
            : 'Unknown feature kind requires manual review.';
      const diagnostic = coverageDiagnostic({ kind: kind ?? 'unknown', lid: item.system?.lid ?? '' });
      return `${token.name ?? token.id} — ${item.name ?? item.id ?? 'Unnamed feature'} (${kind ?? 'unknown'}): ${gap} ${diagnostic.message}`;
    }));
}
function stripOwnActorChanges(actor) {
  delete actor._stats;
  if (actor.flags?.[MODULE_ID]) delete actor.flags[MODULE_ID].lastExecution;
  if (actor.flags?.[MODULE_ID] && !Object.keys(actor.flags[MODULE_ID]).length) delete actor.flags[MODULE_ID];
  if (actor.flags && !Object.keys(actor.flags).length) delete actor.flags;
  if (actor.system) {
    delete actor.system.action_tracker;
    if (!Object.keys(actor.system).length) delete actor.system;
  }
  delete actor.action_tracker;
}

/** Lancer 3.1.3: currentProfile resolves the actor tier; tags use lid, not id. */
export function readToken(token, grid, geometry = tokenGeometry(token, grid)) {
  const d = token.document, actor = token.actor, s = actor.system;
  const position = geometry.cell;
  const { weapons, excludedWeapons } = readNpcWeapons(actor);
  const ids = type => [...new Set([...(actor.items ?? [])].filter(i => i.type === type)
    .map(i => i.system?.lid).filter(id => typeof id === 'string' && id))];
  return { id: token.id, actorId: actor.id, name: token.name ?? d.name,
    isNpc: actor.type === 'npc', side: d.disposition < 0 ? 'hostile' : d.disposition > 0 ? 'friendly' : 'neutral',
    pos: position, size: number(s.size ?? d.width), hp: pair(s.hp),
    occupiedCells: { [cellKey(position)]: geometry.cellsAt(position) },
    classIds: ids('npc_class'), templateIds: ids('npc_template'),
    heat: s.heat ? pair(s.heat) : undefined, structure: s.structure ? pair(s.structure) : undefined,
    stress: s.stress ? pair(s.stress) : undefined, overshield: number(s.overshield?.value ?? 0),
    armor: number(s.armor), evasion: number(s.evasion), edef: number(s.edef), speed: number(s.speed),
    sensors: number(s.sensor_range), saveTarget: Number.isFinite(s.save) ? s.save : null,
    hull: Number.isFinite(s.hull) ? s.hull : null, statuses: [...(actor.statuses ?? [])],
    resistances: Object.entries(s.resistances ?? {}).filter(([, v]) => v === true).map(([k]) => k),
    weapons, excludedWeapons, persona: String(actor.getFlag?.(MODULE_ID, 'persona') ?? '').slice(0, 2000),
    defeated: Boolean(s.destroyed), gmHidden: d.hidden === true };
}

/** Read-only, synchronous extraction: no animation or document mutation during planning. */
export function extractSnapshot({ game, canvas, constants }, { expectedTracker,cataphractGeometry=false } = {}) {
  if (!game.user?.isGM || game.system?.id !== 'lancer') throw Error('Lancer NPC Pilot requires a Lancer GM client.');
  const combat = game.combat, scene = canvas.scene;
  if (!canvas.ready || !scene) throw Error('The scene is not ready. Open the encounter map and wait for the scene to finish loading, then retry Plan Turn.');
  if (!combat) throw Error('No active combat encounter. Open Combat Tracker, choose or Create Encounter, and add the NPC before planning.');
  if (!combat.started) throw Error('Combat has not started. Click Begin Combat in Combat Tracker, start the NPC turn, then retry Plan Turn.');
  if (!combat.scene?.id) throw Error('This encounter is not linked to a scene. Open its map, then choose Combat Tracker > three-dot menu > Link to Viewed Scene. Retry Plan Turn.');
  if (combat.scene.id !== scene.id) throw Error('You are viewing a different scene. Open the encounter\'s linked scene, then retry Plan Turn.');
  const active = canvas.tokens.get(combat.combatant?.tokenId);
  if (!active || active.actor?.type !== 'npc' || combat.combatant.defeated) throw Error('The active combatant must be a living NPC.');
  if (active.document.disposition === 0) throw Error('Set the NPC disposition to friendly or hostile first.');
  const grid = gridInfo(scene, canvas.grid, canvas.dimensions, constants);
  if ((scene.regions?.size ?? scene.regions?.length ?? 0) > 0) throw Error('Region movement rules need manual play in this version.');
  const tokens = canvas.tokens.placeables;
  const geometries = new Map();
  const elevation = active.document.elevation;
  for (const t of tokens) {
    if (!t.actor || !['npc', 'mech', 'pilot', 'deployable'].includes(t.actor.type)) throw Error('Every scene token needs a supported Lancer actor.');
    if (t.document.elevation !== elevation) throw Error('Elevation differences require manual play.');
    geometries.set(t.id, tokenGeometry(t, canvas.grid));
  }
  for (const status of active.actor.statuses ?? []) {
    const ownedGrapple=normStatus(status)==='NPCPILOTGRAPPLE' && [...(active.actor.effects??[])].some(e=>{
      const g=e.flags?.[MODULE_ID]?.grapple;
      return !e.disabled&&g?.tokenId===active.id&&(scene.getFlag?.(MODULE_ID,'grapples')??[]).some(l=>l.id===g.id
        &&[l.sourceTokenId,l.targetTokenId].includes(active.id));
    });
    if(ownedGrapple)continue;
    if (!ACTIVE_STATUSES.has(normStatus(status)) && !String(status).startsWith('resistance_'))
      throw Error(`Active NPC condition ${status} needs manual play.`);
  }
  const speed = number(active.actor.system.speed);
  if (!Number.isInteger(speed) || speed < 0 || speed > 12) throw Error('NPC speed must be an integer from 0 to 12.');
  const tracker = active.actor.system.action_tracker;
  if (expectedTracker && JSON.stringify(tracker) !== JSON.stringify(expectedTracker))
    throw Error('The native action tracker changed during execution. Continue manually.');
  const actionBudget = readActionBudget(active.actor);
  if (actionBudget.move > 2 * speed) throw Error('This movement budget requires manual verification.');
  const snapshot = { round: combat.round, activeTokenId: active.id,
    actionBudget,
    grid, tokens: tokens.map(t => readToken(t, canvas.grid, geometries.get(t.id))),
    blocked: [], blockedMoves: [], blockedAnchorMoves: [], engagementMoves: [], difficult: [], cover: {}, losFrom: {} };
  for (const t of snapshot.tokens) {
    if ((combat.combatants?.contents ?? combat.combatants ?? []).some(c => c.tokenId === t.id && c.defeated)) t.defeated = true;
    // Wrecks remain obstacles until the GM removes their token.
    if (t.defeated || t.hp[0] <= 0) snapshot.blocked.push(...t.occupiedCells[cellKey(t.pos)].map(cellKey));
  }
  const terrain = scene.getFlag?.(MODULE_ID, 'terrain') ?? {};
  snapshot.blocked.push(...(terrain.blocked ?? []));
  snapshot.difficult = [...(terrain.difficult ?? [])]; snapshot.cover = plain(terrain.cover ?? {});
  const mover = snapshot.tokens.find(t => t.id === active.id);
  if (mover.hp[0] <= 0 || mover.defeated) throw Error('The active NPC cannot act while defeated.');
  const geometry = geometries.get(active.id), center = c => geometry.centerAt(c);
  const positions = {};
  const rect = canvas.dimensions.sceneRect;
  const inside = c => insideScene(geometry.positionAt(c), geometry.dimensions, rect);
  const radius = Math.max(actionBudget.move + speed + 1,cataphractGeometry?8:0);
  const prepare = c => {
    if (!inside(c)) return false;
    const cells = geometry.cellsAt(c);
    if (!cells?.length) return false;
    mover.occupiedCells[cellKey(c)] = cells;
    positions[cellKey(c)] = geometry.positionAt(c);
    return true;
  };
  const bodyPoints = (id, c) => {
    const g = geometries.get(id), cells = g.cellsAt(c);
    return cells.map(cell => ({ cell, point: cells.length === 1 ? g.centerAt(c)
      : canvas.grid.getCenterPoint({ i: cell.y, j: cell.x }) }));
  };
  // Large footprints share many identical rays. Cache only within this
  // synchronous read; every later snapshot observes fresh native wall state.
  const collisionCache = new Map();
  const collision = (destination, options) => {
    const key = `${options.type}:${options.origin.x},${options.origin.y}>${destination.x},${destination.y}`;
    if (!collisionCache.has(key)) collisionCache.set(key, active.checkCollision(destination, options));
    return collisionCache.get(key);
  };
  const hidden = t => t.statuses.some(s => normStatus(s) === 'HIDDEN');
  const engagingEnemies = snapshot.tokens.filter(t => t.side !== mover.side && t.side !== 'neutral'
    && !t.defeated && !hidden(t) && t.size >= mover.size);
  for (let y = Math.max(0, mover.pos.y - radius); y <= Math.min(snapshot.grid.height - 1, mover.pos.y + radius); y++) {
    for (let x = Math.max(0, mover.pos.x - radius); x <= Math.min(snapshot.grid.width - 1, mover.pos.x + radius); x++) {
      const from = { x, y };
      if (!prepare(from)) continue;
      // Conservatively stop at adjacency, including an already-engaged start.
      // This prevents a path from continuing after entering engagement, without
      // pretending to implement Disengage or reactions.
      const engaged = engagingEnemies.some(t => tokenDistance(grid, mover, t, from) <= 1);
      for (const to of neighbors(snapshot.grid, from)) {
        const edge = `${cellKey(from)}>${cellKey(to)}`;
        const swept = () => {
          const walls = canvas.walls?.placeables;
          if (!Array.isArray(walls)) throw Error('Native wall geometry is unavailable; continue manually.');
          if (!walls.length) return false;
          const a = geometry.positionAt(from), b = geometry.positionAt(to);
          return sweptWallBlocked(geometry.polygonAt(from), { x: b.x - a.x, y: b.y - a.y }, walls, constants.WALL_MOVEMENT_TYPES);
        };
        // Engagement never short-circuits collision collection: a reviewed
        // exception may ignore engagement but must still observe this wall.
        if (engaged) snapshot.engagementMoves.push(edge);
        if (!prepare(to) || swept() || collision(center(to), { origin: center(from), type: 'move', mode: 'any' }) !== false) {
          snapshot.blockedAnchorMoves.push(edge);
          // Preserve the existing single-cell directed-wall representation too.
          if (mover.occupiedCells[cellKey(from)].length === 1) snapshot.blockedMoves.push(edge);
          continue;
        }
        const destinationCells = mover.occupiedCells[cellKey(to)];
        for (const { cell, point } of bodyPoints(active.id, from)) {
          const next = translateCell(grid, cell, from, to);
          if (!destinationCells.some(c => c.x === next.x && c.y === next.y)) {
            snapshot.blockedAnchorMoves.push(edge); break;
          }
          const target = destinationCells.length === 1 ? center(to) : canvas.grid.getCenterPoint({ i: next.y, j: next.x });
          if (collision(target, { origin: point, type: 'move', mode: 'any' }) !== false)
            snapshot.blockedMoves.push(`${cellKey(cell)}>${cellKey(next)}`);
        }
      }
    }
  }
  for (const { to } of reachableCells(snapshot, active.id, { maxCost:cataphractGeometry?Math.max(8,actionBudget.move+speed):actionBudget.move,
    ...(cataphractGeometry?CATAPHRACT_MOVEMENT:{}) }).values()) {
    const los = snapshot.losFrom[cellKey(to)] = {};
    for (const target of snapshot.tokens.filter(t => t.id!==mover.id&&!t.defeated&&(cataphractGeometry||(t.side !== mover.side && t.side !== 'neutral')))) {
      los[target.id] = !hidden(target) && bodyPoints(active.id, to).some(from =>
        bodyPoints(target.id, target.pos).some(end => collision(end.point,
          { origin: from.point, type: 'sight', mode: 'any' }) === false));
    }
  }
  const carryPositions=cataphractGeometry?collectCarryGeometry({canvas,constants},snapshot,
    {tokenIds:snapshot.tokens.map(t=>t.id),radius:Math.max(8,actionBudget.move+speed)}).positions:undefined;
  const nativeAutomation=cataphractGeometry?plain(game.settings?.get('lancer','automationOptions')??{}):undefined;
  const validation = validateSnapshot(snapshot);
  if (!validation.ok) throw Error(`Cannot read a valid Lancer board: ${validation.errors.map(e => `${e.path}: ${e.message}`).join('; ')}`);
  const sceneData = plain(scene.toObject());
  delete sceneData.tokens; delete sceneData._stats;
  const guardTokens = tokens.map(t => {
    const token = plain(t.document.toObject()), actor = plain(t.actor.toObject());
    if (t.id === active.id) {
      delete token.x; delete token.y; delete token._stats; delete token._movementHistory;
      // These installed modules update bookkeeping during native movement.
      // Keep every other flag, and every target token, in the execution guard.
      for (const [namespace, field] of [['lancer-automations', 'moveHistory'], ['about-face', 'prevPos'], ['about-face', 'direction']]) {
        if (token.flags?.[namespace]) {
          delete token.flags[namespace][field];
          if (!Object.keys(token.flags[namespace]).length) delete token.flags[namespace];
        }
      }
      if (token.flags && !Object.keys(token.flags).length) delete token.flags;
      // About Face mirrors artwork on movement; magnitudes and image stay guarded.
      for (const axis of ['scaleX', 'scaleY']) {
        if (Number.isFinite(token.texture?.[axis])) token.texture[axis] = Math.abs(token.texture[axis]);
      }
      stripOwnActorChanges(actor);
      // Unlinked token actors persist the same changes in ActorDelta too.
      if (token.delta) stripOwnActorChanges(token.delta);
      // Execution checks the exact expected budget separately; its own update
      // must not mask a changed target, wall, item, condition or combat turn.
    }
    return { token, actor };
  });
  return { snapshot, positions,...(cataphractGeometry?{carryPositions,nativeAutomation,cataphractGeometry:true}:{}), turn: `${scene.id}:${combat.id}:${combat.round}:${combat.turn}:${active.id}`,
    guard: JSON.stringify({ scene: sceneData, combat: combat.toObject(), tokens: guardTokens }),
    stamp: JSON.stringify({ scene: scene.toObject(), combat: combat.toObject(),
      tokens: tokens.map(t => ({ token: t.document.toObject(), actor: t.actor.toObject() })), snapshot,...(cataphractGeometry?{nativeAutomation}: {}) }),
    terrainReviewed: terrain.reviewed === true,
    warnings: [...mover.excludedWeapons.map(w => `${w.name}: ${w.reason}`),
      ...((tracker.full !== true || tracker.quick !== true)
        ? ['Earlier action history is unavailable. Remaining slots are shown, but attacks and Boost require manual play to avoid repeating an action or mixing restricted weapon modes.'] : []),
      ...featureWarnings(tokens),
      ...(!mover.weapons.length ? ['This NPC has no usable supported weapons. Attacks are unavailable; play excluded weapons manually.'] : []),
      'Scoring approximates cover, engagement and special traits; verify the Lancer attack HUD.',
      'Resolve reactions manually along the proposed path. Hide and special targeting are excluded.',
      ...(validation.warnings ?? []).map(w => `${w.path}: ${w.message}`), ...(!terrain.reviewed ? ['Scene terrain has not been reviewed; execution is disabled.'] : [])] };
}
