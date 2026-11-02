// Optional installed-source accounting. This does not prove prose mechanics legal.
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, lstatSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { summarizeCatalog } from '../tools/audit-npc-catalog.mjs';
import { readNpcWeapons, reviewedRamCannon } from '../foundry-module/scripts/adapter/weapons.mjs';
import { NPC_CATALOGUE, NPC_CLASSES, NPC_TEMPLATES } from '../foundry-module/scripts/rules/npc-catalogue.mjs';

test('installed NPC roster weapons across all three tiers are supported or explicitly diagnosed', {
  skip: !(process.env.PILOT_FOUNDRY_CODE && process.env.PILOT_NPC_PACK),
}, async () => {
  const source = realpathSync(resolve(process.env.PILOT_NPC_PACK));
  const fileHashes = () => Object.fromEntries(readdirSync(source).sort().map(name => {
    const path = join(source, name);
    assert(lstatSync(path).isFile(), 'Installed pack must contain ordinary database files only.');
    return [name, createHash('sha256').update(readFileSync(path)).digest('hex')];
  }));
  const sourceBefore = JSON.stringify(fileHashes());
  const temporaryRoot = realpathSync(tmpdir());
  const temporary = mkdtempSync(join(temporaryRoot, 'npc-roster-test-'));
  let db;
  try {
    const copied = join(temporary, 'pack');
    cpSync(source, copied, { recursive: true, filter: path => {
      assert(!lstatSync(path).isSymbolicLink(), 'Refuse symlinks in installed catalogue.'); return true;
    } });
    const require = createRequire(import.meta.url);
    const { ClassicLevel } = require(join(resolve(process.env.PILOT_FOUNDRY_CODE), 'node_modules', 'classic-level'));
    db = new ClassicLevel(copied, { valueEncoding: 'utf8', createIfMissing: false });
    await db.open();
    const records = [];
    for await (const [, value] of db.iterator()) records.push(JSON.parse(value));
    await db.close(); db = null;
    const immutableSource = JSON.stringify(records);
    const report = summarizeCatalog(records);
    assert.deepEqual(report.features.map(f => ({ lid: f.id, kind: f.type,
      sourceFingerprint: f.sourceFingerprint, sourceVersion: f.sourceVersion, tiers: [1, 2, 3] })), NPC_CATALOGUE,
    'Installed rules changed: review the frozen catalogue rather than silently dropping coverage.');
    const mappings = owners => owners.map(c => ({ lid: c.id,
      features: c.features.map(f => ({ lid: f.id, kind: f.kind })) }));
    assert.deepEqual(mappings(report.classes), NPC_CLASSES);
    assert.deepEqual(mappings(report.templates), NPC_TEMPLATES);
    assert.equal(report.counts.unresolvedReferences, 0, 'All class/template feature references must resolve.');
    assert.equal(report.counts.duplicateIds, 0, 'Feature IDs must be unambiguous.');
    assert(report.classes.length > 0 && report.templates.length > 0);
    const rawWeapons = records.filter(record => record.type === 'npc_feature' && record.system?.type === 'Weapon');
    assert(rawWeapons.length > 0);
    const coverage = [];
    for (const tier of [1, 2, 3]) {
      let supported = 0, excluded = 0, variants = 0;
      for (const raw of rawWeapons) {
        const item = structuredClone(raw), d = item.system;
        item.id = d.lid;
        // Catalogue defaults are not a live loadout. Set fresh readiness only
        // on this clone so this test measures rules coverage, not empty ammo.
        d.destroyed = false; d.disabled = false;
        d.loaded = true; d.charged = true;
        if ((d.tags ?? []).some(tag => tag.lid === 'tg_limited')) d.uses = { value: 99, max: 99 };
        for (const key of ['uses_per_round', 'uses_per_turn', 'uses_per_scene']) {
          if (d[key]) d[key].value = 0;
        }
        const actor = { system: { tier }, items: [item] };
        // Lancer 3.1.3 currentProfile(), NPC Weapon branch: profile indexes the
        // actor's tier, even when the item has tier_override (adapter refuses it).
        item.currentProfile = () => ({ type: d.weapon_type?.includes('Melee') ? 'Melee' : null,
          range: [...(d.range ?? [])], damage: [...(d.damage?.[tier - 1] ?? [])],
          accuracy: d.accuracy?.[tier - 1] ?? 0, attack: d.attack_bonus?.[tier - 1] ?? 0 });
        const before = JSON.stringify(d);
        const result = readNpcWeapons(actor);
        assert.equal(JSON.stringify(d) === before, true, 'Weapon extraction must not mutate its input.');
        assert(result.weapons.length > 0 || result.excludedWeapons.length > 0,
          `Tier ${tier} weapon ${d.lid} vanished without a diagnostic.`);
        if (result.weapons.length) {
          supported++; variants += result.weapons.length;
          assert.equal(result.excludedWeapons.length, 0);
          assert(result.weapons.every(weapon => weapon.itemId === item.id));
          const hasEffect = String(d.effect ?? '').trim().length > 0;
          const hasOnHit = String(d.on_hit ?? '').trim().length > 0;
          assert(!hasOnHit, 'Unreviewed On Hit text must not be accepted.');
          assert(!hasEffect || reviewedRamCannon(item, tier), 'Unreviewed Effect text must not be accepted.');
        } else {
          excluded++;
          assert(result.excludedWeapons.every(weapon => weapon.itemId === item.id
            && typeof weapon.reason === 'string' && weapon.reason.trim().length > 0));
        }
      }
      assert.equal(supported + excluded, rawWeapons.length);
      coverage.push({ tier, weaponRecords: rawWeapons.length, supported, excluded, variants });
    }
    assert.equal(JSON.stringify(records) === immutableSource, true, 'Source catalogue records must remain unchanged.');
    assert.equal(JSON.stringify(fileHashes()) === sourceBefore, true, 'Original database files must remain unchanged.');
    console.log(JSON.stringify({ accountingOnly: true, classes: report.classes.length,
      templates: report.templates.length, features: report.features.length,
      unresolvedReferences: report.counts.unresolvedReferences, weaponCoverage: coverage }));
  } finally {
    try { if (db) await db.close(); }
    finally {
      assert.equal(dirname(temporary), temporaryRoot);
      assert(basename(temporary).startsWith('npc-roster-test-'));
      rmSync(temporary, { recursive: true, force: true });
    }
  }
});
