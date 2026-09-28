import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
test('Codex installer preserves other entries and ships clean tools with deferred onboarding',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-install-'));
 try {
  const bin=join(dir,'bin');mkdirSync(bin);writeFileSync(join(bin,'codex'),'#!/bin/sh\nexit 0\n',{mode:0o755});
  const base=join(dir,'.agents','plugins');mkdirSync(base,{recursive:true});
  writeFileSync(join(base,'marketplace.json'),JSON.stringify({name:'personal',plugins:[{name:'existing',source:{source:'local',path:'./plugins/existing'}}]}));
  const p=spawnSync(process.execPath,['bin/jevriel.mjs','install','codex'],{env:{...process.env,HOME:dir,JEVRIEL_CONFIG_DIR:join(dir,'config'),TYPESAFE_API_KEY:'',PATH:bin+':'+process.env.PATH},encoding:'utf8'});
  assert.equal(p.status,0,p.stderr);assert.match(p.stdout,/connection setup required/);
  const market=JSON.parse(readFileSync(join(base,'marketplace.json')));assert.equal(market.plugins.length,2);assert.equal(market.plugins[0].name,'existing');
  assert.ok(existsSync(join(dir,'plugins/jevriel/skills/jevriel/SKILL.md')));
  assert.ok(existsSync(join(dir,'plugins/jevriel/server/index.mjs')));
  assert.ok(!existsSync(join(dir,'plugins/jevriel/benchmark/runs')));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('existing MCP setup needs no key and clearly disables bundled inference',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-existing-'));
 try{
 const p=spawnSync(process.execPath,['bin/jevriel.mjs','setup','--provider','existing'],{env:{...process.env,JEVRIEL_CONFIG_DIR:dir},encoding:'utf8'});
 assert.equal(p.status,0,p.stderr);assert.match(p.stdout,/Bundled model calls stay disabled/);
 assert.equal(JSON.parse(readFileSync(join(dir,'provider.json'))).provider,'existing');
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('unattended OpenRouter setup persists secret reference and model without running it',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-secret-'));
 try {
  const argv=['does-not-exist','not-run-by-setup'];
  const p=spawnSync(process.execPath,['bin/jevriel.mjs','setup','--provider','openrouter','--key-command',JSON.stringify(argv),'--model','typesafe/jev-1.13','--no-check'],{env:{...process.env,JEVRIEL_CONFIG_DIR:dir},encoding:'utf8'});
  assert.equal(p.status,0,p.stderr);assert.match(p.stdout,/unverified/);
  const cfg=JSON.parse(readFileSync(join(dir,'provider.json')));assert.equal(cfg.api_key,undefined);assert.deepEqual(cfg.key_command,argv);
  const doctor=spawnSync(process.execPath,['bin/jevriel.mjs','doctor'],{env:{...process.env,JEVRIEL_CONFIG_DIR:dir,JEVRIEL_PROVIDER:''},encoding:'utf8'});
  assert.equal(doctor.status,0);assert.equal(JSON.parse(doctor.stdout).configured,true);assert.ok(!doctor.stdout.includes('not-run-by-setup'));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('portable install has a global skill and host-independent CLI',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-portable-'));
 try {
  const p=spawnSync(process.execPath,['bin/jevriel.mjs','install','portable','--skip-setup'],{env:{...process.env,HOME:dir},encoding:'utf8'});
  assert.equal(p.status,0,p.stderr);assert.ok(existsSync(join(dir,'.agents/skills/jevriel/SKILL.md')));assert.ok(existsSync(join(dir,'.local/share/jevriel/bin/jevriel.mjs')));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('CLI judges a packet through a custom provider and redacts malformed JSON',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-cli-'));
 try {
  const env={...process.env,JEVRIEL_CONFIG_DIR:dir,JEVRIEL_LEDGER_DIR:join(dir,'ledger'),JEVRIEL_PROVIDER:'adapter',JEVRIEL_ADAPTER_COMMAND:JSON.stringify([process.execPath,'-e',"process.stdin.resume();process.stdin.on('end',()=>console.log(JSON.stringify({answers:{q:{type:'noul',noul:1}},usage:{cost:0}})))"])};
  const p=spawnSync(process.execPath,['bin/jevriel.mjs','judge','--input','-'],{env,encoding:'utf8',input:JSON.stringify({state:'synthetic',questions:{q:{type:'noul',instructions:'Is this synthetic?'}}})});
  assert.equal(p.status,0,p.stderr);assert.equal(JSON.parse(p.stdout).answers.q.probability,1);assert.equal(JSON.parse(p.stdout).actual_cost_usd,0);
  const bad=spawnSync(process.execPath,['bin/jevriel.mjs','judge','--input','-'],{env,encoding:'utf8',input:'{"secret":"do-not-print"'});
  assert.notEqual(bad.status,0);assert.ok(!bad.stderr.includes('do-not-print'));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
