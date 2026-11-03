import test from 'node:test';
import assert from 'node:assert/strict';
import { environment } from './adapter.test.mjs';
import { extractSnapshot } from '../scripts/adapter/snapshot.mjs';
import { cellDistance, neighbors } from '../scripts/core/grid.mjs';
import { reachableCells } from '../scripts/core/reach.mjs';
import { executeOption } from '../scripts/adapter/executor.mjs';

// Independently specified Foundry offset geometry: row/column centers and nearest-cell lookup.
export function hexEnvironment(layout = 'odd-r') {
  const env = environment(), columns = layout.endsWith('q'), even = layout.startsWith('even');
  const types = { SQUARE: 1, HEXODDR: 2, HEXEVENR: 3, HEXODDQ: 4, HEXEVENQ: 5 };
  env.constants.GRID_TYPES = types;
  env.canvas.scene.grid.type = types[{ 'odd-r': 'HEXODDR', 'even-r': 'HEXEVENR', 'odd-q': 'HEXODDQ', 'even-q': 'HEXEVENQ' }[layout]];
  const center = ({ i, j }) => columns
    ? { x: (j * 0.75 + 0.5) * 200 / Math.sqrt(3), y: (i + (((j + 1) % 2 === 0) === even ? 0 : 0.5)) * 100 }
    : { x: (j + (((i + 1) % 2 === 0) === even ? 0 : 0.5)) * 100, y: (i * 0.75 + 0.5) * 200 / Math.sqrt(3) };
  env.canvas.grid.getCenterPoint = center;
  env.canvas.grid.getOffset = point => {
    let best, distance = Infinity;
    for (let i = -3; i < 22; i++) for (let j = -3; j < 22; j++) {
      const c = center({ i, j }), d = (c.x - point.x) ** 2 + (c.y - point.y) ** 2;
      if (d < distance) { best = { i, j }; distance = d; }
    }
    return best;
  };
  env.canvas.grid.getOffsetRange = () => [-1, -1, 12, 14];
  for (const [index, t] of env.canvas.tokens.placeables.entries()) {
    const d = t.document, c = center({ i: 3, j: 3 + index * 4 });
    d.x = Math.round(c.x - 50); d.y = Math.round(c.y - 50);
    d.getSnappedPosition = (p = {}) => {
      const c = center(env.canvas.grid.getOffset(d.getCenterPoint(p)));
      return { x: c.x - d.width * 50, y: c.y - d.height * 50 };
    };
  }
  env.canvas.dimensions = { width: 1400, height: 1000, sceneRect: { x: 0, y: 0, width: 1400, height: 1000 } };
  return env;
}

for (const layout of ['odd-r', 'even-r', 'odd-q', 'even-q']) test(`reads ${layout} hex geometry and computes bounded six-neighbor paths`, () => {
  const env = hexEnvironment(layout), board = extractSnapshot(env);
  assert.equal(board.snapshot.grid.type, 'hex');
  assert.equal(board.snapshot.grid.hexLayout, layout);
  assert.deepEqual(board.snapshot.tokens[0].pos, { x: 3, y: 3 });
  const reached = reachableCells(board.snapshot, 'npc');
  for (const n of neighbors(board.snapshot.grid, { x: 3, y: 3 })) {
    assert.equal(reached.get(`${n.x},${n.y}`).cost, 1);
    assert.deepEqual(board.positions[`${n.x},${n.y}`], {
      x: Math.round(env.canvas.grid.getCenterPoint({ i: n.y, j: n.x }).x - 50),
      y: Math.round(env.canvas.grid.getCenterPoint({ i: n.y, j: n.x }).y - 50),
    });
  }
  assert.equal(board.snapshot.grid.height, 12); // Not ceil(1000 / 100).
});

test('accepts half-cell and full-cell Size ½ tokens without moving or resizing them', () => {
  for (const half of [false, true]) {
    const env = environment(), t = env.canvas.tokens.placeables[1];
    t.actor.system.size = 0.5;
    if (half) { t.document.width = t.document.height = 0.5; t.document.x = 425; t.document.y = 125; }
    const before = t.document.toObject();
    const board = extractSnapshot(env);
    assert.equal(board.snapshot.tokens[1].size, 0.5);
    assert.deepEqual(board.snapshot.tokens[1].pos, { x: 4, y: 1 });
    assert.deepEqual(t.document.toObject(), before);
  }
});

test('half-size mover preserves its subcell placement and uses actual centers for collision', () => {
  const env = environment(), t = env.canvas.tokens.placeables[0], rays = [];
  t.actor.system.size = 0.5; t.document.width = t.document.height = 0.5;
  t.document.x = 150; t.document.y = 100;
  t.checkCollision = (to, options) => { rays.push({ to, ...options }); return false; };
  const board = extractSnapshot(env);
  assert.deepEqual(board.positions['2,1'], { x: 250, y: 100 });
  assert(rays.some(r => r.type === 'move' && r.origin.x === 175 && r.origin.y === 125 && r.to.x === 275));
});

