// Read-only Foundry hook wiring around OutcomeTracker. Never writes to any document.
import { OutcomeTracker } from '../core/outcome.mjs';

const TERMINAL = new Set(['missed', 'applied', 'ambiguous']);
const touches = (changes) => {
  const s = changes?.system;
  if (s && (s.hp !== undefined || s.structure !== undefined)) return true;
  return !!changes && ('system.hp' in changes || 'system.hp.value' in changes
    || 'system.structure' in changes || 'system.structure.value' in changes);
};
const snap = (actor) => ({ hp: actor?.system?.hp?.value ?? 0, structure: actor?.system?.structure?.value ?? 0 });

export function observeOutcome({ Hooks, canvas, expect }) {
  const tracker = new OutcomeTracker(expect);
  const wanted = new Set(expect.targetTokenUuids ?? []);
  const before = new Map(); // actor -> {hp, structure}
  const registered = [];
  let resolveDone; let finished = false;
  const done = new Promise((r) => { resolveDone = r; });

  const check = () => {
    const o = tracker.outcome;
    if (!finished && TERMINAL.has(o.status)) { finished = true; resolveDone(o); }
  };
  // Linked tokens share the world actor; unlinked tokens own a synthetic actor,
  // so compare the token's own actor reference first, then actor.token.uuid.
  const tokenUuidFor = (actor) => {
    for (const tok of canvas?.scene?.tokens ?? []) {
      if (wanted.has(tok.uuid) && (tok.actor === actor)) return tok.uuid;
    }
    const u = actor?.token?.uuid;
    return u && wanted.has(u) ? u : null;
  };
  const on = (name, fn) => { registered.push([name, Hooks.on(name, fn)]); };

  on('createChatMessage', (message) => {
    const flags = message?.getFlag?.('lancer', 'attackData');
    if (flags) { tracker.onAttackCard(flags); check(); }
  });
  on('preUpdateActor', (actor, changes) => {
    if (!touches(changes) || !tokenUuidFor(actor)) return;
    before.set(actor, snap(actor));
  });
  on('updateActor', (actor, changes) => {
    const prev = before.get(actor);
    if (!prev) return;
    before.delete(actor);
    const tokenUuid = tokenUuidFor(actor);
    if (!tokenUuid) return;
    const after = snap(actor);
    const destroyed = after.structure <= 0 && prev.structure > 0;
    tracker.onHpChange({ tokenUuid, before: prev, after, destroyed });
    check();
  });

  const dispose = () => {
    while (registered.length) { const [n, id] = registered.pop(); Hooks.off(n, id); }
    before.clear();
  };
  return { tracker, done, dispose };
}
