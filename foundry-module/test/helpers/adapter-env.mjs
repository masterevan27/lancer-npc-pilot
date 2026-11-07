export function environment() {
  const system = { tier: 2, hp: { value: 10, max: 12 }, heat: { value: 0, max: 6 },
    structure: { value: 1, max: 1 }, stress: { value: 1, max: 1 }, armor: 1,
    evasion: 8, edef: 8, speed: 2, sensor_range: 10, size: 1,
    action_tracker: { move: 2, full: true, quick: true, protocol: true, reaction: true, free: false, used_reactions: [] } };
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
  const canvas = { ready: true, scene, grid, walls: { placeables: [] }, dimensions: { width: 800, height: 600,
    sceneRect: { x: 0, y: 0, width: 800, height: 600 } }, tokens: { placeables: tokens, get: id => tokens.find(t => t.id === id) } };
  return { game, canvas, constants: { GRID_TYPES: { SQUARE: 1 }, GRID_DIAGONALS: { EQUIDISTANT: 1 } } };
}
