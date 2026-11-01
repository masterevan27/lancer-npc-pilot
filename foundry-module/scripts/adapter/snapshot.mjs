import { cellKey, neighbors } from '../core/grid.mjs';
import { reachableCells } from '../core/reach.mjs';
import { normStatus, validateSnapshot } from '../core/snapshot.mjs';

export const MODULE_ID = 'lancer-npc-pilot';
const ACTIVE_STATUSES = new Set(['IMPAIRED', 'IMMOBILIZED', 'SLOWED', 'STUNNED', 'LOCKON', 'SHREDDED', 'EXPOSED']);
const ORDINARY_TAGS = new Set(['tg_loading', 'tg_limited', 'tg_recharge', 'tg_accurate', 'tg_inaccurate',
  'tg_reliable', 'tg_ap', 'tg_overkill', 'tg_heat_self']);
const pair = value => [Number(value?.value), Number(value?.max)];
const number = value => Number(value);
const plain = value => JSON.parse(JSON.stringify(value));
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
export function readToken(token, grid) {
  const d = token.document, actor = token.actor, s = actor.system;
  const offset = grid.getOffset({ x: d.x, y: d.y });
  const weapons = [];
  for (const item of actor.items ?? []) {
    if (item.type !== 'npc_feature' || item.system.type !== 'Weapon') continue;
    const data = item.system;
    const tags = (data.tags ?? []).map(t => ({ id: t.lid, val: t.tierVal?.(s.tier) ?? t.val }));
    const has = id => tags.some(t => t.id === id);
    // Lancer NPC classifications and scripted effects are not encoded solely
    // in range/tags (e.g. Superheavy Melee and Wrecker's mandatory multi-target).
    if (/superheavy/i.test(data.weapon_type ?? '') || String(data.effect ?? '').trim()
      || String(data.on_hit ?? '').trim() || tags.some(t => !ORDINARY_TAGS.has(t.id))) continue;
    if (data.destroyed || (has('tg_recharge') && !data.charged)) continue;
    const p = item.currentProfile();
    // AoE and special targeting must use manual Lancer flows.
    if (!p.range?.length || p.range.some(r => !['Range', 'Threat'].includes(r.type))) continue;
    if (tags.some(t => ['tg_smart', 'tg_seeking', 'tg_arcing', 'tg_ordinance', 'tg_ordnance', 'tg_superheavy'].includes(t.id))) continue;
    const damage = (p.damage ?? []).map(v => ({ type: v.type, val: v.val }));
    if (!damage.length || damage.some(v => !/^(?:\d*d\d+(?:[+-]\d+)?|\d+)$/i.test(String(v.val).replace(/\s/g, '')))) continue;
    weapons.push({ itemId: item.id, name: item.name, type: p.type ?? data.weapon_type,
      range: p.range.map(r => ({ type: r.type, val: Number(r.val) })), damage,
      accuracy: number(p.accuracy ?? 0), attackBonus: number(p.attack ?? 0), tags,
      loaded: !has('tg_loading') || data.loaded === true,
      uses: has('tg_limited') ? number(data.uses?.value) : null, destroyed: false });
  }
  return { id: token.id, actorId: actor.id, name: token.name ?? d.name,
    isNpc: actor.type === 'npc', side: d.disposition < 0 ? 'hostile' : d.disposition > 0 ? 'friendly' : 'neutral',
    pos: { x: offset.j, y: offset.i }, size: number(s.size ?? d.width), hp: pair(s.hp),
    heat: s.heat ? pair(s.heat) : undefined, structure: s.structure ? pair(s.structure) : undefined,
    stress: s.stress ? pair(s.stress) : undefined, overshield: number(s.overshield?.value ?? 0),
    armor: number(s.armor), evasion: number(s.evasion), edef: number(s.edef), speed: number(s.speed),
    sensors: number(s.sensor_range), statuses: [...(actor.statuses ?? [])],
    resistances: Object.entries(s.resistances ?? {}).filter(([, v]) => v === true).map(([k]) => k),
    weapons, persona: String(actor.getFlag?.(MODULE_ID, 'persona') ?? '').slice(0, 2000),
    defeated: Boolean(s.destroyed) };
}

