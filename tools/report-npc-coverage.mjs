// Read-only report from frozen metadata and source-review obligations. No DB or model calls.
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { NPC_CATALOGUE, NPC_CLASSES, NPC_TEMPLATES } from '../foundry-module/scripts/rules/npc-catalogue.mjs';
import { NPC_MECHANIC_REVIEW } from '../foundry-module/scripts/rules/npc-mechanics.mjs';
import { buildCoverageManifest, auditMechanicCoverage } from '../foundry-module/scripts/core/coverage.mjs';

export function reportNpcCoverage({ lid, chunk } = {}) {
  const owners = { classes: NPC_CLASSES, templates: NPC_TEMPLATES };
  const manifest = buildCoverageManifest(NPC_CATALOGUE, owners);
  const report = auditMechanicCoverage(NPC_CATALOGUE, manifest, owners);
  if (report.errors.length) throw Error(`Coverage metadata failed validation: ${report.errors.join(' ')}`);
  if (lid !== undefined && !report.entries.some(e => e.lid === lid)) throw Error('Unknown feature lid.');
  if (chunk !== undefined && (!Number.isInteger(chunk) || chunk < 1 || chunk > 8)) throw Error('Chunk must be an integer from 1 to 8.');
  return {
    research: NPC_MECHANIC_REVIEW,
    complete: report.complete,
    totals: { features: report.entries.length, tiers: report.entries.reduce((n, e) => n + e.tiers.length, 0),
      classes: NPC_CLASSES.length, templates: NPC_TEMPLATES.length,
      sourceClassified: report.entries.filter(e => e.reviewed).length,
      sourceUnresolved: report.entries.filter(e => !e.reviewed).length,
      implementationMechanics: report.entries.reduce((n, e) => n + e.mechanics.filter(m => m.owningChunk > 1).length, 0),
      executableDescriptorsSupported: report.executable.totals.supported },
    unassigned: report.unassigned, byChunk: report.byChunk,
    ...(lid !== undefined || chunk !== undefined ? {
      entries: report.entries.filter(e => (lid === undefined || e.lid === lid)
        && (chunk === undefined || e.mechanics.some(m => m.owningChunk === chunk && m.status === 'unresolved'))),
      gates: report.gates,
    } : {}),
  };
}

function main(args) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log('Usage: node tools/report-npc-coverage.mjs [--lid FEATURE_LID] [--chunk 1..8]'); return;
  }
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--lid', '--chunk'].includes(args[i]) || !args[i + 1]) throw Error('Invalid arguments; use --help.');
    options[args[i].slice(2)] = args[i] === '--chunk' ? Number(args[i + 1]) : args[i + 1];
  }
  console.log(JSON.stringify(reportNpcCoverage(options), null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
