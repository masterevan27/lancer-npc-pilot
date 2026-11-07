import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOutcomeExpectation, turnKeyFor } from '../scripts/adapter/auto-wiring.mjs';

test('turn key joins combat, round, turn and combatant ids', () => {
  assert.equal(turnKeyFor({ id: 'c', round: 2, turn: 3, combatant: { id: 'k' } }), 'c:2:3:k');
});

const tok = (id, hpMax, uuid = `Scene.s.Token.${id}`) => ({ id, name: `N-${id}`, document: { uuid }, actor: { id: `a-${id}`, system: { hp: { max: hpMax } },
  items: { get: iid => iid === 'rifle' ? { uuid: `Actor.a-${id}.Item.rifle` } : undefined } } });
const tokens = Object.fromEntries([tok('npc', 10), tok('p1', 20), tok('p2', 30)].map(t => [t.id, t]));
const getToken = id => tokens[id];

test('expectation builds weapon uuid and ordered targets, uuids derived from targets', () => {
  const option = { action: { kind: 'attack', itemId: 'rifle', targetTokenIds: ['p2', 'p1'] } };
  const e = buildOutcomeExpectation(option, { snapshot: { activeTokenId: 'npc' } }, { getToken });
  assert.equal(e.actorId, 'a-npc'); assert.equal(e.itemUuid, 'Actor.a-npc.Item.rifle');
  assert.deepEqual(e.targets, [{ tokenUuid: 'Scene.s.Token.p2', name: 'N-p2', maxHp: 30 }, { tokenUuid: 'Scene.s.Token.p1', name: 'N-p1', maxHp: 20 }]);
  assert.deepEqual(e.targetTokenUuids, e.targets.map(t => t.tokenUuid));
});

test('missing weapon, target or attacker throws so the runner holds', () => {
  const b = { snapshot: { activeTokenId: 'npc' } };
  assert.throws(() => buildOutcomeExpectation({ action: { itemId: 'nope', targetTokenIds: ['p1'] } }, b, { getToken }));
  assert.throws(() => buildOutcomeExpectation({ action: { itemId: 'rifle', targetTokenIds: ['zz'] } }, b, { getToken }));
  assert.throws(() => buildOutcomeExpectation({ action: { itemId: 'rifle', targetTokenIds: ['p1'] } }, { snapshot: { activeTokenId: 'x' } }, { getToken }));
});

import { initializePilot } from '../scripts/pilot.mjs';
import { environment } from './helpers/adapter-env.mjs';

test('initializePilot registers combat hooks, setAutoOptOut, and warns once when auto mode lacks execution', async () => {
  const env = environment();
  env.game.users = { activeGM: env.game.user };
  const values = { decisionMode: 'policy', autoMode: true, executionEnabled: false };
  env.game.settings = { get: (_m, k) => values[k] ?? false };
  const hooks = [], warns = [];
  const api = initializePilot({ ...env, Hooks: { on: n => hooks.push(n) }, notifications: { info() {}, warn: m => warns.push(m) } });
  await new Promise(r => setTimeout(r, 0));
  for (const n of ['updateCombat', 'deleteCombat', 'canvasTearDown']) assert(hooks.includes(n), n);
  assert.equal(typeof api.setAutoOptOut, 'function');
  assert.equal(warns.length, 1); assert.match(warns[0], /auto mode needs token execution/);
  let flag; await api.setAutoOptOut({ setFlag: async (m, k, v) => { flag = [m, k, v]; } }, true);
  assert.deepEqual(flag, ['lancer-npc-pilot', 'autoOptOut', true]);
});

