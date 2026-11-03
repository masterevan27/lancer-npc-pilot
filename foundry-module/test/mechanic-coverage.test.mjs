import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_CATALOGUE, NPC_CLASSES, NPC_TEMPLATES } from '../scripts/rules/npc-catalogue.mjs';
import { NPC_DESCRIPTORS, COVERAGE_GATES } from '../scripts/rules/npc-descriptors.mjs';
import { NPC_MECHANICS, NPC_MECHANIC_REVIEW } from '../scripts/rules/npc-mechanics.mjs';
import { buildCoverageManifest, validateCoverageManifest, auditMechanicCoverage, coverageDiagnostic } from '../scripts/core/coverage.mjs';
import { resolveAbility } from '../scripts/core/abilities.mjs';

const owners = { classes: NPC_CLASSES, templates: NPC_TEMPLATES };
const make = () => buildCoverageManifest(NPC_CATALOGUE, owners, []);

test('work manifest preserves every frozen feature, tier and owner without implying implementation', () => {
  const manifest = make();
  assert.equal(manifest.length, 461);
  assert.equal(validateCoverageManifest(manifest, NPC_CATALOGUE, owners).ok, true);
  const report = auditMechanicCoverage(NPC_CATALOGUE, manifest, owners);
  assert.equal(report.entries.length, 461);
  assert.equal(report.entries.flatMap(e => e.tiers).length, 1383);
  assert.equal(report.owners.length, 59);
  assert(report.owners.every(o => o.complete === false && o.unresolved.length > 0));
  assert.equal(report.complete, false);
  assert.equal(report.executable.totals.supported, 0);
  assert.equal(report.byChunk[1].unresolvedMechanics, 461);
  assert.equal(report.byChunk[6].provisionalFeatures, 251);
  assert.deepEqual(report.unassigned, ['npcf_got_your_back_archer', 'npcf_void_rend']);
  for (const row of manifest) {
    assert.equal(row.review, 'unreviewed');
    assert.equal(row.mechanics[0].owningChunk, 1);
    assert.equal(row.mechanics[0].status, 'unresolved');
    assert.equal(row.routingHint.basis, 'inventory-kind-hint');
    assert(row.routingHint.gates.every(id => COVERAGE_GATES[id]?.acceptance.length > 0));
  }
});

test('missing, duplicate, extra and source-drifted manifest rows remain visible failures', () => {
  for (const change of [
    m => m.pop(), m => m.push(structuredClone(m[0])),
    m => { m[0].lid = 'custom_unknown'; },
    m => { m[0].sourceFingerprint = 'edited'; },
    m => { m[0].sourceVersion = '3.1.4'; },
    m => { m[0].tiers = [1]; },
    m => { m[0].mechanics[0].owningChunk = 0; },
    m => { m[0].routingHint.gates = ['made-up-gate']; },
    m => { m[0].mechanics[0].gates = {}; },
    m => { m[0].owners = []; },
  ]) {
    const manifest = make(); change(manifest);
    const checked = validateCoverageManifest(manifest, NPC_CATALOGUE, owners);
    assert.equal(checked.ok, false);
    assert(checked.errors.length > 0);
    assert.equal(auditMechanicCoverage(NPC_CATALOGUE, manifest, owners).complete, false);
  }
});

test('kind routing stays provisional and cannot turn a catalogue ID into source authority', () => {
  for (const kind of ['Weapon', 'Trait', 'System', 'Tech', 'Reaction', 'Custom']) {
    const result = coverageDiagnostic({ lid: NPC_CATALOGUE[0].lid, kind }, NPC_CATALOGUE);
    assert.equal(result.coverage, 'manual');
    assert.equal(result.sourceMatch, 'not-verified');
    assert.equal(result.owningChunk, 1);
    assert(result.message.includes('Chunk 1'));
  }
  const unknown = coverageDiagnostic({ lid: 'custom', kind: 'Trait' }, NPC_CATALOGUE);
  assert.equal(unknown.catalogueKnown, false);
  assert(unknown.message.includes('Chunk 6'));
  const manifest = make();
  const entry = NPC_CATALOGUE.find(e => e.kind === 'Trait');
  assert.equal(resolveAbility(entry, { systemVersion: '3.1.3', tier: 1,
    descriptors: NPC_DESCRIPTORS, handlers: [] }).coverage, 'manual');
  assert.equal(auditMechanicCoverage(NPC_CATALOGUE, manifest, owners).complete, false);
});

test('unresolved associations and malformed data cannot disappear or execute accessors', () => {
  const broken = structuredClone(owners);
  broken.classes[0].features.push({ lid: 'missing_feature', kind: 'optional' });
  const report = auditMechanicCoverage(NPC_CATALOGUE, make(), broken);
  assert(report.errors.some(e => e.includes('missing_feature')));
  assert.equal(report.entries.length, 461, 'A broken owner reference must not hide the feature catalogue.');
  assert.equal(report.owners.length, 59);
  assert.equal(report.executable.totals.entries, 461);
  assert(report.owners.some(o => o.unresolved.includes('missing_feature')));
  assert.equal(report.complete, false);
  for (const input of [null, [], [null], [() => {}]]) {
    assert.doesNotThrow(() => assert.equal(validateCoverageManifest(input, NPC_CATALOGUE, owners).ok, false));
  }
  const accessor = [];
  Object.defineProperty(accessor, '0', { enumerable: true, get() { assert.fail('Getter ran'); } });
  assert.equal(validateCoverageManifest(accessor, NPC_CATALOGUE, owners).ok, false);
});

