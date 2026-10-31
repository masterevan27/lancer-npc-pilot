// Model reply parsing and validation. No Foundry or browser globals.
//
// Flow for the caller (docs/design.md, "Prompt and reply"):
//   let res = interpretReply(text, options, { attempt: 0 });
//   if (res.status === 'retry')  -> ask the model once more (res.error says why),
//                                   then interpretReply(text2, options, { attempt: 1 })
//   res.status is then 'ok' (model's pick) or 'fallback' (top-scored option,
//   label it "fallback" in the UI). The model never gets a third try.

import { LINE_MAX_WORDS, REASON_MAX_WORDS } from './prompt.mjs';

/**
 * Pull the first JSON object containing an "option" key out of free text:
 * handles code fences, leading/trailing prose and several objects.
 * @returns {object|null}
 */
export function extractJson(text) {
  if (typeof text !== 'string') return null;
  const stripped = text.replace(/```(?:json|JSON)?/g, '');
  const direct = tryParse(stripped.trim());
  if (isChoice(direct)) return direct;
  for (let i = stripped.indexOf('{'); i !== -1; i = stripped.indexOf('{', i + 1)) {
    const end = matchBrace(stripped, i);
    if (end === -1) continue;
    const obj = tryParse(stripped.slice(i, end + 1));
    if (isChoice(obj)) return obj;
  }
  return null;
}

function isChoice(v) {
  return v && typeof v === 'object' && !Array.isArray(v) && 'option' in v;
}

function tryParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

/** Index of the brace closing the one at `start`, string-aware; -1 if none. */
function matchBrace(s, start) {
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '{') depth++;
    else if (ch === '}' && --depth === 0) return i;
  }
  return -1;
}

/** "a", " B. ", "Option C", "(D)" -> "A" / "B" / "C" / "D". */
export function normalizeId(v) {
  if (typeof v === 'number') return null;
  return String(v ?? '')
    .trim()
    .replace(/^option\s*/i, '')
    .replace(/^[\s([{"']+|[\s)\]}"'.:,;!]+$/g, '')
    .toUpperCase();
}

/** Clean model text for display: drop control chars, collapse spaces, cap words. */
export function clip(text, maxWords) {
  if (typeof text !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  const clean = text.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}…` : clean;
}

/**
 * Parse and validate a reply against the offered options.
 * @param {string} text   Raw model output.
 * @param {{id:string, score:number}[]} options
 * @param {{attempt?:number, maxRetries?:number}} [opts]  attempt is 0 for the first reply.
 * @returns {{
 *   status:'ok'|'retry'|'fallback',
 *   optionId:string|null, option:object|null,
 *   reason:string, line:string,
 *   source:'model'|'fallback'|null,
 *   error:string|null
 * }}
 */
export function interpretReply(text, options, opts = {}) {
  const attempt = opts.attempt ?? 0;
  const maxRetries = opts.maxRetries ?? 1;
  const fail = (error) => {
    if (attempt < maxRetries) {
      return { status: 'retry', optionId: null, option: null, reason: '', line: '', source: null, error };
    }
    const top = topOption(options);
    return {
      status: 'fallback', optionId: top?.id ?? null, option: top, reason: '', line: '',
      source: 'fallback', error,
    };
  };

  if (!Array.isArray(options) || options.length === 0) {
    return { status: 'fallback', optionId: null, option: null, reason: '', line: '', source: 'fallback', error: 'no options offered' };
  }
  const obj = extractJson(text);
  if (!obj) return fail('reply contained no JSON object with an "option" field');
  const id = normalizeId(obj.option);
  const option = options.find((o) => String(o.id).toUpperCase() === id);
  if (!option) return fail(`"${String(obj.option).slice(0, 20)}" is not one of ${options.map((o) => o.id).join(', ')}`);
  return {
    status: 'ok', optionId: option.id, option,
    reason: clip(obj.reason, REASON_MAX_WORDS),
    line: clip(obj.line, LINE_MAX_WORDS),
    source: 'model', error: null,
  };
}

/** The message to send back for the single retry. */
export function retryMessage(error, options) {
  return `Your reply could not be used: ${error}. Reply again with JSON only, `
    + `{"option": "<one of ${options.map((o) => o.id).join(', ')}>", "reason": "...", "line": "..."}.`;
}

function topOption(options) {
  return options.reduce((best, o) => (best === null || o.score > best.score ? o : best), null);
}
