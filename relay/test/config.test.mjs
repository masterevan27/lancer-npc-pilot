import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseEnv, buildConfig, DEFAULTS } from '../config.mjs';

test('parseEnv handles comments, export, quotes, CRLF and BOM', () => {
  const text = '﻿# comment\r\nexport A=1\r\nB = two words # trailing\r\nC="x\\ny # not a comment"\r\nD=\'lit\\n\'\r\n\r\nE=\r\nF=a=b\r\n';
  assert.deepEqual(parseEnv(text), {
    A: '1', B: 'two words', C: 'x\ny # not a comment', D: 'lit\\n', E: '', F: 'a=b',
  });
});

test('parseEnv rejects malformed lines', () => {
  assert.throws(() => parseEnv('NOEQUALS'), /line 1/);
  assert.throws(() => parseEnv('A="open'), /unterminated/);
  assert.throws(() => parseEnv('1BAD=x'), /invalid key/);
});

test('buildConfig refuses to run without a shared secret', () => {
  assert.throws(() => buildConfig({}), /PILOT_SHARED_SECRET/);
  assert.throws(() => buildConfig({ PILOT_SHARED_SECRET: '   ' }), /PILOT_SHARED_SECRET/);
});

test('buildConfig defaults', () => {
  const c = buildConfig({ PILOT_SHARED_SECRET: 's' });
  assert.equal(c.host, '127.0.0.1');
  assert.equal(c.port, 5090);
  assert.deepEqual(c.allowedOrigins, ['https://foundry.lab.spiralfrenzy.com']);
  assert.equal(c.anthropic.model, DEFAULTS.ANTHROPIC_MODEL);
  assert.equal(c.anthropic.apiKey, '');
  assert.equal(c.openai.baseUrl, 'http://127.0.0.1:11434/v1');
  assert.equal(c.logPrompts, false);
});

test('buildConfig parses lists and validates numbers', () => {
  const c = buildConfig({
    PILOT_SHARED_SECRET: 's', PILOT_ALLOWED_ORIGINS: 'https://a.example/, https://b.example',
    OPENAI_BASE_URL: 'http://localhost:5001/v1/', PORT: '6000', PILOT_LOG_PROMPTS: '1',
  });
  assert.deepEqual(c.allowedOrigins, ['https://a.example', 'https://b.example']);
  assert.equal(c.openai.baseUrl, 'http://localhost:5001/v1');
  assert.equal(c.port, 6000);
  assert.equal(c.logPrompts, true);
  assert.throws(() => buildConfig({ PILOT_SHARED_SECRET: 's', PORT: 'abc' }), /PORT/);
  assert.throws(() => buildConfig({ PILOT_SHARED_SECRET: 's', ANTHROPIC_EFFORT: 'huge' }), /ANTHROPIC_EFFORT/);
});