test('source catalogue duplicates and malformed rows remain accounted without support', () => {
  const duplicated = [...NPC_CATALOGUE, structuredClone(NPC_CATALOGUE[0])];
  const report = auditMechanicCoverage(duplicated, make(), owners);
  assert.equal(report.entries.length, 462);
  assert.equal(report.executable.totals.entries, 462);
  assert.equal(report.complete, false);
  assert(report.errors.some(e => e.includes('Duplicate catalogue')));
  const malformed = auditMechanicCoverage([null], [], { classes: [], templates: [] });
  assert.equal(malformed.entries.length, 1);
  assert.equal(malformed.executable.totals.manual, 1);
  const sparse = new Array(2); sparse[1] = NPC_CATALOGUE[0];
  const sparseReport = auditMechanicCoverage(sparse, [], { classes: [], templates: [] });
  assert.equal(sparseReport.entries.length, 2);
  assert.equal(sparseReport.executable.totals.entries, 2);
  assert.equal(sparseReport.complete, false);
});

test('finishing classification obligations alone cannot establish executable or class coverage', () => {
  const manifest = make();
  for (const row of manifest) {
    row.review = 'reviewed'; row.mechanics[0].status = 'verified';
    row.sourceGaps = [];
    row.mechanics[0].evidence = ['synthetic classification evidence only'];
  }
  const result = auditMechanicCoverage(NPC_CATALOGUE, manifest, owners);
  assert.equal(result.errors.length, 0);
  assert.equal(result.byChunk[1].unresolvedMechanics, 0);
  assert.equal(result.complete, false);
  assert(result.owners.every(o => o.complete === false));
  assert.equal(result.executable.totals.supported, 0);
});

test('exact-source mechanic annotations cover every entry and retain ambiguous source obligations', () => {
  assert.equal(NPC_MECHANICS.length, 461);
  assert.equal(NPC_MECHANIC_REVIEW.sourceVersion, '3.1.3');
  assert.equal(new Set(NPC_MECHANICS.map(e => e.lid)).size, 461);
  const byId = new Map(NPC_MECHANICS.map(e => [e.lid, e]));
  for (const source of NPC_CATALOGUE) {
    const annotation = byId.get(source.lid);
    assert.equal(annotation.sourceFingerprint, source.sourceFingerprint);
    assert.equal(annotation.sourceVersion, source.sourceVersion);
    assert.deepEqual(annotation.tiers, source.tiers);
    assert(annotation.mechanics.length > 0);
    assert(annotation.mechanics.every(m => m.owningChunk >= 2 && m.owningChunk <= 7
      && m.acceptance.length > 0 && m.acceptance.every(s => typeof s === 'string' && s.trim())));
    if (annotation.classification === 'unresolved') assert(annotation.unresolved.length > 0);
  }
  const manifest = buildCoverageManifest(NPC_CATALOGUE, owners, NPC_MECHANICS);
  assert.equal(validateCoverageManifest(manifest, NPC_CATALOGUE, owners).ok, true);
  assert(manifest.some(e => e.review === 'reviewed'));
  assert(manifest.some(e => e.review === 'unreviewed' && e.sourceGaps.length > 0));
  assert(manifest.every(e => e.mechanics.some(m => m.owningChunk > 1 && m.status === 'unresolved' && m.acceptance.length > 0)));
  const report = auditMechanicCoverage(NPC_CATALOGUE, manifest, owners);
  assert.equal(report.complete, false);
  assert.equal(report.executable.totals.supported, 0);
});

test('review annotations cannot attach by ID alone after rules, version or tiers change', () => {
  const annotations = structuredClone(NPC_MECHANICS);
  for (const change of [e => { e.sourceFingerprint = 'edited'; }, e => { e.sourceVersion = '3.1.4'; },
    e => { e.tiers = [1]; }]) {
    const source = structuredClone(NPC_CATALOGUE[0]); change(source);
    const manifest = buildCoverageManifest([source], { classes: [], templates: [] }, annotations);
    assert.equal(manifest[0].review, 'unreviewed');
    assert(manifest[0].sourceGaps.length > 0);
    assert.equal(manifest[0].mechanics[0].status, 'unresolved');
  }
});

test('sparse review, owner and evidence arrays are rejected before skipped holes can grant classification', () => {
  const source = NPC_CATALOGUE[0], emptyOwners = { classes: [], templates: [] };
  const review = { ...source, classification: 'reviewed', unresolved: [], mechanics: new Array(1) };
  let manifest;
  assert.doesNotThrow(() => { manifest = buildCoverageManifest([source], emptyOwners, [review]); });
  assert.equal(manifest[0].review, 'unreviewed');
  review.mechanics = [{ family: 'weapon', owningChunk: 4, acceptance: new Array(1) }];
  assert.equal(buildCoverageManifest([source], emptyOwners, [review])[0].review, 'unreviewed');
  const baseline = buildCoverageManifest([source], emptyOwners, []);
  assert.equal(validateCoverageManifest(baseline, [source], { classes: new Array(1), templates: [] }).ok, false);
  baseline[0].sourceGaps = new Array(1);
  assert.equal(validateCoverageManifest(baseline, [source], emptyOwners).ok, false);
  baseline[0].sourceGaps = []; baseline[0].review = 'reviewed';
  baseline[0].mechanics[0].status = 'verified'; baseline[0].mechanics[0].evidence = new Array(1);
  assert.equal(validateCoverageManifest(baseline, [source], emptyOwners).ok, false);
});
