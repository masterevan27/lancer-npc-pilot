import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const server = fileURLToPath(new URL('../server.mjs', import.meta.url));

test('server refuses to start without PILOT_SHARED_SECRET', () => {
  const env = { ...process.env, PILOT_ENV_FILE: fileURLToPath(new URL('./no-such.env', import.meta.url)) };
  delete env.PILOT_SHARED_SECRET;
  const r = spawnSync(process.execPath, [server], { env, encoding: 'utf8', timeout: 5000 });
  assert.equal(r.status, 1, 'server must exit, not start');
  assert.match(r.stderr, /refusing to start: PILOT_SHARED_SECRET/);
});
