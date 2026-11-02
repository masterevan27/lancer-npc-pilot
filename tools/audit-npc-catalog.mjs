// Read-only inventory of an installed NPC catalogue. Never opens the source DB.
// Existing licensed Foundry dependencies are loaded only for the CLI reader.
import { cpSync, lstatSync, mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const sortById = (a, b) => a.id.localeCompare(b.id);
const present = value => typeof value === 'string' && value.trim().length > 0;
const tally = values => Object.fromEntries([...new Set(values)].sort()
  .map(key => [key, values.filter(value => value === key).length]));
const featureKinds = new Set(['Weapon', 'Trait', 'System', 'Reaction', 'Tech']);

// Explicit rule-source fields. Current readiness/uses and usage-counter values
// are deliberately absent: identical rules keep their identity during play.
const RULE_FIELDS = ['lid', 'type', 'weapon_type', 'effect', 'on_hit', 'on_attack', 'on_crit', 'trigger',
  'activation', 'tech_type', 'tech_attack', 'accuracy', 'attack_bonus', 'range', 'damage', 'tags',
  'tier_override', 'bonus', 'override', 'actions', 'deployables', 'synergies', 'frequency', 'cost', 'heat_cost'];
function sortedSource(value) {
  if (Array.isArray(value)) return value.map(sortedSource);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort()
    .filter(key => value[key] !== undefined).map(key => [key, sortedSource(value[key])]));
  return value;
}
function sourceFingerprint(system) {
  const selected = Object.fromEntries(RULE_FIELDS.filter(key => system[key] !== undefined)
    .map(key => [key, system[key]]));
  return createHash('sha256').update(JSON.stringify(sortedSource(selected))).digest('hex');
}

/** Inventory, not a rules classifier: prose signals do not establish support. */
export function summarizeCatalog(records) {
  if (!Array.isArray(records)) throw TypeError('Catalogue records must be an array.');
  const relevant = records.filter(record => record && ['npc_class', 'npc_template', 'npc_feature'].includes(record.type));
  const missingIds = relevant.filter(record => typeof record.system?.lid !== 'string' || !record.system.lid).length;
  const identified = relevant.filter(record => typeof record.system?.lid === 'string' && record.system.lid);
  const ids = identified.map(record => record.system.lid);
  const idCounts = tally(ids);
  const duplicates = Object.entries(idCounts).filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id, count }));
  const byId = new Map(identified.map(record => [record.system.lid, record]));
  const features = identified.filter(record => record.type === 'npc_feature').map(record => {
    const s = record.system;
    const range = Array.isArray(s.range) ? s.range : [];
    const damage = Array.isArray(s.damage) ? s.damage.flat(Infinity) : [];
    // This text is inspected in memory only; it is never returned or logged.
    const prose = [s.effect, s.on_hit, s.trigger].filter(present).join(' ');
    return { id: s.lid, name: String(record.name ?? ''), type: String(s.type ?? 'unknown'),
      sourceFingerprint: sourceFingerprint(s),
      sourceVersion: typeof record._stats?.systemVersion === 'string' && record._stats.systemVersion
        ? record._stats.systemVersion : 'unrecorded',
      rangeShapes: [...new Set(range.map(r => String(r?.type ?? 'unknown')))].sort(),
      tags: [...new Set((Array.isArray(s.tags) ? s.tags : []).map(tag => String(tag?.lid ?? 'unknown')))].sort(),
      hasEffect: present(s.effect), hasOnHit: present(s.on_hit), hasTrigger: present(s.trigger),
      effectOnly: present(s.effect) && !range.length && !damage.length,
      // Heuristics help scope review; they must not be used to grant execution.
      proseSignals: Object.entries({
        multiAttack: /two attacks|three attacks|multiple attacks|attack.{0,30}twice|attacks against|attack.{0,30}each/i,
        forcedMovement: /push|pull|knockback|drag|teleport|move.{0,30}target/i,
        saveOrCheck: /\bsave\b|\bcheck\b/i,
        areaOrTerrain: /\bterrain\b|\bzone\b|\bwall\b|\barea\b|\bburst\b|\bblast\b|\bcone\b|\bline \d/i,
        reaction: /reaction|overwatch/i,
      }).filter(([, regex]) => regex.test(prose)).map(([signal]) => signal),
    };
  }).sort(sortById);
  const unresolved = [];
  const describeOwner = record => {
    const s = record.system;
    const refs = ['base_features', 'optional_features'].flatMap(field => {
      const source = s[field];
      if (source !== undefined && !Array.isArray(source)) {
        unresolved.push({ owner: s.lid, field, reason: 'Reference list is not an array.' });
        return [];
      }
      return (source ?? []).map(reference => {
        const id = typeof reference === 'string' ? reference : reference?.lid;
        const target = typeof id === 'string' ? byId.get(id) : null;
        const resolved = target?.type === 'npc_feature' && idCounts[id] === 1;
        if (!resolved) unresolved.push({ owner: s.lid, field,
          ...(typeof id === 'string' ? { id } : {}),
          reason: !id ? 'Reference has no feature lid.' : idCounts[id] > 1 ? 'Feature lid is ambiguous.'
            : target ? 'Reference is not an NPC feature.' : 'Feature is absent.' });
        return { id: typeof id === 'string' ? id : null, kind: field === 'base_features' ? 'base' : 'optional',
          resolved, ...(resolved ? { type: String(target.system.type ?? 'unknown') } : {}) };
      });
    });
    return { id: s.lid, name: String(record.name ?? ''), features: refs };
  };
  const classes = identified.filter(record => record.type === 'npc_class').map(describeOwner).sort(sortById);
  const templates = identified.filter(record => record.type === 'npc_template').map(describeOwner).sort(sortById);
  return {
    inventoryOnly: true,
    limitations: ['This inventories the selected installed pack, not every published or homebrew NPC.',
      'Prose signals and catalogue presence do not establish legal targeting, execution support or live acceptance.'],
    counts: { records: records.length, classes: classes.length, templates: templates.length, features: features.length,
      missingIds, duplicateIds: duplicates.length, unresolvedReferences: unresolved.length },
    featureTypes: tally(features.map(feature => feature.type)),
    unknownFeatureTypes: features.filter(feature => !featureKinds.has(feature.type)).map(feature => feature.id),
    rangeShapes: tally(features.filter(feature => feature.type === 'Weapon').map(feature => feature.rangeShapes.join('/') || 'none')),
    tags: tally(features.flatMap(feature => feature.tags)),
    effectOnlyCount: features.filter(feature => feature.effectOnly).length,
    proseSignals: tally(features.flatMap(feature => feature.proseSignals)),
    duplicates, unresolved, classes, templates, features,
  };
}

