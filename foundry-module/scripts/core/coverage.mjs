// Coverage work tracking is separate from execution authority. No rule-text parsing.
import { auditCoverage, isJsonData } from './abilities.mjs';
import { NPC_DESCRIPTORS, COVERAGE_GATES, coverageRouting } from '../rules/npc-descriptors.mjs';
import { NPC_MECHANICS } from '../rules/npc-mechanics.mjs';
import { NPC_CATALOGUE } from '../rules/npc-catalogue.mjs';

const record = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const text = v => typeof v === 'string' && v.trim().length > 0;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// Array#every/map skip holes. Reject nested sparse work metadata before either
// can silently omit an obligation; leave source accounting to the audit below.
function denseJson(value) {
  if (!isJsonData(value)) return false;
  const visit = v => {
    if (v === null || typeof v !== 'object') return true;
    if (Array.isArray(v)) for (let i = 0; i < v.length; i++) if (!Object.hasOwn(v, i)) return false;
    return Object.values(v).every(visit);
  };
  return visit(value);
}
const ownerRows = owners => ['classes', 'templates'].flatMap(key => (owners[key] ?? [])
  .map(owner => ({ ...owner, type: key === 'classes' ? 'class' : 'template' })));
const associations = (lid, owners) => ownerRows(owners).flatMap(owner => owner.features
  .filter(f => f.lid === lid).map(f => ({ type: owner.type, lid: owner.lid, selection: f.kind })));

function sourceErrors(catalogue, owners) {
  if (!denseJson(catalogue) || !Array.isArray(catalogue) || !catalogue.length)
    return ['A nonempty plain JSON catalogue is required.'];
  if (!denseJson(owners) || !record(owners) || !['classes', 'templates'].every(k => Array.isArray(owners[k])))
    return ['Plain JSON class and template lists are required.'];
  const errors = [], ids = new Set();
  for (const entry of catalogue) {
    if (!record(entry) || !text(entry.lid) || !text(entry.sourceFingerprint) || !text(entry.sourceVersion)
      || !Array.isArray(entry.tiers) || !entry.tiers.length || !entry.tiers.every(t => [1, 2, 3].includes(t))
      || new Set(entry.tiers).size !== entry.tiers.length) {
      errors.push('Invalid catalogue source identity or tiers.'); continue;
    }
    if (ids.has(entry.lid)) errors.push(`Duplicate catalogue lid: ${entry.lid}.`);
    ids.add(entry.lid);
  }
  const ownerIds = new Set();
  for (const owner of ownerRows(owners)) {
    const key = `${owner.type}:${owner.lid}`;
    if (!text(owner.lid) || ownerIds.has(key) || !Array.isArray(owner.features)) {
      errors.push(`Invalid or duplicate owner: ${key}.`); continue;
    }
    ownerIds.add(key);
    for (const f of owner.features) {
      if (!record(f) || !ids.has(f.lid) || !['base', 'optional'].includes(f.kind))
        errors.push(`Unresolved association: ${key} / ${record(f) ? f.lid : 'invalid feature'}.`);
    }
  }
  return errors;
}

/** Initial obligations for all entries, including those absent from owner lists. */
export function buildCoverageManifest(catalogue, owners, reviews = NPC_MECHANICS) {
  if (sourceErrors(catalogue, owners).length) return [];
  const inputs = denseJson(reviews) && Array.isArray(reviews) ? reviews : [];
  return catalogue.map(entry => {
    const matching = inputs.filter(r => record(r) && r.lid === entry.lid && r.sourceFingerprint === entry.sourceFingerprint
      && r.sourceVersion === entry.sourceVersion && same(r.tiers, entry.tiers));
    const candidate = matching.length === 1 ? matching[0] : null;
    const review = candidate && ['reviewed', 'unresolved'].includes(candidate.classification)
      && Array.isArray(candidate.unresolved) && candidate.unresolved.every(text)
      && (candidate.classification !== 'unresolved' || candidate.unresolved.length > 0)
      && Array.isArray(candidate.mechanics) && candidate.mechanics.length > 0
      && candidate.mechanics.every(m => record(m) && text(m.family) && Number.isInteger(m.owningChunk)
        && m.owningChunk >= 2 && m.owningChunk <= 7 && Array.isArray(m.acceptance)
        && m.acceptance.length > 0 && m.acceptance.every(text)) ? candidate : null;
    const classified = review?.classification === 'reviewed' && review.unresolved.length === 0;
    const mechanics = new Map();
    for (const m of review?.mechanics ?? []) {
      const id = `${m.owningChunk}:${m.family}`;
      const previous = mechanics.get(id);
      const gate = Object.keys(COVERAGE_GATES).find(key => COVERAGE_GATES[key].chunk === m.owningChunk);
      mechanics.set(id, { id, owningChunk: m.owningChunk, status: 'unresolved', gates: [gate], evidence: [],
        acceptance: [...new Set([...(previous?.acceptance ?? []), ...m.acceptance])] });
    }
    return { lid: entry.lid, sourceFingerprint: entry.sourceFingerprint, sourceVersion: entry.sourceVersion,
      tiers: [...entry.tiers], review: classified ? 'reviewed' : 'unreviewed',
      sourceGaps: review ? [...review.unresolved] : ['No unique exact-source mechanic review matches this entry.'],
      mechanics: [{ id: 'rules-classification', owningChunk: 1, status: classified ? 'verified' : 'unresolved',
        gates: ['exact-rules'], evidence: classified ? [`rules/npc-mechanics.mjs / ${entry.lid} / ${entry.sourceFingerprint}`] : [] },
      ...mechanics.values()], routingHint: coverageRouting(entry.kind), owners: associations(entry.lid, owners) };
  });
}

