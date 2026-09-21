import test from 'node:test';
import assert from 'node:assert/strict';
import {matchingResult,validProbabilities} from './source-validation.mjs';
test('malformed containers and members become missing results',()=>{
 for(const x of [null,{},'bad',42,[null,3,'x']])assert.equal(matchingResult(x,'a'),null);
});
test('exactly one matching result required',()=>{
 const r={id:'a',classification:'x'};assert.equal(matchingResult([null,r],'a'),r);assert.equal(matchingResult([r,r],'a'),null);assert.equal(matchingResult([r],'b'),null);
});
test('invalid distributions rejected',()=>{
 const c={a:'A',b:'B'};
 for(const p of [null,[],{a:1},{a:.5,b:.2},{a:NaN,b:1},{a:.5,b:.5,c:0},{a:true,b:0}])assert.equal(validProbabilities(p,c,'a'),false);
 assert.equal(validProbabilities({a:.9,b:.1},c,'a'),true);assert.equal(validProbabilities({a:.1,b:.9},c,'a'),false);
});
