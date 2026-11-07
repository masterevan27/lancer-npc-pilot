import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSnapshot, readToken } from '../scripts/adapter/snapshot.mjs';
import { executeOption } from '../scripts/adapter/executor.mjs';

import { environment } from './helpers/adapter-env.mjs';
export { environment };

test('review warnings account for active and target nonweapon features without granting support', () => {
  const env = environment();
  for (const [index, kind] of ['Trait', 'Reaction', 'Tech', 'System', 'Unknown'].entries()) {
    env.canvas.tokens.placeables[index % 2].actor.items.push({ id: `f${index}`,
      name: `Feature ${index}`, type: 'npc_feature', system: { type: kind } });
  }
  const result = extractSnapshot(env);
  for (let i = 0; i < 5; i++) assert(result.warnings.some(w => w.includes(`Feature ${i}`) && w.includes('manual')));
  assert(result.warnings.some(w => w.includes('passive') && w.includes('Chunk 6')));
  assert(result.warnings.some(w => w.includes('Chunk 7')));
  assert(result.warnings.some(w => w.includes('Chunk 5')));
  assert.equal(result.snapshot.tokens[0].weapons.length, 1);
});

test('target traits retain native stats and disclose unresolved exact-source review with provisional gates', () => {
  const env = environment(), target = env.canvas.tokens.placeables[1];
  target.actor.items.push({ id: 'trait', name: 'Target Rule', type: 'npc_feature',
    system: { lid: 'npcf_example', type: 'Trait', effect: 'Custom edited rule text' } });
  const result = extractSnapshot(env);
  const warning = result.warnings.find(w => w.includes('Target Rule'));
  assert(warning.includes('Chunk 1') && warning.includes('unresolved'));
  assert(warning.includes('Chunk 6') && warning.includes('Provisional'));
  assert(warning.includes('native-derived stats'));
  assert.equal(result.snapshot.tokens[1].evasion, target.actor.system.evasion);
  assert.equal(result.snapshot.tokens[0].weapons.length, 1);
});

test('active token movement bookkeeping does not stale execution but other flags do', () => {
  const env = environment(), token = env.canvas.tokens.placeables[0];
  const flags = { 'lancer-automations': { moveHistory: [1] }, 'about-face': { prevPos: { x: 100, y: 100 } } };
  const original = token.document.toObject.bind(token.document);
  let scaleX = 1;
  token.document.toObject = () => ({ ...original(), flags: structuredClone(flags), texture: { scaleX, scaleY: 1 } });
  const before = extractSnapshot(env);
  flags['lancer-automations'].moveHistory.push(2); flags['about-face'].prevPos.x = 200;
  flags['about-face'].direction = 60;
  scaleX = -1;
  assert.equal(extractSnapshot(env).guard, before.guard);
  assert.notEqual(extractSnapshot(env).stamp, before.stamp);
  scaleX = 2;
  assert.notEqual(extractSnapshot(env).guard, before.guard);
  scaleX = 1;
  flags['lancer-automations'].unrelated = true;
  assert.notEqual(extractSnapshot(env).guard, before.guard);
});

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

for (const { name, change, issue, remedy } of [
  { name: 'loading canvas', change: e => { e.canvas.ready = false; }, issue: /scene.*not ready/i, remedy: /wait.*load/i },
  { name: 'no viewed scene', change: e => { e.canvas.scene = null; }, issue: /scene.*not ready/i, remedy: /open.*scene/i },
  { name: 'no encounter', change: e => { e.game.combat = null; }, issue: /no.*combat encounter/i, remedy: /Create Encounter/ },
  { name: 'unstarted encounter', change: e => { e.game.combat.started = false; }, issue: /combat.*not started/i, remedy: /Begin Combat/ },
  { name: 'unlinked encounter', change: e => { e.game.combat.scene = null; }, issue: /encounter.*not linked/i, remedy: /Link to Viewed Scene/ },
  { name: 'different scene', change: e => { e.game.combat.scene = { id: 'other' }; }, issue: /different scene/i, remedy: /open.*linked scene/i },
]) {
  test(`planning explains ${name} without reading tokens or changing combat`, () => {
    const env = environment(); change(env);
    const before = JSON.stringify(env.game.combat);
    env.canvas.tokens.get = () => { throw Error('Token lookup must not happen before preconditions pass'); };
    assert.throws(() => extractSnapshot(env), error => {
      assert.match(error.message, issue);
      assert.match(error.message, remedy);
      return true;
    });
    assert.equal(JSON.stringify(env.game.combat), before);
  });
}

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
  assert(snapshot.engagementMoves.includes('3,1>3,2'));
  assert(!snapshot.engagementMoves.includes('2,1>3,1'));
});

test('real adapter guard permits its own reservation and v13 movement history but detects other changes', async () => {
  const env = environment(); const active = env.canvas.tokens.placeables[0];
  env.game.user.id = 'gm'; env.game.users = { activeGM: { id: 'gm' } };
  env.canvas.tokens.setTargets = async () => {};
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
