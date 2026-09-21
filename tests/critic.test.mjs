import test from 'node:test';
import assert from 'node:assert/strict';
import {execute} from '../server/runtime.mjs';

test('reject a score inconsistent with its probability distribution before ranking', async () => {
  const input={instructions:'Rank candidates',candidates:[{id:'a',value:'A'},{id:'b',value:'B'}],criteria:['low','high']};
  const deps={apiKey:'test-only',noLedger:true,fetchImpl:async()=>({ok:true,status:200,json:async()=>({
    model:'jev-1.13.0',usage:{input_tokens:10,output_tokens:0},answers:{
      a:{type:'score',score:1,confidence:1,probabilities:{0:1,1:0},legend:{0:'low',1:'high'}},
      b:{type:'score',score:0,confidence:1,probabilities:{0:0,1:1},legend:{0:'low',1:'high'}}
    }
  })})};
  await assert.rejects(execute('jevriel_rank',input,deps));
});
