---
type: Runbook
title: "Full NPC coverage work and catalogue audit"
description: "Status of full special-ability coverage and the read-only catalogue audit and coverage report tools."
status: draft
tags: [foundry, npc-coverage]
sources:
  - resource: ../../tools/audit-npc-catalog.mjs
  - resource: ../../tools/report-npc-coverage.mjs
  - resource: ../review-evidence/2026-11-02-coverage-diagnostics.md
  - resource: ../superpowers/plans/2026-11-01-full-npc-coverage.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Full NPC coverage work and catalogue audit

Part of the [Foundry adapter guide](../foundry-adapter.md).

The owner requested full special-ability support across NPC classes on 2026-11-01.
That work is planned in the [full coverage plan](../superpowers/plans/2026-11-01-full-npc-coverage.md);
the current adapter does not yet provide it. The local catalogue audit contains
44 classes (including drones/deployables), 15 templates and 461 features. This is
an inventory of the installed pack, not every published or homebrew NPC and not
a passing execution matrix. Area attacks, tech, special effects, passive/template
modifiers and reactions still have the manual restrictions listed in the
[supported subset](supported-subset.md).
Native large footprints are supported within the same geometry restrictions;
size-dependent special abilities remain manual. Lancer system flows do not
resolve all of those rules automatically.

Run a read-only inventory with explicit local paths:

```powershell
node tools/audit-npc-catalog.mjs --pack <npc-items-directory> --foundry-code-root <Foundry-code-directory>
```

The audit opens a disposable copy of the pack, reports class/feature crosslinks
and mechanics signals, and omits raw ability prose and world/document IDs. Its
results describe coverage work remaining, not permission to execute an ability.

The frozen diagnostic report needs no installed database or model call:

```powershell
node tools/report-npc-coverage.mjs
node tools/report-npc-coverage.mjs --lid npcf_trample_cataphract
node tools/report-npc-coverage.mjs --chunk 2
```

It accounts for all feature/tier records, class/template owners and unassigned
features. Source classification and implementation gates remain separate from
executable descriptor support. See the [coverage evidence](../review-evidence/2026-11-02-coverage-diagnostics.md).

## Related

- [Supported scenes, tokens and weapons](supported-subset.md)
- [Cataphract mechanics (development 0.9.0)](cataphract-mechanics.md)
- [NPC mechanics and tactical behavior roadmap](../roadmap.md)
