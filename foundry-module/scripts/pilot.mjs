import { MODULE_ID, extractSnapshot } from './adapter/snapshot.mjs';
import { PilotController, requestDecision } from './adapter/controller.mjs';
import { executeOption, isResponsibleGM } from './adapter/executor.mjs';
import { showReview, escapeHtml } from './adapter/review.mjs';
import { bindActorPolicy,readDecisionConfig,resolvePolicyContext } from './adapter/policy-context.mjs';
import { executeCataphract } from './adapter/cataphract-executor.mjs';
import { createGrappleController } from './adapter/grapple-controller.mjs';
import { createShieldController } from './adapter/shield-controller.mjs';
import { registerTrampleHistory } from './adapter/trample-hooks.mjs';
import { registerGrappleMovementGuard } from './adapter/grapple-movement-guard.mjs';
import { shouldAutoRun } from './core/auto-mode.mjs';
import { createTurnRunner } from './adapter/turn-runner.mjs';
import { createBannerChannel } from './adapter/banner.mjs';
import { portraitFor } from './core/banner.mjs';
import { observeOutcome } from './adapter/outcome-observer.mjs';
import { createBanter, postChatMessage } from './adapter/banter.mjs';
import { warmUpModel } from './adapter/warmup.mjs';
import { buildOutcomeExpectation, turnKeyFor } from './adapter/auto-wiring.mjs';

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
  game.settings.register(MODULE_ID,'autoMode',{name:'Auto mode: run NPC turns without approval',
    hint:'Hostile and friendly NPC turns play themselves when they start. Requires token execution to be enabled; the GM can opt an NPC out with api.setAutoOptOut(actor, true).',
    scope:'world',config:true,type:Boolean,default:false});
  game.settings.register(MODULE_ID,'banterEnabled',{name:'NPC banter',
    hint:'NPCs speak a short in-character line before and after their attack.',scope:'world',config:true,type:Boolean,default:false});
  game.settings.register(MODULE_ID,'banterProvider',{name:'Banter provider',scope:'client',config:true,type:String,
    choices:{openai:'Local / OpenAI compatible',anthropic:'Anthropic API (paid)'},default:'openai'});
  game.settings.register(MODULE_ID,'banterModel',{name:'Banter model override',hint:"Leave blank to use the relay's configured model.",
    scope:'client',config:true,type:String,default:''});
  game.keybindings.register(MODULE_ID, 'planTurn', { name: 'Plan the active NPC turn',
    editable: [{ key: 'KeyP', modifiers: ['ALT'] }], restricted: true,
    onDown: () => { const api = game.modules.get(MODULE_ID)?.api; if (!api) return false;
      void api.planTurn().catch(e => globalThis.ui?.notifications?.error(e.message)); return true; } });
  game.keybindings.register(MODULE_ID,'manageGrapples',{name:'Manage Pilot grapples',editable:[{key:'KeyG',modifiers:['ALT']}],restricted:true,
    onDown:()=>{const api=game.modules.get(MODULE_ID)?.api;if(!api)return false;
      void api.manageGrapples().catch(e=>globalThis.ui?.notifications?.error(e.message));return true;}});
}

