import { MODULE_ID } from './snapshot.mjs';

export function isResponsibleGM(game) {
  return game.user?.isGM === true && game.users.activeGM?.id === game.user.id;
}

/** Only handed an internally stored, explicitly approved option by the controller. */
export async function executeOption(option, board, choice, { game, canvas, read, withLock, postLine }) {
  if (!isResponsibleGM(game)) throw Error('Only Foundry’s active GM may execute a Pilot plan.');
  return withLock(`lancer-npc-pilot:${board.turn}`, async () => {
    const fresh = read();
    if (fresh.turn !== board.turn || fresh.stamp !== board.stamp || !fresh.terrainReviewed)
      throw Error('The board changed before execution. Re-plan.');
    const token = canvas.tokens.get(board.snapshot.activeTokenId), actor = token?.actor;
    if (!actor || actor.getFlag(MODULE_ID, 'lastExecution') === board.turn) throw Error('This turn was already reserved for execution. Continue manually.');
    const kind = option.action.kind;
    if (!['attack', 'boost', 'retreat', 'hold'].includes(kind)) throw Error('Unsupported action.');
    const item = kind === 'attack' ? actor.items.get(option.action.itemId) : null;
    if (kind === 'attack' && typeof item?.beginWeaponAttackFlow !== 'function') throw Error('The selected Lancer weapon flow is unavailable.');
    if (option.move && typeof token.document.move !== 'function') throw Error('Foundry v13 movement API is unavailable.');
    const tracker = structuredClone(actor.system.action_tracker);
    let expectedPosition = { x: token.document.x, y: token.document.y };
    // Persistent reservation survives reloads. No automatic retry after a partial
    // move or cancelled system HUD: the GM decides what remains of this turn.
    await actor.setFlag(MODULE_ID, 'lastExecution', board.turn);
    let expectedTracker;
    const checkBoard = () => {
      if (!isResponsibleGM(game)) throw Error('The active GM changed. Continue manually.');
      const current = read({ expectedTracker });
      if (token.document.x !== expectedPosition.x || token.document.y !== expectedPosition.y)
        throw Error('The NPC moved away from the approved position. Continue manually.');
      if (current.turn !== board.turn || current.guard !== board.guard) throw Error('The board changed during execution. Continue manually.');
      return current;
    };
    checkBoard();
    if (option.move) {
      const mover = board.snapshot.tokens.find(t => t.id === board.snapshot.activeTokenId);
      const points = option.move.path.slice(1).map(c => canvas.grid.getTopLeftPoint({ i: c.y, j: c.x }));
      const difficult = new Set(board.snapshot.difficult ?? []);
      let cost = 0, split = points.length;
      for (let i = 1; i < option.move.path.length; i++) {
        const c = option.move.path[i]; cost += difficult.has(`${c.x},${c.y}`) ? 2 : 1;
        if (cost > mover.speed) { split = i - 1; break; }
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
      const position = canvas.grid.getTopLeftPoint(option.move ? { i: option.move.to.y, j: option.move.to.x }
        : { i: board.snapshot.tokens.find(t => t.id === board.snapshot.activeTokenId).pos.y,
          j: board.snapshot.tokens.find(t => t.id === board.snapshot.activeTokenId).pos.x });
      if (token.document.x !== position.x || token.document.y !== position.y) throw Error('The NPC is no longer at the approved position.');
      const cell = option.move?.to ?? board.snapshot.tokens.find(t => t.id === board.snapshot.activeTokenId).pos;
      if (!targets?.length || targets.some(id => !current.snapshot.tokens.some(t => t.id === id && t.hp[0] > 0 && !t.defeated)
        || current.snapshot.losFrom[`${cell.x},${cell.y}`]?.[id] !== true)) throw Error('Target or line of sight changed. Continue manually.');
    }
    if (option.move || kind === 'attack' || option.facts.usesBoost) {
      if (option.move) tracker.move = 0;
      if (kind === 'attack' || option.facts.usesBoost) {
        if (tracker.full) tracker.full = false; else tracker.quick = false;
      }
      tracker.protocol = false;
      await actor.update({ 'system.action_tracker': tracker });
      expectedTracker = tracker;
    }
    checkBoard();
    if (choice.line) await postLine(choice.line, token);
    checkBoard();
    if (kind === 'attack') {
      await game.user.updateTokenTargets(option.action.targetTokenIds);
      checkBoard();
      await item.beginWeaponAttackFlow();
      return { status: 'handed-to-lancer' };
    }
    return { status: kind === 'hold' ? 'held' : 'moved' };
  });
}
