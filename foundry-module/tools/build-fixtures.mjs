// Regenerates foundry-module/test/fixtures/*.json from the specs below.
// Run from the repository root:  node foundry-module/tools/build-fixtures.mjs
// The specs are hand-written; only `losFrom` is computed (with the simple
// cell raycast in grid-los.mjs) so the fixtures stay consistent with their maps.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cellKey } from '../scripts/core/grid.mjs';
import { reachableCells } from '../scripts/core/reach.mjs';
import { areEnemies } from '../scripts/core/snapshot.mjs';
import { tokenLos } from './grid-los.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'test', 'fixtures');

const rifle = (over = {}) => ({
  itemId: 'w-rifle', name: 'Assault Rifle', type: 'Rifle',
  range: [{ type: 'Range', val: 10 }], damage: '1d6+2 Kinetic',
  accuracy: 0, attackBonus: 1, tags: ['Loading'], loaded: true, uses: null, ...over,
});
const blade = (over = {}) => ({
  itemId: 'w-blade', name: 'Chain Axe', type: 'Melee',
  range: [{ type: 'Threat', val: 1 }], damage: '2d6+2 Kinetic',
  accuracy: 1, attackBonus: 1, tags: [], loaded: true, uses: null, ...over,
});

const pc = (id, name, pos, over = {}) => ({
  id, actorId: `a-${id}`, name, side: 'friendly', isNpc: false, pos, size: 1,
  hp: [12, 12], heat: [0, 6], structure: [4, 4], stress: [4, 4],
  armor: 0, evasion: 8, edef: 8, speed: 4, sensors: 10, statuses: [],
  weapons: [rifle({ itemId: `${id}-rifle` })], features: [], ...over,
});

