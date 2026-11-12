# Agent instructions

Dashboard project ID: `lancer-npc-pilot`. The shared rules are in `~/.agents/AGENTS.md`.

Read [docs/design.md](docs/design.md) before changing anything. The anti-goals there
are hard rules: the AI never rolls or invents outcomes, nothing executes without
GM approval unless auto mode is on, and the API key never reaches the browser,
the world data or the repository.

- Module: plain ES modules, no build step. Relay: Node >= 20 built-ins only.
- Tests: `node --test` from the repository root. Keep the core pure and testable
  with JSON fixtures.
- Cloud agents can't reach `*.lab.spiralfrenzy.com` or the owner's PC. Mark live
  Foundry or Ollama behavior as unverified.
- Version is the root `VERSION` file; see [docs/VERSIONING.md](docs/VERSIONING.md).
- Docs: start at [docs/index.md](docs/index.md). The bundle follows the pinned OKF
  profile in `.okf/tools`; install with `npm ci --prefix .okf/tools --ignore-scripts
  --no-audit --no-fund` and check with `node .okf/tools/cli.mjs check .`.
