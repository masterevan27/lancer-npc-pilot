// Reviewed NPC weapon extraction. Unknown rules stay manual, with a visible reason.
const ORDINARY_TAGS = new Set(['tg_loading', 'tg_limited', 'tg_recharge', 'tg_accurate', 'tg_inaccurate',
  'tg_reliable', 'tg_ap', 'tg_overkill', 'tg_heat_self']);
const RAM_EFFECT = 'This lance can be used as either a ranged or melee weapon, but not both in the same turn. At T2–3, this weapon can make two attacks at a time, targeting either the same character or two different ones.';
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/** Explicitly reviewed installed 3.1.3 payload, not a name-based effect bypass. */
export function reviewedRamCannon(item, tier) {
  const d = item.system;
  return item.type === 'npc_feature' && d.type === 'Weapon' && d.lid === 'npcf_ram_cannon_cataphract'
    && Number(tier) === 1 && !d.tier_override && !d.bonus && !d.override
    && d.weapon_type === 'Heavy Melee/Heavy Cannon' && d.effect === RAM_EFFECT
    && !String(d.on_hit ?? '').trim() && !(d.tags?.length)
    && same(d.range, [{ type: 'Range', val: 5 }, { type: 'Threat', val: 2 }])
    && same(d.damage?.[0], [{ type: 'Kinetic', val: '5' }])
    && d.accuracy?.[0] === 1 && d.attack_bonus?.[0] === 0;
}

export function readNpcWeapons(actor) {
  const weapons = [], excludedWeapons = [];
  for (const item of actor.items ?? []) {
    if (item.type !== 'npc_feature' || item.system.type !== 'Weapon') continue;
    const d = item.system, tier = actor.system.tier;
    const exclude = reason => excludedWeapons.push({ itemId: item.id, name: item.name, reason });
    const tags = (d.tags ?? []).map(t => ({ id: t.lid, val: t.tierVal?.(tier) ?? t.val }));
    const has = id => tags.some(t => t.id === id);
    if (d.destroyed) { exclude('Weapon is destroyed.'); continue; }
    if (d.disabled) { exclude('Weapon is disabled.'); continue; }
    if (has('tg_loading') && d.loaded !== true) { exclude('Loading weapon is unloaded.'); continue; }
    if (has('tg_limited') && !(Number(d.uses?.value) > 0)) { exclude('Limited uses are spent or unknown.'); continue; }
    if (has('tg_recharge') && d.charged !== true) { exclude('Recharge weapon is not charged.'); continue; }
    if (d.tier_override) { exclude('Weapon tier override requires manual play.'); continue; }
    if (['uses_per_round', 'uses_per_turn', 'uses_per_scene'].some(k => Number(d[k]?.value ?? 0) !== 0)) {
      exclude('Custom usage limits require manual play.'); continue;
    }
    const ram = reviewedRamCannon(item, tier);
    if (d.lid === 'npcf_ram_cannon_cataphract' && Number(tier) !== 1) {
      exclude('Ram Cannon T2–3 multiple attacks require manual play.'); continue;
    }
    if (d.lid === 'npcf_ram_cannon_cataphract' && !ram) {
      exclude('Ram Cannon payload differs from the reviewed modes; use manual play.'); continue;
    }
    if (/superheavy/i.test(d.weapon_type ?? '')) { exclude('Superheavy attacks require manual play.'); continue; }
    if (String(d.effect ?? '').trim() && !ram) { exclude('Unreviewed weapon Effect requires manual play.'); continue; }
    if (String(d.on_hit ?? '').trim()) { exclude('Unreviewed On Hit effect requires manual play.'); continue; }
    const unknown = tags.filter(t => !ORDINARY_TAGS.has(t.id));
    if (unknown.length) { exclude(`Unsupported tags: ${unknown.map(t => t.id ?? 'unknown').join(', ')}.`); continue; }
    const p = item.currentProfile();
    if (!ram && /melee/i.test(p.type ?? d.weapon_type ?? '') && p.range?.some(r => r.type === 'Range')) {
      exclude('Mixed melee/ranged classification needs reviewed attack modes.'); continue;
    }
    if (!p.range?.length || p.range.some(r => !['Range', 'Threat'].includes(r.type) || !Number.isFinite(Number(r.val)) || Number(r.val) <= 0)) {
      exclude('Area, special or invalid range requires manual targeting.'); continue;
    }
    const damage = (p.damage ?? []).map(v => ({ type: v.type, val: v.val }));
    if (!damage.length || damage.some(v => !/^(?:\d*d\d+(?:[+-]\d+)?|\d+)$/i.test(String(v.val).replace(/\s/g, '')))) {
      exclude('Unsupported damage expression requires manual play.'); continue;
    }
    const weapon = { itemId: item.id, name: item.name, type: p.type ?? d.weapon_type,
      range: p.range.map(r => ({ type: r.type, val: Number(r.val) })), damage,
      accuracy: Number(p.accuracy ?? 0), attackBonus: Number(p.attack ?? 0), tags,
      loaded: true, uses: has('tg_limited') ? Number(d.uses?.value) : null, destroyed: false };
    if (ram) {
      // Separate identities prevent Threat 2 from inheriting Range 5 or ranged
      // attacks from inheriting melee cover/engagement scoring.
      weapons.push({ ...weapon, mode: 'melee', name: `${item.name} (melee)`, type: 'Melee', range: [{ type: 'Threat', val: 2 }] },
        { ...weapon, mode: 'ranged', name: `${item.name} (ranged)`, type: 'Cannon', range: [{ type: 'Range', val: 5 }] });
    } else weapons.push(weapon);
  }
  return { weapons, excludedWeapons };
}
