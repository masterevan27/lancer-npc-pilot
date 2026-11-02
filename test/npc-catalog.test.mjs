import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { summarizeCatalog, auditInstalledCatalog } from '../tools/audit-npc-catalog.mjs';

const feature = (id, type, system = {}) => ({ _id: 'PRIVATE_WORLD_ID', name: id, type: 'npc_feature',
  system: { lid: id, type, ...system } });

test('catalogue summarizes classes, templates, shapes and crosslinks without raw prose or world IDs', () => {
  const records = [
    { name: 'Class', type: 'npc_class', system: { lid: 'class', base_features: ['rifle'], optional_features: ['tech'] } },
    { name: 'Template', type: 'npc_template', system: { lid: 'template', base_features: ['trait'], optional_features: ['absent'] } },
    feature('rifle', 'Weapon', { range: [{ type: 'Range', val: 5 }, { type: 'Blast', val: 1 }],
      tags: [{ lid: 'tg_loading' }], effect: 'PRIVATE_EFFECT_TEXT two attacks', on_hit: 'PRIVATE_ON_HIT_TEXT' }),
    feature('tech', 'Tech', { effect: 'PRIVATE_TECH_TEXT must make a save and teleport.', tags: [{ lid: 'tg_quick_tech' }] }),
    feature('trait', 'Trait', { effect: 'PRIVATE_TRAIT_TEXT', trigger: 'PRIVATE_TRIGGER_TEXT on reaction' }),
  ];
  const before = structuredClone(records), result = summarizeCatalog(records);
  assert.deepEqual(records, before);
  assert.equal(result.counts.classes, 1); assert.equal(result.counts.templates, 1); assert.equal(result.counts.features, 3);
  assert.equal(result.counts.unresolvedReferences, 1);
  assert.deepEqual(result.classes[0].features, [
    { id: 'rifle', kind: 'base', resolved: true, type: 'Weapon' },
    { id: 'tech', kind: 'optional', resolved: true, type: 'Tech' },
  ]);
  assert.deepEqual(result.rangeShapes, { 'Blast/Range': 1 });
  assert.equal(result.effectOnlyCount, 2);
  assert.deepEqual(result.features.find(x => x.id === 'tech').proseSignals, ['forcedMovement', 'saveOrCheck']);
  assert.equal(result.features.find(x => x.id === 'rifle').hasOnHit, true);
  assert.equal(result.features.find(x => x.id === 'trait').hasTrigger, true);
  assert(!JSON.stringify(result).includes('PRIVATE_'));
  assert.equal(result.inventoryOnly, true);
});

test('invalid, missing and wrong-kind crosslinks are reported, including template links', () => {
  const result = summarizeCatalog([
    { type: 'npc_class', system: { lid: 'class', base_features: ['template', null, { uuid: 'PRIVATE_UUID' }], optional_features: 'bad' } },
    { type: 'npc_template', system: { lid: 'template', base_features: ['absent', 'feature'] } },
    feature('feature', 'Unexpected'),
    feature('feature', 'Unexpected'),
    { type: 'npc_feature', system: { type: 'Trait' } },
    { type: 'other', system: { lid: 'ignored' } },
  ]);
  assert.equal(result.counts.unresolvedReferences, 6);
  assert(result.unresolved.some(reference => reference.reason === 'Feature lid is ambiguous.'));
  assert.equal(result.counts.missingIds, 1);
  assert.deepEqual(result.duplicates, [{ id: 'feature', count: 2 }]);
  assert.deepEqual(result.unknownFeatureTypes, ['feature', 'feature']);
  assert(!JSON.stringify(result).includes('PRIVATE_UUID'));
});

test('empty catalogue is valid and malformed records do not throw', () => {
  assert.equal(summarizeCatalog([null, {}, 1]).counts.features, 0);
  assert.deepEqual(summarizeCatalog([]).features, []);
  assert.throws(() => summarizeCatalog(null), /array/);
});

