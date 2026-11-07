import test from 'node:test';
import assert from 'node:assert/strict';
import { bannerView, portraitFor } from '../scripts/core/banner.mjs';
import { createBannerChannel } from '../scripts/adapter/banner.mjs';

const base = {name:'Raider', className:'Striker', side:'hostile', round:3};

test('thinking view', () => {
  const v = bannerView({...base, kind:'thinking'});
  assert.equal(v.title, 'Raider · Striker is thinking…');
  assert.equal(v.subtitle, 'Hostile · Round 3');
  assert.equal(v.autoHideMs, null);
  assert.equal(v.showEndTurn, true);
  assert.equal(v.quote, null);
});
test('acting view', () => {
  const v = bannerView({...base, kind:'acting', side:'friendly', summary:'Moves and shoots'});
  assert.equal(v.title, 'Raider · Striker acts');
  assert.equal(v.subtitle, 'Moves and shoots');
  assert.equal(v.autoHideMs, 3000);
  assert.equal(v.showEndTurn, false);
  assert.equal(v.side, 'friendly');
});
test('speech view', () => {
  const v = bannerView({...base, kind:'speech', line:'Die!'});
  assert.equal(v.title, 'Raider');
  assert.equal(v.quote, 'Die!');
  assert.ok(v.autoHideMs >= 4000 && v.autoHideMs <= 6000);
  assert.equal(v.showEndTurn, false);
});
test('held view', () => {
  const v = bannerView({...base, kind:'held', why:'Needs GM'});
  assert.equal(v.title, 'Raider · turn held');
  assert.equal(v.subtitle, 'Needs GM');
  assert.equal(v.autoHideMs, null);
  assert.equal(v.showEndTurn, true);
});
test('view passes portrait through, else null', () => {
  assert.equal(bannerView({...base, kind:'thinking', portrait:'a.png'}).portrait, 'a.png');
  assert.equal(bannerView({...base, kind:'thinking'}).portrait, null);
});

test('portraitFor falls back from default images to the token', () => {
  const token = {document:{texture:{src:'tok.webp'}}};
  assert.equal(portraitFor({img:'art/a.png'}, token), 'art/a.png');
  assert.equal(portraitFor({img:'icons/svg/mystery-man.svg'}, token), 'tok.webp');
  assert.equal(portraitFor({img:'systems/lancer/assets/icons/mech.svg'}, token), 'tok.webp');
  assert.equal(portraitFor({img:'icons/svg/mystery-man.svg'}, null), null);
  assert.equal(portraitFor(null, null), null);
  assert.equal(portraitFor({}, {document:{}}), null);
});

function fakeDoc() {
  const mk = tag => {
    const el = {tag, className:'', textContent:'', children:[], attrs:{}, listeners:{}, removed:false, src:undefined};
    el.append = (...c) => { el.children.push(...c); };
    el.remove = () => { el.removed = true; if (el.parent) el.parent.children = el.parent.children.filter(c => c !== el); };
    el.setAttribute = (k, v) => { el.attrs[k] = v; };
    el.addEventListener = (t, f) => { el.listeners[t] = f; };
    return el;
  };
  const body = mk('body');
  const origAppend = body.append;
  body.append = (...c) => { c.forEach(x => { x.parent = body; }); origAppend(...c); };
  return { createElement: mk, body };
}
const all = el => [el, ...el.children.flatMap(all)];
function setup(isGM = true) {
  const emitted = [];
  let handler = null;
  const game = {user:{isGM}, socket:{emit:(n, d) => emitted.push([n, d]), on:(n, f) => { handler = f; }}};
  const document = fakeDoc();
  let ended = 0;
  const ch = createBannerChannel({game, socketName:'module.lancer-npc-pilot', document, onEndTurn:() => { ended++; }});
  return {emitted, document, ch, game, handler:() => handler, ended:() => ended};
}
const view = (o = {}) => ({...bannerView({...base, kind:'thinking', portrait:'p.png'}), ...o});

