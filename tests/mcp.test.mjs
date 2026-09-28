import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('fresh MCP exposes version, Light default and a working disabled-call stop without inference',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-mcp-'));
 try{
  const messages=[{id:1,method:'initialize'},{id:2,method:'tools/list'},{id:3,method:'tools/call',params:{name:'jevriel_status',arguments:{}}},{id:4,method:'tools/call',params:{name:'jevriel_session_mode',arguments:{mode:'disabled'}}},{id:5,method:'tools/call',params:{name:'jevriel_judge',arguments:{state:'synthetic',questions:{q:{type:'noul',instructions:'Is this synthetic?'}}}}}];
  const p=spawnSync(process.execPath,['server/index.mjs'],{input:messages.map(x=>JSON.stringify({jsonrpc:'2.0',...x})).join('\n')+'\n',encoding:'utf8',env:{...process.env,JEVRIEL_CONFIG_DIR:dir,JEVRIEL_LEDGER_DIR:dir,JEVRIEL_PROVIDER:'openrouter',OPENROUTER_API_KEY:'fixture-only',JEVRIEL_ADAPTER_COMMAND:'',JEVRIEL_KEY_COMMAND:''}});
  assert.equal(p.status,0,p.stderr);const replies=p.stdout.trim().split('\n').map(JSON.parse);
  assert.equal(replies[0].result.serverInfo.version,JSON.parse(readFileSync('package.json')).version);
  assert.equal(replies[1].result.tools.length,9);assert.equal(JSON.parse(replies[2].result.content[0].text).adoption.mode,'light');
  assert.equal(replies[4].result.isError,true);assert.match(replies[4].result.content[0].text,/disabled/);
  assert.equal(JSON.parse(readFileSync(join(dir,'usage.jsonl'),'utf8').trim()).attempts,0);
 }finally{rmSync(dir,{recursive:true,force:true});}
});