// ---- initializePilot harness for the auto-run gate ----
function harness(over = {}) {
  const env = environment();
  const h = { handlers: {}, chats: [], infos: [], errors: [], fetches: [], nextTurns: 0, locks: [] };
  const values = { decisionMode: 'model', autoMode: true, executionEnabled: true, promptOnTurn: false,
    relayUrl: 'http://127.0.0.1:5090', secret: 's', provider: 'openai', model: '', banterEnabled: false, ...over };
  h.values = values;
  env.game.users = { activeGM: env.game.user };
  env.game.settings = { get: (_m, k) => values[k] ?? false };
  env.game.combat.combatant = { id: 'cb', tokenId: 'npc' };
  env.game.combat.nextTurn = async () => { h.nextTurns++; };
  env.canvas.scene.flags.terrain = { reviewed: true };
  for (const t of env.canvas.tokens.placeables) {
    t.document.uuid = `Scene.scene.Token.${t.id}`;
    t.actor.items.get = id => t.actor.items.find(i => i.id === id);
  }
  env.canvas.tokens.placeables[0].actor.items[0].uuid = 'Actor.a-npc.Item.rifle';
  env.canvas.scene.tokens = [];
  h.env = env;
  h.fetchOrig = globalThis.fetch;
  globalThis.fetch = (url, init) => h.fetchImpl ? h.fetchImpl(url, init) : new Promise((_res, rej) => h.fetches.push(rej));
  h.offs = [];
  globalThis.ChatMessage = undefined;
  h.ChatMessage = { create: async m => { h.chats.push(m); }, getWhisperRecipients: () => ['gm'], getSpeaker: () => ({}) };
  h.api = initializePilot({ ...env, Hooks: { on: (n, f) => { h.handlers[n] = f; return n; }, off: (n) => { h.offs.push(n); } }, ChatMessage: h.ChatMessage,
    locks: { request: async (k, _o, fn) => { h.locks.push(k); return fn({}); } },
    DialogV2: { wait: async (...a) => (h.dialog ? h.dialog(...a) : { action: 'skip' }), prompt: async () => null },
    notifications: { info: m => h.infos.push(m), warn() {}, error: m => h.errors.push(m) } });
  h.turn = n => { env.game.combat.turn = n; h.handlers.updateCombat(env.game.combat, { turn: n }); };
  h.done = () => { globalThis.fetch = h.fetchOrig; };
  return h;
}
const tick = () => new Promise(r => setTimeout(r, 20));

test('turning auto mode off while planning is pending holds the turn instead of executing', async () => {
  const h = harness();
  try {
    await tick(); // ready-time warm-up request, if any, settles
    h.fetches.length = 0;
    h.turn(1); await tick();
    assert.equal(h.fetches.length, 1, 'auto planning requested the model');
    h.values.autoMode = false;
    h.fetches[0](new Error('down')); await tick();
    assert.equal(h.nextTurns, 0);
    assert(!h.locks.some(k => k.startsWith('lancer-npc-pilot:')), 'execution was never entered');
    assert(h.chats.some(c => c.whisper), 'GM was whispered about the held turn');
    assert(!h.chats.some(c => c.flavor), 'no intent line was posted by an execution');
  } finally { h.done(); }
});

test('a stale auto run flag does not block manual planning after the next turn starts no auto run', async () => {
  const h = harness();
  try {
    await tick(); h.fetches.length = 0;
    h.turn(1); await tick();
    h.values.autoMode = false; // next turn's actor is not auto-run
    h.turn(2); await tick();
    h.fetches.length = 0;
    const p = h.api.planTurn(); await tick();
    assert(!h.infos.includes('NPC Pilot is already planning or reviewing a turn.'));
    assert.equal(h.fetches.length, 1, 'manual planning proceeded');
    h.fetches[0](new Error('down')); await p.catch(() => {});
  } finally { h.done(); }
});

test('cancelling before history settles prevents a queued auto run from starting', async () => {
  const h = harness();
  try {
    await tick(); h.fetches.length = 0;
    h.turn(1); h.handlers.deleteCombat({});
    await tick();
    assert.equal(h.fetches.length, 0);
    h.turn(2); h.api.cancel(); await tick();
    assert.equal(h.fetches.length, 0);
  } finally { h.done(); }
});

// ---- final-review regression: auto gate re-checked at every executor checkpoint ----
test('turning auto mode off during the reservation write never starts the native attack (final review 1)', async () => {
  const h = harness();
  try {
    await tick(); h.fetches.length = 0;
    const npc = h.env.canvas.tokens.placeables[0];
    let began = 0, setTargets = 0;
    npc.actor.items[0].beginWeaponAttackFlow = async () => { began++; };
    let reserved = 0;
    npc.actor.setFlag = async () => { reserved++; h.values.autoMode = false; };
    npc.actor.update = async d => { if (d['system.action_tracker']) npc.actor.system.action_tracker = d['system.action_tracker']; };
    h.env.canvas.tokens.setTargets = async () => { setTargets++; };
    h.turn(1); await tick();
    assert.equal(h.fetches.length, 1, 'auto planning requested the model');
    h.fetches[0](new Error('down')); await tick(); await tick();
    assert.equal(reserved, 1, 'the turn reached the reservation write');
    assert.equal(began, 0, 'native attack flow never began');
    assert.equal(h.nextTurns, 0);
    assert(h.chats.some(c => c.whisper), 'GM was told the turn is held');
  } finally { h.done(); }
});

