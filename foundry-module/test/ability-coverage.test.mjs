import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDescriptor, resolveAbility, auditCoverage } from '../scripts/core/abilities.mjs';

const descriptor = () => ({
  id: 'test-single-weapon', version: 1, fingerprints: ['sha256:reviewed'],
  systemVersions: ['3.1.3'], tiers: [1, 2, 3], activation: 'Quick',
  cost: { quick: 1 }, targetPolicy: { kind: 'single', side: 'enemy' },
  handlerId: 'single-weapon', coverage: 'supported', gaps: [],
  provenance: { source: 'synthetic fixture', review: 'unit test fixture; no runtime coverage claim' },
});
const entry = () => ({ lid: 'npcf_test', name: 'Test', sourceFingerprint: 'sha256:reviewed',
  sourceVersion: '3.1.3', tiers: [1, 2, 3], kind: 'Weapon' });
const context = () => ({ systemVersion: '3.1.3', tier: 1,
  descriptors: [descriptor()], handlers: ['single-weapon'] });

test('a reviewed JSON descriptor validates and exact provenance grants only its allowlisted handler', () => {
  assert.deepEqual(validateDescriptor(descriptor()), { ok: true, errors: [] });
  const ctx = context(), result = resolveAbility(entry(), ctx);
  assert.equal(result.coverage, 'supported');
  assert.equal(result.descriptor.id, 'test-single-weapon');
  assert.deepEqual(result.gaps, []);
});

test('schema rejects invalid activation, target, numeric cost, tier and provenance metadata', () => {
  for (const change of [
    d => { d.activation = 'Cast'; }, d => { d.targetPolicy.kind = 'guessed'; },
    d => { d.cost.quick = -1; }, d => { d.cost.quick = 0.5; },
    d => { d.cost.quick = '1'; }, d => { d.cost.move = Infinity; },
    d => { d.cost.counters = { charges: -1 }; }, d => { d.cost.unknown = 1; },
    d => { d.tiers = [0]; }, d => { d.tiers = [1, 1]; },
    d => { d.provenance.review = ''; }, d => { d.fingerprints = []; },
    d => { d.systemVersions = []; }, d => { d.systemVersions = ['unrecorded']; },
    d => { d.handlerId = ''; },
    d => { d.gaps = ['Unresolved mechanic']; },
  ]) {
    const d = descriptor(); change(d);
    const result = validateDescriptor(d);
    assert.equal(result.ok, false, JSON.stringify(d));
    assert(result.errors.length > 0);
  }
});

test('unknown source, edited source, same display name and wrong runtime never grant coverage', () => {
  for (const change of [
    (e, c) => { e.sourceFingerprint = 'sha256:edited'; },
    (e, c) => { e.sourceFingerprint = ''; },
    (e, c) => { e.sourceVersion = 'unrecorded'; },
    (e, c) => { c.systemVersion = '3.1.4'; },
    (e, c) => { c.descriptors = []; },
    (e, c) => { e.descriptorId = 'another-descriptor'; },
    (e, c) => { c.handlers = []; },
    (e, c) => { delete c.handlers; },
  ]) {
    const e = entry(), c = context(); change(e, c);
    const result = resolveAbility(e, c);
    assert.equal(result.coverage, 'manual');
    assert.equal(result.descriptor, null);
    assert(result.gaps.length > 0);
  }
});

test('tier boundaries are exact and no numeric coercion grants a descriptor', () => {
  const c = context(); c.descriptors[0].tiers = [1];
  for (const tier of [2, 3, 0, 4, '1', undefined]) {
    const result = resolveAbility(entry(), { ...c, tier });
    assert.equal(result.coverage, 'manual');
    assert.equal(result.descriptor, null);
  }
  const e = entry(); e.tiers = [2, 3];
  assert.equal(resolveAbility(e, context()).coverage, 'manual');
});

test('duplicate descriptor IDs and ambiguous matching fingerprints are refused', () => {
  const c = context(); c.descriptors.push(structuredClone(c.descriptors[0]));
  assert.equal(resolveAbility(entry(), c).coverage, 'manual');
  c.descriptors[1].id = 'another-claim';
  assert.equal(resolveAbility(entry(), c).coverage, 'manual');
  const e = entry(); e.descriptorId = 'test-single-weapon';
  assert.equal(resolveAbility(e, c).coverage, 'supported');
});

test('explicit partial/manual/unreviewed descriptors preserve unresolved gaps and cannot grant execution', () => {
  for (const coverage of ['partial', 'manual', 'unreviewed']) {
    const c = context(); c.descriptors[0].coverage = coverage;
    c.descriptors[0].gaps = ['Targeting remains unverified'];
    const result = resolveAbility(entry(), c);
    assert.equal(result.coverage, coverage);
    assert.equal(result.descriptor, null);
    assert(result.gaps.includes('Targeting remains unverified'));
  }
});

