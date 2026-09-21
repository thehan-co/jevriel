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
