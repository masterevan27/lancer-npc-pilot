// Coverage foundation only: no browser globals, rules execution, text evaluation or I/O.
// Runtime handlers must be independently vetted and wired by a later implementation.
const COVERAGE = new Set(['supported', 'partial', 'manual', 'unreviewed']);
const ACTIVATIONS = new Set(['Quick', 'Full', 'Protocol', 'Reaction', 'Free', 'Passive']);
const TARGETS = new Set(['none', 'self', 'single', 'multiple', 'area']);
const COSTS = new Set(['move', 'quick', 'full', 'protocol', 'reaction', 'counters']);
const text = value => typeof value === 'string' && value.trim().length > 0;
const systemVersion = value => typeof value === 'string'
  && /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const count = value => Number.isSafeInteger(value) && value >= 0;
const tier = value => Number.isInteger(value) && value >= 1 && value <= 3;
const uniqueList = (values, check) => Array.isArray(values) && values.length > 0
  && values.every(check) && new Set(values).size === values.length;

// Inspect property descriptors before values, so getters and executable extras
// cannot run while checking a supposedly JSON descriptor or imported metadata.
function jsonData(value, ancestors = new Set()) {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || (!Array.isArray(value) && !record(value)) || ancestors.has(value)) return false;
  if (Object.getOwnPropertySymbols(value).length) return false;
  ancestors.add(value);
  for (const [key, property] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === 'length') continue;
    if (!Object.hasOwn(property, 'value') || !property.enumerable || !jsonData(property.value, ancestors)) return false;
  }
  ancestors.delete(value);
  return true;
}

/** Validate a declarative descriptor. Extra JSON data stays inert; no code is accepted. */
export function validateDescriptor(descriptor) {
  const errors = [];
  if (!record(descriptor) || !jsonData(descriptor)) return { ok: false, errors: ['Descriptor must contain only plain JSON data.'] };
  const d = descriptor;
  const require = (condition, message) => { if (!condition) errors.push(message); };
  require(text(d.id), 'Descriptor id is required.');
  require(text(d.version) || (count(d.version) && d.version > 0), 'Descriptor version is required.');
  require(uniqueList(d.fingerprints, text), 'Exact unique source fingerprints are required.');
  require(uniqueList(d.systemVersions, systemVersion), 'Exact unique recorded system versions are required.');
  require(uniqueList(d.tiers, tier), 'Unique supported tiers must be integers from 1 to 3.');
  require(ACTIVATIONS.has(d.activation), 'Activation must be Quick, Full, Protocol, Reaction, Free or Passive.');
  require(record(d.targetPolicy) && TARGETS.has(d.targetPolicy.kind), 'A known targetPolicy.kind is required.');
  require(record(d.cost), 'A numeric action cost object is required.');
  if (record(d.cost)) for (const [key, value] of Object.entries(d.cost)) {
    require(COSTS.has(key), `Unknown action cost: ${key}.`);
    if (key === 'counters') require(record(value) && Object.entries(value).every(([id, n]) => text(id) && count(n)), 'Counter costs must be nonnegative safe integers.');
    else require(count(value), `Action cost ${key} must be a nonnegative safe integer.`);
  }
  require(COVERAGE.has(d.coverage), 'Explicit coverage status is required.');
  require(Array.isArray(d.gaps) && d.gaps.every(text), 'Gaps must be an array of nonempty explanations.');
  if (d.coverage === 'supported') {
    require(text(d.handlerId), 'Supported coverage requires a reviewed handlerId.');
    require(Array.isArray(d.gaps) && d.gaps.length === 0, 'Supported coverage cannot contain unresolved gaps.');
  } else if (d.handlerId !== undefined) require(text(d.handlerId), 'When present, handlerId must be nonempty.');
  if (d.coverage === 'partial') require(Array.isArray(d.gaps) && d.gaps.length > 0, 'Partial coverage requires an unresolved gap.');
  require(record(d.provenance) && text(d.provenance.source) && text(d.provenance.review), 'Provenance requires source and review references.');
  return { ok: errors.length === 0, errors };
}

const refused = reason => ({ descriptor: null, coverage: 'manual', gaps: [reason] });
function entryError(entry) {
  if (!record(entry) || !jsonData(entry)) return 'Catalogue entry must contain only plain JSON data.';
  if (!text(entry.lid)) return 'Catalogue entry lid is required.';
  if (!text(entry.sourceFingerprint)) return 'Exact source fingerprint is missing.';
  if (!text(entry.sourceVersion)) return 'Source system version is missing.';
  if (!uniqueList(entry.tiers, tier)) return 'Catalogue entry must declare unique tiers from 1 to 3.';
  if (entry.descriptorId !== undefined && !text(entry.descriptorId)) return 'Catalogue descriptorId must be nonempty when present.';
  return null;
}

