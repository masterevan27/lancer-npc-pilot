import { generateCandidates, pickTop } from '../core/options.mjs';
import { buildPrompt } from '../core/prompt.mjs';
import { interpretReply, retryMessage } from '../core/reply.mjs';
import { selectPolicyDecision } from '../core/policy.mjs';
import { explainEvaluation } from '../core/policy-metrics.mjs';
import { generatePolicyCandidates } from './policy-candidates.mjs';

const AUTO_MODEL_TIMEOUT_MS = 30000;
const AUTO_FALLBACK_REASON = 'Model unavailable — top-scoring safe option.';

/** Pure orchestration with injected I/O. Only approve() can reach execution. */
export class PilotController {
  #epoch = 0;
  #pending = null;
  #review = null;
  #executing = false;
  #usedTurns = new Set();

  constructor({ read, request, execute, canExecute, readDecisionConfig = () => ({mode:'model',stamp:'model'}), resolvePolicyContext }) {
    Object.assign(this, { read, request, execute, canExecute, readDecisionConfig, resolvePolicyContext });
  }

  cancel() {
    this.#epoch++;
    this.#pending?.abort(); this.#pending = null; this.#review = null;
  }

  async plan({ auto = false } = {}) {
    if (this.#executing) throw Error('An approved option is still executing.');
    this.cancel();
    const epoch = this.#epoch;
    const board = this.read();
    const config = this.readDecisionConfig(board);
    if (this.#usedTurns.has(board.turn)) throw Error('This NPC turn was already handed to execution. Continue manually.');
    if (config.mode === 'policy') return this.#planPolicy(board,config,epoch);
    if (config.mode !== 'model') throw Error('Choose model or policy decision mode in module settings. No action was taken.');
    const options = pickTop(generateCandidates(board.snapshot)
      .filter(o => ['attack', 'boost', 'retreat', 'hold'].includes(o.action.kind)), 8);
    if (!options.length) throw Error('No supported legal options are available. Play this turn manually.');
    const payload = buildPrompt(board.snapshot, options);
    this.#pending = new AbortController();
    const signal = this.#pending.signal;
    let choice;
    try {
      const gone = () => epoch !== this.#epoch || signal.aborted;
      const autoFallback = error => ({ status: 'fallback', source: 'fallback', optionId: options[0].id,
        reason: AUTO_FALLBACK_REASON, line: '', error });
      for (let attempt = 0; attempt < 2; attempt++) {
        let text;
        try { text = await this.request(structuredClone(payload), auto ? { signal, timeoutMs: AUTO_MODEL_TIMEOUT_MS } : { signal }); }
        catch (e) {
          if (!auto) throw e;
          if (gone()) throw Error('Planning was cancelled or superseded.');
          choice = autoFallback(e?.message ?? String(e)); break;
        }
        if (epoch !== this.#epoch) throw Error('Planning was cancelled or superseded.');
        choice = interpretReply(text, options, { attempt });
        if (choice.status === 'fallback' && auto) choice = autoFallback(choice.error);
        if (choice.status !== 'retry') break;
        payload.messages.push({ role: 'assistant', content: text },
          { role: 'user', content: retryMessage(choice.error, options) });
      }
      if (epoch !== this.#epoch) throw Error('Planning was cancelled or superseded.');
      const review = { ...structuredClone(board), mode:'model',state:'ready',diagnostics:[],options: structuredClone(options), choice: structuredClone(choice) };
      // Keep the authoritative board/options private; callers may edit their UI copy.
      this.#review = { public: review, board, config:structuredClone(config),state:'ready',options: structuredClone(options), choice: structuredClone(choice) };
      return review;
    } finally { if (epoch === this.#epoch) this.#pending = null; }
  }

  async #planPolicy(board,config,epoch) {
    this.#pending = new AbortController();
    const signal=this.#pending.signal;
    try {
      let context;
      try {
        if (!this.resolvePolicyContext) throw Error('Policy context is unavailable; bind a supported NPC class or play manually.');
        context=await this.resolvePolicyContext(board,structuredClone(config),{signal});
      } catch(e) {
        if(signal.aborted || epoch!==this.#epoch) throw Error('Planning was cancelled or superseded.');
        context={state:'needs-input',coverageGaps:[e.message]};
      }
      if(epoch!==this.#epoch || signal.aborted) throw Error('Planning was cancelled or superseded.');
      const fresh=this.read(),freshConfig=this.readDecisionConfig(fresh);
      if(fresh.turn!==board.turn || fresh.stamp!==board.stamp || freshConfig.stamp!==config.stamp) {
        this.cancel();throw Error('The board or decision configuration changed during planning. Re-plan.');
      }
      let decision;
      if(!['ready','partial'].includes(context.state)) decision={state:context.state ?? 'needs-input',candidates:[],evaluations:[],
        selectedKey:null,diagnostics:context.coverageGaps ?? ['Policy configuration requires input.']};
      else {
        const candidates=generatePolicyCandidates(context);
        decision=selectPolicyDecision(candidates,context);
      }
      const options=decision.candidates;
      const selected=options.find(o=>o.key===decision.selectedKey);
      const explanation=selected ? explainEvaluation(decision.evaluations.find(e=>e.planKey===selected.key),context)
        : {reason:'No supported policy choice. Check the class binding and coverage diagnostics, re-plan, or play manually.',warnings:[]};
      const choice={source:'policy',optionId:selected?.id ?? null,reason:explanation.reason,line:''};
      const diagnostics=[...decision.diagnostics,...(decision.search?.limitations ?? [])];
      const warnings=[...(board.warnings ?? []),...diagnostics,...new Set(decision.evaluations.flatMap(e=>e.warnings))];
      const review={...structuredClone(board),mode:'policy',state:decision.state,policyId:context.policy?.id ?? null,
        diagnostics:structuredClone(diagnostics),warnings,options:structuredClone(options),choice:structuredClone(choice)};
      this.#review={public:review,board,config:structuredClone(config),state:decision.state,
        options:structuredClone(options),choice:structuredClone(choice),decision:structuredClone(decision)};
      return review;
    } finally { if(epoch===this.#epoch) this.#pending=null; }
  }

  async approve(review, optionId, { verify } = {}) {
    const stored = this.#review;
    if (this.#executing || !stored || stored.public !== review) throw Error('This review expired or was already used. Re-plan.');
    if (!['ready','partial'].includes(stored.state) || !stored.options.length) throw Error('This policy needs input or configuration. Re-plan or play manually.');
    if (!this.canExecute()) throw Error('Execution is disabled. Enable it only after staged acceptance checks.');
    const fresh = this.read();
    const config=this.readDecisionConfig(fresh);
    if (!fresh.terrainReviewed) throw Error('Review and configure scene terrain before execution.');
    if (fresh.turn !== stored.board.turn || fresh.stamp !== stored.board.stamp || config.stamp !== stored.config.stamp) {
      this.cancel(); throw Error('The board or turn changed. Re-plan before approving.');
    }
    const option = stored.options.find(o => o.id === optionId);
    if (!option) throw Error('Choose one of the offered options.');
    this.#executing = true; this.#review = null;
    this.#usedTurns.add(fresh.turn);
    // Bound client memory, retaining recent turns. Persistent reservations and
    // exact native tracker checks additionally protect reloads and other GM clients.
    if (this.#usedTurns.size > 100) this.#usedTurns.delete(this.#usedTurns.values().next().value);
    const verifyDecision = board => {
      if(!this.canExecute()) throw Error('Execution is disabled. Continue manually.');
      if(this.readDecisionConfig(board).stamp!==stored.config.stamp)
        throw Error('The decision configuration changed. Re-plan before execution.');
      verify?.(board);
    };
    try { return await this.execute(structuredClone(option), fresh, structuredClone(stored.choice), {verifyDecision}); }
    finally { this.#executing = false; }
  }
}

/** Browser -> local relay. API keys never enter this interface. */
export async function requestDecision(payload, settings, { fetchImpl = fetch, signal, timeoutMs, maxTokens = 1500, temperature } = {}) {
  const url = new URL(settings.relayUrl);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw Error('Use a relay origin without credentials, path, query or fragment.');
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) throw Error('Relay requires HTTPS or HTTP loopback.');
  if (!settings.secret) throw Error('Configure the relay shared secret on this GM client.');
  if (!['anthropic', 'openai'].includes(settings.provider)) throw Error('Choose a supported provider.');
  const timeout = AbortSignal.timeout(timeoutMs ?? settings.timeoutMs ?? 125000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response;
  try {
    response = await fetchImpl(new URL('/v1/decide', url).href, { method: 'POST', redirect: 'error',
      credentials: 'omit', cache: 'no-store', signal: requestSignal,
      headers: { 'Content-Type': 'application/json', 'X-Pilot-Secret': settings.secret },
      body: JSON.stringify({ ...payload, provider: settings.provider, model: settings.model || undefined, maxTokens,
        ...(temperature === undefined ? {} : { temperature }) }) });
  } catch {
    if (signal?.aborted) throw Error('Planning cancelled.');
    if (timeout.aborted) throw Error('Model request timed out. No action was taken.');
    throw Error('Cannot reach the relay. Check its process, URL, CORS and browser local-network permission.');
  }
  if (!response.ok) throw Error(`Relay request failed (HTTP ${response.status}). Check the relay configuration.`);
  const body = await response.json();
  if (typeof body.text !== 'string' || body.text.length > 100000) throw Error('The relay returned an invalid reply.');
  return body.text;
}
