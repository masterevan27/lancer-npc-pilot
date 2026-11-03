import { MODULE_ID, extractSnapshot } from './adapter/snapshot.mjs';
import { PilotController, requestDecision } from './adapter/controller.mjs';
import { executeOption, isResponsibleGM } from './adapter/executor.mjs';
import { showReview, escapeHtml } from './adapter/review.mjs';
import { bindActorPolicy,readDecisionConfig,resolvePolicyContext } from './adapter/policy-context.mjs';

export function registerSettings(game) {
  game.settings.register(MODULE_ID,'decisionMode',{name:'Decision mode',scope:'client',config:true,type:String,
    choices:{model:'Model (relay)',policy:'Module policy (no relay)'},default:'model'});
  for (const [key, name, type, value, scope, config] of [
    ['promptOnTurn', 'Offer a proposal when an NPC turn starts', Boolean, false, 'world', true],
    ['executionEnabled', 'Enable token execution (staged scenes only)', Boolean, false, 'world', true],
    ['relayUrl', 'Relay URL', String, 'http://127.0.0.1:5090', 'client', false],
    ['secret', 'Relay shared secret', String, '', 'client', false],
    ['provider', 'Provider', String, 'openai', 'client', false],
    ['model', 'Model override', String, '', 'client', false],
  ]) game.settings.register(MODULE_ID, key, { name, scope, config, type, default: value });
  game.keybindings.register(MODULE_ID, 'planTurn', { name: 'Plan the active NPC turn',
    editable: [{ key: 'KeyP', modifiers: ['ALT'] }], restricted: true,
    onDown: () => { const api = game.modules.get(MODULE_ID)?.api; if (!api) return false;
      void api.planTurn().catch(e => globalThis.ui?.notifications?.error(e.message)); return true; } });
}

