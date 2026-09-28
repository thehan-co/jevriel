import test from 'node:test';
import assert from 'node:assert/strict';
import {execute,summarize} from '../server/runtime.mjs';
const packet={state:{text:'Synthetic'},questions:{check:{type:'noul',instructions:'Is this synthetic?'}}};
const c={provider:'openrouter',configured:true,key:'fixture',model:'typesafe/jev-1.13'};
for(const [value,expected] of [[0,0],[0.000021,0.000021],[undefined,null],[null,null],[-1,null],['0.1',null],[Infinity,null]]) {
 test(`preserve only valid reported USD cost: ${value}`,async()=>{
  let receipt;
  const r=await execute('jevriel_judge',packet,{connection:c,noLedger:true,onReceipt:r=>receipt=r,fetchImpl:async()=>({ok:true,status:200,json:async()=>({id:'fixture-id',model:'fixture-version',answers:{check:{type:'noul',noul:.9}},usage:{cost:value,input_tokens:12}})})});
  assert.equal(r.actual_cost_usd,expected);assert.equal(receipt.actual_cost_usd,expected);assert.equal(r.provider_request_id,'fixture-id');
 });
}
test('invalid answers retain observed cost and never produce a valid judgment',async()=>{
 let receipt;
 await assert.rejects(execute('jevriel_judge',packet,{connection:c,noLedger:true,onReceipt:r=>receipt=r,fetchImpl:async()=>({ok:true,status:200,json:async()=>({answers:{},usage:{cost:.003}})})}));
 assert.equal(receipt.status,'error');assert.equal(receipt.actual_cost_usd,.003);
});
test('aggregate includes failures and leaves missing legacy billing unknown',()=>{
 const rows=[{status:'ok',actual_cost_usd:.01,input_tokens:10,elapsed_ms:1},{status:'error',actual_cost_usd:0,input_tokens:null,elapsed_ms:1}];
 assert.equal(summarize(rows).actual_cost_usd,.01);
 rows.push({status:'error',elapsed_ms:1});const s=summarize(rows);
 assert.equal(s.actual_cost_usd,null);assert.equal(s.known_actual_cost_usd,.01);assert.equal(s.cost_unknown,1);assert.equal(s.input_tokens,null);
 assert.equal(summarize([]).actual_cost_usd,null);
});
