#!/usr/bin/env node
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,chmodSync} from 'node:fs';
import {join,dirname,resolve} from 'node:path';
import {homedir} from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {getKey,configDir} from '../server/credentials.mjs';
import {execute} from '../server/runtime.mjs';
import {connection,providerFile,savedProvider} from '../server/providers.mjs';
import {adoption,setAdoption} from '../server/adoption.mjs';
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
 const args=process.argv.slice(command==='install'?4:3);const option=args.indexOf('--provider');
 let selected=option>=0?args[option+1]:connection().provider;
 if(process.stdin.isTTY&&option<0){
  console.log('Already have a working JEV MCP? Choose 1. No new API key is needed.');
  console.log('1 existing MCP   2 Cloudflare   3 TypeSafe   4 OpenRouter   5 compatible endpoint   6 custom adapter');
  const choice=await ask('Connection [current: '+selected+']: ');
  selected=({'1':'existing','2':'cloudflare','3':'typesafe','4':'openrouter','5':'compatible','6':'adapter'})[choice]||choice||selected;
 }
 if(!['cloudflare','typesafe','openrouter','compatible','adapter','existing'].includes(selected)){console.log('Installed; provider connection setup required. Run: npx --yes github:thehan-co/jevriel setup');return false;}
 const supported=['--provider','--model','--endpoint','--account-id','--adapter-command','--key-command','--replace-key','--no-check','--skip-setup'];
 for(let i=0;i<args.length;i++){if(!supported.includes(args[i]))throw new Error('Unknown setup option. See jevriel help.');if(!['--replace-key','--no-check','--skip-setup'].includes(args[i])){if(!args[i+1]||args[i+1].startsWith('--'))throw new Error('Missing setup option value');i++;}}
 const value=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
 const previous=savedProvider();let config=previous.provider===selected?{...previous}:{provider:selected};
 for(const [flag,key] of [['--model','model'],['--endpoint','endpoint'],['--account-id','account_id']])if(value(flag)!==undefined)config[key]=value(flag);
 for(const [flag,key] of [['--adapter-command','argv'],['--key-command','key_command']])if(value(flag)!==undefined){let argv;try{argv=JSON.parse(value(flag));}catch{throw new Error('Command must be a JSON argv array');}if(!Array.isArray(argv)||!argv.length||!argv.every(x=>typeof x==='string'&&x.length))throw new Error('Command must be a nonempty JSON argv array');config[key]=argv;}
 if(value('--key-command')!==undefined)delete config.api_key;
 if(config.endpoint){const u=new URL(config.endpoint);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw new Error('Use a credential-free HTTPS endpoint');}
 const replaceKey=args.includes('--replace-key');
 if(replaceKey&&!process.stdin.isTTY)throw new Error('Run setup --replace-key in an interactive terminal; keys are never accepted as arguments.');
 if(selected==='existing'){
  mkdirSync(configDir(),{recursive:true,mode:0o700});writeFileSync(providerFile(),JSON.stringify(config)+'\n',{mode:0o600});chmodSync(providerFile(),0o600);
  console.log('Use your existing JEV MCP with the JEVRIEL skill. Bundled model calls stay disabled; no credential migration or paid call.');return true;
 }
 const setupEnv={...process.env,JEVRIEL_PROVIDER:selected};
 if(selected==='typesafe'&&!setupEnv.TYPESAFE_API_KEY&&!config.key_command&&!setupEnv.JEVRIEL_KEY_COMMAND)setupEnv.TYPESAFE_API_KEY=getKey()||'';
 let c=connection(setupEnv,config);
 if(selected==='cloudflare'&&!c.account)config.account_id=await ask('Cloudflare account ID: ');
 if(selected==='compatible'&&!c.endpoint)config.endpoint=await ask('Trusted JEV-compatible HTTPS endpoint (credentials are sent only here): ');
 if(selected==='compatible'&&!config.model&&!setupEnv.JEVRIEL_MODEL)config.model=await ask('Provider JEV model ID: ');
 if(selected==='adapter'&&!c.argv)config.argv=JSON.parse(await ask('Trusted local adapter command as a JSON argv array (no shell; no keys): '));
 if(((!c.key&&!c.keyCommand)||replaceKey)&&selected!=='adapter'){console.log('Use credentials for your chosen provider, not a TypeSafe key unless you selected TypeSafe. Keep keys out of chat and source control.');config.api_key=await hiddenKey(selected+' API key/token');
  if(replaceKey){for(const name of ['TYPESAFE_API_KEY','CLOUDFLARE_API_TOKEN','JEV_CLOUDFLARE_API_TOKEN','OPENROUTER_API_KEY','JEVRIEL_API_KEY'])delete setupEnv[name];console.log('Saved token will be tested. Provider environment variables still take precedence in future sessions.');}
 }
 c=connection(setupEnv,config);
 if(selected==='compatible'&&(!config.model&&!setupEnv.JEVRIEL_MODEL))throw new Error('Specify the compatible endpoint model with --model');
 if(c.endpoint){const u=new URL(c.endpoint);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw new Error('Use a credential-free HTTPS endpoint');}
 if(!c.configured){console.log('Installed; provider connection setup required. Complete the selected provider credentials and account/endpoint, then rerun setup.');return false;}
 mkdirSync(configDir(),{recursive:true,mode:0o700});writeFileSync(providerFile(),JSON.stringify(config)+'\n',{mode:0o600});chmodSync(providerFile(),0o600);
 if(args.includes('--no-check')){console.log('Provider configuration saved. Connection unverified; run setup without --no-check for one live check.');return true;}
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
 for(const part of ['bin','server','vendor','skills','benchmark','examples','assets','docs','.codex-plugin','.claude-plugin','.mcp.json','.mcp.claude.json','README.md','CHANGELOG.md','LICENSE','NOTICE','package.json']){
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
  else if(host==='portable'){
   const target=join(homedir(),'.local','share','jevriel');mkdirSync(target,{recursive:true});
   for(const part of ['bin','server','vendor','skills','benchmark','examples','docs','package.json','README.md','CHANGELOG.md','LICENSE','NOTICE'])if(existsSync(join(root,part)))cpSync(join(root,part),join(target,part),{recursive:true,filter:src=>!/(?:^|\/)(?:runs|published-probe|__pycache__)(?:\/|$)/.test(src)&&!src.endsWith('config.local.json')});
   const skill=join(homedir(),'.agents','skills','jevriel');mkdirSync(skill,{recursive:true});cpSync(join(root,'skills','jevriel'),skill,{recursive:true});
   console.log('Portable skill installed at '+skill+'\nCLI: node '+join(target,'bin','jevriel.mjs')+'\nMCP: node '+join(target,'server','index.mjs'));
  }
  else throw new Error('Choose codex, claude or portable.');
  if(!flags.includes('--skip-setup'))await setup();
  if(process.stdin.isTTY){
   const mode=await ask('Adoption: 1 Light (call JEV when asked), 2 Deep (assess every workflow) [keep '+adoption().mode+']: ');
   if(mode==='2'){
    const skill=join(homedir(),'.agents','skills','jevriel');mkdirSync(skill,{recursive:true});cpSync(join(root,'skills','jevriel'),skill,{recursive:true});
    const suggested=host==='codex'?join(process.env.CODEX_HOME||join(homedir(),'.codex'),'AGENTS.md'):host==='claude'?join(homedir(),'.claude','CLAUDE.md'):'';
    const instructions=(await ask('Persistent host instruction file'+(suggested?' ['+suggested+']':' (absolute path)')+': '))||suggested;
    if(instructions)console.log(JSON.stringify(setAdoption('deep',{instructions,policy:join(skill,'references','adoption.md')}),null,2));
    else console.log('No instruction file selected. Adoption unchanged; see docs/adoption.md.');
   }else if(mode==='1'){
    const policy=adoption().policy;
    if(policy)setAdoption('light',{policy});
   }
  }

 }else if(command==='setup'){if(!await setup())process.exitCode=2;}
 else if(command==='doctor'){console.log(JSON.stringify(await execute('jevriel_status'),null,2));if(!connection().configured&&!connection().external_connector)process.exitCode=2;}
 else if(command==='adoption'){
  const args=process.argv.slice(3);
  if(!args.length)console.log(JSON.stringify(adoption(),null,2));
  else {const [mode,...opts]=args;const settings={};
   for(let i=0;i<opts.length;i+=2){if(!['--instructions','--policy'].includes(opts[i])||!opts[i+1])throw new Error('Use adoption light|deep [--instructions /absolute/file] [--policy /absolute/file]');settings[opts[i].slice(2)]=opts[i+1];}
   settings.policy??=adoption().policy??join(homedir(),'.agents','skills','jevriel','references','adoption.md');
   console.log(JSON.stringify(setAdoption(mode,settings),null,2));
  }
 }
 else if(command==='judge'){
  const args=process.argv.slice(3);if(args.length!==2||args[0]!=='--input')throw new Error('Use judge --input <packet.json|->');
  const packet=JSON.parse(readFileSync(args[1]==='-'?0:args[1],'utf8'));
  if(!packet||Object.keys(packet).some(k=>!['state','questions'].includes(k)))throw new Error('Packet accepts only state and questions; configure the provider/model through setup');
  console.log(JSON.stringify(await execute('jevriel_judge',packet),null,2));
 }
 else if(command==='benchmark'){run('python3',[join(root,'benchmark','flight_test.py'),...process.argv.slice(3)]);}
 else console.log('JEVRIEL\n  jevriel install codex|claude|portable [--skip-setup]\n  jevriel setup [--replace-key] [--provider cloudflare|typesafe|openrouter|compatible|adapter|existing]\n  jevriel doctor\n  jevriel adoption [light|deep] [--instructions /absolute/file] [--policy /absolute/file]\n  jevriel judge --input <packet.json|->\n  Setup options: --model ID --endpoint HTTPS_URL --account-id ID --adapter-command JSON_ARGV --key-command JSON_ARGV --no-check\n  jevriel benchmark --config <file> --out <new-directory>\nRuntime: Node.js 20+. Benchmark: Python 3.10+. Host CLI required.');
}catch(e){console.error(e instanceof SyntaxError?'Invalid JSON input or configuration. Check local syntax; values are not logged.':e.message);process.exitCode=1;}
