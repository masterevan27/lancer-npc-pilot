// Renders the NPC turn banner on every client and broadcasts over the module socket.
export const FADE_MS = 600; // keep in step with the .npc-pilot-banner--fading transition in pilot.css

export function createBannerChannel({game, socketName = 'module.lancer-npc-pilot', document, onEndTurn, setTimeout: setT = globalThis.setTimeout, clearTimeout: clearT = globalThis.clearTimeout}) {
  let root = null;
  let timers = [];

  const stopTimer = () => { timers.forEach(t => clearT(t)); timers = []; };
  const remove = () => { stopTimer(); if (root) { root.remove(); root = null; } };

  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function render(view) {
    remove();
    const side = view.side === 'friendly' ? 'friendly' : 'hostile';
    root = el('div', `npc-pilot-banner npc-pilot-banner--${side} npc-pilot-banner--${view.kind}`);
    root.setAttribute('role', 'status');
    if (view.portrait) {
      const img = el('img', 'npc-pilot-banner__portrait');
      img.src = view.portrait;
      img.setAttribute('alt', '');
      root.append(img);
    }
    const body = el('div', 'npc-pilot-banner__body');
    const text = el('div', 'npc-pilot-banner__text');
    text.append(el('div', 'npc-pilot-banner__title', view.title ?? ''));
    if (view.subtitle) text.append(el('div', 'npc-pilot-banner__subtitle', view.subtitle));
    if (view.quote) text.append(el('div', 'npc-pilot-banner__quote', `“${view.quote}”`));
    body.append(text);
    if (view.showEndTurn && game.user?.isGM) {
      const btn = el('button', 'npc-pilot-banner__end', 'End turn');
      btn.setAttribute('type', 'button');
      btn.addEventListener('click', () => onEndTurn?.());
      body.append(btn);
    }
    root.append(body);
    document.body.append(root);
    if (view.autoHideMs != null) {
      const mine = root;
      const track = (fn, ms) => {
        const h = setT(fn, ms);
        h?.unref?.();
        timers.push(h);
      };
      track(() => {
        if (root !== mine) return;
        mine.className = `${mine.className} npc-pilot-banner--fading`;
        track(() => { if (root === mine) remove(); }, FADE_MS);
      }, view.autoHideMs);
    }
  }

  const onMessage = data => {
    if (data?.type === 'banner' && data.view) render(data.view);
    else if (data?.type === 'banner-clear') remove();
  };
  game.socket.on(socketName, onMessage);

  return {
    show(view) { game.socket.emit(socketName, {type: 'banner', view}); render(view); },
    clear() { game.socket.emit(socketName, {type: 'banner-clear'}); remove(); },
    dispose() { remove(); game.socket.off?.(socketName, onMessage); }
  };
}
