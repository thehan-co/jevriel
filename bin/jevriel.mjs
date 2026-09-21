#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,chmodSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {getKey,configDir,credentialFile} from '../server/credentials.mjs';
import {execute} from '../server/runtime.mjs';
import {connection,providerFile,savedProvider} from '../server/providers.mjs';
import {createInterface} from 'node:readline/promises';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const [command='help',host='codex',...flags]=process.argv.slice(2);
const run=(cmd,args)=>{const p=spawnSync(cmd,args,{stdio:'inherit'});if(p.error||p.status!==0)throw new Error(`${cmd} failed. Install its CLI and retry. Existing files have been retained.`);};
function hiddenKey(label="Provider API key/token"){
 if(!process.stdin.isTTY)return Promise.resolve(null);
 process.stdout.write(label+' (hidden; saved locally with owner-only permissions): ');
 return new Promise((ok,no)=>{let value='';process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
 const done=()=>{process.stdin.setRawMode(false);process.stdin.pause();process.stdin.off('data',on);process.stdout.write('\n');};
 const on=chunk=>{for(const c of chunk){if(c==='\u0003'){done();no(new Error('Setup cancelled. Plugin remains installed.'));return;}if(c==='\r'||c==='\n'){done();ok(value.trim());return;}if(c==='\u007f')value=value.slice(0,-1);else if(c>=' ')value+=c;}};process.stdin.on('data',on);});
}
async function ask(label){if(!process.stdin.isTTY)return '';const rl=createInterface({input:process.stdin,output:process.stdout});try{return (await rl.question(label)).trim();}finally{rl.close();}}
async function setup(){
 const args=process.argv.slice(3);const option=args.indexOf('--provider');
 let selected=option>=0?args[option+1]:connection().provider;
 if(process.stdin.isTTY&&option<0){
  console.log('Already have a working JEV MCP? Choose 1. No new API key is needed.');
  console.log('1 existing MCP   2 Cloudflare   3 TypeSafe   4 OpenRouter   5 compatible endpoint   6 custom adapter');
  const choice=await ask('Connection [current: '+selected+']: ');
  selected=({'1':'existing','2':'cloudflare','3':'typesafe','4':'openrouter','5':'compatible','6':'adapter'})[choice]||choice||selected;
 }
 if(!['cloudflare','typesafe','openrouter','compatible','adapter','existing'].includes(selected)){console.log('Installed; provider connection setup required. Run: npx --yes github:thehan-co/jevriel setup');return false;}
 const previous=savedProvider();let config=previous.provider===selected?{...previous}:{provider:selected};
 const replaceKey=args.includes('--replace-key');
 if(replaceKey&&!process.stdin.isTTY)throw new Error('Run setup --replace-key in an interactive terminal; keys are never accepted as arguments.');
 if(selected==='existing'){
  mkdirSync(configDir(),{recursive:true,mode:0o700});writeFileSync(providerFile(),JSON.stringify(config)+'\n',{mode:0o600});chmodSync(providerFile(),0o600);
  console.log('Use your existing JEV MCP with the JEVRIEL skill. Bundled model calls stay disabled; no credential migration or paid call.');return true;
 }
 const setupEnv={...process.env,JEVRIEL_PROVIDER:selected};
 if(selected==='typesafe'&&!setupEnv.TYPESAFE_API_KEY)setupEnv.TYPESAFE_API_KEY=getKey()||'';
 let c=connection(setupEnv,config);
 if(selected==='cloudflare'&&!c.account)config.account_id=await ask('Cloudflare account ID: ');
 if(selected==='compatible'&&!c.endpoint){config.endpoint=await ask('Trusted JEV-compatible HTTPS endpoint (credentials are sent only here): ');config.model=await ask('Provider JEV model ID: ');}
 if(selected==='adapter'&&!c.argv)config.argv=JSON.parse(await ask('Trusted local adapter command as a JSON argv array (no shell; no keys): '));
 if((!c.key||replaceKey)&&selected!=='adapter'){console.log('Use credentials for your chosen provider, not a TypeSafe key unless you selected TypeSafe. Keep keys out of chat and source control.');config.api_key=await hiddenKey(selected+' API key/token');
  if(replaceKey){for(const name of ['TYPESAFE_API_KEY','CLOUDFLARE_API_TOKEN','JEV_CLOUDFLARE_API_TOKEN','OPENROUTER_API_KEY','JEVRIEL_API_KEY'])delete setupEnv[name];console.log('Saved token will be tested. Provider environment variables still take precedence in future sessions.');}
 }
 c=connection(setupEnv,config);
 if(!c.configured){console.log('Installed; provider connection setup required. Complete the selected provider credentials and account/endpoint, then rerun setup.');return false;}
 mkdirSync(configDir(),{recursive:true,mode:0o700});writeFileSync(providerFile(),JSON.stringify(config)+'\n',{mode:0o600});chmodSync(providerFile(),0o600);
 console.log('Checking '+selected+' with one small JEV request. Your provider quota and billing apply; no automatic paid fallback.');
 await execute('jevriel_judge',{state:'Connection check: the light is green.',questions:{check:{type:'choice',instructions:'What color is the light?',criteria:{green:'Green',red:'Red'}}}},{connection:c});
 console.log('JEV provider connection verified. Ready to start JEVing.');return true;
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
 else if(command==='doctor'){console.log(JSON.stringify(await execute('jevriel_status'),null,2));if(!connection().configured&&!connection().external_connector)process.exitCode=2;}
 else if(command==='benchmark'){run('python3',[join(root,'benchmark','flight_test.py'),...process.argv.slice(3)]);}
 else console.log('JEVRIEL\n  jevriel install codex|claude [--skip-setup]\n  jevriel setup [--replace-key] [--provider cloudflare|typesafe|openrouter|compatible|adapter|existing]\n  jevriel doctor\n  jevriel benchmark --config <file> --out <new-directory>\nRuntime: Node.js 20+. Benchmark: Python 3.10+. Host CLI required.');
}catch(e){console.error(e.message);process.exitCode=1;}
