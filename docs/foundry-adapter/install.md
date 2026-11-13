---
type: Runbook
title: "Install and plan a turn in a staged scene"
description: "Install the module, start the relay, create the GM macro and review a proposal."
status: draft
tags: [foundry, operations]
sources:
  - resource: ../../foundry-module/scripts/pilot.mjs
  - resource: ../../foundry-module/scripts/adapter/controller.mjs
  - resource: ../../foundry-module/scripts/adapter/review.mjs
  - resource: ../../tools/build-release.ps1
  - resource: ../VERSIONING.md
generated:
  by: claude/claude-opus-5-5
  at: 2026-11-13T06:00:00Z
stale_after: 2027-01-30T00:00:00Z
---
# Install and plan a turn in a staged scene

Part of the [Foundry adapter guide](../foundry-adapter.md).

1. Use Foundry **Setup → Add-on Modules →
   Install Module → Manifest URL** with:

   ```text
   https://github.com/masterevan27/lancer-npc-pilot/releases/latest/download/module.json
   ```

   Later published versions are available through **Check Update / Update All**.
   The public 0.3.1 manifest and ZIP are available at this URL.
   For local staging from source, copy the **contents** of `foundry-module/`
   into a Foundry user-data module directory named `lancer-npc-pilot`, with
   `module.json` at its root, or extract the locally built release ZIP there.
   See [versioning and releases](../VERSIONING.md). Module updates do not update or
   restart the separate relay.
2. Enable **Lancer NPC Pilot** in a disposable Lancer world. The reference
   environment is Foundry 13.351 with Lancer 3.1.3.
3. For default model mode, start the [relay](../../relay/README.md) on the GM's PC with a shared secret and
   the Foundry origin in `PILOT_ALLOWED_ORIGINS`. Keep provider API keys in the
   relay environment only. Development 0.8.0 also has an opt-in
   [module policy mode](policy-mode.md) that needs no relay.
4. As GM, create a Script macro containing:

   ```js
   if (!game.user?.isGM) {
     return ui.notifications.info('NPC Pilot planning is GM-only. No action was taken.');
   }
   const api = game.modules.get('lancer-npc-pilot')?.api;
   if (!api) {
     return ui.notifications.warn('NPC Pilot is unavailable. Enable it in a Lancer world and reload.');
   }
   await api.planTurn();
   ```

   **Alt+P** opens the same workflow for GMs; the restricted binding is absent
   from player settings. A player controlling a mech still cannot plan NPC
   turns. Existing copied macros need the guarded command above; module updates
   do not rewrite world macros. First GM use in model mode opens Relay settings. Choose
   Local / OpenAI compatible or Anthropic API, enter the relay shared secret,
   and optionally override the model. A blank override uses the relay setting.
   These values are browser-client settings; a provider API key is never needed
   in Foundry. The saved shared secret is not inserted into rendered HTML.
5. Start a combat and select an NPC turn. Development 0.7.0 and later read remaining
   native movement and actions, including a manually started partial turn.
   If a quick slot was already spent, earlier action identity is unknown;
   attacks and Boost stay manual rather than risking an illegal repeat or mode switch.
   Review the remaining budget shown above the ranked
   alternatives, exact route, model reason, optional NPC line and warnings.
   An unusable model ID gets one retry, then the top option is labeled
   **fallback**. A connection error takes no action.
6. Use **Skip** or **Do it manually** while execution is off. Close also skips.
   **Re-ask model** makes another model request; **Relay settings** changes
   provider/model configuration. Anthropic requests incur provider usage.
7. For a simple staged scene only, use **Review terrain** to confirm that walls
   and configured terrain account for obstacles and movement costs. Then enable
   **Enable token execution (staged scenes only)** in module settings and
   request a new proposal. This reveals **Execute selected** to Foundry's
   active GM. The radio buttons choose an alternative instead of the model pick.

Optional **Offer a proposal when an NPC turn starts** is a world setting. It
only opens planning/review on Foundry's active GM client. It never auto-approves.
If the combat changes while a dialog is open, discard it and request a new
proposal. A second tab's request cannot approve the first tab's stored object.
