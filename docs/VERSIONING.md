---
type: Runbook
title: "Versioning and Foundry releases"
description: "Version source, increment rules and the Foundry release packaging procedure."
status: draft
tags: [operations, release]
sources:
  - resource: ../VERSION
  - resource: ../package.json
  - resource: ../foundry-module/module.json
  - resource: ../tools/build-release.ps1
  - resource: ../.github/workflows/release.yml
generated:
  by: codex/unrecorded
  at: 2026-11-02T05:41:34Z
stale_after: 2027-02-09T00:00:00Z
---
# Versioning

The root `VERSION` file holds the project version (SemVer). It stays `0.x`
until live acceptance on the lab Foundry passes. Bump the minor version for
new behavior and the patch version for fixes. Once the Foundry module ships,
its `module.json` `version` must equal `VERSION`.

## Publishing a Foundry release

Release packaging uses PowerShell 5.1 or newer (PowerShell 7 `pwsh` also works)
and Node for tests; no npm dependencies are needed. The release workflow runs
on GitHub's Windows runner. Version 0.3.1 fixes Windows release packaging after
the failed v0.3.0 workflow; it does not change gameplay behavior or close its
staged acceptance gates.

1. Set `VERSION`, `package.json` and `foundry-module/module.json` to the same
   version. Update the manifest's `download` URL to the matching `vX.Y.Z` ZIP.
   Keep `manifest` pointing at `releases/latest/download/module.json`.
2. Run `node --test`, then build locally from the repository root:

   ```powershell
   ./tools/build-release.ps1 -Tag v0.3.1
   ```

   Substitute the intended version for later releases. This produces ignored
   `dist/module.json` and `dist/lancer-npc-pilot.zip`. The ZIP contains the
   manifest at its root, runtime `.mjs` scripts, `.css` styles and `LICENSE`.
   Relay files, tests, tooling and environment files are excluded. Existing
   output files cause an error; explicitly remove those two artifacts before
   rebuilding. Version, URL and tag mismatches fail before packaging.
3. Review and commit the release changes. When ready to publish, integrate
   them into `main` and push that branch. Make the repository public (or provide
   another unauthenticated hosting arrangement) so Foundry can fetch both assets.
   Enable GitHub Actions for the repository.
4. A push to `main` that changes the root `VERSION` file automatically runs
   `.github/workflows/release.yml`. The workflow runs the tests, validates the
   matching version sources and release URLs, and packages the module. It creates
   the matching `vX.Y.Z` tag at that push's exact commit and publishes a GitHub
   release with both assets, marked latest. Use a new version for each release;
   the workflow does not bump versions or overwrite existing releases.
   Agents continue updating the version files after changes under the existing
   versioning rules. An existing tag must point to the exact source commit.

   Main pushes that do not change `VERSION` do not publish a release. Update all
   three version sources and the download URL together as described in step 1.
   The workflow uses its built-in GitHub token; no personal access token or
   model API key is needed.

   Manual version-tag pushes remain supported, for example:

   ```powershell
   git tag v0.3.1
   git push origin v0.3.1
   ```

   A manual tag must match `VERSION` exactly. Do not also push a manual tag for
   a version being published automatically from `main`.
   If publication fails, inspect the workflow and release state before retrying;
   an existing release is not overwritten automatically.
   Rerunning a failed tag workflow uses that tag's original source. If code
   needs fixing, land the fix and publish a new patch version/tag rather than
   expecting a rerun of the old tag to pick it up.
5. Verify both release downloads are accessible while signed out. Install via
   the stable manifest URL in the [adapter guide](foundry-adapter.md), first in
   a disposable test world. Later releases with a higher version appear in
   Foundry's **Check Update / Update All**. Repositories do not need a Foundry
   package-directory listing for installation by manifest URL.

The updater manages the Foundry module only. Update and restart the local relay
separately when its code changes. Never package `relay/.env` or provider keys.

## Related

- [Install and plan a turn in a staged scene](foundry-adapter/install.md)
- [Foundry adapter setup and acceptance](foundry-adapter.md)
- [Documentation index](index.md)
