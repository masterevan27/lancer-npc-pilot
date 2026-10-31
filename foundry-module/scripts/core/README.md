# Pure core

The pure core is plain ES modules with no Foundry, browser or Node-only globals. It turns
a plain-JSON **snapshot** of the board into ranked, legal turn options. It
builds the model prompt and checks the model's reply. Everything here runs
under `node --test` from the repository root.

## Data flow

```
Foundry adapter (milestone 3)               pure core (this folder)
---------------------------------           ------------------------------------------
read combat, tokens, actors, items  ─┐
wall collision -> blocked/blockedMoves│
LOS + cover per (cell, target)       ├─> snapshot ─> validateSnapshot()   snapshot.mjs
                                     ─┘               │
                                                      v
                                            generateOptions()             options.mjs
                                              ├─ reachableCells()         reach.mjs
                                              └─ hitChance(), attackDamage() hit.mjs
                                                      │ TurnOption[] (ids A, B, C...)
                                                      v
                                            buildPrompt(snap, options, {persona})  prompt.mjs
                                                      │ {system, messages}
                                                      v
                                       relay POST /v1/decide  (not in this folder)
                                                      │ text
                                                      v
                                            interpretReply(text, options, {attempt})  reply.mjs
                                                      │ ok | retry (once) | fallback (top score)
                                                      v
GM review dialog -> re-snapshot, check option still matches -> execute through Foundry/Lancer
```

The core never rolls dice. Its numbers are exact probabilities and
expectations for display and ranking. Foundry and the Lancer system roll the
dice.

| File | Exports you will use |
|---|---|
| `snapshot.mjs` | JSDoc typedefs, `validateSnapshot(snap)`, tag/status helpers |
| `grid.mjs` | `cellKey`, `cellDistance`, `neighbors`, `footprint`, hex offset<->axial |
| `hit.mjs` | `hitChance`, `attackDamage`, `parseDamage`, `averageDamage` |
| `reach.mjs` | `reachableCells(snap, tokenId, {maxCost})` |
| `options.mjs` | `generateOptions(snap, {maxOptions, weights})`, `DEFAULT_WEIGHTS` |
| `prompt.mjs` | `buildPrompt(snap, options, {persona, role})`, `describeOption(opt)` |
| `reply.mjs` | `interpretReply(text, options, {attempt})`, `retryMessage(error, options)` |

## Snapshot contract (for the adapter author)

The full JSDoc typedefs are in `snapshot.mjs`, and the four fixtures in
`foundry-module/test/fixtures/` are working examples. Always run
`validateSnapshot` first. Errors make the snapshot unusable. Warnings point
out data that the core ignores or approximates.

### Coordinates

- Every position is a **grid cell** `{x: column, y: row}` of integers, never
  pixels. Cell keys are the string `"x,y"`.
- Foundry v13 offsets are `{i: row, j: column}`. Map them to `{x: j, y: i}`.
- `token.pos` is the token's **anchor cell**. On square grids that is the
  top-left cell of its n x n footprint. Size 1/2 and size 1 take 1 cell, size 2
  takes 2x2 and size 3 takes 3x3.
- **Hex grids:** `grid.type: "hex"` with `grid.hexLayout` set to one of
  `"odd-r"` (the default), `"even-r"`, `"odd-q"` or `"even-q"`. These are
  offset layouts in Red Blob Games naming. `-r` is pointy-top with rows
  offset. `-q` is flat-top with columns offset. Foundry calls them `HEXODDR`,
  `HEXEVENR`, `HEXODDQ` and `HEXEVENQ`. **Verify the parity on a live scene**
  by checking that two cells Foundry calls adjacent are at `cellDistance` 1
  here. **Limitation:** on hex grids every token is treated as one cell, so
  multi-hex footprints are not modelled.
- **Square grids:** `grid.diagonals` is `"equidistant"` (the default; a
  diagonal step costs 1) or `"rectilinear"` (no diagonal steps). Other Foundry
  diagonal rules (alternating 1-2-1, exact) are not supported. Map them to
  one of these two, or refuse.
- `grid.width` and `grid.height` are optional bounds in cells.

### Walls, terrain, cover

- `blocked`: cells no token may enter, such as solid terrain or cells inside walls.
- `blockedMoves`: **directed** steps `"x1,y1>x2,y2"` between adjacent cells
  that a wall blocks. Foundry walls are segments, not cells, so this is the
  main output of the collision test. For every reachable cell and every
  neighbour, test movement collision centre-to-centre, including diagonals,
  and add both directions when the wall blocks both ways. On square grids the
  core also refuses diagonal steps that cut the corner of a `blocked` cell.
- `difficult`: cells that cost 2 spaces to enter.
- `cover`: `{"x,y": "soft"|"hard"}`, the cover a token standing in that cell
  has, with no direction. It feeds the NPC's own defensive score and serves as
  the fallback cover for targets.

### Line of sight: `losFrom`

`losFrom["x,y"][targetTokenId]` holds LOS **from the active token with its
anchor at x,y** to that target. The value is either `true` or `false`, or
`{visible, cover}`, where `cover` is the target's cover against an attacker
in that cell. Per-pair cover beats the cell `cover` map.

