// Relay configuration: process env plus an optional Git-ignored relay/.env.
// Values already set in the process environment win over the file.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

export const DEFAULTS = Object.freeze({
  HOST: '127.0.0.1',
  PORT: 5090,
  PILOT_ALLOWED_ORIGINS: 'https://foundry.lab.spiralfrenzy.com',
  ANTHROPIC_BASE_URL: 'https://api.anthropic.com',
  // Current Sonnet (claude-api skill, models cached 2026-10-06). Override with ANTHROPIC_MODEL.
  ANTHROPIC_MODEL: 'claude-opus-5-5',
  OPENAI_BASE_URL: 'http://127.0.0.1:11434/v1',
  OPENAI_MODEL: 'gpt-oss:20b',
  PILOT_UPSTREAM_TIMEOUT_MS: 120_000,
  PILOT_MAX_BODY_BYTES: 1_048_576,
  PILOT_DEFAULT_MAX_TOKENS: 16_000,
  PILOT_MAX_TOKENS_LIMIT: 64_000,
});

export const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

/**
 * Parse dotenv-style text. Supports `KEY=value`, `export KEY=value`,
 * `#` comments, blank lines, single quotes (literal), double quotes
 * (\n \r \t \" \\ escapes), inline ` #` comments on unquoted values,
 * a UTF-8 BOM and CRLF line endings.
 * @param {string} text
 * @returns {Record<string, string>}
 */
export function parseEnv(text) {
  const out = {};
  const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('export ')) line = line.slice(7).trimStart();
    const eq = line.indexOf('=');
    if (eq <= 0) throw new Error(`relay/.env line ${i + 1}: expected KEY=value`);
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      throw new Error(`relay/.env line ${i + 1}: invalid key`);
    }
    let raw = line.slice(eq + 1).trim();
    let value;
    if (raw.startsWith('"')) {
      const end = findClosingQuote(raw);
      if (end < 0) throw new Error(`relay/.env line ${i + 1}: unterminated "`);
      value = raw.slice(1, end).replace(/\\([nrt"\\])/g, (_, c) =>
        ({ n: '\n', r: '\r', t: '\t', '"': '"', '\\': '\\' })[c]);
    } else if (raw.startsWith("'")) {
      const end = raw.indexOf("'", 1);
      if (end < 0) throw new Error(`relay/.env line ${i + 1}: unterminated '`);
      value = raw.slice(1, end);
    } else {
      const hash = raw.search(/\s#/);
      value = (hash >= 0 ? raw.slice(0, hash) : raw).trim();
    }
    out[key] = value;
  }
  return out;
}

function findClosingQuote(raw) {
  for (let j = 1; j < raw.length; j++) {
    if (raw[j] === '\\') { j++; continue; }
    if (raw[j] === '"') return j;
  }
  return -1;
}

/** Read relay/.env if it exists; returns {} when absent. */
export function readEnvFile(path = join(dirname(fileURLToPath(import.meta.url)), '.env')) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') return {};
    throw err;
  }
  return parseEnv(text);
}

function int(value, name, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }
  return n;
}

const trimSlash = (s) => s.replace(/\/+$/, '');

/**
 * Build the relay config from an env-like object. Pure: no I/O.
 * Throws with a readable message on invalid or missing required values.
 * @param {Record<string, string|undefined>} env
 */
export function buildConfig(env) {
  const secret = env.PILOT_SHARED_SECRET ?? '';
  if (!secret.trim()) {
    throw new Error('PILOT_SHARED_SECRET is not set. Put it in relay/.env (see relay/.env.example).');
  }
  const effort = (env.ANTHROPIC_EFFORT ?? '').trim();
  if (effort && !EFFORT_LEVELS.includes(effort)) {
    throw new Error(`ANTHROPIC_EFFORT must be one of ${EFFORT_LEVELS.join(', ')}`);
  }
  const fallbacks = (env.ANTHROPIC_FALLBACKS ?? 'default').trim();
  if (!['default', 'off'].includes(fallbacks)) {
    throw new Error('ANTHROPIC_FALLBACKS must be "default" or "off"');
  }
  const maxTokensLimit = int(env.PILOT_MAX_TOKENS_LIMIT, 'PILOT_MAX_TOKENS_LIMIT', DEFAULTS.PILOT_MAX_TOKENS_LIMIT);
  return Object.freeze({
    host: env.HOST || DEFAULTS.HOST,
    port: int(env.PORT, 'PORT', DEFAULTS.PORT, { min: 0, max: 65535 }),
    sharedSecret: secret,
    allowedOrigins: (env.PILOT_ALLOWED_ORIGINS ?? DEFAULTS.PILOT_ALLOWED_ORIGINS)
      .split(',').map((s) => trimSlash(s.trim())).filter(Boolean),
    logPrompts: env.PILOT_LOG_PROMPTS === '1',
    upstreamTimeoutMs: int(env.PILOT_UPSTREAM_TIMEOUT_MS, 'PILOT_UPSTREAM_TIMEOUT_MS', DEFAULTS.PILOT_UPSTREAM_TIMEOUT_MS),
    maxBodyBytes: int(env.PILOT_MAX_BODY_BYTES, 'PILOT_MAX_BODY_BYTES', DEFAULTS.PILOT_MAX_BODY_BYTES),
    defaultMaxTokens: Math.min(
      int(env.PILOT_DEFAULT_MAX_TOKENS, 'PILOT_DEFAULT_MAX_TOKENS', DEFAULTS.PILOT_DEFAULT_MAX_TOKENS),
      maxTokensLimit),
    maxTokensLimit,
    anthropic: Object.freeze({
      apiKey: env.ANTHROPIC_API_KEY || '',
      baseUrl: trimSlash(env.ANTHROPIC_BASE_URL || DEFAULTS.ANTHROPIC_BASE_URL),
      model: env.ANTHROPIC_MODEL || DEFAULTS.ANTHROPIC_MODEL,
      effort: effort || null,
      fallbacks,
    }),
    openai: Object.freeze({
      apiKey: env.OPENAI_API_KEY || '',
      baseUrl: trimSlash(env.OPENAI_BASE_URL || DEFAULTS.OPENAI_BASE_URL),
      model: env.OPENAI_MODEL || DEFAULTS.OPENAI_MODEL,
    }),
  });
}

/** Process env layered over relay/.env (or the file named by PILOT_ENV_FILE). */
export function loadConfig({ env = process.env, envFile } = {}) {
  envFile ??= env.PILOT_ENV_FILE ? readEnvFile(env.PILOT_ENV_FILE) : readEnvFile();
  return buildConfig({ ...envFile, ...env });
}
