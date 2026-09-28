import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {adoption,setAdoption,adoptionFile} from '../server/adoption.mjs';
test('opt-in Deep installs an idempotent pointer and Light restores manual preference',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-adoption-'));const prior=process.env.JEVRIEL_CONFIG_DIR;process.env.JEVRIEL_CONFIG_DIR=dir;
 try{
  assert.equal(adoption().mode,'light');
  const policy=join(dir,'policy.md'),instructions=join(dir,'AGENTS.md');writeFileSync(policy,'Policy');writeFileSync(instructions,'Existing instructions\n');
  setAdoption('deep',{policy,instructions});setAdoption('deep',{policy,instructions});
  const text=readFileSync(instructions,'utf8');assert.ok(text.startsWith('Existing instructions\n'));assert.equal(text.split('<!-- jevriel:adoption:start -->').length,2);assert.equal(adoption().mode,'deep');
  setAdoption('light');assert.equal(adoption().mode,'light');assert.deepEqual(adoption().instructions,[instructions]);
  writeFileSync(adoptionFile(),'{bad json');assert.equal(adoption().mode,'light');assert.ok(adoption().warning);
 }finally{if(prior===undefined)delete process.env.JEVRIEL_CONFIG_DIR;else process.env.JEVRIEL_CONFIG_DIR=prior;rmSync(dir,{recursive:true,force:true});}
});
test('malformed existing block is preserved and does not activate Deep',()=>{
 const dir=mkdtempSync(join(tmpdir(),'jevriel-adoption-invalid-'));const prior=process.env.JEVRIEL_CONFIG_DIR;process.env.JEVRIEL_CONFIG_DIR=dir;
 try{
  const policy=join(dir,'policy.md'),instructions=join(dir,'AGENTS.md');writeFileSync(policy,'Policy');writeFileSync(instructions,'<!-- jevriel:adoption:start -->');
  assert.throws(()=>setAdoption('deep',{policy,instructions}),/Malformed/);assert.equal(adoption().mode,'light');assert.equal(readFileSync(instructions,'utf8'),'<!-- jevriel:adoption:start -->');
 }finally{if(prior===undefined)delete process.env.JEVRIEL_CONFIG_DIR;else process.env.JEVRIEL_CONFIG_DIR=prior;rmSync(dir,{recursive:true,force:true});}
});
