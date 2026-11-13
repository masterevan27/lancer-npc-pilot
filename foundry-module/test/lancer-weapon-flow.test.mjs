// Optional check against licensed installed code; no Lancer source is redistributed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { prepareModeFlow } from '../scripts/adapter/weapon-flow.mjs';

test('reviewed modes retain installed Lancer initialization, tier accuracy and attack HUD handoff', {
  skip: !process.env.PILOT_LANCER_SYSTEM,
}, async () => {
  const root = process.env.PILOT_LANCER_SYSTEM;
  const files = fs.readdirSync(root);
  const actorFile = files.find(n => /^lancer-actor-.*\.mjs$/.test(n));
  const code = fs.readFileSync(path.join(root, actorFile), 'utf8');
  const init = code.slice(code.indexOf('async function initAttackData('), code.indexOf('async function checkWeaponLoaded('));
  assert(init.startsWith('async function initAttackData('));
  const profile = code.slice(code.indexOf('\tcurrentProfile() {'), code.indexOf('\n\t_resetEquipped()', code.indexOf('\tcurrentProfile() {')));
  assert(profile.includes('tier'));
  const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/ram-cannon.json', import.meta.url)));
  for (const mode of ['melee', 'ranged']) {
    const calls = [];
    const context = { ae: { Melee: 'Melee' }, re: { Weapon: 'Weapon', Tech: 'Tech' }, ce: { Range: 'Range' },
      ue: { Melee: 'Melee', Ranged: 'Ranged' },
      game: { user: { targets: new Set(['target']) } },
      at: { fromParams(item, tags, title, targets, grit, bonus, accuracy) {
        calls.push({ title, targets, grit, accuracy });
        return { weapon: { melee: item.currentProfile().type === 'Melee', plugins: {} },
          base: { grit, accuracy }, targets };
      } }, ui: { notifications: { warn: assert.fail, error: assert.fail } } };
    const nativeInit = vm.runInNewContext(`(${init})`, context);
    const nativeProfile = vm.runInNewContext(`({${profile}}).currentProfile`, context);
    const actor = { system: { tier: 1 }, is_npc: () => true };
    const item = { id: 'ram', ...structuredClone(fixture), actor,
      is_mech_weapon: () => false, is_mech_system: () => false, is_pilot_weapon: () => false,
      is_npc_feature: () => true, currentProfile: nativeProfile };
    actor.items = [item];
    class WeaponAttackFlow {
      // Lancer Automations inserts a reviewed choice hook before native init.
      static steps = ['lancer-automations:throwChoice', 'initAttackData', 'showAttackHUD', 'rollAttacks'];
      constructor(item) { this.state = { actor, item, data: {} }; }
      getStep(name) { if (name === 'lancer-automations:throwChoice') return async () => true;
        return name === 'initAttackData' ? nativeInit : async state => {
        assert.equal(state.data.acc_diff.weapon.melee, mode === 'melee'); return true;
      }; }
      async begin() { for (const step of this.constructor.steps) if (await this.getStep(step)(this.state) === false) return false; return true; }
    }
    const game = { system: { version: '3.1.3' }, lancer: { flows: new Map([['WeaponAttackFlow', WeaponAttackFlow]]) } };
    const flow = prepareModeFlow(item, actor, mode, game);
    assert.equal(await flow.begin(), true);
    assert.equal(flow.state.data.attack_type, mode === 'melee' ? 'Melee' : 'Ranged');
    assert.equal(calls[0].accuracy, 1); assert.equal(calls[0].grit, 0);
    assert.deepEqual([...calls[0].targets], ['target']);
  }
});

// Self-contained check (no installed Lancer): prepended Lancer Automations step fixture.
async function modeFlowFixture(mode, { cancel = false } = {}) {
  const { environment } = await import('./adapter.test.mjs');
  const fixture = JSON.parse(fs.readFileSync(new URL('./fixtures/ram-cannon.json', import.meta.url)));
  const env = environment(), token = env.canvas.tokens.placeables[0], actor = token.actor;
  actor.system.tier = 1;
  const item = { id: 'ram', ...structuredClone(fixture), currentProfile() {
    const s = this.system;
    return { type: s.weapon_type.includes('Melee') ? 'Melee' : null,
      range: s.range, damage: s.damage[0], accuracy: s.accuracy[0], attack: s.attack_bonus[0] };
  } };
  actor.items = [item];
  const log = [];
  class WeaponAttackFlow {
    static steps = ['lancer-automations:throwChoice', 'initAttackData', 'showAttackHUD', 'rollAttacks'];
    constructor(i) { this.state = { actor, item: i, data: {} }; }
    getStep(name) {
      return async state => {
        log.push(name);
        if (name === 'initAttackData') state.data.acc_diff = { weapon: {} };
        return !(cancel && name === 'showAttackHUD');
      };
    }
    async begin() {
      for (const step of this.constructor.steps) if (await this.getStep(step)(this.state) === false) return false;
      return true;
    }
  }
  const game = { system: { version: '3.1.3' }, lancer: { flows: new Map([['WeaponAttackFlow', WeaponAttackFlow]]) } };
  return { item, actor, game, Flow: WeaponAttackFlow, log, mode };
}

const surface = Flow => ({
  proto: Object.getOwnPropertyNames(Flow.prototype).map(k => [k, Flow.prototype[k]]),
  steps: [...Flow.steps], own: Object.getOwnPropertyNames(Flow).sort(), registry: Flow.steps,
});

test('per-instance flow wrapping leaves the Flow prototype, steps and registry unchanged', async () => {
  for (const mode of ['melee', 'ranged']) {
    const { item, actor, game, Flow } = await modeFlowFixture(mode);
    const before = surface(Flow), registryBefore = [...game.lancer.flows.entries()];
    const flow = prepareModeFlow(item, actor, mode, game);
    assert.equal(await flow.begin(), true);
    assert.equal(flow.state.data.attack_type, mode === 'melee' ? 'Melee' : 'Ranged');
    assert.deepEqual(surface(Flow), before);
    assert.equal(Flow.steps, before.registry);
    assert.deepEqual([...game.lancer.flows.entries()], registryBefore);
    assert.notEqual(flow.getStep, Flow.prototype.getStep);
    assert.equal(Object.hasOwn(Flow.prototype, 'getStep'), true);
    assert.equal(Object.hasOwn(flow, 'getStep'), true);
  }
});

test('a cancelled begin runs the flow once and is not retried', async () => {
  for (const mode of ['melee', 'ranged']) {
    const { item, actor, game, log } = await modeFlowFixture(mode, { cancel: true });
    const flow = prepareModeFlow(item, actor, mode, game);
    assert.equal(await flow.begin(), false);
    assert.deepEqual(log, ['lancer-automations:throwChoice', 'initAttackData', 'showAttackHUD']);
  }
});
