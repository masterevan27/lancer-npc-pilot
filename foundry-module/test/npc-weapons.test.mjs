import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { environment } from './adapter.test.mjs';
import { readToken, extractSnapshot } from '../scripts/adapter/snapshot.mjs';
import { generateCandidates } from '../scripts/core/options.mjs';
import { renderReview } from '../scripts/adapter/review.mjs';

const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/ram-cannon.json', import.meta.url)));
function equip(env, tier = 1) {
  const token = env.canvas.tokens.placeables[0];
  token.actor.system.tier = tier;
  const item = { id: 'ram', ...structuredClone(fixture), currentProfile() {
    const s = this.system, index = token.actor.system.tier - 1;
    return { type: s.weapon_type.includes('Melee') ? 'Melee' : null,
      range: s.range, damage: s.damage[index], accuracy: s.accuracy[index], attack: s.attack_bonus[index] };
  } };
  token.actor.items = [item];
  return { token, item };
}

test('installed T1 Ram Cannon becomes distinct melee and ranged choices without mutating the item', () => {
  const env = environment(), { token, item } = equip(env);
  const before = JSON.stringify(item.system);
  const weapons = readToken(token, env.canvas.grid).weapons;
  assert.deepEqual(weapons.map(w => [w.mode, w.type, w.range]), [
    ['melee', 'Melee', [{ type: 'Threat', val: 2 }]],
    ['ranged', 'Cannon', [{ type: 'Range', val: 5 }]],
  ]);
  assert.equal(JSON.stringify(item.system), before);
  const attacks = generateCandidates(extractSnapshot(env).snapshot).filter(o => o.action.kind === 'attack');
  assert.deepEqual(new Set(attacks.map(o => o.action.mode)), new Set(['melee', 'ranged']));
  assert.equal(new Set(attacks.map(o => o.key)).size, attacks.length);
  for (const o of attacks) assert(o.facts.distanceToTarget <= (o.action.mode === 'melee' ? 2 : 5));
});

test('Ram Cannon modes respect range and LOS', () => {
  const env = environment(), { token } = equip(env);
  token.actor.system.speed = 0; token.actor.system.action_tracker.move = 0;
  const attacks = () => generateCandidates(extractSnapshot(env).snapshot).filter(o => o.action.kind === 'attack');
  assert.deepEqual(attacks().map(o => o.action.mode), ['ranged']); // target three spaces away
  env.canvas.tokens.placeables[1].document.x = 700;
  assert.equal(attacks().length, 0);
  env.canvas.tokens.placeables[1].document.x = 200;
  token.checkCollision = () => true;
  assert.equal(attacks().length, 0);
});

test('higher tiers, tier overrides and modified Ram Cannon mechanics stay manual with a reason', () => {
  for (const change of [(_i, t) => { t.actor.system.tier = 2; },
    (_i, t) => { t.actor.system.tier = 3; },
    i => { i.system.tier_override = 2; },
    i => { i.system.effect += ' Also push the target.'; },
    i => { i.system.effect = ''; },
    i => { i.system.effect = ''; i.system.lid = 'custom_dual_weapon'; },
    i => { i.system.on_hit = 'Push.'; },
    i => { i.system.range[0].val = 10; },
    i => { i.system.damage[0][0].val = '9'; },
    i => { i.system.weapon_type = 'Superheavy Melee'; }]) {
    const env = environment(), { token, item } = equip(env); change(item, token);
    const result = readToken(token, env.canvas.grid);
    assert.equal(result.weapons.length, 0);
    assert.equal(result.excludedWeapons[0].itemId, 'ram');
    assert(result.excludedWeapons[0].reason.length > 0);
  }
});

test('every refused ordinary weapon has a reason and no usable weapons appears in review', () => {
  const env = environment(), token = env.canvas.tokens.placeables[0];
  token.actor.items[0].system.effect = 'Unknown script';
  const board = extractSnapshot(env);
  assert.match(board.warnings.join('\n'), /Rifle.*effect/i);
  assert.match(board.warnings.join('\n'), /no usable supported weapons/i);
  const html = renderReview({ ...board, options: [], choice: { source: 'model', reason: '' } }, false);
  assert.match(html, /Rifle/); assert.match(html, /no usable supported weapons/i);
});

test('destroyed, disabled, unloaded, spent and uncharged weapons are diagnosed', () => {
  for (const change of [i => { i.system.destroyed = true; }, i => { i.system.disabled = true; },
    i => { i.system.loaded = false; }, i => { i.system.uses.value = 0; },
    i => { i.system.tags.push({ lid: 'tg_recharge' }); i.system.charged = false; }]) {
    const env = environment(), token = env.canvas.tokens.placeables[0]; change(token.actor.items[0]);
    const result = readToken(token, env.canvas.grid);
    assert.equal(result.weapons.length, 0);
    assert.match(result.excludedWeapons[0].reason, /destroyed|disabled|unloaded|spent|charged/i);
  }
});

test('ordinary supported NPC weapons remain available and unsupported tags stay refused', () => {
  const env = environment(), token = env.canvas.tokens.placeables[0];
  assert.equal(readToken(token, env.canvas.grid).weapons.length, 1);
  for (const tag of ['tg_smart', 'tg_arcing', 'tg_knockback', 'tg_unknown']) {
    token.actor.items[0].system.tags = [{ lid: tag }];
    const result = readToken(token, env.canvas.grid);
    assert.equal(result.weapons.length, 0);
    assert.match(result.excludedWeapons[0].reason, /tag/i);
  }
});
