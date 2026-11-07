// Read-only classification of what Lancer resolved for an attack Pilot handed off.
// Pilot never rolls, edits or predicts: this only interprets facts Lancer produced.

/** Returns null unless the attackData flags belong to the handed-off attack. `hit` is null when Lancer gave no boolean. */
export function matchAttackCard(flags, expect) {
  if (!flags || typeof flags !== 'object') return null;
  if (flags.origin !== expect.actorId || flags.attackerItemUuid !== expect.itemUuid) return null;
  const targets = (Array.isArray(flags.targets) ? flags.targets : []).map((t) => ({
    tokenUuid: t?.uuid, hit: typeof t?.hit === 'boolean' ? t.hit : null, crit: t?.crit === true,
  }));
  return { targets };
}

/**
 * Damage card (chat flag lancer.damageData) printed by the attacking actor's damage flow.
 * Returns the token uuids it lists, or null when it is not this attack's damage card.
 */
export function matchDamageCard(flags, speakerActorId, expect) {
  if (!flags || typeof flags !== 'object' || speakerActorId !== expect.actorId) return null;
  const uuids = (Array.isArray(flags.targetDamageResults) ? flags.targetDamageResults : [])
    .map((r) => r?.target).filter((u) => typeof u === 'string');
  const allowed = expect.targetTokenUuids ?? [];
  const mine = uuids.filter((u) => !allowed.length || allowed.includes(u));
  return mine.length ? { targetUuids: mine } : null;
}

const num = (v) => (Number.isFinite(v) ? v : 0);

/**
 * Attribution is two-step. Only after the matching attack card AND a damage card from the same
 * attacker that lists the target do HP/structure decreases on that target count as applied.
 * Residual limitation: an unrelated manual HP edit made after the damage card could still be counted.
 */
export class OutcomeTracker {
  #expect; #cards = 0; #targets = null; #changes = new Map();
  #ambiguous = false; #damageCards = 0; #damageTargets = new Set();

  constructor(expect) { this.#expect = expect; }

  onAttackCard(flags) {
    const m = matchAttackCard(flags, this.#expect);
    if (!m) return;
    this.#cards += 1;
    if (this.#cards > 1) return; // sticky ambiguous; keep the first card's targets
    const allowed = this.#expect.targetTokenUuids ?? [];
    this.#targets = m.targets.filter((t) => !allowed.length || allowed.includes(t.tokenUuid));
    // Never infer a result from absence: every expected target needs an explicit boolean hit.
    const complete = this.#targets.length > 0
      && this.#targets.every((t) => typeof t.hit === 'boolean')
      && allowed.every((u) => this.#targets.some((t) => t.tokenUuid === u));
    if (!complete) this.#ambiguous = true;
  }

  onDamageCard(flags, speakerActorId) {
    if (!this.#targets) return; // before the attack card: not this attack's damage
    const m = matchDamageCard(flags, speakerActorId, this.#expect);
    if (!m) return;
    this.#damageCards += 1;
    for (const u of m.targetUuids) this.#damageTargets.add(u);
  }

  /** True while a hit target is listed on the damage card but no decrease has been credited. */
  awaitingDamage(tokenUuid) {
    const t = this.#targets?.find((x) => x.tokenUuid === tokenUuid);
    return !!t?.hit && this.#damageTargets.has(tokenUuid) && !this.#changes.get(tokenUuid)?.counted;
  }

  onHpChange({ tokenUuid, before, after, destroyed }) {
    if (!this.#targets || !this.#damageTargets.has(tokenUuid)) return; // before the attack or damage card: ignore
    const t = this.#targets.find((x) => x.tokenUuid === tokenUuid);
    if (!t || !t.hit) return;
    const hpLost = Math.max(0, num(before?.hp) - num(after?.hp));
    const structLost = Math.max(0, num(before?.structure) - num(after?.structure));
    const cur = this.#changes.get(tokenUuid) ?? { damage: 0, counted: false, destroyed: false };
    if (hpLost > 0 || structLost > 0) cur.counted = true;
    cur.damage += hpLost; // structure-only bookkeeping adds 0
    if (destroyed === true) cur.destroyed = true;
    this.#changes.set(tokenUuid, cur);
  }

  get outcome() {
    const info = new Map((this.#expect.targets ?? []).map((t) => [t.tokenUuid, t]));
    const list = (this.#targets ?? []).map((t) => {
      const c = this.#changes.get(t.tokenUuid);
      return { tokenUuid: t.tokenUuid, name: info.get(t.tokenUuid)?.name ?? null,
        hit: t.hit === true, crit: t.crit, damage: t.hit && c?.counted ? c.damage : null,
        maxHp: info.get(t.tokenUuid)?.maxHp ?? null, destroyed: !!(t.hit && c?.destroyed) };
    });
    let status = 'pending';
    if (this.#ambiguous || this.#cards > 1 || this.#damageCards > 1) status = 'ambiguous';
    else if (this.#targets) {
      const hits = list.filter((t) => t.hit);
      if (!hits.length) status = 'missed'; // every expected target has an explicit hit === false
      else if (hits.every((t) => this.#changes.get(t.tokenUuid)?.counted)) status = 'applied';
    }
    return { status, targets: list };
  }
}
