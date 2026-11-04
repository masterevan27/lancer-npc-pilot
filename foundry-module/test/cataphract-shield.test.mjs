import test from 'node:test';
import assert from 'node:assert/strict';
const mod=await import('../scripts/adapter/shield.mjs').catch(e=>{if(e.code==='ERR_MODULE_NOT_FOUND')return {};throw e;});
const payload={damage:[{type:'Kinetic',amount:5.9},{type:'Heat',amount:4},{type:'Burn',amount:3}],ap:false,paracausal:false};
test('Shield resistance keeps Heat separate for heat-capacity actors and retains native amount parsing',()=>{
 assert.equal(typeof mod.shieldDamageSteps,'function');
 const steps=mod.shieldDamageSteps(payload,{resistance:true,hasHeatcap:true,multiple:1,addBurn:false});
 assert.deepEqual(steps,[{damage:{Kinetic:5,Burn:3},resistance:true,ap:false,paracausal:false,addBurn:false},
  {damage:{Heat:4},resistance:false,ap:false,paracausal:false,addBurn:false}]);
});
test('Heat converted to Energy shares one armor calculation; manual half does not double Shield resistance',()=>{
 assert.equal(typeof mod.shieldDamageSteps,'function');
 assert.equal(mod.shieldDamageSteps(payload,{resistance:true,hasHeatcap:false,multiple:1,addBurn:true}).length,1);
 const half=mod.shieldDamageSteps(payload,{resistance:true,hasHeatcap:true,multiple:0.5,addBurn:true});
 assert.equal(half.length,1);assert.equal(half[0].damage.Heat,4);assert.equal(half[0].resistance,true);
 const double=mod.shieldDamageSteps(payload,{resistance:true,hasHeatcap:true,multiple:2,addBurn:true});
 assert.equal(double[0].damage.Kinetic,10);assert.equal(double[1].damage.Heat,8);
});
test('unknown native damage types, values, modifiers and flags fail before any effect',()=>{
 assert.equal(typeof mod.shieldDamageSteps,'function');
 for(const bad of [{...payload,ap:'false'},{...payload,damage:[{type:'True',amount:4}]},{...payload,damage:[{type:'Kinetic',amount:-1}]}])
 assert.throws(()=>mod.shieldDamageSteps(bad,{resistance:true,hasHeatcap:true,multiple:1,addBurn:true}),/damage|native/i);
});
