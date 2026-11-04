import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderReview, showReview } from '../scripts/adapter/review.mjs';
import { initializePilot,registerSettings } from '../scripts/pilot.mjs';
import { environment } from './adapter.test.mjs';

const review = { snapshot: { activeTokenId: 'npc', tokens: [{ id: 'npc', name: '<img src=x onerror=alert(1)>' }] },
  options: [{ id: 'A', score: 1, action: { kind: 'hold' }, move: null, facts: {} }],
  choice: { optionId: 'A', source: 'fallback', reason: '<script>evil()</script>', line: '"<b>go</b>"' },
  warnings: ['<svg onload=bad>'] };

test('review escapes actor names, model text and warnings; shows source and exact path', () => {
  const html = renderReview(review, false);
  assert(!html.includes('<script>')); assert(!html.includes('<img')); assert(!html.includes('<svg'));
  assert(html.includes('&lt;script&gt;')); assert(html.includes('fallback')); assert(html.includes('disabled'));
});

test('Execute is absent when disabled and default dialog action is Skip', async () => {
  let config;
  await showReview(review, { DialogV2: { wait: async value => { config = value; return null; } }, canExecute: false });
  assert(!config.buttons.some(b => b.action === 'execute'));
  assert(config.buttons.some(b => b.action === 'skip' && b.default));
  assert(config.buttons.some(b => b.action === 'reask'));
});

test('Impale review discloses native save, Full/recharge costs and complete conditional target route before approval',()=>{
 const review={snapshot:{activeTokenId:'npc',tokens:[{id:'npc',name:'Cataphract'},{id:'pc',name:'<Defender>'}]},mode:'policy',state:'partial',policyId:'cataphract-base-t1',
 choice:{source:'policy',optionId:'A',reason:'Review both branches'},diagnostics:[],warnings:[],options:[{id:'A',score:0,
 move:{to:{x:4,y:1},path:[{x:1,y:1},{x:2,y:1},{x:3,y:1},{x:4,y:1}],cost:3},
 action:{kind:'impale',targetTokenIds:['pc'],saveTarget:12,pauseIndex:0,carryPath:[{x:2,y:1},{x:3,y:1},{x:4,y:1},{x:5,y:1}]},
 facts:{targetName:'<Defender>',moveCost:3,usesBoost:false}}]};
 const html=renderReview(review,true);assert.match(html,/Hull/);assert.match(html,/12/);assert.match(html,/Full/);assert.match(html,/recharge/i);
 assert.match(html,/\(2,1\).*\(3,1\).*\(4,1\).*\(5,1\)/);assert(html.includes('&lt;Defender&gt;'));assert(!html.includes('outside enemy threat'));
});

test('partial-turn review exposes remaining shared actions and movement before approval', () => {
  const partial = structuredClone(review);
  partial.snapshot.actionBudget = { move: 2, quick: 1, full: false, protocol: false, reaction: true };
  const html = renderReview(partial, false);
  assert(html.includes('Movement remaining: 2'));
  assert(html.includes('Quick actions remaining: 1'));
  assert(html.includes('Full action available: no'));
});

test('player clients never receive a planning API or install hooks', () => {
  const api = initializePilot({ game: { user: { isGM: false } }, Hooks: { on: () => assert.fail('player hook') } });
  assert.equal(api, null);
});
test('policy mode is explicitly selectable on the client, retaining disabled execution and prompts',()=>{
 const settings=new Map();registerSettings({settings:{register:(_m,k,v)=>settings.set(k,v)},keybindings:{register(){}}});
 assert.equal(settings.get('decisionMode').default,'model');assert.equal(settings.get('decisionMode').scope,'client');
 assert.deepEqual(Object.keys(settings.get('decisionMode').choices),['model','policy']);
 assert.equal(settings.get('executionEnabled').default,false);assert.equal(settings.get('promptOnTurn').default,false);
});
test('the production policy planTurn path reaches manual review without reading a secret or opening relay setup',async()=>{
 const env=environment();let dialogs=0;
 env.game.users={activeGM:env.game.user};
 env.game.settings={get:(_m,k)=>{assert.notEqual(k,'secret');return k==='decisionMode'?'policy':false;}};
 const api=initializePilot({...env,Hooks:{on(){}},notifications:{info(){}},
   DialogV2:{prompt:()=>assert.fail('relay setup'),wait:async c=>{dialogs++;assert(c.buttons.some(b=>b.label==='Policy settings'));return {action:'manual'};}}});
 await api.planTurn();assert.equal(dialogs,1);
});

test('module manifest and versioned files agree and every shipped entry exists', () => {
  const manifest = JSON.parse(fs.readFileSync(new URL('../module.json', import.meta.url)));
  const version = fs.readFileSync(new URL('../../VERSION', import.meta.url), 'utf8').trim();
  const pkg = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url)));
  assert.equal(manifest.id, 'lancer-npc-pilot'); assert.equal(manifest.version, version); assert.equal(pkg.version, version);
  for (const path of [...manifest.esmodules, ...manifest.styles]) assert(fs.existsSync(new URL(`../${path}`, import.meta.url)));
  assert.equal(manifest.compatibility.minimum, '13');
});
