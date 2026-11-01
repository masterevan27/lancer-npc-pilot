import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSnapshot, readToken } from '../scripts/adapter/snapshot.mjs';
import { executeOption } from '../scripts/adapter/executor.mjs';

export function environment() {
  const system = { tier: 2, hp: { value: 10, max: 12 }, heat: { value: 0, max: 6 },
    structure: { value: 1, max: 1 }, stress: { value: 1, max: 1 }, armor: 1,
    evasion: 8, edef: 8, speed: 2, sensor_range: 10, size: 1,
    action_tracker: { move: 2, full: true, quick: true } };
  const weapon = { id: 'rifle', name: 'Rifle', type: 'npc_feature',
    system: { type: 'Weapon', loaded: true, charged: true, destroyed: false,
      uses: { value: 2, max: 2 }, tags: [{ lid: 'tg_loading', val: '' }, { lid: 'tg_limited', val: '2' }] },
    currentProfile: () => ({ type: null, accuracy: 1, attack: 2,
      range: [{ type: 'Range', val: 5 }], damage: [{ type: 'Kinetic', val: '1d6+2' }] }),
    beginWeaponAttackFlow: async () => {} };
  const token = (id, x, disposition, type = 'npc') => {
    const actor = { id: `a-${id}`, name: id, type, system: structuredClone(system),
      statuses: new Set(), items: [weapon], flags: {},
      getFlag: () => '', toObject() { return { ...this.system, flags: this.flags }; } };
    const document = { id, name: id, x, y: 100, width: 1, height: 1, elevation: 0,
      disposition, actor, toObject() { return { id, x: this.x, y: this.y, elevation: this.elevation }; } };
    return { id, name: id, actor, document, checkCollision: () => false };
  };
  const tokens = [token('npc', 100, -1), token('pc', 400, 1, 'mech')];
  const scene = { id: 'scene', grid: { type: 1, diagonals: 1, size: 100, distance: 1 },
    regions: [], flags: {}, getFlag(namespace, key) { return this.flags[key]; },
    toObject() { return { flags: this.flags }; } };
  const grid = { getOffset: ({ x, y }) => ({ i: Math.floor(y / 100), j: Math.floor(x / 100) }),
    getTopLeftPoint: ({ i, j }) => ({ x: j * 100, y: i * 100 }),
    getCenterPoint: ({ i, j }) => ({ x: j * 100 + 50, y: i * 100 + 50 }),
    getOffsetRange: ({ x, y, width, height }) => [Math.floor(y / 100), Math.floor(x / 100), Math.ceil((y + height) / 100), Math.ceil((x + width) / 100)] };
  for (const t of tokens) {
    const d = t.document;
    d.getSize = () => ({ width: d.width * 100, height: d.height * 100 });
    d.getCenterPoint = (p = {}) => ({ x: (p.x ?? d.x) + d.width * 50, y: (p.y ?? d.y) + d.height * 50 });
    d.getOccupiedGridSpaceOffsets = (p = {}) => [grid.getOffset(d.getCenterPoint(p))];
    d.getSnappedPosition = (p = {}) => {
      const step = d.width === 0.5 ? 25 : 100;
      return { x: Math.round((p.x ?? d.x) / step) * step, y: Math.round((p.y ?? d.y) / step) * step };
    };
  }
  const combat = { id: 'combat', round: 1, turn: 0, started: true, scene: { id: 'scene' },
    combatant: { tokenId: 'npc', defeated: false }, combatants: [],
    toObject() { return { id: this.id, turn: this.turn, round: this.round }; } };
  const game = { user: { isGM: true }, system: { id: 'lancer' }, combat };
  const canvas = { ready: true, scene, grid, dimensions: { width: 800, height: 600,
    sceneRect: { x: 0, y: 0, width: 800, height: 600 } }, tokens: { placeables: tokens, get: id => tokens.find(t => t.id === id) } };
  return { game, canvas, constants: { GRID_TYPES: { SQUARE: 1 }, GRID_DIAGONALS: { EQUIDISTANT: 1 } } };
}

test('Lancer adapter reads resolved tier profile, tag lid, limited uses, statuses and persona', () => {
  const env = environment(); const t = env.canvas.tokens.placeables[0];
  t.actor.statuses.add('impaired'); t.actor.getFlag = () => 'Berserker';
  const value = readToken(t, env.canvas.grid);
  assert.equal(value.weapons[0].attackBonus, 2);
  assert.equal(value.weapons[0].accuracy, 1);
  assert.deepEqual(value.weapons[0].tags[0], { id: 'tg_loading', val: '' });
  assert.equal(value.weapons[0].uses, 2);
  assert.equal(value.side, 'hostile'); assert.equal(value.persona, 'Berserker');
  assert.deepEqual(value.statuses, ['impaired']);
});

test('snapshot contains hidden enemies, directed movement walls and known LOS', () => {
  const env = environment(); env.canvas.tokens.placeables[1].document.hidden = true;
  env.canvas.tokens.placeables[0].checkCollision = (to, { origin, type }) =>
    type === 'move' ? origin.x < 200 && to.x >= 200 : to.x > 400;
  const { snapshot } = extractSnapshot(env);
  assert.equal(snapshot.tokens.length, 2);
  assert(snapshot.blockedMoves.includes('1,1>2,1'));
  assert(!snapshot.blockedMoves.includes('2,1>1,1'));
  assert.equal(snapshot.losFrom['1,1'].pc, false);
});

