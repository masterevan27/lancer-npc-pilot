// Pure view models for the shared NPC turn banner. No DOM, no Foundry globals.
const DEFAULT_IMAGES = ['icons/svg/mystery-man.svg'];
const LANCER_DEFAULT = /^systems\/lancer\/assets\/icons\//;

const isDefaultImage = src => !src || DEFAULT_IMAGES.includes(src) || LANCER_DEFAULT.test(src);

export function portraitFor(actor, token) {
  const img = actor?.img;
  if (img && !isDefaultImage(img)) return img;
  return token?.document?.texture?.src || null;
}

export function bannerView({kind, name, className, side, round, portrait, summary, line, why}) {
  const who = className ? `${name} · ${className}` : `${name}`;
  const Side = side ? side[0].toUpperCase() + side.slice(1) : '';
  const view = {kind, side, title: '', subtitle: '', quote: null, portrait: portrait || null, showEndTurn: false, autoHideMs: null};
  switch (kind) {
    case 'thinking':
      view.title = `${who} is thinking…`;
      view.subtitle = `${Side} · Round ${round}`;
      view.showEndTurn = true;
      break;
    case 'acting':
      view.title = `${who} acts`;
      view.subtitle = summary || '';
      view.autoHideMs = 3000;
      break;
    case 'waiting':
      view.title = `${who} is waiting for Lancer`;
      view.subtitle = 'Resolve the attack and apply damage';
      view.showEndTurn = true;
      break;
    case 'speech':
      view.title = `${name}`;
      view.quote = line ?? '';
      view.autoHideMs = 5000;
      break;
    case 'held':
      view.title = `${name} · turn held`;
      view.subtitle = why || '';
      view.showEndTurn = true;
      break;
    default:
      throw new Error(`unknown banner kind: ${kind}`);
  }
  return view;
}
