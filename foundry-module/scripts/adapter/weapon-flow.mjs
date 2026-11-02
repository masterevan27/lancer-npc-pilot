import { readNpcWeapons, reviewedRamCannon } from './weapons.mjs';

/** Prepare without changing documents, targets, budgets or the shared registry.
 * Verified against installed Lancer 3.1.3 Flow/WeaponAttackFlow source.
 * The normal init runs first, retaining system accuracy, plugins and targets.
 */
export function prepareModeFlow(item, actor, mode, game) {
  const Flow = game.lancer?.flows?.get('WeaponAttackFlow');
  if (!['melee', 'ranged'].includes(mode) || game.system?.version !== '3.1.3'
    || !reviewedRamCannon(item, actor.system.tier)
    || !readNpcWeapons(actor).weapons.some(w => w.itemId === item.id && w.mode === mode)
    || typeof Flow !== 'function' || typeof Flow.prototype.getStep !== 'function'
    || typeof Flow.prototype.begin !== 'function' || Flow.steps?.[0] !== 'initAttackData'
    || !Flow.steps.includes('showAttackHUD') || !Flow.steps.includes('rollAttacks'))
    throw Error('This weapon mode needs reviewed Lancer 3.1.3 flow support. Continue manually.');
  const flow = new Flow(item);
  const getStep = flow.getStep.bind(flow);
  if (typeof getStep('initAttackData') !== 'function') throw Error('Lancer attack initialization is unavailable.');
  flow.getStep = name => {
    const step = getStep(name);
    if (name !== 'initAttackData') return step;
    return async (state, args) => {
      const result = await step(state, args);
      if (result === false) return false;
      if (!state.data?.acc_diff?.weapon) throw Error('Lancer mode initialization failed. Continue manually.');
      state.data.attack_type = mode === 'melee' ? 'Melee' : 'Ranged';
      state.data.acc_diff.weapon.melee = mode === 'melee';
      return result;
    };
  };
  return flow;
}
