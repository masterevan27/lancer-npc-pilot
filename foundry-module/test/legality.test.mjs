// Property-style legality check: every option the generator returns must be
// legal under an independent re-check, on the fixtures and on many random maps.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cellKey, footprint, footprintDistance, neighbors, inBounds } from '../scripts/core/grid.mjs';
import { generateCandidates, generateOptions } from '../scripts/core/options.mjs';
import { areEnemies, hasStatus, isDefeated, rangeVal } from '../scripts/core/snapshot.mjs';
import { tokenLos } from '../tools/grid-los.mjs';
import { FIXTURES, loadFixture, rng } from './helpers/fixtures.mjs';

function assertLegal(snap, opt, label) {
  const grid = snap.grid;
  const me = snap.tokens.find((t) => t.id === snap.activeTokenId);
  const others = snap.tokens.filter((t) => t.id !== me.id && !isDefeated(t));
  const blocked = new Set(snap.blocked ?? []);
  const walls = new Set(snap.blockedMoves ?? []);
  const difficult = new Set(snap.difficult ?? []);
  const blockers = new Set();
  const occupied = new Set();
  for (const t of others) {
    for (const c of footprint(grid, t.pos, t.size)) {
      occupied.add(cellKey(c));
      if (areEnemies(me, t) || t.side === 'neutral' || me.side === 'neutral') blockers.add(cellKey(c));
    }
  }
  const where = `${label} option ${opt.id} ${JSON.stringify(opt.action)} ${JSON.stringify(opt.move?.to)}`;
  let end = me.pos;
  if (opt.move) {
    const { path, cost, to } = opt.move;
    assert.ok(hasStatus(me, 'IMMOBILIZED') === false, `${where}: immobilized token moved`);
    assert.deepEqual(path[0], me.pos, `${where}: path must start at the token`);
    assert.deepEqual(path[path.length - 1], to, `${where}: path must end at move.to`);
    let spent = 0;
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      assert.ok(neighbors(grid, a).some((n) => n.x === b.x && n.y === b.y), `${where}: step ${cellKey(a)}->${cellKey(b)} not adjacent`);
      let stepCost = 1;
      for (const f of footprint(grid, b, me.size)) {
        const k = cellKey(f);
        assert.ok(inBounds(grid, f), `${where}: off map at ${k}`);
        assert.ok(!blocked.has(k), `${where}: path enters blocked ${k}`);
        assert.ok(!blockers.has(k), `${where}: path enters enemy/neutral-occupied ${k}`);
        if (difficult.has(k)) stepCost = 2;
      }
      for (const f of footprint(grid, a, me.size)) {
        const t = { x: f.x + b.x - a.x, y: f.y + b.y - a.y };
        assert.ok(!walls.has(`${cellKey(f)}>${cellKey(t)}`), `${where}: crosses a wall`);
      }
      spent += stepCost;
    }
    assert.equal(spent, cost, `${where}: reported cost ${cost} but path costs ${spent}`);
    const budget = ['boost', 'retreat'].includes(opt.action.kind) && !hasStatus(me, 'SLOWED') ? me.speed * 2 : me.speed;
    assert.ok(cost <= budget, `${where}: cost ${cost} > budget ${budget}`);
    for (const f of footprint(grid, to, me.size)) {
      assert.ok(!occupied.has(cellKey(f)), `${where}: ends on an occupied cell ${cellKey(f)}`);
    }
    end = to;
  }
  if (opt.action.kind === 'attack') {
    const wpn = me.weapons.find((w) => w.itemId === opt.action.itemId);
    assert.ok(wpn, `${where}: unknown weapon`);
    assert.notEqual(wpn.loaded, false, `${where}: weapon not loaded`);
    if (Array.isArray(wpn.uses)) assert.ok(wpn.uses[0] > 0);
    else if (typeof wpn.uses === 'number') assert.ok(wpn.uses > 0);
    const [tid] = opt.action.targetTokenIds;
    const tgt = snap.tokens.find((t) => t.id === tid);
    assert.ok(tgt && areEnemies(me, tgt) && !isDefeated(tgt), `${where}: bad target`);
    const reach = Math.max(rangeVal(wpn, ['range']), rangeVal(wpn, ['threat']));
    const d = footprintDistance(grid, end, me.size, tgt.pos, tgt.size);
    assert.ok(d <= reach, `${where}: target ${d} away, reach ${reach}`);
    const los = snap.losFrom?.[cellKey(end)]?.[tid];
    assert.ok(los === true || (typeof los === 'object' && los?.visible === true), `${where}: LOS not known-visible`);
    assert.ok(opt.move === null || opt.move.cost <= me.speed, `${where}: attack after Boost-length move`);
  }
  if (opt.action.kind === 'hide') {
    const row = snap.losFrom?.[cellKey(end)] ?? {};
    for (const e of others.filter((t) => areEnemies(me, t))) {
      const v = row[e.id];
      assert.ok(v === false || (typeof v === 'object' && v?.visible === false), `${where}: hide cell visible to ${e.id}`);
    }
  }
}