test('refuses missing occupancy/snapping APIs, unsupported sizes and ambiguous footprints', () => {
  for (const mutate of [
    t => { delete t.document.getOccupiedGridSpaceOffsets; },
    t => { delete t.document.getSnappedPosition; },
    t => { t.actor.system.size = 2; },
    t => { t.document.getOccupiedGridSpaceOffsets = () => [{ i: 1, j: 1 }, { i: 1, j: 2 }]; },
    t => { t.document.x += 10; },
  ]) { const env = environment(); mutate(env.canvas.tokens.placeables[0]); assert.throws(() => extractSnapshot(env)); }
});

test('hex engagement uses hex distance rather than square adjacency', () => {
  const env = hexEnvironment(), grid = { type: 'hex', hexLayout: 'odd-r' };
  const me = env.canvas.tokens.placeables[0], enemy = env.canvas.tokens.placeables[1];
  const from = { x: 3, y: 3 }, target = { x: 2, y: 2 };
  assert.equal(cellDistance(grid, from, target), 2);
  const p = env.canvas.grid.getCenterPoint({ i: target.y, j: target.x });
  enemy.document.x = Math.round(p.x - 50); enemy.document.y = Math.round(p.y - 50);
  const board = extractSnapshot(env);
  assert(!board.snapshot.blockedMoves.includes('3,3>4,3'));
  enemy.actor.system.size = 0.5;
  assert.equal(extractSnapshot(env).snapshot.tokens[1].size, 0.5);
  assert.equal(me.document.x, 300);
});

test('hex half-size approved Boost executes rounded token waypoints and preserves stale-state guards', async () => {
  const env = hexEnvironment(), t = env.canvas.tokens.placeables[0], calls = [];
  t.actor.system.size = 0.5; t.document.width = t.document.height = 0.5;
  const center = env.canvas.grid.getCenterPoint({ i: 3, j: 3 });
  t.document.x = Math.round(center.x - 25); t.document.y = Math.round(center.y - 25);
  env.game.user.id = 'gm'; env.game.users = { activeGM: { id: 'gm' } };
  env.canvas.scene.flags.terrain = { reviewed: true };
  t.actor.setFlag = async (ns, key, value) => { (t.actor.flags[ns] ??= {})[key] = value; };
  t.actor.getFlag = (ns, key) => t.actor.flags[ns]?.[key];
  t.actor.update = async data => { t.actor.system.action_tracker = data['system.action_tracker']; };
  t.document.move = async points => { calls.push(points); Object.assign(t.document, points.at(-1)); return true; };
  const board = extractSnapshot(env), route = [{ x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 }];
  const option = { move: { to: route.at(-1), path: route, cost: 3 }, action: { kind: 'boost' }, facts: { usesBoost: true } };
  await executeOption(option, board, {}, { ...env, read: options => extractSnapshot(env, options),
    withLock: async (_key, fn) => fn(), postLine: async () => {} });
  assert.deepEqual(calls.map(v => v.length), [2, 1]);
  assert.deepEqual({ x: t.document.x, y: t.document.y }, board.positions['6,3']);
  assert.equal(t.actor.system.action_tracker.move, 1); // 2 base + 2 Boost - 3 actually moved.
  assert.equal(t.actor.system.action_tracker.full, false);
  assert.equal(t.actor.system.action_tracker.quick, true);
});

test('hex paths include rows beyond pixel-size division and stay within padded scene bounds', () => {
  const env = hexEnvironment(), t = env.canvas.tokens.placeables[0];
  const p = env.canvas.grid.getCenterPoint({ i: 9, j: 3 });
  t.document.x = Math.round(p.x - 50); t.document.y = Math.round(p.y - 50);
  env.canvas.dimensions.sceneRect = { x: 100, y: 100, width: 1200, height: 900 };
  const board = extractSnapshot(env), reached = reachableCells(board.snapshot, 'npc');
  assert.equal(reached.get('3,10').cost, 1);
  for (const r of reached.values()) {
    const pos = board.positions[`${r.to.x},${r.to.y}`];
    assert(pos.x >= 100 && pos.y >= 100 && pos.x + 100 <= 1300 && pos.y + 100 <= 1000);
  }
});

test('half-size targets retain their real collision centers and only engage equal/smaller movers', () => {
  const env = environment(), mover = env.canvas.tokens.placeables[0], target = env.canvas.tokens.placeables[1], rays = [];
  target.actor.system.size = 0.5; target.document.width = target.document.height = 0.5;
  target.document.x = 250; target.document.y = 100;
  mover.checkCollision = (to, options) => { rays.push({ to, ...options }); return false; };
  let board = extractSnapshot(env);
  assert(!board.snapshot.blockedMoves.includes('1,1>1,2'));
  assert(rays.some(r => r.type === 'sight' && r.to.x === 275 && r.to.y === 125));
  mover.actor.system.size = 0.5;
  board = extractSnapshot(env);
  assert(board.snapshot.blockedMoves.includes('1,1>1,2'));
});
