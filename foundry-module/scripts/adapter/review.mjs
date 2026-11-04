import { describeOption } from '../core/prompt.mjs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderReview(review, canExecute) {
  const actor = review.snapshot.tokens.find(t => t.id === review.snapshot.activeTokenId);
  const budget = review.snapshot.actionBudget;
  return `<section class="npc-pilot-review">
    <h2>${escapeHtml(actor?.name)} — turn proposal</h2>
    ${review.mode==='policy' ? `<p>Policy: ${escapeHtml(review.policyId ?? 'unconfigured')} · ${escapeHtml(review.state)}</p>
    <ul>${(review.diagnostics ?? []).map(d=>`<li>${escapeHtml(d)}</li>`).join('')}</ul>` : ''}
    ${budget ? `<p>Movement remaining: ${escapeHtml(budget.move)} · Quick actions remaining: ${escapeHtml(budget.quick)} · Full action available: ${budget.full ? 'yes' : 'no'}<br>Protocol available: ${budget.protocol ? 'yes' : 'no'} · Reaction available: ${budget.reaction ? 'yes' : 'no'}</p>` : ''}
    <p>Choice: <strong>${escapeHtml(review.choice.source)}</strong>. ${escapeHtml(review.choice.reason)}</p>
    ${review.choice.line ? `<blockquote>${escapeHtml(review.choice.line)}</blockquote>` : ''}
    <p>${review.mode==='policy' && !['ready','partial'].includes(review.state) ? 'Configuration or order input is required. Re-plan or play manually.'
      : canExecute ? 'Review the route and targets before approving. Lancer handles all rolls and outcomes.' : 'Execution is disabled. Enable execution and review scene terrain before approving.'}</p>
    <fieldset><legend>Ranked alternatives — pick one to execute</legend>${review.options.map(o =>
      `<label class="npc-pilot-option"><input type="radio" name="option" value="${escapeHtml(o.id)}" ${o.id === review.choice.optionId ? 'checked' : ''}>
      <span><strong>${escapeHtml(o.id)} · score ${Number(o.score).toFixed(2)}</strong><br>${escapeHtml(describeOption(o))}
      ${o.move ? `<small>Route: ${escapeHtml(o.move.path.map(p => `(${p.x},${p.y})`).join(' → '))}</small>` : ''}
      ${o.action.kind==='impale'?`<small>Pause before save: ${escapeHtml(`(${o.move.path[o.action.pauseIndex].x},${o.move.path[o.action.pauseIndex].y})`)}. On failed save, target route: ${escapeHtml(o.action.carryPath.map(p=>`(${p.x},${p.y})`).join(' → '))}</small>`:''}
      ${o.mechanics?.grapple?`<small>Grappled partner route: ${escapeHtml(o.mechanics.grapple.carriedPath.map(p=>`(${p.x},${p.y})`).join(' → '))}</small>`:''}
      ${o.facts.trampleContacts?.length?`<small>Potential Trample contacts (native mitigation and existing turn claims apply): ${o.facts.trampleContacts.map(c=>escapeHtml(review.snapshot.tokens.find(t=>t.id===c.tokenId)?.name??c.tokenId)).join(', ')}</small>`:''}</span></label>`).join('')}</fieldset>
    <ul class="npc-pilot-warnings">${review.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
  </section>`;
}

export async function showReview(review, { DialogV2, canExecute }) {
  const policy=review.mode==='policy';
  const eligible=!policy || (['ready','partial'].includes(review.state) && review.options.length>0);
  const button = (action, label, extra = {}) => ({ action, label,
    callback: (_event, b) => ({ action, optionId: b.form.elements.option?.value }), ...extra });
  return DialogV2.wait({ window: { title: 'Lancer NPC Pilot' }, position: { width: 700 },
    classes: ['npc-pilot-dialog'], content: renderReview(review, canExecute), rejectClose: false,
    buttons: [...(canExecute && eligible ? [button('execute', 'Execute selected')] : []),
      button('reask', policy ? 'Re-plan' : 'Re-ask model'), button('configure', policy ? 'Policy settings' : 'Relay settings'), button('terrain', 'Review terrain'),
      button('skip', 'Skip', { default: true }), button('manual', 'Do it manually')] });
}
