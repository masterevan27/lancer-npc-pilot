# Relay

A small local HTTP service between the Foundry module and the model. It keeps
the Anthropic API key out of the browser and gives the HTTPS Foundry page one
localhost endpoint for both Claude and a local model (Ollama or any
OpenAI-compatible server). Node 20 or later, no npm packages.

The relay only forwards a prompt and returns the model's text. It never rolls
dice or acts in Foundry; the module and the GM do that.

## Run it on Windows (PowerShell)

1. Install Node.js 20 LTS or later and check: `node --version`.
2. Create your config from the example (from the repository root):

   ```powershell
   Copy-Item relay\.env.example relay\.env
   notepad relay\.env
   ```

3. In `relay\.env`, set `PILOT_SHARED_SECRET` to a long random string. One way
   to make one:

   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
   ```

   Enter the same secret in the module's settings.
4. For Claude, put your key in `relay\.env` as `ANTHROPIC_API_KEY=sk-ant-...`.
   **The key goes in `relay\.env` only.** Not in Foundry settings, world data,
   chat, or Git. `relay/.env` is Git-ignored.
5. For a local model, start Ollama and set `OPENAI_MODEL` to a model that
   `ollama list` shows (for example `gpt-oss:20b`).
6. Start the relay:

   ```powershell
   node relay\server.mjs
   ```

   or `npm run relay`. It prints which providers are ready. Stop it with Ctrl+C.
7. Check it:

   ```powershell
   Invoke-RestMethod http://127.0.0.1:5090/v1/health -Headers @{ 'X-Pilot-Secret' = '<your secret>' }
   ```

The relay refuses to start without `PILOT_SHARED_SECRET`. Variables set in
the real environment override `relay\.env`.

## Configuration

| Variable | Default | Notes |
|---|---|---|
| `PILOT_SHARED_SECRET` | none (required) | Must match the `X-Pilot-Secret` header. |
| `ANTHROPIC_API_KEY` | empty | Without it the `anthropic` provider answers 503. |
| `ANTHROPIC_MODEL` | `claude-opus-5-5` | Default Claude model; a request may override it. `claude-sonnet-5-5` is cheaper. Opus 5.5 defaults to medium effort; `ANTHROPIC_EFFORT=low` is cheaper still. |
| `ANTHROPIC_EFFORT` | unset | `low`, `medium`, `high`, `xhigh` or `max`. Unset uses the model's default. `low` is cheaper and faster for picking from a list. |
| `ANTHROPIC_FALLBACKS` | `default` | `default` sends `fallbacks: "default"` (beta `server-side-fallback-2026-07-01`), so a request the model declines is retried on another model server-side. `off` disables it. Never sent for Haiku models. |
| `ANTHROPIC_BASE_URL` | `https://api.anthropic.com` | For tests. |
| `OPENAI_BASE_URL` | `http://127.0.0.1:11434/v1` | Ollama. KoboldCPP: `http://127.0.0.1:5001/v1`. |
| `OPENAI_MODEL` | `gpt-oss:20b` | Use a name from `ollama list`. |
| `OPENAI_API_KEY` | empty | Sent as `Authorization: Bearer` if set. |
| `HOST` / `PORT` | `127.0.0.1` / `5090` | Keep loopback. |
| `PILOT_ALLOWED_ORIGINS` | `https://foundry.lab.spiralfrenzy.com` | Comma-separated. Browser requests from any other origin get 403. |
| `PILOT_UPSTREAM_TIMEOUT_MS` | `120000` | Per model call. Answers 504 when exceeded. |
| `PILOT_MAX_BODY_BYTES` | `1048576` | Larger request bodies get 413. |
| `PILOT_DEFAULT_MAX_TOKENS` | `16000` | Used when a request has no `maxTokens`. Reasoning models spend part of it thinking. |
| `PILOT_MAX_TOKENS_LIMIT` | `64000` | Upper bound for `maxTokens`. |
| `PILOT_LOG_PROMPTS` | off | `1` logs prompts and replies to the console. Off by default; the normal log line has only method, path, status, time, provider, model and token counts. |
| `PILOT_ENV_FILE` | `relay/.env` | Use another env file. |

