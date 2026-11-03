import { describeOption } from '../core/prompt.mjs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderReview(review, canExecute) {
  const actor = review.snapshot.tokens.find(t => t.id === review.snapshot.activeTokenId);
  const budget = review.snapshot.actionBudget;
  return `<section class="npc-pilot-review">
    <h2>${escapeHtml(actor?.name)} — turn proposal</h2>
    ${budget ? `<p>Movement remaining: ${escapeHtml(budget.move)} · Quick actions remaining: ${escapeHtml(budget.quick)} · Full action available: ${budget.full ? 'yes' : 'no'}<br>Protocol available: ${budget.protocol ? 'yes' : 'no'} · Reaction available: ${budget.reaction ? 'yes' : 'no'}</p>` : ''}
    <p>Choice: <strong>${escapeHtml(review.choice.source)}</strong>. ${escapeHtml(review.choice.reason)}</p>
    ${review.choice.line ? `<blockquote>${escapeHtml(review.choice.line)}</blockquote>` : ''}
    <p>${canExecute ? 'Review the route and targets before approving. Lancer handles all rolls and outcomes.' : 'Execution is disabled. Enable execution and review scene terrain before approving.'}</p>
    <fieldset><legend>Ranked alternatives — pick one to execute</legend>${review.options.map(o =>
      `<label class="npc-pilot-option"><input type="radio" name="option" value="${escapeHtml(o.id)}" ${o.id === review.choice.optionId ? 'checked' : ''}>
      <span><strong>${escapeHtml(o.id)} · score ${Number(o.score).toFixed(2)}</strong><br>${escapeHtml(describeOption(o))}
      ${o.move ? `<small>Route: ${escapeHtml(o.move.path.map(p => `(${p.x},${p.y})`).join(' → '))}</small>` : ''}</span></label>`).join('')}</fieldset>
    <ul class="npc-pilot-warnings">${review.warnings.map(w => `<li>${escapeHtml(w)}</li>`).join('')}</ul>
  </section>`;
}

export async function showReview(review, { DialogV2, canExecute }) {
  const button = (action, label, extra = {}) => ({ action, label,
    callback: (_event, b) => ({ action, optionId: b.form.elements.option?.value }), ...extra });
  return DialogV2.wait({ window: { title: 'Lancer NPC Pilot' }, position: { width: 700 },
    classes: ['npc-pilot-dialog'], content: renderReview(review, canExecute), rejectClose: false,
    buttons: [...(canExecute ? [button('execute', 'Execute selected')] : []),
      button('reask', 'Re-ask model'), button('configure', 'Relay settings'), button('terrain', 'Review terrain'),
      button('skip', 'Skip', { default: true }), button('manual', 'Do it manually')] });
}
