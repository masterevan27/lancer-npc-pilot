// Shared helpers for upstream providers.

/** An error with an HTTP status and a stable machine-readable code. */
export class RelayError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

const MAX_UPSTREAM_DETAIL = 500;

/**
 * POST JSON upstream with a timeout. Maps network failures and timeouts to
 * RelayErrors. Returns the parsed JSON body of a 2xx response.
 */
export async function postJson(url, { headers, body, timeoutMs, fetchImpl = fetch, provider }) {
  let res;
  try {
    res = await fetchImpl(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      throw new RelayError(504, 'upstream_timeout',
        `${provider} did not answer within ${timeoutMs} ms`);
    }
    throw new RelayError(502, 'upstream_unreachable',
      `could not reach ${provider} at ${new URL(url).origin}: ${err?.cause?.code ?? err?.message ?? 'network error'}`);
  }
  let text;
  try {
    text = await res.text();
  } catch (err) {
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      throw new RelayError(504, 'upstream_timeout',
        `${provider} did not finish its answer within ${timeoutMs} ms`);
    }
    throw new RelayError(502, 'upstream_unreachable', `${provider} connection failed mid-response`);
  }
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* handled below */ }
  if (!res.ok) {
    const detail = upstreamMessage(json) ?? text.slice(0, MAX_UPSTREAM_DETAIL);
    throw new RelayError(502, 'upstream_error',
      `${provider} returned HTTP ${res.status}${detail ? `: ${detail}` : ''}`,
      { upstreamStatus: res.status });
  }
  if (json === null || typeof json !== 'object') {
    throw new RelayError(502, 'upstream_bad_response', `${provider} returned a non-JSON body`);
  }
  return json;
}

function upstreamMessage(json) {
  const m = json?.error?.message ?? (typeof json?.error === 'string' ? json.error : null) ?? json?.message;
  return typeof m === 'string' ? m.slice(0, MAX_UPSTREAM_DETAIL) : null;
}
