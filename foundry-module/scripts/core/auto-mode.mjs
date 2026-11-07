// Pure auto-mode gating and turn lifecycle. No Foundry globals.

/** Decide whether an NPC turn may run without the GM pressing Execute. */
export function shouldAutoRun({ autoMode, executionEnabled, isResponsibleGM, actorOptOut, isNpc, side } = {}) {
  const no = reason => ({ auto: false, reason });
  if (!autoMode) return no('Auto mode is off.');
  if (!executionEnabled) return no('Execution is disabled.');
  if (!isResponsibleGM) return no('Only the responsible GM client runs turns automatically.');
  if (!isNpc) return no('Only NPC turns run automatically.');
  if (actorOptOut) return no('This actor is opted out of auto mode.');
  if (side !== 'hostile' && side !== 'friendly') return no('Neutral combatants are not run automatically.');
  return { auto: true, reason: 'All auto-mode gates are open.' };
}

/** Execute only a ready/partial review whose chosen option exists; otherwise stop for the GM. */
export function nextAutoStep(review, { canExecute, terrainReviewed } = {}) {
  const stop = why => ({ action: 'review', why });
  if (!review || !['ready', 'partial'].includes(review.state)) return stop('The plan is not ready to execute.');
  const options = Array.isArray(review.options) ? review.options : [];
  if (!options.length) return stop('The plan has no options.');
  const optionId = review.choice?.optionId;
  if (optionId == null || !options.some(o => o.id === optionId)) return stop('No option has been chosen.');
  if (!canExecute) return stop('Execution is not available for this plan.');
  if (!terrainReviewed) return stop('Terrain has not been reviewed.');
  return { action: 'execute', optionId };
}

const live = ['thinking', 'acting', 'awaiting-resolution'];

export class TurnLifecycle {
  state = 'idle';
  turnKey = null;
  holdReason = null;

  #to(next, from) {
    if (!from.includes(this.state)) throw new Error(`Invalid turn transition: ${this.state} -> ${next}`);
    this.state = next;
    return next;
  }

  start(turnKey) {
    this.turnKey = turnKey;
    this.holdReason = null;
    this.state = 'thinking';
    return this.state;
  }
  decided() { return this.#to('acting', ['thinking']); }
  handedOff({ expectsAttack } = {}) {
    return this.#to(expectsAttack ? 'awaiting-resolution' : 'done', ['acting']);
  }
  resolved() { return this.#to('done', ['awaiting-resolution']); }
  hold(why) {
    const state = this.#to('held', live);
    this.holdReason = why ?? null;
    return state;
  }
  cancel() { return this.#to('cancelled', [...live, 'held']); }
  forceEnd() { return this.#to('done', [...live, 'held']); }
}