## API

All routes except the CORS preflight need the `X-Pilot-Secret` header.

### `GET /v1/health`

```json
{"ok": true, "service": "lancer-npc-pilot-relay", "version": "0.1.0",
 "providers": {
   "anthropic": {"configured": true, "keyPresent": true, "model": "claude-opus-5-5", "baseUrl": "https://api.anthropic.com", "effort": null},
   "openai": {"configured": true, "keyPresent": false, "model": "gpt-oss:20b", "baseUrl": "http://127.0.0.1:11434/v1"}}}
```

It says whether a key is present, never the key.

### `POST /v1/decide`

Request (`Content-Type: application/json`):

```json
{"provider": "anthropic", "model": "optional override",
 "system": "system prompt",
 "messages": [{"role": "user", "content": "..."}],
 "maxTokens": 2000, "temperature": 0.3}
```

`messages` content is plain text, roles are `user` and `assistant`, and the
last message must be `user`. Response:

```json
{"text": "{\"option\":\"o3\",...}", "provider": "anthropic", "model": "claude-opus-5-5",
 "stopReason": "end_turn", "usage": {"inputTokens": 812, "outputTokens": 40},
 "ignored": ["temperature"]}
```

`temperature` is passed to OpenAI-compatible servers. For Anthropic it is
dropped and listed in `ignored`: the API version the relay sends
(`anthropic-version: 2026-10-21`) rejects sampling parameters. `model` is the
model that answered, which can differ from the one asked for when a server-side
fallback ran. `stopReason` of `max_tokens` means the text was cut off.

Errors are JSON, `{"error": {"code": "...", "message": "..."}}`:

| Status | Code | When |
|---|---|---|
| 400 | `invalid_request`, `unknown_provider` | Bad body or provider. |
| 401 | `unauthorized` | Missing or wrong `X-Pilot-Secret`. |
| 403 | `origin_not_allowed` | Browser origin not in `PILOT_ALLOWED_ORIGINS`. |
| 404 / 405 | `not_found` / `method_not_allowed` | |
| 413 | `body_too_large` | |
| 415 | `unsupported_media_type` | Not `application/json`. |
| 502 | `upstream_error` (with `upstreamStatus`), `upstream_unreachable`, `upstream_bad_response`, `upstream_refusal` | The model server failed, could not be reached, sent something unusable, or declined. |
| 503 | `provider_not_configured` | `anthropic` without a key. |
| 504 | `upstream_timeout` | No answer within `PILOT_UPSTREAM_TIMEOUT_MS`. |

### CORS and Private Network Access

Only origins in `PILOT_ALLOWED_ORIGINS` get `Access-Control-Allow-Origin`.
The preflight allows `GET, POST, OPTIONS` and the `Content-Type` and
`X-Pilot-Secret` headers, and answers
`Access-Control-Request-Private-Network: true` with
`Access-Control-Allow-Private-Network: true`, which Chromium asks for when an
HTTPS page calls `127.0.0.1`. Requests with no `Origin` (curl, PowerShell) are
allowed and still need the secret.

## Tests

From the repository root: `node --test` (or `npm test`). The tests run the
relay against a local mock upstream; they make no real model calls.

## Not yet verified live

Cloud development can't reach the owner PC or the Anthropic API with a real
key, so these are checked only against mocks:

- A real Anthropic Messages call (key, `claude-opus-5-5`, the
  `2026-10-21` API version, the `fallbacks` beta, `ANTHROPIC_EFFORT`).
- A real Ollama `/v1/chat/completions` call with gpt-oss, including how much
  of `maxTokens` its reasoning uses.
- The browser on `https://foundry.lab.spiralfrenzy.com` reaching
  `http://127.0.0.1:5090` (PNA preflight, or Chrome's newer local-network
  permission prompt).
- Running on Windows.
