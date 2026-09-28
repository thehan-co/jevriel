import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,chmodSync} from 'node:fs';
import {join,dirname,isAbsolute,resolve} from 'node:path';
import {configDir} from './credentials.mjs';
const start='<!-- jevriel:adoption:start -->';
const end='<!-- jevriel:adoption:end -->';
export const adoptionFile=()=>join(configDir(),'adoption.json');
export function adoption(){
 try {
  const value=JSON.parse(readFileSync(adoptionFile(),'utf8'));
  if(!['light','deep'].includes(value.mode)|| (value.instructions!==undefined&&(!Array.isArray(value.instructions)||!value.instructions.every(x=>typeof x==='string'))))throw new Error();
  if(value.mode==='deep'&&(!value.policy||!isAbsolute(value.policy)||!existsSync(value.policy)))throw new Error();
  return {mode:value.mode,scope:'user',policy:value.policy??null,instructions:value.instructions??[],mechanism:'Host instructions, not a background daemon or interception of every tool call'};
 }catch(e){
  return {mode:'light',scope:'user',policy:null,instructions:[],...(e.code==='ENOENT'?{}:{warning:'Adoption configuration invalid or unreadable; using light mode'}),mechanism:'Explicit user invocation'};
 }
}
export function instructionBlock(policy){
 return `${start}\nAt the start of each task, read the JEVRIEL adoption setting at ${JSON.stringify(adoptionFile())} and the policy at ${JSON.stringify(policy)}. Follow the current Light or Deep mode there, subject to higher-priority instructions and existing permissions. If either file is unavailable, use Light mode.\n${end}`;
}
export function setAdoption(mode,{instructions,policy}={}){
 if(!['light','deep'].includes(mode))throw new Error('Adoption must be light or deep');
 const old=adoption();policy=policy??old.policy;
 if((mode==='deep'||instructions)&&(!policy||!isAbsolute(policy)||!existsSync(policy)))throw new Error('Choose an existing absolute policy file with --policy, or install portable first');
 let target,updated;
 if(instructions){
  if(!isAbsolute(instructions))throw new Error('Use an absolute host instruction file path');
  target=resolve(instructions);
  if(target===resolve(policy)||target===resolve(adoptionFile()))throw new Error('Host instructions must be separate from the adoption policy and config');
  const text=existsSync(target)?readFileSync(target,'utf8'):'';
  const starts=text.split(start).length-1,ends=text.split(end).length-1;
  if(starts!==ends||starts>1||(starts&&text.indexOf(end)<text.indexOf(start)))throw new Error('Malformed JEVRIEL instruction block; file unchanged');
  updated=starts?text.slice(0,text.indexOf(start))+instructionBlock(policy)+text.slice(text.indexOf(end)+end.length):text+(text.endsWith('\n')?'':'\n')+'\n'+instructionBlock(policy)+'\n';
 }
 if(target){
  mkdirSync(dirname(target),{recursive:true});
  if(existsSync(target))copyFileSync(target,target+'.jevriel-backup');
  writeFileSync(target,updated,{mode:0o600});
 }
 const value={mode,policy,instructions:[...new Set([...old.instructions,...(target?[target]:[])])]};
 mkdirSync(configDir(),{recursive:true,mode:0o700});writeFileSync(adoptionFile(),JSON.stringify(value,null,2)+'\n',{mode:0o600});chmodSync(adoptionFile(),0o600);
 return adoption();
}