test('snapshot stamp changes for world, walls, actor or turn changes', () => {
  const env = environment(); const a = extractSnapshot(env).stamp;
  env.canvas.tokens.placeables[1].actor.system.hp.value--;
  assert.notEqual(extractSnapshot(env).stamp, a);
  const b = extractSnapshot(env).stamp; env.game.combat.turn++;
  assert.notEqual(extractSnapshot(env).stamp, b);
});

test('adapter refuses players, wrong turns, unsupported grids, size, statuses and elevation', () => {
  for (const mutate of [
    e => { e.game.user.isGM = false; }, e => { e.game.combat.combatant.tokenId = 'pc'; },
    e => { e.canvas.scene.grid.type = 2; }, e => { e.canvas.scene.grid.diagonals = 2; },
    e => { e.canvas.tokens.placeables[0].document.width = 2; },
    e => { e.canvas.tokens.placeables[0].actor.statuses.add('grappled'); },
    e => { e.canvas.tokens.placeables[1].document.elevation = 5; },
    e => { e.canvas.scene.regions.push({}); },
  ]) { const env = environment(); mutate(env); assert.throws(() => extractSnapshot(env)); }
});

test('special range shapes and recharge weapons cannot become ordinary attacks', () => {
  const env = environment(); const t = env.canvas.tokens.placeables[0];
  t.actor.items[0].currentProfile = () => ({ range: [{ type: 'Blast', val: 1 }], damage: [] });
  assert.equal(readToken(t, env.canvas.grid).weapons.length, 0);
  t.actor.items[0].system.tags.push({ lid: 'tg_recharge', val: '5' });
  t.actor.items[0].system.charged = false;
  assert.equal(readToken(t, env.canvas.grid).weapons.length, 0);
});

test('Superheavy weapon types and scripted attack effects are excluded even without special tags', () => {
  for (const change of [w => { w.system.weapon_type = 'Superheavy Melee'; },
    w => { w.system.effect = 'Attacks all characters within Threat.'; },
    w => { w.system.on_hit = '<p>Push the target.</p>'; },
    w => { w.system.tags.push({ lid: 'tg_unknown', val: '' }); }]) {
    const env = environment(); const t = env.canvas.tokens.placeables[0]; change(t.actor.items[0]);
    assert.equal(readToken(t, env.canvas.grid).weapons.length, 0);
  }
});

test('Hidden enemies cannot be attacked and entering engagement stops further movement', () => {
  const env = environment(); const enemy = env.canvas.tokens.placeables[1];
  enemy.actor.statuses.add('hidden');
  assert.equal(extractSnapshot(env).snapshot.losFrom['1,1'].pc, false);
  enemy.actor.statuses.clear();
  const snapshot = extractSnapshot(env).snapshot;
  assert(snapshot.blockedMoves.includes('3,1>3,2'));
  assert(!snapshot.blockedMoves.includes('2,1>3,1'));
});

test('real adapter guard permits its own reservation and v13 movement history but detects other changes', async () => {
  const env = environment(); const active = env.canvas.tokens.placeables[0];
  env.game.user.id = 'gm'; env.game.users = { activeGM: { id: 'gm' } };
  env.game.user.updateTokenTargets = async () => {};
  env.canvas.scene.flags.terrain = { reviewed: true };
  active.document.delta = { _id: 'synthetic', system: {}, flags: {} };
  const originalObject = active.document.toObject.bind(active.document);
  active.document.toObject = () => ({ ...originalObject(), delta: structuredClone(active.document.delta),
    _movementHistory: active.document._movementHistory ?? [] });
  active.actor.setFlag = async (ns, key, value) => {
    (active.actor.flags[ns] ??= {})[key] = value;
    (active.document.delta.flags[ns] ??= {})[key] = value;
  };
  active.actor.getFlag = (ns, key) => active.actor.flags[ns]?.[key];
  active.actor.update = async data => {
    active.actor.system.action_tracker = data['system.action_tracker'];
    active.document.delta.system.action_tracker = structuredClone(data['system.action_tracker']);
  };
  let flows = 0;
  active.actor.items.get = () => ({ beginWeaponAttackFlow: async () => { flows++; } });
  active.document.move = async (points, opts) => {
    assert.equal(opts.autoRotate, false);
    Object.assign(active.document, points.at(-1));
    active.document._movementHistory = points;
    return true;
  };
  const board = extractSnapshot(env);
  const option = { move: { to: { x: 2, y: 1 }, path: [{ x: 1, y: 1 }, { x: 2, y: 1 }], cost: 1 },
    action: { kind: 'attack', itemId: 'rifle', targetTokenIds: ['pc'] }, facts: { usesBoost: false } };
  await executeOption(option, board, {}, { ...env, read: options => extractSnapshot(env, options),
    withLock: async (_key, fn) => fn(), postLine: async () => {} });
  assert.equal(flows, 1);
});