export function initializePilot({ game, canvas, constants, Hooks, DialogV2, ChatMessage, notifications, locks = globalThis.navigator?.locks }) {
  if(game.system?.id!=='lancer')return null;
  registerGrappleMovementGuard({canvas,Hooks,notifications});
  // Banners render on every client; the End-turn button only appears for the GM.
  let runner=null;
  const banner=game.socket?.on&&globalThis.document
    ?createBannerChannel({game,document:globalThis.document,onEndTurn:()=>{Promise.resolve(runner?.endTurnAnyway()).catch(e=>notifications?.error?.(e.message));}})
    :{show(){},clear(){},dispose(){}};
  if (!game.user?.isGM) return null;
  const setting = key => game.settings.get(MODULE_ID, key);
  const read = options => {
    const binding=canvas.tokens?.get(game.combat?.combatant?.tokenId)?.actor?.getFlag(MODULE_ID,'policyBinding');
    return extractSnapshot({game,canvas,constants},{...options,cataphractGeometry:setting('decisionMode')==='policy'
      &&binding?.classId==='npcc_cataphract'&&binding.policyId==='cataphract-base-t1'});
  };
  const canExecute = () => game.user.isGM && isResponsibleGM(game) && setting('executionEnabled') === true;
  const withLock = (key, fn, {wait=false}={}) => {
    if (!locks?.request) throw Error('Execution requires browser Web Locks. Use a current browser in a secure context.');
    return locks.request(key, wait?{}:{ ifAvailable: true }, lock => {
      if (!lock) throw Error('This turn is executing in another browser tab.');
      return fn();
    });
  };
  const grapples=createGrappleController({game,canvas,constants,Hooks,DialogV2,withLock,notifications,canExecute});
  const shield=createShieldController({game,canvas,constants,Hooks,DialogV2,withLock,notifications,canExecute});
  const history=registerTrampleHistory({game,canvas,Hooks,withLock,notifications});
  const controller = new PilotController({ read, canExecute,
    readDecisionConfig:board=>readDecisionConfig({game,board}),
    resolvePolicyContext:(board,config,options)=>resolvePolicyContext(board,config,{game,...options}),
    request: (payload, options) => requestDecision(payload, {
      relayUrl: setting('relayUrl'), secret: setting('secret'), provider: setting('provider'), model: setting('model'),
    }, options),
    execute: (option, board, rawChoice, {verifyDecision}) => {
      // With banter on, banter posts the intent line itself (in character); the executor must post nothing.
      const choice=setting('banterEnabled')===true?{...rawChoice,line:''}:rawChoice;
      return (option.mechanics?.id==='cataphract-t1'?executeCataphract:executeOption)(option, board, choice, { game, canvas, read, withLock,verifyDecision,
        postLine: (line, token) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ token }),
          flavor: 'NPC intent — before resolution', content: `<p>${escapeHtml(line)}</p>` }) });
    },
  });
  let busy = false, autoRunning = false, turnSeq = 0;
  const getToken = id => canvas.tokens?.get(id);
  const classNameOf = actor => [...(actor?.items ?? [])].find(i => i.type === 'npc_class')?.name ?? '';
  const sideOf = token => token?.document?.disposition < 0 ? 'hostile' : token?.document?.disposition > 0 ? 'friendly' : 'neutral';
  const readSpeaker = tokenId => {
    const token = getToken(tokenId), actor = token?.actor;
    if (!token || !actor) throw Error('The speaking token is missing.');
    return { name: token.name ?? token.document?.name ?? 'NPC', className: classNameOf(actor), side: sideOf(token),
      round: game.combat?.round ?? 0, portrait: portraitFor(actor, token), token, actorId: actor.id };
  };
  const banterSettings = () => ({ enabled: setting('banterEnabled') === true, provider: setting('banterProvider'),
    model: setting('banterModel'), relayUrl: setting('relayUrl'), secret: setting('secret') });
  const logWarn = m => globalThis.console?.warn?.(m);
  const banter = createBanter({ request: requestDecision, postChat: postChatMessage, banner,
    readSnapshot: () => read().snapshot, readSpeaker, settings: banterSettings, log: logWarn });
  const readTurnInfo = () => {
    const token = getToken(game.combat?.combatant?.tokenId), actor = token?.actor;
    if (!token || !actor) throw Error('There is no active NPC token.');
    return { name: token.name ?? 'NPC', className: classNameOf(actor), side: sideOf(token), round: game.combat.round,
      portrait: portraitFor(actor, token), speakerTokenId: token.id, canExecute: canExecute(),
      terrainReviewed: canvas.scene?.getFlag(MODULE_ID, 'terrain')?.reviewed === true };
  };
  const whisperGM = text => ChatMessage.create({ content: `<p>${escapeHtml(text)}</p>`, whisper: ChatMessage.getWhisperRecipients('GM') });
  const autoGate = combat => {
    const token = canvas.tokens?.get(combat?.combatant?.tokenId), actor = token?.actor;
    return shouldAutoRun({ autoMode: setting('autoMode') === true, executionEnabled: setting('executionEnabled') === true,
      isResponsibleGM: isResponsibleGM(game), actorOptOut: actor?.getFlag?.(MODULE_ID, 'autoOptOut') === true,
      isNpc: actor?.type === 'npc', side: sideOf(token) });
  };
  let autoKey = null;
  // Any cancellation invalidates queued auto runs and clears the in-flight flag.
  const invalidate = () => { turnSeq++; autoRunning = false; autoKey = null; runner?.cancel(); };
  // The auto runner may only execute while the full gate is still open for the same turn.
  const autoController = { plan: o => controller.plan(o), cancel: () => controller.cancel(),
    approve: (review, optionId) => {
      const stillAuto = () => {
        if (!autoGate(game.combat).auto || !autoKey || turnKeyFor(game.combat) !== autoKey)
          throw Error('Auto mode was turned off or the turn changed. Continue manually.');
      };
      stillAuto();
      // Re-evaluated at every executor checkpoint, not only before the hand-off starts.
      return controller.approve(review, optionId, { verify: stillAuto });
    } };
  runner = createTurnRunner({ controller: autoController, banner,
    observe: (option, board) => observeOutcome({ Hooks, canvas, expect: buildOutcomeExpectation(option, board, { getToken }) }),
    endTurn: () => game.combat.nextTurn(), whisperGM,
    openReview: review => api.openReview(review),
    speakIntent: banter.speakIntent, speakReaction: banter.speakReaction, readTurnInfo, log: logWarn });
  const api = {
    grapples,shield,
    async setAutoOptOut(actor, value) {
      if (!game.user.isGM) throw Error('GM only.');
      return actor.setFlag(MODULE_ID, 'autoOptOut', value === true);
    },
    async openReview(review) {
      if (busy) return;
      busy = true;
      let next = null;
      try {
        const result = await showReview(review, { DialogV2, canExecute: canExecute() && review.terrainReviewed });
        if (result?.action === 'execute') {
          await controller.approve(review, result.optionId);
          notifications.info('NPC Pilot handed off the approved option. Resolve remaining actions, reactions and damage in Lancer.');
        } else if (result?.action === 'reask') next = () => api.planTurn();
        else if (result?.action === 'configure') next = async () => { if (review.mode === 'policy') await api.configurePolicy(); else if (await api.configureRelay()) await api.planTurn(); };
        else if (result?.action === 'terrain') next = async () => { if (await api.reviewTerrain()) await api.planTurn(); };
      } catch (e) { notifications.error(e.message); }
      finally { busy = false; }
      if (next) await next().catch(e => notifications.error(e.message));
    },
    async manageGrapples(){
      if(!game.user.isGM||!canvas.scene)throw Error('View the encounter as GM.');
      const links=canvas.scene.getFlag(MODULE_ID,'grapples')??[];
      if(!links.length){notifications.info('No Pilot-owned grapples in this scene.');return;}
      const button=(action,label)=>({action,label,callback:(_e,b)=>({action,id:b.form.elements.grapple.value,path:b.form.elements.path.value})});
      const result=await DialogV2.wait({window:{title:'NPC Pilot — grapples'},rejectClose:false,
        content:`<label>Grapple<select name="grapple">${links.map(l=>`<option value="${escapeHtml(l.id)}">${escapeHtml(canvas.tokens.get(l.sourceTokenId)?.name??l.sourceTokenId)} ↔ ${escapeHtml(canvas.tokens.get(l.targetTokenId)?.name??l.targetTokenId)}</option>`).join('')}</select></label>
          <p>Use the active participant’s action. Same-size control contests are available only at the observed start of the turn. Cancellation retains the grapple; tied native checks go to the contest’s initiator.</p>
          <label>Movement route, starting cell first (x,y pairs separated by spaces)<textarea name="path" placeholder="4,3 5,3 6,3"></textarea></label>
          <p>For a Cataphract with Trample, use Plan Turn for paired movement and transit damage.</p>`,
        buttons:[button('release','End grapple (grappler free action)'),button('escape','Break free (defender quick action)'),
          button('contest','Contest control (same size)'),button('move','Review paired movement'),{action:'cancel',label:'Cancel',default:true,callback:()=>null}]});
      if(!result)return;
      controller.cancel();
      if(result.action==='move'){
        const cells=result.path.trim().split(/\s+/);
        if(cells.length<2||cells.length>37||cells.some(c=>!/^\d+,\d+$/.test(c)))throw Error('Enter two to 37 grid cells as x,y pairs, starting at the current cell.');
        return grapples.move(result.id,cells.map(c=>{const [x,y]=c.split(',').map(Number);return {x,y};}));
      }
      return grapples[result.action==='escape'?'breakFree':result.action==='contest'?'contest':'release'](result.id);
    },
    async configurePolicy() {
      if(!game.user.isGM) throw Error('GM only.');
      await DialogV2.prompt({window:{title:'NPC Pilot — policy settings'},rejectClose:false,
        content:'<p>Select Decision mode in Game Settings → Configure Settings → Lancer NPC Pilot. Policy mode requires no relay.</p><p>Bind a T1 base Cataphract with the GM module API; see the adapter guide. Trample and Impale require exact reviewed sources, native geometry and known turn history. Unsupported target traits remain manual. Alt+G manages Pilot-owned grapples. Re-plan after changing the binding or mode.</p>',
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
      if (busy || autoRunning) { notifications.info('NPC Pilot is already planning or reviewing a turn.'); return; }
      busy = true;
      try {
        await history.settled();
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
    cancel: () => { invalidate(); controller.cancel(); },
  };
  Hooks.on('updateCombat', (combat, changes) => {
    if (!('turn' in changes || 'round' in changes)) return;
    invalidate();
    const seq = turnSeq;
    controller.cancel();
    const actor = canvas.tokens?.get(combat.combatant?.tokenId)?.actor;
    if (autoGate(combat).auto && !busy) {
      const key = turnKeyFor(combat);
      autoKey = key; autoRunning = true;
      void history.settled().then(() => { if (seq === turnSeq && turnKeyFor(game.combat) === key) return runner.run(key); })
        .catch(e => notifications.error(e.message)).finally(() => { if (seq === turnSeq) autoRunning = false; });
      return;
    }
    // Auto mode implies the turn prompt; when a gate is closed the GM still gets the manual proposal.
    if ((setting('promptOnTurn') || setting('autoMode')) && isResponsibleGM(game) && actor?.type === 'npc' && !busy)
      void history.settled().then(() => { if (seq === turnSeq) return api.planTurn(); }).catch(e => notifications.error(e.message));
  });
  Hooks.on('deleteCombat', () => invalidate());
  Hooks.on('canvasTearDown', () => { invalidate(); controller.cancel(); });
  void (async () => {
    try {
      if (!isResponsibleGM(game)) return;
      if (setting('autoMode') === true && setting('executionEnabled') !== true)
        notifications.warn('NPC Pilot: auto mode needs token execution enabled. NPC turns will offer a proposal instead.');
      const providers = [];
      const base = { relayUrl: setting('relayUrl'), secret: setting('secret') };
      if ((setting('decisionMode') ?? 'model') === 'model') providers.push({ ...base, provider: setting('provider'), model: setting('model') });
      if (setting('banterEnabled') === true) providers.push({ ...base, provider: setting('banterProvider'), model: setting('banterModel') });
      if (providers.length) await warmUpModel({ request: requestDecision, providers, notifications });
    } catch (e) { logWarn(`NPC Pilot: warm-up skipped: ${e?.message ?? e}`); }
  })();
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