export function initializePilot({ game, canvas, constants, Hooks, DialogV2, ChatMessage, notifications, locks = globalThis.navigator?.locks }) {
  if (!game.user?.isGM || game.system?.id !== 'lancer') return null;
  const setting = key => game.settings.get(MODULE_ID, key);
  const read = options => extractSnapshot({ game, canvas, constants }, options);
  const canExecute = () => game.user.isGM && isResponsibleGM(game) && setting('executionEnabled') === true;
  const withLock = (key, fn) => {
    if (!locks?.request) throw Error('Execution requires browser Web Locks. Use a current browser in a secure context.');
    return locks.request(key, { ifAvailable: true }, lock => {
      if (!lock) throw Error('This turn is executing in another browser tab.');
      return fn();
    });
  };
  const controller = new PilotController({ read, canExecute,
    readDecisionConfig:board=>readDecisionConfig({game,board}),
    resolvePolicyContext:(board,config,options)=>resolvePolicyContext(board,config,{game,...options}),
    request: (payload, options) => requestDecision(payload, {
      relayUrl: setting('relayUrl'), secret: setting('secret'), provider: setting('provider'), model: setting('model'),
    }, options),
    execute: (option, board, choice, {verifyDecision}) => executeOption(option, board, choice, { game, canvas, read, withLock,verifyDecision,
      postLine: (line, token) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ token }),
        flavor: 'NPC intent — before resolution', content: `<p>${escapeHtml(line)}</p>` }) }),
  });
  let busy = false;
  const api = {
    async configurePolicy() {
      if(!game.user.isGM) throw Error('GM only.');
      await DialogV2.prompt({window:{title:'NPC Pilot — policy settings'},rejectClose:false,
        content:'<p>Select Decision mode in Game Settings → Configure Settings → Lancer NPC Pilot. Policy mode requires no relay.</p><p>Bind a T1 base Cataphract with the GM module API; see the adapter guide. Only one native class and its base loadout are supported. Specials remain manual. Re-plan after changing the binding or mode.</p>',
        ok:{label:'Close',callback:()=>true}});
      controller.cancel();return false;
    },
    async bindActorPolicy(actor, binding) {
      const result=await bindActorPolicy(actor,binding,{game});controller.cancel();return result;
    },
    async configureRelay() {
      if (!game.user.isGM) throw Error('GM only.');
      const provider = setting('provider');
      const result = await DialogV2.prompt({ window: { title: 'NPC Pilot — relay settings' }, rejectClose: false,
        content: `<p>These settings stay in this browser. Enter the relay shared secret, never an Anthropic API key.</p>
          <div class="form-group"><label>Relay URL</label><input name="relayUrl" value="${escapeHtml(setting('relayUrl'))}" required></div>
          <div class="form-group"><label>Shared secret</label><input name="secret" type="password" autocomplete="off" placeholder="Leave blank to keep the saved secret"></div>
          <div class="form-group"><label>Provider</label><select name="provider"><option value="openai" ${provider === 'openai' ? 'selected' : ''}>Local / OpenAI compatible</option>
          <option value="anthropic" ${provider === 'anthropic' ? 'selected' : ''}>Anthropic API (paid)</option></select></div>
          <div class="form-group"><label>Model override</label><input name="model" value="${escapeHtml(setting('model'))}" placeholder="Use the relay’s configured model"></div>`,
        ok: { label: 'Save', callback: (_e, b) => Object.fromEntries(new FormData(b.form)) } });
      if (!result) return false;
      const secret = result.secret || setting('secret');
      if (!secret) throw Error('Enter the shared secret configured in the relay.');
      if (/^sk-ant-/i.test(secret)) throw Error('Use the relay shared secret. Keep Anthropic API keys in the relay environment.');
      for (const [key, value] of Object.entries({ relayUrl: result.relayUrl.trim(), secret,
        provider: result.provider, model: result.model.trim() })) await game.settings.set(MODULE_ID, key, value);
      controller.cancel(); return true;
    },
    async reviewTerrain() {
      if (!game.user.isGM || !canvas.scene) throw Error('View a scene as GM first.');
      const confirmed = await DialogV2.confirm({ window: { title: 'Review scene terrain' }, rejectClose: false,
        content: '<p>Confirm that walls and the configured blocked/difficult cells describe all movement obstacles and costs on this scene. Check every occupied cell of larger tokens, plus cover and reactions, in every proposal.</p><p>Do not confirm for scenes with unmarked terrain, elevation changes, unsupported token dimensions or region movement rules.</p>' });
      if (!confirmed) return false;
      const terrain = canvas.scene.getFlag(MODULE_ID, 'terrain') ?? {};
      await canvas.scene.setFlag(MODULE_ID, 'terrain', { ...terrain, reviewed: true });
      controller.cancel(); return true;
    },
    async planTurn() {
      if (!game.user.isGM) throw Error('GM only.');
      if (busy) { notifications.info('NPC Pilot is already planning or reviewing a turn.'); return; }
      busy = true;
      try {
        if ((setting('decisionMode') ?? 'model') === 'model' && !setting('secret') && !await api.configureRelay()) return;
        for (;;) {
          notifications.info('NPC Pilot is planning. No token action is taken until you approve.');
          const review = await controller.plan();
          const result = await showReview(review, { DialogV2, canExecute: canExecute() && review.terrainReviewed });
          if (result?.action === 'reask') continue;
          if (result?.action === 'configure') {
            if (review.mode==='policy') { await api.configurePolicy(); break; }
            if (await api.configureRelay()) continue; break;
          }
          if (result?.action === 'terrain') { if (await api.reviewTerrain()) continue; break; }
          if (result?.action === 'execute') {
            await controller.approve(review, result.optionId);
            notifications.info('NPC Pilot handed off the approved option. Resolve remaining actions, reactions and damage in Lancer.');
          }
          break;
        }
      } finally { controller.cancel(); busy = false; }
    },
    cancel: () => controller.cancel(),
  };
  Hooks.on('updateCombat', (combat, changes) => {
    if (!('turn' in changes || 'round' in changes)) return;
    controller.cancel();
    const token = canvas.tokens?.get(combat.combatant?.tokenId);
    if (setting('promptOnTurn') && isResponsibleGM(game) && token?.actor?.type === 'npc' && !busy)
      void api.planTurn().catch(e => notifications.error(e.message));
  });
  Hooks.on('canvasTearDown', () => controller.cancel());
  return api;
}

if (globalThis.Hooks) {
  Hooks.once('init', () => registerSettings(game));
  Hooks.once('ready', () => {
    const api = initializePilot({ game, canvas, constants: CONST, Hooks,
      DialogV2: foundry.applications.api.DialogV2, ChatMessage, notifications: ui.notifications });
    if (api) game.modules.get(MODULE_ID).api = api;
  });
}
