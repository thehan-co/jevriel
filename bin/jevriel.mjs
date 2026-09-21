#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,chmodSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {getKey,configDir,credentialFile} from '../server/credentials.mjs';
import {execute} from '../server/runtime.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [command='help',host='codex',...flags]=process.argv.slice(2);
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{stdio:'inherit'});if(p.error||p.status!==0)throw new Error(`${cmd} failed. Install its CLI and retry. Existing files have been retained.`);};
function hiddenKey(){
 if(!process.stdin.isTTY)return Promise.resolve(null);
 process.stdout.write('TypeSafe API key (hidden; saved locally with owner-only permissions): ');
 return new Promise((ok,no)=>{let value='';process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
 const done=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off('data',on);process.stdout.write('\n');};
 const on=chunk=>{for(const c of chunk){if(c==='\u0003'){done();no(new Error('Setup cancelled. Plugin remains installed.'));return;}if(c==='\r'||c==='\n'){done();ok(value.trim());return;}if(c==='\u007f')value=value.slice(0,-1);else if(c>=' ')value+=c;}};process.stdin.on('data',on);});
}
async function setup(){
 let key=getKey();
 if(!key){
  console.log('Get your TypeSafe API key from https://typesafe.ai and keep it out of chat and source control.');
  key=await hiddenKey();
  if(!key){console.log('Installed; TypeSafe connection setup required. Run: npx --yes github:thehan-co/jevriel setup');return false;}
  mkdirSync(configDir(),{recursive:true,mode:0o700});
  writeFileSync(credentialFile(),JSON.stringify({api_key:key})+'\n',{mode:0o600});chmodSync(credentialFile(),0o600);
 }
 console.log('Checking TypeSafe with one small billable judgment (published input rate: $0.042/M).');
 await execute('jevriel_judge',{state:'Connection check: the light is green.',questions:{check:{type:'choice',instructions:'What color is the light?',criteria:{green:'Green',red:'Red'}}}},{apiKey:key});
 console.log('TypeSafe connection verified. Ready to start JEVing.');return true;
}
function registerCodex(){
 const base=join(homedir(),'.agents','plugins'), target=join(homedir(),'plugins','jevriel');
 const file=join(base,'marketplace.json');
 let market=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{name:'personal',interface:{displayName:'Personal'},plugins:[]};
 if(!/^[A-Za-z0-9_-]+$/.test(market.name)||!Array.isArray(market.plugins))throw new Error('Existing personal marketplace has an invalid shape; it was not changed.');
 const manifest=JSON.parse(readFileSync(join(root,'.codex-plugin/plugin.json'),'utf8'));
 const old=market.plugins.find(p=>p.name==='jevriel');
 if(old && (old.source?.source!=='local'||old.source?.path!=='./plugins/jevriel'))throw new Error('JEVRIEL already points to another source; resolve that entry before installing.');
 mkdirSync(target,{recursive:true});
 for(const part of ['bin','server','vendor','skills','benchmark','assets','docs','.codex-plugin','.claude-plugin','.mcp.json','.mcp.claude.json','README.md','LICENSE','NOTICE','package.json']){
  if(existsSync(join(root,part)))cpSync(join(root,part),join(target,part),{recursive:true,filter:src=>!/(?:^|\/)(?:runs|published-probe|__pycache__)(?:\/|$)/.test(src)&&!src.endsWith('config.local.json')});
 }
 manifest.version=manifest.version.split('+')[0]+'+codex.'+Date.now();writeFileSync(join(target,'.codex-plugin/plugin.json'),JSON.stringify(manifest,null,2)+'\n');
 const entry={name:'jevriel',source:{source:'local',path:'./plugins/jevriel'},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'},category:'DeveloperTools'};
 if(old)market.plugins[market.plugins.indexOf(old)]=entry;else market.plugins.push(entry);
 if(existsSync(file))cpSync(file,file+'.jevriel-backup');
 writeFileSync(file,JSON.stringify(market,null,2)+'\n');run('codex',['plugin','add',`jevriel@${market.name}`]);
 console.log('JEVRIEL installed in Codex. Start a new thread to load its skill and tools.');
}
try{
 if(command==='install'){
  if(host==='codex')registerCodex();
  else if(host==='claude'){run('claude',['plugin','marketplace','add','https://github.com/thehan-co/jevriel.git']);run('claude',['plugin','install','jevriel@jevriel']);}
  else throw new Error('Choose codex or claude.');
  if(!flags.includes('--skip-setup'))await setup();
 }else if(command==='setup')await setup();
 else if(command==='doctor'){console.log(JSON.stringify(await execute('jevriel_status'),null,2));if(!getKey())process.exitCode=2;}
 else if(command==='benchmark'){run('python3',[join(root,'benchmark','flight_test.py'),...process.argv.slice(3)]);}
 else console.log('JEVRIEL\n  jevriel install codex|claude [--skip-setup]\n  jevriel setup\n  jevriel doctor\n  jevriel benchmark --config <file> --out <new-directory>\nRuntime: Node.js 20+. Benchmark: Python 3.10+. Host CLI required.');
}catch(e){console.error(e.message);process.exitCode=1;}
