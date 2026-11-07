// Read-only classification of what Lancer resolved for an attack Pilot handed off.
// Pilot never rolls, edits or predicts: this only interprets facts Lancer produced.

/** Returns null unless the attackData flags belong to the handed-off attack. */
export function matchAttackCard(flags, expect) {
  if (!flags || typeof flags !== 'object') return null;
  if (flags.origin !== expect.actorId || flags.attackerItemUuid !== expect.itemUuid) return null;
  const targets = (Array.isArray(flags.targets) ? flags.targets : []).map((t) => ({
    tokenUuid: t.uuid, hit: t.hit === true, crit: t.crit === true,
  }));
  return { targets };
}

const num = (v) => (Number.isFinite(v) ? v : 0);

export class OutcomeTracker {
  #expect; #cards = 0; #targets = null; #changes = new Map();

  constructor(expect) { this.#expect = expect; }

  onAttackCard(flags) {
    const m = matchAttackCard(flags, this.#expect);
    if (!m) return;
    this.#cards += 1;
    if (this.#cards > 1) return; // sticky ambiguous; keep the first card's targets
    const allowed = this.#expect.targetTokenUuids ?? [];
    this.#targets = m.targets.filter((t) => !allowed.length || allowed.includes(t.tokenUuid));
  }

  onHpChange({ tokenUuid, before, after, destroyed }) {
    if (!this.#targets) return; // before the attack card: ignore
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
        hit: t.hit, crit: t.crit, damage: t.hit && c?.counted ? c.damage : null,
        maxHp: info.get(t.tokenUuid)?.maxHp ?? null, destroyed: !!(t.hit && c?.destroyed) };
    });
    let status = 'pending';
    if (this.#cards > 1) status = 'ambiguous';
    else if (this.#targets) {
      const hits = list.filter((t) => t.hit);
      if (!hits.length) status = 'missed'; // vacuous when no target was hit
      else if (hits.every((t) => this.#changes.get(t.tokenUuid)?.counted)) status = 'applied';
    }
    return { status, targets: list };
  }
}
