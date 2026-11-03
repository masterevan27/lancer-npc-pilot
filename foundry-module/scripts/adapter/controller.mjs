import { generateCandidates, pickTop } from '../core/options.mjs';
import { buildPrompt } from '../core/prompt.mjs';
import { interpretReply, retryMessage } from '../core/reply.mjs';

/** Pure orchestration with injected I/O. Only approve() can reach execution. */
export class PilotController {
  #epoch = 0;
  #pending = null;
  #review = null;
  #executing = false;
  #usedTurns = new Set();

  constructor({ read, request, execute, canExecute }) {
    Object.assign(this, { read, request, execute, canExecute });
  }

  cancel() {
    this.#epoch++;
    this.#pending?.abort(); this.#pending = null; this.#review = null;
  }

  async plan() {
    if (this.#executing) throw Error('An approved option is still executing.');
    this.cancel();
    const epoch = this.#epoch;
    const board = this.read();
    if (this.#usedTurns.has(board.turn)) throw Error('This NPC turn was already handed to execution. Continue manually.');
    const options = pickTop(generateCandidates(board.snapshot)
      .filter(o => ['attack', 'boost', 'retreat', 'hold'].includes(o.action.kind)), 8);
    if (!options.length) throw Error('No supported legal options are available. Play this turn manually.');
    const payload = buildPrompt(board.snapshot, options);
    this.#pending = new AbortController();
    const signal = this.#pending.signal;
    let choice;
    try {
      for (let attempt = 0; attempt < 2; attempt++) {
        const text = await this.request(structuredClone(payload), { signal });
        if (epoch !== this.#epoch) throw Error('Planning was cancelled or superseded.');
        choice = interpretReply(text, options, { attempt });
        if (choice.status !== 'retry') break;
        payload.messages.push({ role: 'assistant', content: text },
          { role: 'user', content: retryMessage(choice.error, options) });
      }
      if (epoch !== this.#epoch) throw Error('Planning was cancelled or superseded.');
      const review = { ...structuredClone(board), options: structuredClone(options), choice: structuredClone(choice) };
      // Keep the authoritative board/options private; callers may edit their UI copy.
      this.#review = { public: review, board, options: structuredClone(options), choice: structuredClone(choice) };
      return review;
    } finally { if (epoch === this.#epoch) this.#pending = null; }
  }

  async approve(review, optionId) {
    const stored = this.#review;
    if (this.#executing || !stored || stored.public !== review) throw Error('This review expired or was already used. Re-plan.');
    if (!this.canExecute()) throw Error('Execution is disabled. Enable it only after staged acceptance checks.');
    const fresh = this.read();
    if (!fresh.terrainReviewed) throw Error('Review and configure scene terrain before execution.');
    if (fresh.turn !== stored.board.turn || fresh.stamp !== stored.board.stamp) {
      this.cancel(); throw Error('The board or turn changed. Re-plan before approving.');
    }
    const option = stored.options.find(o => o.id === optionId);
    if (!option) throw Error('Choose one of the offered options.');
    this.#executing = true; this.#review = null;
    this.#usedTurns.add(fresh.turn);
    // Bound client memory, retaining recent turns. Persistent reservations and
    // exact native tracker checks additionally protect reloads and other GM clients.
    if (this.#usedTurns.size > 100) this.#usedTurns.delete(this.#usedTurns.values().next().value);
    try { return await this.execute(structuredClone(option), fresh, structuredClone(stored.choice)); }
    finally { this.#executing = false; }
  }
}

/** Browser -> local relay. API keys never enter this interface. */
export async function requestDecision(payload, settings, { fetchImpl = fetch, signal } = {}) {
  const url = new URL(settings.relayUrl);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/')
    throw Error('Use a relay origin without credentials, path, query or fragment.');
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) throw Error('Relay requires HTTPS or HTTP loopback.');
  if (!settings.secret) throw Error('Configure the relay shared secret on this GM client.');
  if (!['anthropic', 'openai'].includes(settings.provider)) throw Error('Choose a supported provider.');
  const timeout = AbortSignal.timeout(settings.timeoutMs ?? 125000);
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
  let response;
  try {
    response = await fetchImpl(new URL('/v1/decide', url).href, { method: 'POST', redirect: 'error',
      credentials: 'omit', cache: 'no-store', signal: requestSignal,
      headers: { 'Content-Type': 'application/json', 'X-Pilot-Secret': settings.secret },
      body: JSON.stringify({ ...payload, provider: settings.provider, model: settings.model || undefined, maxTokens: 1500 }) });
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
