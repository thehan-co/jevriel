import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {configDir,getKey} from './credentials.mjs';
export const providerFile=()=>join(configDir(),'provider.json');
export function savedProvider(){try{return JSON.parse(readFileSync(providerFile(),'utf8'));}catch{return {};}}
export function connection(env=process.env,saved=savedProvider()){
 const provider=env.JEVRIEL_PROVIDER||saved.provider||'unconfigured';
 if(saved.provider&&saved.provider!==provider)saved={};
 const defaults={typesafe:'jev-1.13.0',cloudflare:'typesafe/jev',openrouter:'typesafe/jev-1.13',compatible:'jev-latest',adapter:'provider-defined'};
 let key='';
 if(provider==='typesafe')key=env.TYPESAFE_API_KEY|| (env===process.env?getKey():'') || (saved.provider==='typesafe'?saved.api_key:'');
 if(provider==='cloudflare')key=env.JEV_CLOUDFLARE_API_TOKEN||env.CLOUDFLARE_API_TOKEN||(saved.provider==='cloudflare'?saved.api_key:'');
 if(provider==='openrouter')key=env.OPENROUTER_API_KEY||(saved.provider==='openrouter'?saved.api_key:'');
 if(provider==='compatible')key=env.JEVRIEL_API_KEY||(saved.provider==='compatible'?saved.api_key:'');
 const account=env.CLOUDFLARE_ACCOUNT_ID||saved.account_id||'';
 const endpoint=env.JEVRIEL_ENDPOINT||saved.endpoint||'';
 const argv=env.JEVRIEL_ADAPTER_COMMAND?JSON.parse(env.JEVRIEL_ADAPTER_COMMAND):saved.argv;
 const model=env.JEVRIEL_MODEL||saved.model||defaults[provider]||null;
 return {provider,key,account,endpoint,model,argv,configured:provider==='adapter'?Boolean(Array.isArray(argv)&&argv.length&&argv.every(x=>typeof x==='string'&&x.length)):provider==='existing'?false:Boolean(key&&model&&(provider!=='cloudflare'||/^[a-f0-9]{32}$/i.test(account))&&(provider!=='compatible'||/^https:\/\//.test(endpoint))),external_connector:provider==='existing',pricing:'Provider invoice/allowance separate from TypeSafe published reference price'};
}
export function requestFor(c,packet){
 const headers={'content-type':'application/json',authorization:`Bearer ${c.key}`};
 if(c.provider==='typesafe')return {url:'https://api.typesafe.ai/v1/systemone',headers,body:{...packet,model:c.model}};
 if(c.provider==='cloudflare')return {url:`https://api.cloudflare.com/client/v4/accounts/${c.account}/ai/run`,headers,body:{model:c.model,input:{state:packet.state,questions:packet.questions}}};
 if(c.provider==='openrouter')return {url:'https://openrouter.ai/api/alpha/decisions',headers,body:{...packet,model:c.model}};
 if(c.provider==='compatible'){
  const u=new URL(c.endpoint);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw new Error('Use a credential-free HTTPS endpoint');
  return {url:u.href,headers,body:{...packet,model:c.model}};
 }
 throw new Error('Provider setup required');
}
export function unwrap(c,body){
 if(c.provider!=='cloudflare')return body;
 if(body?.success===false)throw new Error('Cloudflare reported a failed request');
 const result=body?.result;
 if(result?.state&&result.state!=='Completed')throw new Error('Cloudflare result incomplete');
 return result?.result??result??body;
}

export function runAdapter(c,packet){
 const p=spawnSync(c.argv[0],c.argv.slice(1),{input:JSON.stringify(packet),encoding:'utf8',timeout:30000,maxBuffer:1024*1024,shell:false});
 if(p.error||p.status!==0)throw new Error('Provider adapter failed');
 const body=JSON.parse(p.stdout);return {ok:true,status:200,json:async()=>body};
}
