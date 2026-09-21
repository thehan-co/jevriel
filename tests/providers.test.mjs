import test from 'node:test';
import assert from 'node:assert/strict';
import {connection,requestFor,unwrap,runAdapter} from '../server/providers.mjs';
import {execute} from '../server/runtime.mjs';
test('no implicit paid provider selection from environment keys',()=>assert.equal(connection({TYPESAFE_API_KEY:'x'},{}).provider,'unconfigured'));
test('Cloudflare uses only Cloudflare credentials and envelope',()=>{
 const c=connection({JEVRIEL_PROVIDER:'cloudflare',CLOUDFLARE_API_TOKEN:'cf-test',CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32),TYPESAFE_API_KEY:'wrong'},{});
 assert.equal(c.configured,true);const r=requestFor(c,{state:'x',questions:{}});assert.match(r.url,/api.cloudflare.com/);assert.equal(r.headers.authorization,'Bearer cf-test');assert.equal(r.body.model,'typesafe/jev');assert.equal(r.body.input.state,'x');
 assert.deepEqual(unwrap(c,{success:true,result:{state:'Completed',result:{answers:{},usage:null}}}),{answers:{},usage:null});
 assert.throws(()=>unwrap(c,{success:false}));assert.throws(()=>unwrap(c,{result:{state:'Pending'}}));
});
test('Cloudflare route preserves unknown actual bill and TypeSafe reference separately',async()=>{
 const c=connection({JEVRIEL_PROVIDER:'cloudflare',CLOUDFLARE_API_TOKEN:'test',CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32)},{});
 const r=await execute('jevriel_route',{state:'x',instructions:'Choose',routes:{a:'a',b:'b'}},{connection:c,noLedger:true,fetchImpl:async()=>({ok:true,status:200,json:async()=>({success:true,result:{answers:{route:{type:'choice',choice:'a',confidence:.9,probabilities:{a:.9,b:.05,needs_review:.05}}},usage:{input_tokens:100}}})})});
 assert.equal(r.provider,'cloudflare');assert.equal(r.actual_cost_usd,null);assert.ok(Math.abs(r.typesafe_reference_input_cost_usd-.0000042)<1e-12);
});
test('custom endpoint disallows credentials in URL and HTTP',()=>{for(const endpoint of ['http://example.com','https://user:secret@example.com','https://example.com?key=x'])assert.throws(()=>requestFor({provider:'compatible',endpoint,key:'x'},{}));});
test('existing MCP mode disables bundled inference',()=>{const c=connection({}, {provider:'existing'});assert.equal(c.configured,false);assert.equal(c.external_connector,true);});
test('arbitrary API adapter validates its argv configuration',()=>{assert.equal(connection({}, {provider:'adapter',argv:['node','/trusted/bridge.mjs']}).configured,true);assert.equal(connection({}, {provider:'adapter',argv:[]}).configured,false);});

test('custom adapter executes without a shell and returns normalized JSON',async()=>{
 const c={argv:[process.execPath,'-e',"let s='';process.stdin.on('data',x=>s+=x);process.stdin.on('end',()=>process.stdout.write(JSON.stringify({answers:{},received:JSON.parse(s).state}))); "]};
 const r=runAdapter(c,{state:'literal $HOME; no shell',questions:{}});
 assert.deepEqual(await r.json(),{answers:{},received:'literal $HOME; no shell'});
 assert.throws(()=>runAdapter({argv:[process.execPath,'-e','process.exit(1)']},{}),/adapter failed/);
});
test('OpenRouter uses native decisions API and its own credentials',()=>{
 const c=connection({JEVRIEL_PROVIDER:'openrouter',OPENROUTER_API_KEY:'or-test',TYPESAFE_API_KEY:'wrong'},{});
 const r=requestFor(c,{state:'x',questions:{}});
 assert.equal(r.url,'https://openrouter.ai/api/alpha/decisions');assert.equal(r.headers.authorization,'Bearer or-test');assert.equal(r.body.model,'typesafe/jev-1.13');
});
test('authentication failures report safe actionable HTTP status without provider secrets',async()=>{
 let receipt;
 await assert.rejects(execute('jevriel_route',{state:'x',instructions:'Choose',routes:{a:'a',b:'b'}},{apiKey:'test',noLedger:true,onReceipt:r=>receipt=r,fetchImpl:async()=>({ok:false,status:401,json:async()=>({errors:[{message:'secret must never be shown'}]})})}),e=>/HTTP 401: Authentication failed/.test(e.message)&&!e.message.includes('secret must'));
 assert.equal(receipt.http_status,401);assert.equal(receipt.status,'error');
});