- Fill it for every cell `reachableCells(snap, activeId)` returns, which means
  within Speed. Fill it for every hostile token.
- **A missing entry means unknown, and unknown is never treated as
  visible.** An attack needs a known `true` or `visible: true`. Hide needs a
  known `false` for every enemy.
- For size > 1, compute LOS from any cell of the footprint, which is what the
  fixture builder does. Check that against the Lancer rules for large mechs.

### Tokens

Required: `id`, `name`, `side` (`hostile`|`friendly`|`neutral`), `pos`,
`size`, `hp` `[cur, max]`, `armor`, `evasion`, `edef`, `speed`.
Optional: `heat`, `structure`, `stress` (all `[cur, max]`), `overshield`,
`statuses`, `resistances` (damage type names), `weapons`, `features`,
`persona`, `defeated`.

- `side` comes from token disposition. Hostile and friendly are enemies of
  each other. Neutral tokens are nobody's target, but they block movement.
- `defeated: true` or `structure[0] <= 0` takes a token out completely: it is
  not a target and not an obstacle. Put wreck cells in `blocked` if wrecks
  should obstruct.
- Statuses are matched case- and punctuation-insensitively (`"Lock On"` =
  `"LOCKON"`). The ones the core uses are `STUNNED`, `IMMOBILIZED`, `SLOWED`,
  `IMPAIRED`, `PRONE`, `LOCKON`, `INVISIBLE`, `EXPOSED` and `SHREDDED`.

### Weapons

`{itemId, name, type, range: [{type, val}], damage, accuracy, attackBonus,
tags, loaded, uses, destroyed}`, with **tier already resolved** by the
adapter. NPC items store per-tier arrays.

- `range` types are `Range` and `Threat`, used for single-target attacks.
  `Blast` riders are ignored: the primary target is attacked. A weapon that
  has only `Line`, `Cone` or `Burst` gets no options in v1.
- A weapon is melee when `type` contains "Melee", or when it has Threat but no Range.
- `damage` is `"1d6+2 Kinetic"`, `"1d6 Kinetic + 2 Burn"` or Lancer-style
  `[{type, val}]`.
- `accuracy` is net accuracy in dice: positive means accuracy, negative means
  difficulty. `attackBonus` is the flat d20 bonus, such as the NPC tier attack bonus.
- Tags are strings (`"Heat 2 (Self)"`, `"Reliable 2"`, `"AP"`) or
  `{id: "tg_reliable", val: 2}`. The core uses `ap`, `reliable`, `overkill`,
  `accurate`, `inaccurate`, `heat_self`, `smart` and `seeking`.
- `loaded: false`, `uses` 0 (number or `[cur, max]`) and `destroyed: true`
  each make the weapon unusable.

## TurnOption

```js
{
  id: 'A',                      // A, B, C... by rank
  key: 'attack:w-rifle:pc1',    // stable dedupe key (kind:item:target)
  move: { to: {x, y}, path: [{x, y}, ...], cost } | null,   // path starts at the token; null = stays put
  action: { kind: 'attack'|'boost'|'retreat'|'hide'|'hold', itemId?, targetTokenIds? },
  score: 4.21,
  category: 'aggressive'|'defensive'|'reposition',
  facts: { hitChance, critChance, expectedDamage, expectedBurn, zeroHpChance, netAccuracy,
           targetDefense, defenseType, targetCover, distanceToTarget, cover, inEnemyThreat,
           enemiesInRange, nearestEnemy, heatAfter, heatCap, overheats, moveCost, usesBoost, ... }
}
```

- `attack` moves at most Speed, then attacks. `hide` moves at most Speed.
  `boost` and `retreat` may move up to 2 x Speed in a single path, which means
  standard move plus Boost. `facts.usesBoost` tells the executor to split the
  path after `speed` spaces.
- Only the best end cell is kept for each weapon x target pair (and for each
  boost target, plus one retreat, one hide and one hold). After that, the top
  N are chosen while keeping the best aggressive, defensive and reposition
  option whenever one exists.
- Scoring weights are in `DEFAULT_WEIGHTS`, roughly in "expected HP damage"
  units. Override them with `generateOptions(snap, { weights: {...} })`.
- Options are deterministic. Ties go to the shorter move, then the lower
  row and column.

**Before executing, re-snapshot** and check that the option is still legal.
The simplest way is to regenerate the candidates and look for the same
`key` with the same `move.to`.

## Reply handling

```js
let res = interpretReply(text, options, { attempt: 0 });
if (res.status === 'retry') {
  const text2 = await relay(/* same request + assistant text + user retryMessage(res.error, options) */);
  res = interpretReply(text2, options, { attempt: 1 });
}
// res.status: 'ok' (model pick) | 'fallback' (top-scored option; label it "fallback" in the UI)
```

The parser strips code fences and surrounding prose and accepts ids like
`"b"`, `"B."` or `"Option B"`. It cuts `reason` to 25 words and `line` to 20,
and strips control characters.

## Rule assumptions to verify

Every interpretation is marked `RULE?` in the source. The list is at the top
of `hit.mjs`, `reach.mjs` and `options.mjs`. Regenerate the fixtures with
`node foundry-module/tools/build-fixtures.mjs` after changing a spec.
