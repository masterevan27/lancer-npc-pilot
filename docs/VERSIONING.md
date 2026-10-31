# Versioning

The root `VERSION` file holds the project version (SemVer). It stays `0.x`
until live acceptance on the lab Foundry passes. Bump the minor version for
new behavior and the patch version for fixes. Once the Foundry module ships,
its `module.json` `version` must equal `VERSION`.