/** Read-only, synchronous extraction: no animation or document mutation during planning. */
export function extractSnapshot({ game, canvas, constants }, { expectedTracker } = {}) {
  if (!game.user?.isGM || game.system?.id !== 'lancer') throw Error('Lancer NPC Pilot requires a Lancer GM client.');
  const combat = game.combat, scene = canvas.scene;
  if (!canvas.ready || !combat?.started || combat.scene?.id !== scene?.id) throw Error('View the active combat scene first.');
  const active = canvas.tokens.get(combat.combatant?.tokenId);
  if (!active || active.actor?.type !== 'npc' || combat.combatant.defeated) throw Error('The active combatant must be a living NPC.');
  if (active.document.disposition === 0) throw Error('Set the NPC disposition to friendly or hostile first.');
  if (scene.grid.type !== constants.GRID_TYPES.SQUARE || scene.grid.diagonals !== constants.GRID_DIAGONALS.EQUIDISTANT)
    throw Error('This adapter currently requires an equidistant square grid.');
  if ((scene.regions?.size ?? scene.regions?.length ?? 0) > 0) throw Error('Region movement rules need manual play in this version.');
  const tokens = canvas.tokens.placeables;
  const elevation = active.document.elevation;
  for (const t of tokens) {
    if (!t.actor || !['npc', 'mech', 'pilot', 'deployable'].includes(t.actor.type)) throw Error('Every scene token needs a supported Lancer actor.');
    if (t.document.width !== 1 || t.document.height !== 1 || Number(t.actor.system.size ?? 1) !== 1)
      throw Error('This adapter currently supports size-1 tokens only.');
    if (t.document.elevation !== elevation) throw Error('Elevation differences require manual play.');
    const o = canvas.grid.getOffset({ x: t.document.x, y: t.document.y });
    const anchor = canvas.grid.getTopLeftPoint(o);
    if (Math.abs(anchor.x - t.document.x) > 0.01 || Math.abs(anchor.y - t.document.y) > 0.01)
      throw Error('Snap all tokens to the grid before planning.');
  }
  for (const status of active.actor.statuses ?? []) {
    if (!ACTIVE_STATUSES.has(normStatus(status)) && !String(status).startsWith('resistance_'))
      throw Error(`Active NPC condition ${status} needs manual play.`);
  }
  const speed = number(active.actor.system.speed);
  if (!Number.isInteger(speed) || speed < 0 || speed > 12) throw Error('NPC speed must be an integer from 0 to 12.');
  const tracker = active.actor.system.action_tracker;
  if (expectedTracker ? JSON.stringify(tracker) !== JSON.stringify(expectedTracker)
    : !tracker || tracker.move !== speed || tracker.full !== true || tracker.quick !== true)
    throw Error('Plan at the start of a fresh NPC turn, before spending movement or actions.');
  const size = scene.grid.size;
  const snapshot = { round: combat.round, activeTokenId: active.id,
    grid: { type: 'square', diagonals: 'equidistant', size, distance: scene.grid.distance,
      width: Math.ceil(canvas.dimensions.width / size), height: Math.ceil(canvas.dimensions.height / size) },
    tokens: tokens.map(t => readToken(t, canvas.grid)), blocked: [], blockedMoves: [], difficult: [], cover: {}, losFrom: {} };
  for (const t of snapshot.tokens) {
    if ((combat.combatants?.contents ?? combat.combatants ?? []).some(c => c.tokenId === t.id && c.defeated)) t.defeated = true;
    // Wrecks remain obstacles until the GM removes their token.
    if (t.defeated || t.hp[0] <= 0) snapshot.blocked.push(cellKey(t.pos));
  }
  const terrain = scene.getFlag?.(MODULE_ID, 'terrain') ?? {};
  snapshot.blocked.push(...(terrain.blocked ?? []));
  snapshot.difficult = [...(terrain.difficult ?? [])]; snapshot.cover = plain(terrain.cover ?? {});
  const mover = snapshot.tokens.find(t => t.id === active.id);
  if (mover.hp[0] <= 0 || mover.defeated) throw Error('The active NPC cannot act while defeated.');
  const center = c => canvas.grid.getCenterPoint({ i: c.y, j: c.x });
  const rect = canvas.dimensions.sceneRect;
  const inside = c => { const p = center(c); return p.x >= rect.x && p.y >= rect.y && p.x < rect.x + rect.width && p.y < rect.y + rect.height; };
  const radius = 2 * speed + 1;
  const hidden = t => t.statuses.some(s => normStatus(s) === 'HIDDEN');
  const engagingEnemies = snapshot.tokens.filter(t => t.side !== mover.side && t.side !== 'neutral'
    && !t.defeated && !hidden(t) && t.size >= mover.size);
  for (let y = Math.max(0, mover.pos.y - radius); y <= Math.min(snapshot.grid.height - 1, mover.pos.y + radius); y++) {
    for (let x = Math.max(0, mover.pos.x - radius); x <= Math.min(snapshot.grid.width - 1, mover.pos.x + radius); x++) {
      const from = { x, y };
      if (!inside(from)) { snapshot.blocked.push(cellKey(from)); continue; }
      // Conservatively stop at adjacency, including an already-engaged start.
      // This prevents a path from continuing after entering engagement, without
      // pretending to implement Disengage or reactions.
      const engaged = engagingEnemies.some(t => Math.max(Math.abs(t.pos.x - x), Math.abs(t.pos.y - y)) <= 1);
      for (const to of neighbors(snapshot.grid, from)) {
        if (engaged || !inside(to) || active.checkCollision(center(to), { origin: center(from), type: 'move', mode: 'any' }) !== false)
          snapshot.blockedMoves.push(`${cellKey(from)}>${cellKey(to)}`);
      }
    }
  }
  for (const { to } of reachableCells(snapshot, active.id).values()) {
    const los = snapshot.losFrom[cellKey(to)] = {};
    for (const target of snapshot.tokens.filter(t => t.side !== mover.side && t.side !== 'neutral' && !t.defeated)) {
      los[target.id] = !hidden(target) && active.checkCollision(center(target.pos), { origin: center(to), type: 'sight', mode: 'any' }) === false;
    }
  }
  const validation = validateSnapshot(snapshot);
  if (!validation.ok) throw Error(`Cannot read a valid Lancer board: ${validation.errors.map(e => `${e.path}: ${e.message}`).join('; ')}`);
  const sceneData = plain(scene.toObject());
  delete sceneData.tokens; delete sceneData._stats;
  const guardTokens = tokens.map(t => {
    const token = plain(t.document.toObject()), actor = plain(t.actor.toObject());
    if (t.id === active.id) {
      delete token.x; delete token.y; delete token._stats; delete token._movementHistory;
      stripOwnActorChanges(actor);
      // Unlinked token actors persist the same changes in ActorDelta too.
      if (token.delta) stripOwnActorChanges(token.delta);
      // Execution checks the exact expected budget separately; its own update
      // must not mask a changed target, wall, item, condition or combat turn.
    }
    return { token, actor };
  });
  return { snapshot, turn: `${scene.id}:${combat.id}:${combat.round}:${combat.turn}:${active.id}`,
    guard: JSON.stringify({ scene: sceneData, combat: combat.toObject(), tokens: guardTokens }),
    stamp: JSON.stringify({ scene: scene.toObject(), combat: combat.toObject(),
      tokens: tokens.map(t => ({ token: t.document.toObject(), actor: t.actor.toObject() })), snapshot }),
    terrainReviewed: terrain.reviewed === true,
    warnings: ['Scoring approximates cover, engagement and special traits; verify the Lancer attack HUD.',
      'Resolve reactions manually along the proposed path. Hide and special targeting are excluded.',
      ...(validation.warnings ?? []).map(w => `${w.path}: ${w.message}`), ...(!terrain.reviewed ? ['Scene terrain has not been reviewed; execution is disabled.'] : [])] };
}
