import test from 'node:test';
import assert from 'node:assert/strict';
import {decide} from '../examples/daily-triage/policy.mjs';
const result={answers:{queue:{type:'choice',value:'meeting',confidence:.9,probabilities:{meeting:.9,task:.1,reference:0,review:0}},contradiction:{type:'noul',probability:.1},actionability:{type:'score',value:2,confidence:1}}};
test('replay changes policy without inference and retains advisory authority',()=>{
 assert.equal(decide(result,{queueConfidence:.85}).recommendation,'meeting');
 assert.equal(decide(result,{queueConfidence:.95}).recommendation,'review');
 assert.equal(decide(result).authority,'advisory_only');
});
test('conflict forces review even with a strong queue and actionability',()=>{
 const r=structuredClone(result);r.answers.contradiction.probability=.8;
 assert.deepEqual(decide(r).reasons,['reported_record_conflict']);
});
test('incomplete saved judgment fails to review',()=>assert.equal(decide({}).recommendation,'review'));
