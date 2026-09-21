#!/usr/bin/env node
import readline from 'node:readline';
import {definitions,execute} from './runtime.mjs';
const answer=(id,result)=>({jsonrpc:'2.0',id,result});
export async function handleMessage(m){
 if(m.id===undefined)return null;
 if(m.method==='initialize')return answer(m.id,{protocolVersion:'2025-06-18',capabilities:{tools:{}},serverInfo:{name:'jevriel',version:'0.1.2'},instructions:'Read the JEVRIEL skill. Run jevriel_status first. Returned judgments are advisory. Unknown costs are not zero.'});
 if(m.method==='ping')return answer(m.id,{});
 if(m.method==='tools/list')return answer(m.id,{tools:definitions});
 if(m.method==='tools/call'){
  try{return answer(m.id,{content:[{type:'text',text:JSON.stringify(await execute(m.params.name,m.params.arguments))}]});}
  catch(e){return answer(m.id,{isError:true,content:[{type:'text',text:e.message}]});}
 }
 return {jsonrpc:'2.0',id:m.id,error:{code:-32601,message:'Unknown method'}};
}
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})){
 try{const result=await handleMessage(JSON.parse(line));if(result)process.stdout.write(JSON.stringify(result)+'\n');}
 catch{process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Invalid request'}})+'\n');}
}