const specs = {
  'open-map': {
    round: 2, activeTokenId: 'npc1',
    grid: { type: 'square', size: 100, distance: 1, diagonals: 'equidistant', width: 20, height: 20 },
    tokens: [
      {
        id: 'npc1', actorId: 'a-npc1', name: 'Assault Mk II', side: 'hostile', isNpc: true,
        pos: { x: 5, y: 10 }, size: 1, hp: [10, 10], heat: [0, 8], structure: [1, 1], stress: [1, 1],
        armor: 1, evasion: 8, edef: 8, speed: 4, sensors: 10, statuses: [],
        weapons: [rifle(), blade({ itemId: 'w-knife', name: 'Combat Knife', damage: '1d3+1 Kinetic', accuracy: 0 })],
        features: [{ itemId: 'f1', name: 'Hunker Down', kind: 'trait', text: '...' }],
        persona: 'Disciplined line infantry. Keeps range, uses cover.',
      },
      pc('pc1', 'Lancaster "Mule"', { x: 14, y: 10 }, { hp: [7, 12] }),
      pc('pc2', 'Everest "Kite"', { x: 15, y: 4 }, { armor: 1 }),
    ],
    blocked: [],
    cover: { '6,8': 'hard', '7,11': 'soft' },
  },

  'walled-corridor': {
    round: 1, activeTokenId: 'npc1',
    grid: { type: 'square', size: 100, distance: 1, width: 16, height: 9 },
    tokens: [
      {
        id: 'npc1', name: 'Sentinel', side: 'hostile', isNpc: true, pos: { x: 1, y: 4 }, size: 1,
        hp: [12, 12], heat: [0, 6], structure: [1, 1], armor: 1, evasion: 7, edef: 8, speed: 5,
        statuses: [], weapons: [rifle({ range: [{ type: 'Range', val: 8 }] })],
      },
      { ...pc('pc1', 'Blackbeard "Rook"', { x: 11, y: 4 }), weapons: [blade({ itemId: 'pc1-blade' })] },
      { id: 'npc2', name: 'Grunt', side: 'hostile', isNpc: true, pos: { x: 3, y: 4 }, size: 1, hp: [1, 1], armor: 0, evasion: 10, edef: 10, speed: 4, weapons: [] },
    ],
    // Corridor along row 4 with a gap at the far end of the upper wall.
    blocked: [
      ...[...Array(16).keys()].filter((x) => x !== 9).map((x) => `${x},3`),
      ...[...Array(16).keys()].map((x) => `${x},5`),
    ],
    // A force field: it stops movement from 6,4 into 7,4 but not sight.
    blockedMoves: ['6,4>7,4', '7,4>6,4'],
    difficult: ['5,4'],
    // Leave one reachable cell's LOS unknown on purpose.
    losOmit: ['4,4'],
  },

  'melee-duel': {
    round: 3, activeTokenId: 'npc1',
    grid: { type: 'square', size: 100, distance: 1, width: 14, height: 10 },
    tokens: [
      {
        id: 'npc1', name: 'Berserker', side: 'hostile', isNpc: true, pos: { x: 2, y: 5 }, size: 1,
        hp: [14, 14], heat: [2, 6], structure: [1, 1], armor: 1, evasion: 8, edef: 6, speed: 5,
        statuses: [], weapons: [blade({ tags: ['Heat 1 (Self)', 'Overkill'] })],
        persona: 'Berserker: always closes to melee.',
      },
      { id: 'npc2', name: 'Shieldbearer', side: 'hostile', isNpc: true, pos: { x: 4, y: 5 }, size: 1, hp: [10, 10], armor: 2, evasion: 6, edef: 8, speed: 3, weapons: [] },
      pc('pc1', 'Sagarmatha "Ace"', { x: 9, y: 5 }, { hp: [5, 12], armor: 1, evasion: 10, statuses: ['Prone'], weapons: [rifle({ itemId: 'pc1-sniper', name: 'Anti-Materiel Rifle', range: [{ type: 'Range', val: 15 }], damage: '2d6 Kinetic', tags: ['AP'] })] }),
      // A big size-2 wall of a mech to path around.
      pc('pc2', 'Atlas "Tank"', { x: 5, y: 3 }, { size: 2, hp: [20, 20], armor: 2, speed: 3, weapons: [blade({ itemId: 'pc2-fist', name: 'Fist' })] }),
    ],
    blocked: ['6,6', '6,7'],
  },

  'hex-map': {
    round: 4, activeTokenId: 'npc1',
    grid: { type: 'hex', size: 100, distance: 1, hexLayout: 'odd-q', width: 15, height: 12 },
    tokens: [
      {
        id: 'npc1', name: 'Hornet Skirmisher', side: 'hostile', isNpc: true, pos: { x: 3, y: 5 }, size: 1,
        hp: [6, 8], heat: [3, 6], structure: [1, 1], armor: 0, evasion: 10, edef: 8, speed: 6,
        statuses: ['Impaired'],
        weapons: [
          { itemId: 'w-smg', name: 'Spike Thrower', type: 'CQB', range: [{ type: 'Range', val: 5 }, { type: 'Threat', val: 2 }], damage: [{ type: 'Kinetic', val: '1d3+1' }, { type: 'Burn', val: '1' }], accuracy: 0, attackBonus: 2, tags: [{ id: 'tg_reliable', val: 1 }], loaded: true, uses: null },
          { itemId: 'w-missile', name: 'Hunter Missile', type: 'Launcher', range: [{ type: 'Range', val: 8 }], damage: '1d6+1 Explosive', accuracy: 1, attackBonus: 2, tags: ['Limited 2', 'Seeking'], loaded: true, uses: [1, 2] },
          { itemId: 'w-spent', name: 'Spent Rocket', type: 'Launcher', range: [{ type: 'Range', val: 10 }], damage: '2d6 Explosive', accuracy: 0, tags: ['Loading'], loaded: false, uses: null },
        ],
      },
      pc('pc1', 'Genghis "Pyre"', { x: 8, y: 5 }, { hp: [9, 12], armor: 1, evasion: 7, statuses: ['Lock On'], resistances: ['Explosive'], weapons: [{ itemId: 'pc1-flamer', name: 'Flamethrower', type: 'Cannon', range: [{ type: 'Threat', val: 3 }], damage: '1d6 Burn', tags: [] }] }),
      pc('pc2', 'Raleigh "Doc"', { x: 6, y: 10 }),
      { id: 'n1', name: 'Civilian Hauler', side: 'neutral', isNpc: true, pos: { x: 5, y: 5 }, size: 1, hp: [5, 5], armor: 0, evasion: 5, edef: 5, speed: 3, weapons: [] },
    ],
    blocked: ['6,4', '6,5', '6,6', '4,8', '5,8'],
    cover: { '5,4': 'hard' },
  },
};

for (const [name, spec] of Object.entries(specs)) {
  const { losOmit = [], ...snap } = spec;
  const me = snap.tokens.find((t) => t.id === snap.activeTokenId);
  const blocked = new Set(snap.blocked ?? []);
  const losFrom = {};
  for (const r of reachableCells(snap, me.id, { maxCost: me.speed }).values()) {
    const k = cellKey(r.to);
    if (losOmit.includes(k)) continue;
    const row = {};
    for (const t of snap.tokens) {
      if (t.id === me.id || !areEnemies(me, t)) continue;
      row[t.id] = tokenLos(snap.grid, blocked, r.to, me.size, t);
    }
    losFrom[k] = row;
  }
  snap.losFrom = losFrom;
  writeFileSync(join(OUT, `${name}.json`), `${JSON.stringify(snap, null, 1)}\n`);
  console.log(`wrote ${name}.json (${Object.keys(losFrom).length} LOS cells)`);
}
