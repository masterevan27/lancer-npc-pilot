import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenFootprint, tokenDistance } from '../scripts/core/grid.mjs';
import { reachableCells } from '../scripts/core/reach.mjs';
import { validateSnapshot } from '../scripts/core/snapshot.mjs';
import { buildPrompt } from '../scripts/core/prompt.mjs';

const token = (id, pos, side = 'hostile') => ({ id, name: id, pos, side, size: 2,
  hp: [10, 10], armor: 0, evasion: 8, edef: 8, speed: 2, weapons: [] });
const square = { type: 'square', width: 8, height: 8 };
const cells = (x, y) => [{ x, y }, { x: x + 1, y }, { x, y: y + 1 }, { x: x + 1, y: y + 1 }];
const board = () => {
  const mover = token('npc', { x: 1, y: 1 }); mover.occupiedCells = {};
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) mover.occupiedCells[`${x},${y}`] = cells(x, y);
  return { activeTokenId: mover.id, grid: square, tokens: [mover], blocked: [], difficult: [] };
};

test('native occupied cells govern obstruction, difficult terrain, allies and map edges', () => {
  const b = board(), mover = b.tokens[0];
  assert.deepEqual(tokenFootprint(square, mover), cells(1, 1));
  b.blocked = ['3,2'];
  assert(!reachableCells(b, 'npc').has('2,1'), 'The blocked trailing body cell must prevent entry.');
  b.blocked = []; b.difficult = ['3,2'];
  assert.equal(reachableCells(b, 'npc').get('2,1').cost, 2);
  assert(!reachableCells(b, 'npc', { maxCost: 8 }).has('7,1'));
  const ally = token('ally', { x: 3, y: 1 }); ally.occupiedCells = { '3,1': cells(3, 1) };
  b.difficult = []; b.tokens.push(ally);
  assert(!reachableCells(b, 'npc', { maxCost: 5 }).has('2,1'), 'Cannot end overlapping an ally.');
  assert(reachableCells(b, 'npc', { maxCost: 5 }).has('5,1'), 'Can pass through allied occupied cells.');
  ally.side = 'friendly';
  assert(!reachableCells(b, 'npc', { maxCost: 3 }).has('5,1'));
});

test('hex parity uses actual per-anchor cells for range and directed body-cell walls', () => {
  const grid = { type: 'hex', hexLayout: 'odd-r', width: 8, height: 8 };
  const mover = token('npc', { x: 2, y: 2 });
  mover.occupiedCells = { '2,2': [{ x: 2, y: 2 }, { x: 2, y: 3 }],
    '2,3': [{ x: 2, y: 3 }, { x: 3, y: 4 }] };
  const target = token('pc', { x: 4, y: 4 }, 'friendly');
  target.occupiedCells = { '4,4': [{ x: 4, y: 4 }, { x: 4, y: 5 }] };
  assert.equal(tokenDistance(grid, mover, target, { x: 2, y: 3 }), 1);
  const b = { grid, activeTokenId: 'npc', tokens: [mover, target], blockedMoves: ['2,3>3,4'] };
  assert(!reachableCells(b, 'npc').has('2,3'), 'Parity-shifted trailing body crosses this directed wall.');
  b.blockedMoves = ['3,4>2,3'];
  assert(reachableCells(b, 'npc').has('2,3'), 'Reverse-only wall must not block the forward move.');
  assert(!reachableCells(b, 'npc').has('3,2'), 'A missing hypothetical footprint never falls back to one cell.');
});

test('large hex snapshots require exact native cell maps and reject malformed occupancy', () => {
  const b = board(); b.grid = { ...square, type: 'hex', hexLayout: 'odd-r' };
  assert.equal(validateSnapshot(b).ok, true);
  const mover = b.tokens[0]; delete mover.occupiedCells;
  assert.equal(validateSnapshot(b).ok, false);
  mover.occupiedCells = { '1,1': [] };
  assert.equal(validateSnapshot(b).ok, false);
  mover.occupiedCells = { '1,1': [{ x: 1, y: 1 }, { x: 1, y: 1 }] };
  assert.equal(validateSnapshot(b).ok, false);
  mover.occupiedCells = { '1,1': [{ x: 1, y: 1 }], '2,1': new Array(2) };
  assert.equal(validateSnapshot(b).ok, false);
});

test('native anchor-only blockers and inconsistent action budgets are validated separately', () => {
  const b = board(); b.blockedAnchorMoves = ['not-a-step'];
  assert.equal(validateSnapshot(b).ok, false);
  b.blockedAnchorMoves = []; b.actionBudget = { move: 100, quick: 2 };
  assert.equal(validateSnapshot(b).ok, false);
});

test('model facts use exact occupied-cell range rather than the large token anchor', () => {
  const grid = { type: 'hex', hexLayout: 'odd-r' };
  const mover = token('npc', { x: 2, y: 2 });
  mover.occupiedCells = { '2,2': [{ x: 2, y: 2 }, { x: 2, y: 3 }] };
  const target = token('pc', { x: 3, y: 3 }, 'friendly');
  target.occupiedCells = { '3,3': [{ x: 3, y: 3 }, { x: 4, y: 4 }] };
  const prompt = buildPrompt({ grid, activeTokenId: 'npc', tokens: [mover, target] }, []);
  assert.match(prompt.messages[0].content, /pc, at \(3,3\), 1 away/);
});