// ---- final-review 5: banter in GM-approved play ----
function approvedRig(over = {}) {
  const h = harness({ autoMode: false, banterEnabled: true, banterProvider: 'openai', banterModel: '', ...over });
  const npc = h.env.canvas.tokens.placeables[0], pc = h.env.canvas.tokens.placeables[1];
  h.began = 0; h.reserved = 0;
  npc.actor.items[0].beginWeaponAttackFlow = async () => { h.began++; };
  npc.actor.setFlag = async () => { h.reserved++; };
  npc.actor.update = async d => { if (d['system.action_tracker']) npc.actor.system.action_tracker = d['system.action_tracker']; };
  h.env.canvas.tokens.setTargets = async () => {};
  h.env.canvas.scene.tokens = [{ uuid: 'Scene.scene.Token.pc', actor: pc.actor }];
  h.banterPrompts = [];
  h.fetchImpl = async (_url, init) => {
    const body = JSON.parse(init.body), text = body.messages.map(m => m.content).join(' ');
    if (/Phase: (intent|reaction)/.test(text)) { h.banterPrompts.push(text); return { ok: true, json: async () => ({ text: h.banterReply ?? 'Hold still, pc.' }) }; }
    return { ok: true, json: async () => ({ text: '{"option":"A","reason":"closest","line":"Here I come, pc."}' }) };
  };
  h.dialog = async () => ({ action: 'execute', optionId: 'A' });
  globalThis.ChatMessage = h.ChatMessage; globalThis.CONST = { CHAT_MESSAGE_STYLES: { IC: 2 } };
  const done = h.done; h.done = () => { done(); globalThis.ChatMessage = undefined; delete globalThis.CONST; };
  return h;
}
const speech = h => h.chats.filter(c => c.style === 2).map(c => c.content);

test('banter on: the approved Execute path speaks the intent before the attack and the reaction when it resolves (final review 5)', async () => {
  const h = approvedRig();
  try {
    await tick();
    await h.api.planTurn(); await tick();
    assert.equal(h.began, 1, 'the approved attack was handed to Lancer');
    assert.deepEqual(speech(h), ['<p>Here I come, pc.</p>'], 'intent line spoken once, in character');
    assert(!h.chats.some(c => c.flavor), 'the executor did not also post the line');
    h.handlers.createChatMessage({ getFlag: (s, k) => (s === 'lancer' && k === 'attackData'
      ? { origin: 'a-npc', attackerItemUuid: 'Actor.a-npc.Item.rifle', targets: [{ uuid: 'Scene.scene.Token.pc', hit: false }] } : undefined) });
    await tick();
    assert.equal(h.banterPrompts.length, 1, 'one reaction request');
    assert.deepEqual(speech(h), ['<p>Here I come, pc.</p>', '<p>Hold still, pc.</p>']);
    assert.equal(h.nextTurns, 0, 'approved play never advances the turn');
  } finally { h.done(); }
});

test('banter off: approved play is unchanged, the executor posts the line (final review 5)', async () => {
  const h = approvedRig({ banterEnabled: false });
  try {
    await tick();
    await h.api.planTurn(); await tick();
    assert.equal(h.began, 1);
    assert.deepEqual(speech(h), []);
    assert.equal(h.chats.filter(c => c.flavor === 'NPC intent — before resolution').length, 1);
    assert.equal(h.banterPrompts.length, 0);
  } finally { h.done(); }
});

test('a turn change after an approved attack disposes the observer and silences its reaction (final review 5)', async () => {
  const h = approvedRig();
  try {
    await tick();
    await h.api.planTurn(); await tick();
    h.offs.length = 0;
    h.handlers.updateCombat(h.env.game.combat, { turn: 5 }); await tick();
    assert(h.offs.includes('createChatMessage') && h.offs.includes('updateActor'), 'observer hooks removed');
    assert.deepEqual(speech(h), ['<p>Here I come, pc.</p>']);
  } finally { h.done(); }
});
