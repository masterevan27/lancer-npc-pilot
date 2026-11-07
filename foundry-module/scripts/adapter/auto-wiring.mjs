// Pure helpers for wiring auto mode into Foundry. No Foundry globals.

/** `${combat.id}:${combat.round}:${combat.turn}:${combatant.id}` */
export function turnKeyFor(combat) {
  return `${combat?.id}:${combat?.round}:${combat?.turn}:${combat?.combatant?.id}`;
}

/** What the outcome observer should expect for an attack option. Targets keep option order. */
export function buildOutcomeExpectation(option, board, { getToken }) {
  const attacker = getToken(board?.snapshot?.activeTokenId);
  const actor = attacker?.actor;
  if (!actor) throw new Error('The attacking token or actor is missing.');
  const item = actor.items?.get?.(option.action?.itemId);
  if (!item?.uuid) throw new Error('The attacking weapon could not be found.');
  const targets = (option.action?.targetTokenIds ?? []).map(id => {
    const tok = getToken(id);
    const uuid = tok?.document?.uuid;
    if (!uuid) throw new Error('An attack target could not be found.');
    return { tokenUuid: uuid, name: tok.name ?? tok.document.name ?? '', maxHp: tok.actor?.system?.hp?.max ?? 0 };
  });
  if (!targets.length) throw new Error('The attack has no targets to observe.');
  return { actorId: actor.id, itemUuid: item.uuid, targetTokenUuids: targets.map(t => t.tokenUuid), targets };
}
