import { MODULE_ID } from './snapshot.mjs';
import { prepareModeFlow } from './weapon-flow.mjs';
import { normalizeBudget, spend } from '../core/budgets.mjs';
import { pathCost, movementContext, stepCost } from '../core/reach.mjs';

/** Diagnose stale guards using field paths only; never log document values. */
export function changedGuardPaths(before, after) {
  const paths = [];
  const walk = (a, b, path) => {
    if (paths.length >= 8 || JSON.stringify(a) === JSON.stringify(b)) return;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[key], b[key], `${path}.${key}`);
    } else paths.push(path);
  };
  walk(JSON.parse(before), JSON.parse(after), 'board');
  return paths;
}

export function isResponsibleGM(game) {
  return game.user?.isGM === true && game.users.activeGM?.id === game.user.id;
}

/** Only handed an internally stored, explicitly approved option by the controller. */
export async function executeOption(option, board, choice, { game, canvas, read, withLock, postLine, verifyDecision = () => {} }) {
  if (!isResponsibleGM(game)) throw Error('Only Foundry’s active GM may execute a Pilot plan.');
  return withLock(`lancer-npc-pilot:${board.turn}`, async () => {
    const fresh = read();
    if (!isResponsibleGM(game)) throw Error('The active GM changed before execution. Re-plan.');
    verifyDecision(fresh);
    if (fresh.turn !== board.turn || fresh.stamp !== board.stamp || !fresh.terrainReviewed)
      throw Error('The board changed before execution. Re-plan.');
    const token = canvas.tokens.get(board.snapshot.activeTokenId), actor = token?.actor;
    if (!actor || actor.getFlag(MODULE_ID, 'lastExecution') === board.turn) throw Error('This turn was already reserved for execution. Continue manually.');
    const kind = option.action.kind;
    if (!['attack', 'boost', 'retreat', 'hold'].includes(kind)) throw Error('Unsupported action.');
    const item = kind === 'attack' ? actor.items.get(option.action.itemId) : null;
    if (kind === 'attack' && typeof item?.beginWeaponAttackFlow !== 'function') throw Error('The selected Lancer weapon flow is unavailable.');
    if (kind === 'attack' && typeof canvas.tokens.setTargets !== 'function') throw Error('Foundry v13 targeting API is unavailable.');
    const modeFlow = kind === 'attack' && option.action.mode
      ? prepareModeFlow(item, actor, option.action.mode, game) : null;
    if (option.move && typeof token.document.move !== 'function') throw Error('Foundry v13 movement API is unavailable.');
    const mover = board.snapshot.tokens.find(t => t.id === board.snapshot.activeTokenId);
    const positionFor = c => {
      const p = board.positions?.[`${c.x},${c.y}`];
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.y)) throw Error('Approved token waypoint geometry is unavailable. Re-plan.');
      return { x: p.x, y: p.y };
    };
    const route = option.move?.path ?? [mover.pos];
    const approvedPoints = route.map(positionFor);
    const finalPosition = positionFor(option.move?.to ?? mover.pos);
    if (token.document.x !== approvedPoints[0].x || token.document.y !== approvedPoints[0].y)
      throw Error('The NPC is no longer at the approved starting position. Re-plan.');
    const tracker = structuredClone(actor.system.action_tracker);
    const budget = board.snapshot.actionBudget ?? normalizeBudget(tracker, { speed: mover.speed });
    const routeCost = pathCost(board.snapshot, mover.id, route);
    if (routeCost === null || routeCost !== (option.move?.cost ?? 0))
      throw Error('Approved movement route or cost is no longer valid. Re-plan.');
    let projected = budget;
    if (option.facts.usesBoost) projected = spend(projected, { boost: 1 });
    projected = spend(projected, { move: routeCost, quick: kind === 'attack' ? 1 : 0 });
    let expectedPosition = { x: token.document.x, y: token.document.y };
    // Persistent reservation survives reloads. No automatic retry after a partial
    // move or cancelled system HUD: the GM decides what remains of this turn.
    await actor.setFlag(MODULE_ID, 'lastExecution', board.turn);
    let expectedTracker = tracker;
    const checkBoard = () => {
      if (!isResponsibleGM(game)) throw Error('The active GM changed. Continue manually.');
      const current = read({ expectedTracker });
      verifyDecision(current);
      if (token.document.x !== expectedPosition.x || token.document.y !== expectedPosition.y)
        throw Error('The NPC moved away from the approved position. Continue manually.');
      if (current.turn !== board.turn || current.guard !== board.guard)
        throw Error(`The board changed during execution. Continue manually. Changed fields: ${changedGuardPaths(board.guard, current.guard).join(', ')}`);
      return current;
    };
    checkBoard();
    if (option.move) {
      const points = approvedPoints.slice(1);
      const context = movementContext(board.snapshot, mover);
      let cost = 0, split = points.length;
      for (let i = 1; i < option.move.path.length; i++) {
        cost += stepCost(context, option.move.path[i - 1], option.move.path[i]);
        if (cost > budget.move) { split = i - 1; break; }
      }
      const segments = option.facts.usesBoost ? [points.slice(0, split), points.slice(split)] : [points];
      for (const segment of segments.filter(s => s.length)) {
        checkBoard();
        const moved = await token.document.move(segment, { autoRotate: false });
        await token.movementAnimationPromise;
        const end = segment.at(-1);
        if (moved !== true || token.document.x !== end.x || token.document.y !== end.y)
          throw Error('Movement was interrupted. No attack was started; continue manually.');
        expectedPosition = end;
        checkBoard();
      }
    }
    const current = checkBoard();
    if (kind === 'attack') {
      const targets = option.action.targetTokenIds;
      const position = finalPosition;
      if (token.document.x !== position.x || token.document.y !== position.y) throw Error('The NPC is no longer at the approved position.');
      const cell = option.move?.to ?? board.snapshot.tokens.find(t => t.id === board.snapshot.activeTokenId).pos;
      if (!targets?.length || targets.some(id => !current.snapshot.tokens.some(t => t.id === id && t.hp[0] > 0 && !t.defeated)
        || current.snapshot.losFrom[`${cell.x},${cell.y}`]?.[id] !== true)) throw Error('Target or line of sight changed. Continue manually.');
    }
    if (option.move || kind === 'attack' || option.facts.usesBoost) {
      await actor.update({ 'system.action_tracker': projected.nativeTracker });
      expectedTracker = projected.nativeTracker;
    }
    checkBoard();
    if (choice.line) await postLine(choice.line, token);
    checkBoard();
    if (kind === 'attack') {
      await canvas.tokens.setTargets(option.action.targetTokenIds, { mode: 'replace' });
      checkBoard();
      if (modeFlow) await modeFlow.begin();
      else await item.beginWeaponAttackFlow();
      return { status: 'handed-to-lancer' };
    }
    return { status: kind === 'hold' ? 'held' : 'moved' };
  });
}