/** Validate source bindings and obligations without granting any executable handler. */
export function validateCoverageManifest(manifest, catalogue, owners) {
  const errors = sourceErrors(catalogue, owners);
  if (!denseJson(manifest) || !Array.isArray(manifest) || !manifest.length)
    errors.push('A nonempty plain JSON coverage manifest is required.');
  if (errors.length) return { ok: false, errors };
  const byId = new Map(catalogue.map(e => [e.lid, e])), seen = new Set();
  for (const row of manifest) {
    if (!record(row) || !text(row.lid)) { errors.push('Manifest row has no lid.'); continue; }
    if (seen.has(row.lid)) errors.push(`Duplicate manifest lid: ${row.lid}.`);
    seen.add(row.lid);
    const source = byId.get(row.lid);
    if (!source) { errors.push(`Unknown manifest lid: ${row.lid}.`); continue; }
    if (row.sourceFingerprint !== source.sourceFingerprint || row.sourceVersion !== source.sourceVersion
      || !same(row.tiers, source.tiers)) errors.push(`Source identity or tiers changed: ${row.lid}.`);
    if (!same(row.owners, associations(row.lid, owners))) errors.push(`Owner associations changed: ${row.lid}.`);
    if (!['unreviewed', 'reviewed'].includes(row.review)) errors.push(`Invalid review status: ${row.lid}.`);
    if (!Array.isArray(row.sourceGaps) || !row.sourceGaps.every(text)
      || (row.review === 'reviewed' && row.sourceGaps.length > 0)) errors.push(`Invalid source gaps: ${row.lid}.`);
    if (!same(row.routingHint, coverageRouting(source.kind))) errors.push(`Invalid provisional routing: ${row.lid}.`);
    if (!Array.isArray(row.mechanics) || !row.mechanics.length) { errors.push(`Missing mechanic obligations: ${row.lid}.`); continue; }
    const mechanicIds = new Set();
    for (const mechanic of row.mechanics) {
      if (!record(mechanic) || !text(mechanic.id)) { errors.push(`Invalid mechanic: ${row.lid}.`); continue; }
      if (mechanicIds.has(mechanic.id)) errors.push(`Duplicate mechanic: ${row.lid}/${mechanic.id}.`);
      mechanicIds.add(mechanic.id);
      if (!Number.isInteger(mechanic.owningChunk) || mechanic.owningChunk < 1 || mechanic.owningChunk > 8
        || !['unresolved', 'verified'].includes(mechanic.status)
        || !Array.isArray(mechanic.evidence) || !mechanic.evidence.every(text)
        || !Array.isArray(mechanic.gates) || !mechanic.gates.length
        || new Set(mechanic.gates).size !== mechanic.gates.length
        || !mechanic.gates.every(id => Object.hasOwn(COVERAGE_GATES, id)
          && COVERAGE_GATES[id].chunk === mechanic.owningChunk)
        || (mechanic.acceptance !== undefined && (!Array.isArray(mechanic.acceptance)
          || !mechanic.acceptance.length || !mechanic.acceptance.every(text)))
        || (mechanic.status === 'verified' && !mechanic.evidence.length))
        errors.push(`Invalid mechanic gates/evidence: ${row.lid}/${mechanic.id}.`);
    }
    const classification = row.mechanics.find(m => m?.id === 'rules-classification');
    if (!classification || classification.owningChunk !== 1 || !Array.isArray(classification.gates)
      || !classification.gates.includes('exact-rules')
      || (row.review === 'reviewed' && classification.status !== 'verified'))
      errors.push(`Exact rules review is unresolved or absent: ${row.lid}.`);
  }
  for (const lid of byId.keys()) if (!seen.has(lid)) errors.push(`Missing manifest lid: ${lid}.`);
  return { ok: errors.length === 0, errors };
}

