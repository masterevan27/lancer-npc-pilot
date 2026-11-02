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
4. Tag the intended commit and push that tag, for example:

   ```powershell
   git tag v0.3.1
   git push origin v0.3.1
   ```

   `.github/workflows/release.yml` runs the tests, validates the tag and packages
   the module, then creates a GitHub release with both assets and marks it latest.
   It uses the workflow's built-in GitHub token; no personal access token or
   model API key is needed. A normal branch push does not publish a release.
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
