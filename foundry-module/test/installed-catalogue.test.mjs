import test from 'node:test';
import assert from 'node:assert/strict';
import { NPC_CATALOGUE, NPC_CLASSES, NPC_TEMPLATES } from '../scripts/rules/npc-catalogue.mjs';
import { auditCoverage } from '../scripts/core/abilities.mjs';

test('frozen installed roster accounts all features, tiers, class and template references', () => {
  assert.equal(NPC_CATALOGUE.length, 461);
  assert.equal(NPC_CLASSES.length, 44); assert.equal(NPC_TEMPLATES.length, 15);
  const ids = new Set(NPC_CATALOGUE.map(e => e.lid));
  assert.equal(ids.size, NPC_CATALOGUE.length);
  for (const e of NPC_CATALOGUE) {
    assert.match(e.sourceFingerprint, /^[a-f\d]{64}$/);
    assert.equal(e.sourceVersion, '3.1.3'); assert.deepEqual(e.tiers, [1, 2, 3]);
  }
  for (const c of [...NPC_CLASSES, ...NPC_TEMPLATES]) for (const f of c.features) assert(ids.has(f.lid), `${c.lid}: ${f.lid}`);
  // No reviewed descriptors have been supplied to this foundation yet. Keeping
  // every missing mechanic visible is required; catalogue presence is not support.
  const report = auditCoverage(NPC_CATALOGUE, [], { systemVersion: '3.1.3', handlers: [] });
  assert.equal(report.complete, false); assert.equal(report.totals.manual, 461);
  assert.equal(report.gaps.length, 461 * 3);
});
