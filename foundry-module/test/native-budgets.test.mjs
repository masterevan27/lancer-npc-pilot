import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import * as module from 'node:module';
import { normalizeBudget, spend } from '../scripts/core/budgets.mjs';

test('planning projection agrees with installed Lancer action spending without assuming reset omissions', {
  skip: !process.env.PILOT_LANCER_SYSTEM || !module.stripTypeScriptTypes,
}, async () => {
  const map = JSON.parse(await readFile(resolve(process.env.PILOT_LANCER_SYSTEM, 'lancer.mjs.map'), 'utf8'));
  const index = map.sources.findIndex(s => s.endsWith('/apps/action/actor-actions.ts'));
  assert(index >= 0, 'Installed native action source must be present.');
  const source = map.sourcesContent[index].replace(/^import \{ LancerActor \} from "\.\.\/\.\.\/actor\/lancer-actor";\r?\n/m, '');
  const js = module.stripTypeScriptTypes(source);
  const native = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
  const initial = { move: 3, full: true, quick: true, protocol: true, reaction: true,
    free: false, used_reactions: ['fixture'] };
  const actor = { system: { speed: 8, action_tracker: structuredClone(initial) },
    is_mech: () => false, is_npc: () => true,
    async update(changes) { Object.assign(this.system.action_tracker, structuredClone(changes['system.action_tracker'])); } };
  for (const sequence of [['quick', 'quick', 'reaction', 'free'], ['full'], ['move'], ['protocol']]) {
    actor.system.action_tracker = structuredClone(initial);
    let planned = normalizeBudget(initial, { speed: 8 });
    for (const action of sequence) {
      const cost = action === 'move' ? { move: planned.move } : { [action]: 1 };
      planned = spend(planned, cost);
      await native.modAction(actor, true, action);
      assert.deepEqual(planned.nativeTracker, actor.system.action_tracker, sequence.join('→'));
      assert.deepEqual(planned.observedTracker, initial, 'A planning projection is never a new native observation.');
    }
  }
  actor.system.action_tracker.free = true;
  await native.modAction(actor, false);
  assert.equal(actor.system.action_tracker.move, 8);
  assert.equal(actor.system.action_tracker.free, true, 'Native merge preserves omitted free history.');
  assert.deepEqual(actor.system.action_tracker.used_reactions, ['fixture']);
});