test('extra JSON metadata remains inert and executable or accessor payloads are refused', () => {
  const d = descriptor();
  d.notes = { text: 'return dangerousCode()', labels: ['not executable'], nested: null };
  assert.equal(validateDescriptor(d).ok, true);
  const e = entry(), c = context(); c.descriptors = [d];
  const before = JSON.stringify({ e, c }); resolveAbility(e, c);
  assert.equal(JSON.stringify({ e, c }), before);
  for (const extra of [() => {}, Symbol('unsafe'), BigInt(1), new Date(), NaN]) {
    const invalid = descriptor(); invalid.extra = extra;
    assert.equal(validateDescriptor(invalid).ok, false);
  }
  const cycle = descriptor(); cycle.extra = cycle;
  assert.equal(validateDescriptor(cycle).ok, false);
  const accessor = descriptor();
  Object.defineProperty(accessor, 'extra', { enumerable: true, get() { assert.fail('Getter must stay inert'); } });
  assert.equal(validateDescriptor(accessor).ok, false);
});

test('malformed entries and contexts yield manual gaps without throwing', () => {
  for (const e of [null, undefined, [], {}, { ...entry(), tiers: [] }, { ...entry(), tiers: [NaN] }]) {
    assert.doesNotThrow(() => {
      const result = resolveAbility(e, context());
      assert.equal(result.coverage, 'manual'); assert(result.gaps.length > 0);
    });
  }
  for (const c of [null, undefined, [], {}, { ...context(), descriptors: null },
    { ...context(), handlers: 'single-weapon' }, { ...context(), descriptors: [null] }]) {
    assert.doesNotThrow(() => {
      const result = resolveAbility(entry(), c);
      assert.equal(result.coverage, 'manual'); assert(result.gaps.length > 0);
    });
  }
});

test('audit accounts every catalogue entry and declared tier, including unsupported mechanics', () => {
  const catalogue = [entry(), { ...entry(), lid: 'npcf_unknown', sourceFingerprint: 'sha256:unknown' }];
  const report = auditCoverage(catalogue, [descriptor()], { systemVersion: '3.1.3', handlers: ['single-weapon'] });
  assert.equal(report.entries.length, 2);
  assert.deepEqual(report.totals, { entries: 2, supported: 1, partial: 0, manual: 1, unreviewed: 0 });
  assert.equal(report.complete, false);
  assert.deepEqual(report.entries[0].tiers.map(t => t.tier), [1, 2, 3]);
  assert(report.gaps.some(g => g.lid === 'npcf_unknown'));
  const complete = auditCoverage([entry()], [descriptor()], { systemVersion: '3.1.3', handlers: ['single-weapon'] });
  assert.equal(complete.complete, true);
  assert.deepEqual(complete.gaps, []);
});

test('audit does not hide an unsupported declared tier behind a requested context tier', () => {
  const d = descriptor(); d.tiers = [1];
  const report = auditCoverage([entry()], [d], context());
  assert.equal(report.complete, false);
  assert.equal(report.entries[0].coverage, 'partial');
  assert.deepEqual(report.entries[0].tiers.map(t => t.coverage), ['supported', 'manual', 'manual']);
  assert.equal(report.totals.partial, 1);
});

test('duplicate catalogue lids remain individually accounted but cannot be complete', () => {
  const report = auditCoverage([entry(), entry()], [descriptor()], context());
  assert.equal(report.entries.length, 2);
  assert.equal(report.totals.entries, 2);
  assert.equal(report.totals.manual, 2);
  assert.equal(report.complete, false);
  assert(report.gaps.every(g => /duplicate/i.test(g.reason)));
});

test('empty or malformed catalogues cannot establish complete coverage', () => {
  for (const catalogue of [[], null, undefined, {}, [null]]) {
    const report = auditCoverage(catalogue, [], {});
    assert.equal(report.complete, false);
    assert(report.gaps.length > 0);
  }
});

test('sparse and accessor catalogue slots stay inert and are individually accounted as manual', () => {
  const sparse = new Array(2); sparse[1] = entry();
  const sparseReport = auditCoverage(sparse, [descriptor()], context());
  assert.equal(sparseReport.entries.length, 2);
  assert.equal(sparseReport.entries[0].coverage, 'manual');
  assert.equal(sparseReport.complete, false);
  const accessor = [];
  Object.defineProperty(accessor, '0', { enumerable: true, get() { assert.fail('Catalogue getter must stay inert'); } });
  const report = auditCoverage(accessor, [descriptor()], context());
  assert.equal(report.entries.length, 1);
  assert.equal(report.totals.manual, 1);
});

test('audit rejects malformed descriptor authority and runtime metadata without throwing', () => {
  for (const [descriptors, ctx] of [[undefined, context()], [[null], context()],
    [[descriptor()], null], [[descriptor()], { systemVersion: '3.1.3' }],
    [[descriptor()], { ...context(), systemVersion: '3.1.4' }]]) {
    const report = auditCoverage([entry()], descriptors, ctx);
    assert.equal(report.entries.length, 1);
    assert.equal(report.complete, false);
    assert(report.gaps.length > 0);
  }
});

test('agreeing unknown runtime markers cannot establish a reviewed version', () => {
  const e = entry(), c = context();
  e.sourceVersion = 'unrecorded'; c.systemVersion = 'unrecorded';
  c.descriptors[0].systemVersions = ['unrecorded'];
  const result = resolveAbility(e, c);
  assert.equal(result.coverage, 'manual');
  assert.equal(result.descriptor, null);
});
