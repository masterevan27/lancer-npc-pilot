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
  const order = [...wanted];
  const tokenUuidsFor = (actor) => {
    const out = [];
    for (const tok of canvas?.scene?.tokens ?? []) {
      if (wanted.has(tok.uuid) && tok.actor === actor && !out.includes(tok.uuid)) out.push(tok.uuid);
    }
    const u = actor?.token?.uuid;
    if (u && wanted.has(u) && !out.includes(u)) out.push(u);
    return out.sort((x, y) => order.indexOf(x) - order.indexOf(y));
  };
  // Several expected targets can share one linked world actor. One update credits
  // the next hit target not yet credited (never several), in expect order.
  const creditTarget = (actor) => {
    const uuids = tokenUuidsFor(actor);
    if (!uuids.length) return null;
    return uuids.find((u) => tracker.awaitingDamage(u)) ?? uuids[0];
  };
  const on = (name, fn) => { registered.push([name, Hooks.on(name, fn)]); };

  on('createChatMessage', (message) => {
    const flags = message?.getFlag?.('lancer', 'attackData');
    if (flags) { tracker.onAttackCard(flags); check(); }
    // The attacker's own damage card gates which later HP decreases count (speaker actor id).
    const damage = message?.getFlag?.('lancer', 'damageData');
    if (damage) { tracker.onDamageCard(damage, message.speaker?.actor); check(); }
  });
  on('preUpdateActor', (actor, changes) => {
    if (!touches(changes) || !tokenUuidsFor(actor).length) return;
    before.set(actor, snap(actor));
  });
  on('updateActor', (actor, changes) => {
    const prev = before.get(actor);
    if (!prev) return;
    before.delete(actor);
    const tokenUuid = creditTarget(actor);
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