/** Copy first: ClassicLevel may create locks/recovery files even during reads. */
export async function auditInstalledCatalog({ packPath, foundryCodeRoot }) {
  if (!packPath || !foundryCodeRoot) throw TypeError('packPath and foundryCodeRoot are required.');
  const requested = resolve(packPath);
  if (lstatSync(requested).isSymbolicLink()) throw Error('Pack path must not be a symbolic link.');
  const source = realpathSync(requested);
  if (!lstatSync(source).isDirectory()) throw Error('Pack path must name a LevelDB directory.');
  const require = createRequire(import.meta.url);
  const { ClassicLevel } = require(join(resolve(foundryCodeRoot), 'node_modules', 'classic-level'));
  const temporaryRoot = realpathSync(tmpdir());
  const temporary = mkdtempSync(join(temporaryRoot, 'npc-catalog-audit-'));
  let db;
  try {
    const copy = join(temporary, 'pack');
    cpSync(source, copy, { recursive: true, filter: path => {
      if (lstatSync(path).isSymbolicLink()) throw Error('Pack contains a symbolic link; refusing an ambiguous snapshot.');
      return true;
    } });
    db = new ClassicLevel(copy, { valueEncoding: 'utf8', createIfMissing: false });
    await db.open();
    const records = [];
    for await (const [, value] of db.iterator()) records.push(JSON.parse(value));
    return { source: { method: 'temporary filesystem copy; original database never opened',
      consistency: 'Best-effort file copy; stop the source Foundry server first for an atomic catalogue snapshot.' },
      ...summarizeCatalog(records) };
  } finally {
    try { if (db) await db.close(); }
    finally {
      // Check the exact recursive deletion target before removing temporary data.
      if (dirname(temporary) !== temporaryRoot || !basename(temporary).startsWith('npc-catalog-audit-'))
        throw Error('Unexpected temporary path; cleanup refused.');
      rmSync(temporary, { recursive: true, force: true });
    }
  }
}

async function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: node tools/audit-npc-catalog.mjs --pack PATH --foundry-code-root PATH');
    return;
  }
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--pack', '--foundry-code-root'].includes(args[i]) || !args[i + 1]) throw Error('Invalid arguments; use --help.');
    options[args[i] === '--pack' ? 'packPath' : 'foundryCodeRoot'] = args[i + 1];
  }
  console.log(JSON.stringify(await auditInstalledCatalog(options), null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => {
    // Keep DB values and machine/world paths out of failures too.
    console.error(`NPC catalogue audit failed (${error.code ?? error.name}). Check arguments, source consistency and installed Foundry dependencies.`);
    process.exitCode = 1;
  });
}
