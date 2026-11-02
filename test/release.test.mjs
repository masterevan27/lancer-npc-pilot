import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const shell = process.platform === 'win32' ? 'powershell.exe' : 'pwsh';
const available = !spawnSync(shell, ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.ToString()']).error;
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'pilot-release-test-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  for (const path of ['VERSION', 'package.json', 'LICENSE', 'foundry-module']) {
    cpSync(join(root, path), join(dir, path), { recursive: true });
  }
  return dir;
}
function build(dir, tag) {
  return spawnSync(shell, ['-NoProfile', '-File', join(root, 'tools/build-release.ps1'),
    '-ProjectRoot', dir, '-Tag', tag], { encoding: 'utf8' });
}

test('release ZIP installs from its root and excludes relay, tests and local configuration', { skip: !available }, t => {
  const dir = fixture(t);
  const version = readFileSync(join(dir, 'VERSION'), 'utf8').trim();
  mkdirSync(join(dir, 'relay'));
  writeFileSync(join(dir, 'relay/.env'), 'TEST_ONLY_SENTINEL');
  writeFileSync(join(dir, 'foundry-module/scripts/local.env'), 'TEST_ONLY_SENTINEL');
  const result = build(dir, `v${version}`);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const unpack = spawnSync(shell, ['-NoProfile', '-Command',
    "Expand-Archive -LiteralPath $env:PILOT_TEST_ZIP -DestinationPath $env:PILOT_TEST_OUT"], {
    env: { ...process.env, PILOT_TEST_ZIP: join(dir, 'dist/lancer-npc-pilot.zip'), PILOT_TEST_OUT: join(dir, 'unpacked') },
    encoding: 'utf8'
  });
  assert.equal(unpack.status, 0, unpack.stderr);
  const manifestBytes = readFileSync(join(dir, 'dist/module.json'));
  assert.deepEqual(readFileSync(join(dir, 'unpacked/module.json')), manifestBytes);
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.manifest, 'https://github.com/masterevan27/lancer-npc-pilot/releases/latest/download/module.json');
  assert.equal(manifest.download, `https://github.com/masterevan27/lancer-npc-pilot/releases/download/v${version}/lancer-npc-pilot.zip`);
  assert.equal(manifest.version, version);
  for (const path of [...manifest.esmodules, ...manifest.styles, 'LICENSE', 'scripts/core/options.mjs']) {
    assert.ok(existsSync(resolve(dir, 'unpacked', path)), path);
  }
  for (const path of ['relay', 'test', 'tools', '.env', 'scripts/local.env', 'scripts/core/README.md']) {
    assert.equal(existsSync(join(dir, 'unpacked', path)), false, path);
  }
});

test('wrong release tag fails before producing artifacts', { skip: !available }, t => {
  const dir = fixture(t);
  const result = build(dir, 'v999.0.0');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /Tag must match VERSION/);
  assert.equal(existsSync(join(dir, 'dist/module.json')), false);
});

test('inconsistent version sources fail before producing artifacts', { skip: !available }, t => {
  const dir = fixture(t);
  writeFileSync(join(dir, 'VERSION'), '999.0.0\n');
  const result = build(dir, 'v999.0.0');
  assert.notEqual(result.status, 0);
  assert.match(result.stdout + result.stderr, /Version sources disagree/);
  assert.equal(existsSync(join(dir, 'dist/module.json')), false);
});