/** Roll up work and independent executable coverage; neither can hide orphan features. */
export function auditMechanicCoverage(catalogue, manifest, owners) {
  const checked = validateCoverageManifest(manifest, catalogue, owners);
  // Bad owner associations must not erase an otherwise valid source catalogue.
  const sourceRows = isJsonData(catalogue) && Array.isArray(catalogue) ? Array.from(catalogue) : [];
  const readableOwners = denseJson(owners) && record(owners)
    && ['classes', 'templates'].every(k => Array.isArray(owners[k]) && owners[k].every(o => record(o)
      && text(o.lid) && Array.isArray(o.features) && o.features.every(f => record(f) && text(f.lid))))
    ? owners : { classes: [], templates: [] };
  const rows = checked.ok ? new Map(manifest.map(r => [r.lid, r])) : new Map();
  const entries = sourceRows.map((value, index) => {
    const entry = record(value) ? value : {};
    const row = rows.get(entry.lid), unresolved = row?.mechanics.filter(m => m.status !== 'verified').map(m => m.id)
      ?? ['invalid-or-missing-manifest'];
    return { index, lid: text(entry.lid) ? entry.lid : null,
      sourceFingerprint: text(entry.sourceFingerprint) ? entry.sourceFingerprint : null,
      sourceVersion: text(entry.sourceVersion) ? entry.sourceVersion : null,
      tiers: (Array.isArray(entry.tiers) ? entry.tiers : []).map(tier => ({ tier, review: row?.review ?? 'unreviewed' })),
      unresolved, reviewed: row?.review === 'reviewed', sourceGaps: row?.sourceGaps ?? ['Invalid or missing source review.'], mechanics: row?.mechanics
        ?? [{ id: 'rules-classification', owningChunk: 1, status: 'unresolved', gates: ['exact-rules'], evidence: [] }],
      routingHint: coverageRouting(entry.kind),
      owners: associations(entry.lid, readableOwners) };
  });
  const byId = new Map(entries.map(e => [e.lid, e]));
  const versions = new Set(sourceRows.map(e => record(e) ? e.sourceVersion : undefined));
  const executable = auditCoverage(sourceRows, NPC_DESCRIPTORS,
    { systemVersion: versions.size === 1 ? [...versions][0] : 'unrecorded', handlers: [] });
  const executableById = new Map(executable.entries.map(e => [e.lid, e]));
  const byChunk = Object.fromEntries(Array.from({ length: 8 }, (_, i) => [i + 1, { unresolvedMechanics: 0, provisionalFeatures: 0 }]));
  for (const entry of entries) {
    byChunk[entry.routingHint.owningChunk].provisionalFeatures++;
    for (const mechanic of entry.mechanics) if (mechanic.status !== 'verified') byChunk[mechanic.owningChunk].unresolvedMechanics++;
  }
  return { entries, gates: COVERAGE_GATES, byChunk, errors: checked.errors,
    unassigned: entries.filter(e => !e.owners.length).map(e => e.lid).sort(),
    owners: ownerRows(readableOwners).map(owner => ({ type: owner.type, lid: owner.lid,
      unresolved: owner.features.filter(f => !byId.get(f.lid)?.reviewed || byId.get(f.lid)?.unresolved.length).map(f => f.lid),
      // Classification evidence is not executable support, including for empty owners.
      complete: checked.ok && owner.features.length > 0 && owner.features.every(f => byId.get(f.lid)?.reviewed
        && byId.get(f.lid).unresolved.length === 0 && executableById.get(f.lid)?.coverage === 'supported') })), executable, complete: checked.ok && entries.length > 0
        && entries.every(e => e.reviewed && !e.unresolved.length && e.owners.length > 0) && executable.complete };
}

/** Runtime association is informational: browser snapshots do not hash exact rule sources. */
export function coverageDiagnostic(feature, catalogue = NPC_CATALOGUE) {
  const safe = isJsonData(feature) && record(feature) ? feature : {};
  const known = isJsonData(catalogue) && Array.isArray(catalogue)
    ? catalogue.find(e => record(e) && e.lid === safe.lid) : null;
  const routingHint = coverageRouting(safe.kind);
  const primary = COVERAGE_GATES[routingHint.gates[0]];
  const guide = known?.kind === safe.kind ? NPC_MECHANICS.find(e => e.lid === safe.lid
    && e.sourceFingerprint === known.sourceFingerprint && e.sourceVersion === known.sourceVersion && same(e.tiers, known.tiers)) : null;
  const detail = guide ? guide.mechanics.map(m => `Chunk ${m.owningChunk}: ${m.acceptance.join(' ')}`).join(' ')
    + (guide.unresolved.length ? ` Catalogue questions: ${guide.unresolved.join(' ')}` : '')
    : `Chunk ${primary.chunk}: ${primary.acceptance.join(' ')}`;
  return { coverage: 'manual', sourceMatch: 'not-verified', catalogueKnown: Boolean(known), owningChunk: 1, routingHint,
    message: `Chunk 1: live source, tier and runtime verification remains unresolved; an ID match is not source verification. Provisional catalogue guide only. ${detail}` };
}
