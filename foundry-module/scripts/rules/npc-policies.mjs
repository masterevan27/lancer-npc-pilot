const freeze = v => { if(v && typeof v==='object') { Object.values(v).forEach(freeze); Object.freeze(v); } return v; };
const refs=['Core Book p297 owner excerpt; scope recorded in docs/roadmap.md',
  'docs/superpowers/specs/2026-11-03-npc-policy-contract-design.md; owner approved 2026-11-03'];
// Reviewed 2026-11-03 against installed 3.1.3 and the approved contract.
// Inventory regeneration cannot update these independently reviewed tuples.
const requirements=[
  ['ram_cannon','db277e82de7d8c3d99f709c01fe290979de6a6b8be42c82de970ce6b5eb3eb42'],
  ['trample','b5100a5c0a43b3cf50887929409ad816c18ef58437733591404fa3f635846088'],
  ['impale','cf7794eeac1852a42a611efde0a72dee18f3b22b3c54853d27d4a4e17381af42'],
  ['point_defense_shield','4bae80a12ea5bbb57a330ca3ca81892390be49bff3b33a37fee91d9f889c0a2c'],
].map(([name,sourceFingerprint])=>({lid:`npcf_${name}_cataphract`,sourceVersion:'3.1.3',sourceFingerprint}));
export const NPC_POLICIES = freeze({'cataphract-base-t1':{
  schemaVersion:1,id:'cataphract-base-t1',revision:1,reviewState:'reviewed',role:'mobile-striker',sourceRefs:refs,
  match:{classIds:['npcc_cataphract'],tiers:[1],templateIds:[],optionalFeatures:'none'},requirements,
  // Weights and metric normalizations are implementation tuning, not printed rules.
  goals:['priority-access','shield-position','reaction-safety','conditional-displacement'].map((metricId,i)=>({
    id:metricId,metricId,weight:[3,2,3,2][i],families:metricId==='conditional-displacement'?['impale']:['*'],sourceRefs:refs})),
  individualBounds:{riskTolerance:[-1,1]},search:{maxOptions:8,maxCandidates:4096}
}});