test('feature fingerprints ignore key order and runtime readiness but bind rule fields', () => {
  const original = feature('rifle', 'Weapon', { weapon_type: 'Main Rifle',
    range: [{ type: 'Range', val: 5 }], damage: [[{ type: 'Kinetic', val: '5' }]],
    tags: [{ lid: 'tg_loading', val: '' }], effect: 'Private source rules.', on_hit: '',
    activation: 'Quick', tier_override: 0, bonus: { armor: 1 },
    loaded: false, charged: false, destroyed: false, disabled: false, uses: 0,
    uses_per_turn: { value: 0 }, uses_per_round: { value: 0 }, uses_per_scene: { value: 0 } });
  original._stats = { systemVersion: '3.1.3' };
  const report = record => summarizeCatalog([record]).features[0];
  const baseline = report(original);
  assert.match(baseline.sourceFingerprint, /^[a-f0-9]{64}$/);
  assert.equal(baseline.sourceVersion, '3.1.3');
  const reordered = structuredClone(original);
  reordered.system = Object.fromEntries(Object.entries(reordered.system).reverse());
  reordered.system.range[0] = { val: 5, type: 'Range' };
  assert.equal(report(reordered).sourceFingerprint, baseline.sourceFingerprint);
  const runtime = structuredClone(original);
  Object.assign(runtime.system, { loaded: true, charged: true, destroyed: true, disabled: true,
    uses: { value: 4, max: 5 }, uses_per_turn: { value: 1 }, uses_per_round: { value: 2 }, uses_per_scene: { value: 3 } });
  assert.equal(report(runtime).sourceFingerprint, baseline.sourceFingerprint);
  for (const change of [s => { s.effect += ' Changed.'; }, s => { s.range[0].val++; },
    s => { s.type = 'Tech'; }, s => { s.on_hit = 'Push'; }, s => { s.activation = 'Full'; },
    s => { s.tier_override = 2; }, s => { s.bonus.armor++; }, s => { s.tags[0].val = '2'; }]) {
    const edited = structuredClone(original); change(edited.system);
    assert.notEqual(report(edited).sourceFingerprint, baseline.sourceFingerprint);
  }
  assert.equal(report(feature('unknown', 'Trait')).sourceVersion, 'unrecorded');
  assert(!JSON.stringify(baseline).includes('Private source rules.'));
});

test('installed reader requires both explicit paths before touching a database', async () => {
  await assert.rejects(auditInstalledCatalog({}), /required/);
});

test('reader opens only a disposable copy even when the database library writes a lock', async t => {
  const tempRoot = resolve(tmpdir());
  const root = mkdtempSync(join(tempRoot, 'npc-catalog-test-'));
  t.after(() => {
    assert.equal(dirname(root), tempRoot); assert(basename(root).startsWith('npc-catalog-test-'));
    rmSync(root, { recursive: true, force: true });
  });
  const pack = join(root, 'pack'), codeRoot = join(root, 'code');
  const dependency = join(codeRoot, 'node_modules', 'classic-level');
  mkdirSync(pack); mkdirSync(dependency, { recursive: true });
  const bytes = JSON.stringify(feature('synthetic', 'Weapon', { range: [{ type: 'Range', val: 5 }] }));
  writeFileSync(join(pack, 'record.json'), bytes);
  let openedCopy;
  const witness = join(root, 'opened-copy.txt');
  writeFileSync(join(dependency, 'index.js'), `
    const fs = require('node:fs'), path = require('node:path');
    exports.ClassicLevel = class {
      constructor(directory) { this.directory = directory; }
      async open() {
        fs.writeFileSync(path.join(this.directory, 'LOCK'), 'library wrote a lock');
        fs.writeFileSync(${JSON.stringify(witness)}, this.directory);
      }
      async *iterator() { yield ['private-key', fs.readFileSync(path.join(this.directory, 'record.json'), 'utf8')]; }
      async close() {}
    };
  `);
  const result = await auditInstalledCatalog({ packPath: pack, foundryCodeRoot: codeRoot });
  openedCopy = readFileSync(witness, 'utf8');
  assert.notEqual(openedCopy, pack);
  assert.equal(existsSync(openedCopy), false, 'disposable copy is cleaned up');
  assert.deepEqual(readdirSync(pack), ['record.json']);
  assert.equal(readFileSync(join(pack, 'record.json'), 'utf8'), bytes);
  assert.equal(result.counts.features, 1);
  assert(!JSON.stringify(result).includes('private-key'));
});