function registryError(context) {
  if (!record(context) || !jsonData(context)) return 'Context must contain only plain JSON data.';
  if (!systemVersion(context.systemVersion)) return 'An exact recorded runtime systemVersion is required.';
  if (!Array.isArray(context.descriptors)) return 'Descriptor registry must be an array.';
  if (!Array.isArray(context.handlers) || !context.handlers.every(text)) return 'An explicit handler ID allowlist is required.';
  const ids = new Set();
  for (const d of context.descriptors) {
    const checked = validateDescriptor(d);
    if (!checked.ok) return `Invalid descriptor registry: ${checked.errors.join(' ')}`;
    if (ids.has(d.id)) return `Duplicate descriptor id: ${d.id}.`;
    ids.add(d.id);
  }
  return null;
}

/**
 * Resolve one concrete tier. No display name or prose supplies permission.
 * Context: {systemVersion,tier,descriptors,handlers}; handlers is an explicit
 * array of vetted handler IDs, never functions or source strings to execute.
 * A returned supported descriptor is a data copy, not an execution authorization.
 */
export function resolveAbility(entry, context) {
  const invalidEntry = entryError(entry);
  if (invalidEntry) return refused(invalidEntry);
  const invalidRegistry = registryError(context);
  if (invalidRegistry) return refused(invalidRegistry);
  if (!tier(context.tier)) return refused('A concrete integer NPC tier from 1 to 3 is required.');
  if (!entry.tiers.includes(context.tier)) return refused(`Catalogue entry does not declare tier ${context.tier}.`);
  if (entry.sourceVersion !== context.systemVersion) return refused('Source and runtime system versions differ or are unrecorded.');
  const matches = context.descriptors.filter(d => d.fingerprints.includes(entry.sourceFingerprint)
    && (entry.descriptorId === undefined || d.id === entry.descriptorId));
  if (!matches.length) return refused('No descriptor matches the exact source fingerprint and descriptor ID.');
  if (matches.length !== 1) return refused('Multiple descriptors match this source fingerprint; an exact descriptorId is required.');
  const descriptor = matches[0];
  if (!descriptor.systemVersions.includes(context.systemVersion)) return refused('Descriptor does not support this exact runtime system version.');
  if (!descriptor.tiers.includes(context.tier)) return refused(`Descriptor does not support tier ${context.tier}.`);
  if (descriptor.coverage !== 'supported') return {
    descriptor: null, coverage: descriptor.coverage,
    gaps: descriptor.gaps.length ? [...descriptor.gaps] : [`Descriptor coverage remains ${descriptor.coverage}.`],
  };
  if (!context.handlers.includes(descriptor.handlerId)) return refused(`Handler ${descriptor.handlerId} is not explicitly allowlisted.`);
  return { descriptor: JSON.parse(JSON.stringify(descriptor)), coverage: 'supported', gaps: [] };
}

/**
 * Account every catalogue entry and every declared tier. A context tier cannot
 * narrow the audit. Unsupported entries stay in the report; even an empty or
 * malformed catalogue cannot claim complete coverage.
 */
export function auditCoverage(catalogue, descriptors, context) {
  const totals = { entries: Array.isArray(catalogue) ? catalogue.length : 0,
    supported: 0, partial: 0, manual: 0, unreviewed: 0 };
  const entries = [], gaps = [];
  if (!Array.isArray(catalogue) || !catalogue.length) return {
    totals, entries, gaps: [{ lid: null, reason: 'A nonempty catalogue array is required.' }], complete: false,
  };
  const rows = Array.from({ length: catalogue.length }, (_, index) => {
    const property = Object.getOwnPropertyDescriptor(catalogue, String(index));
    return property && Object.hasOwn(property, 'value') ? property.value : undefined;
  });
  const duplicates = new Set(), seen = new Set();
  for (const entry of rows) {
    if (!record(entry) || !jsonData(entry) || !text(entry.lid)) continue;
    if (seen.has(entry.lid)) duplicates.add(entry.lid);
    seen.add(entry.lid);
  }
  // Invalid context stays invalid; never fill missing authority with defaults.
  const safeContext = record(context) && jsonData(context) ? { ...context, descriptors } : null;
  rows.forEach((entry, index) => {
    const invalid = entryError(entry);
    const lid = invalid ? null : entry.lid;
    const duplicate = !invalid && duplicates.has(lid);
    const results = invalid || duplicate
      ? [{ tier: null, ...refused(invalid ?? `Duplicate catalogue lid: ${lid}.`) }]
      : entry.tiers.map(t => ({ tier: t, ...resolveAbility(entry, safeContext && { ...safeContext, tier: t }) }));
    const statuses = new Set(results.map(result => result.coverage));
    const coverage = statuses.size === 1 ? results[0].coverage : 'partial';
    totals[coverage]++;
    const report = { index, lid, coverage,
      tiers: results.map(({ tier, coverage, descriptor, gaps }) => ({ tier, coverage, descriptorId: descriptor?.id ?? null, gaps })),
      gaps: results.flatMap(result => result.gaps.map(reason => ({ tier: result.tier, reason }))),
    };
    entries.push(report);
    gaps.push(...report.gaps.map(gap => ({ index, lid, ...gap })));
  });
  return { totals, entries, gaps, complete: totals.supported === totals.entries && gaps.length === 0 };
}