for (const name of FIXTURES) {
  test(`legality: every candidate in ${name} is legal`, () => {
    const snap = loadFixture(name);
    const cands = generateCandidates(snap).map((c, i) => ({ id: `#${i}`, ...c }));
    assert.ok(cands.length > 0);
    for (const c of cands) assertLegal(snap, c, name);
  });
}

/** Random snapshot: square or hex, random walls, tokens, partly unknown LOS. */
function randomSnapshot(seed) {
  const r = rng(seed);
  const int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  const hex = r() < 0.5;
  const grid = hex
    ? { type: 'hex', hexLayout: ['odd-r', 'even-r', 'odd-q', 'even-q'][int(0, 3)], width: 14, height: 14 }
    : { type: 'square', diagonals: r() < 0.8 ? 'equidistant' : 'rectilinear', width: 14, height: 14 };
  const taken = new Set();
  const free = () => {
    for (;;) {
      const c = { x: int(0, 13), y: int(0, 13) };
      if (!taken.has(cellKey(c))) { taken.add(cellKey(c)); return c; }
    }
  };
  const mkWeapon = (i) => {
    const melee = r() < 0.3;
    return {
      itemId: `w${i}`, name: `W${i}`, type: melee ? 'Melee' : 'Rifle',
      range: melee ? [{ type: 'Threat', val: int(1, 2) }] : [{ type: 'Range', val: int(3, 10) }],
      damage: `${int(1, 2)}d6+${int(0, 3)} Kinetic`, accuracy: int(-1, 1),
      tags: r() < 0.3 ? ['Heat 1 (Self)'] : [], loaded: r() < 0.85, uses: r() < 0.2 ? [int(0, 1), 2] : null,
    };
  };
  const tokens = [];
  const nTokens = int(2, 6);
  for (let i = 0; i < nTokens; i++) {
    const big = !hex && r() < 0.2;
    tokens.push({
      id: `t${i}`, name: `T${i}`, side: i === 0 ? 'hostile' : ['hostile', 'friendly', 'friendly', 'neutral'][int(0, 3)],
      pos: free(), size: big ? 2 : 1, hp: [int(1, 12), 12], heat: [int(0, 5), 6], structure: [1, 1],
      armor: int(0, 2), evasion: int(6, 12), edef: int(6, 12), speed: int(2, 6),
      statuses: r() < 0.15 ? [['SLOWED', 'IMMOBILIZED', 'IMPAIRED', 'PRONE'][int(0, 3)]] : [],
      weapons: [mkWeapon(1), mkWeapon(2)],
    });
  }
  if (!tokens.some((t) => t.side === 'friendly')) tokens[1].side = 'friendly';
  // Big tokens claim their whole footprint.
  for (const t of tokens) for (const c of footprint(grid, t.pos, t.size)) taken.add(cellKey(c));
  const blocked = [];
  const nBlocked = int(0, 40);
  for (let i = 0; i < nBlocked; i++) {
    const c = { x: int(0, 13), y: int(0, 13) };
    if (!taken.has(cellKey(c))) blocked.push(cellKey(c));
  }
  const difficult = [];
  for (let i = 0; i < int(0, 10); i++) difficult.push(`${int(0, 13)},${int(0, 13)}`);
  const blockedMoves = [];
  for (let i = 0; i < int(0, 10); i++) {
    const a = { x: int(0, 13), y: int(0, 13) };
    const ns = neighbors(grid, a);
    const b = ns[int(0, ns.length - 1)];
    blockedMoves.push(`${cellKey(a)}>${cellKey(b)}`);
  }
  const snap = { round: 1, activeTokenId: 't0', grid, tokens, blocked, difficult, blockedMoves };
  // LOS for every cell within the mover's speed (true / false / unknown).
  const me = tokens[0];
  const bset = new Set(blocked);
  const losFrom = {};
  for (let x = 0; x < 14; x++) {
    for (let y = 0; y < 14; y++) {
      if (r() < 0.15) continue; // unknown
      const row = {};
      for (const t of tokens) {
        if (t.id === me.id || r() < 0.1) continue;
        row[t.id] = tokenLos(grid, bset, { x, y }, me.size, t);
      }
      losFrom[`${x},${y}`] = row;
    }
  }
  snap.losFrom = losFrom;
  return snap;
}

test('legality property: 300 random maps (square and hex), every candidate legal', () => {
  let checked = 0;
  let attacks = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const snap = randomSnapshot(seed);
    const cands = generateCandidates(snap).map((c, i) => ({ id: `#${i}`, ...c }));
    for (const c of cands) {
      assertLegal(snap, c, `seed ${seed}`);
      checked++;
      if (c.action.kind === 'attack') attacks++;
    }
    // The ranked subset is drawn from the candidates.
    const top = generateOptions(snap);
    for (const o of top) assert.ok(cands.some((c) => c.key === o.key));
  }
  assert.ok(checked > 1000, `only ${checked} options checked`);
  assert.ok(attacks > 100, `only ${attacks} attacks checked`);
});