test('show emits once and renders locally', () => {
  const s = setup();
  s.ch.show(view());
  assert.equal(s.emitted.length, 1);
  assert.equal(s.emitted[0][0], 'module.lancer-npc-pilot');
  assert.equal(s.emitted[0][1].type, 'banner');
  const els = all(s.document.body);
  assert.ok(els.some(e => e.className.includes('npc-pilot-banner--thinking')));
  assert.ok(els.some(e => e.textContent === 'Raider · Striker is thinking…'));
  const img = els.find(e => e.tag === 'img');
  assert.equal(img.src, 'p.png');
});
test('text with markup renders literally via textContent', () => {
  const s = setup();
  s.ch.show(view({title:'<b>Boss</b>', quote:'<i>hi</i>', kind:'speech'}));
  const els = all(s.document.body);
  assert.ok(els.some(e => e.textContent === '<b>Boss</b>'));
  assert.ok(els.some(e => e.textContent.includes('<i>hi</i>')));
});
test('remote message renders; clear removes', () => {
  const s = setup();
  s.handler()({type:'banner', view:view()});
  assert.equal(s.emitted.length, 0);
  assert.ok(all(s.document.body).some(e => e.className.includes('npc-pilot-banner')));
  s.handler()({type:'banner-clear'});
  assert.ok(!all(s.document.body).some(e => e.className.includes('npc-pilot-banner')));
});
test('End turn button only for GM, calls onEndTurn', () => {
  const gm = setup(true);
  gm.ch.show(view());
  const btn = all(gm.document.body).find(e => e.tag === 'button');
  assert.ok(btn);
  btn.listeners.click();
  assert.equal(gm.ended(), 1);
  const pl = setup(false);
  pl.ch.show(view());
  assert.ok(!all(pl.document.body).some(e => e.tag === 'button'));
  const noBtn = setup(true);
  noBtn.ch.show(view({showEndTurn:false}));
  assert.ok(!all(noBtn.document.body).some(e => e.tag === 'button'));
});
test('a new show replaces the old banner; clear emits', () => {
  const s = setup();
  s.ch.show(view());
  s.ch.show(view({kind:'acting'}));
  assert.equal(all(s.document.body).filter(e => e.className.startsWith('npc-pilot-banner ')).length, 1);
  s.ch.clear();
  assert.equal(s.emitted.at(-1)[1].type, 'banner-clear');
  s.ch.dispose();
});

function timed() {
  const pending = new Map(); let id = 0; const cleared = [];
  const setTimeout = (fn, ms) => { pending.set(++id, {fn, ms}); return id; };
  const clearTimeout = h => { cleared.push(h); pending.delete(h); };
  const fire = () => { const [h, t] = [...pending][0]; pending.delete(h); t.fn(); return t.ms; };
  const emitted = []; const offs = [];
  const game = {user:{isGM:true}, socket:{emit:(n, d) => emitted.push(d), on:() => {}, off:(n, f) => offs.push(n)}};
  const document = fakeDoc();
  const ch = createBannerChannel({game, document, setTimeout, clearTimeout});
  return {pending, cleared, fire, ch, document, offs};
}
const live = d => all(d.body).filter(e => e.className.startsWith('npc-pilot-banner '));

test('acting banner fades at 3000 ms, then is removed after the fade', () => {
  const t = timed();
  t.ch.show(view({kind:'acting', autoHideMs:3000, showEndTurn:false}));
  assert.equal(t.fire(), 3000);
  assert.ok(live(t.document)[0].className.includes('npc-pilot-banner--fading'));
  assert.equal(live(t.document).length, 1);
  t.fire();
  assert.equal(live(t.document).length, 0);
});
test('speech banner also fades before removal', () => {
  const t = timed();
  t.ch.show(view({kind:'speech', quote:'hi', autoHideMs:5000, showEndTurn:false}));
  assert.equal(t.fire(), 5000);
  assert.ok(live(t.document)[0].className.includes('--fading'));
  t.fire();
  assert.equal(live(t.document).length, 0);
});
test('a new show cancels old timers, so the new banner is never hidden by them', () => {
  const t = timed();
  t.ch.show(view({kind:'acting', autoHideMs:3000, showEndTurn:false}));
  t.fire(); // old banner now fading, removal timer pending
  t.ch.show(view({kind:'thinking'}));
  assert.equal(t.pending.size, 0);
  assert.ok(t.cleared.length >= 1);
  assert.equal(live(t.document).length, 1);
  assert.ok(!live(t.document)[0].className.includes('--fading'));
});
test('clear cancels pending timers', () => {
  const t = timed();
  t.ch.show(view({kind:'acting', autoHideMs:3000, showEndTurn:false}));
  t.ch.clear();
  assert.equal(t.pending.size, 0);
  assert.equal(live(t.document).length, 0);
});
test('dispose removes the socket listener', () => {
  const t = timed();
  t.ch.show(view());
  t.ch.dispose();
  assert.deepEqual(t.offs, ['module.lancer-npc-pilot']);
  assert.equal(live(t.document).length, 0);
});
