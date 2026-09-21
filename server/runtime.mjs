import {appendFileSync,mkdirSync,readFileSync} from 'node:fs';
import {homedir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {route,rank,extract,verify,judge,escalationGate} from '../vendor/typesafe-as-a-judge/judge.mjs';
import {getSessionMode,setSessionMode,isJevEnabled} from '../vendor/typesafe-as-a-judge/session.mjs';
import {TOOL_DEFINITIONS} from '../vendor/typesafe-as-a-judge/tools.mjs';
import {validateAnswers,assert} from './validation.mjs';
import {getKey} from './credentials.mjs';
const handlers={typesafe_route:route,typesafe_rank:rank,typesafe_extract:extract,typesafe_verify:verify,typesafe_judge:judge};
const toPublic=name=>name.replace(/^typesafe_/,'jevriel_');
export const definitions=TOOL_DEFINITIONS.map(t=>({...t,name:toPublic(t.name),description:t.description.replace(/typesafe_session_mode/g,'jevriel_session_mode')}));
definitions.find(t=>t.name==='jevriel_usage_summary').description='Read the durable local metadata ledger. Includes failed calls and unknown usage; never claims unmeasured savings.';
definitions.push({name:'jevriel_status',description:'Check setup, model, session policy and benchmark location without calling a model.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,openWorldHint:false}});
export const modelId=()=>process.env.JEVRIEL_MODEL || 'jev-1.13.0';
const ledgerDir=()=>process.env.JEVRIEL_LEDGER_DIR || join(homedir(),'.local','state','jevriel');
const ledgerFile=()=>join(ledgerDir(),'usage.jsonl');
const tokens=v=>Number.isSafeInteger(v)&&v>=0?v:null;
export function summarize(rows) {
 const valid=rows.filter(r=>r.status==='ok');
 const known=rows.filter(r=>r.input_tokens!==null);
 return {calls:rows.length,successful:valid.length,failed:rows.length-valid.length,input_tokens:known.length===rows.length?known.reduce((s,r)=>s+r.input_tokens,0):null,known_input_tokens:known.reduce((s,r)=>s+r.input_tokens,0),usage_unknown:rows.length-known.length,total_elapsed_ms:rows.reduce((s,r)=>s+r.elapsed_ms,0),estimated_known_input_cost_usd:known.reduce((s,r)=>s+(r.estimated_input_cost_usd??0),0),cost_basis:'TypeSafe published input rate, $0.042/M; output free; estimates, not bills. Unknown receipts excluded from known subtotal.',pricing_source:'https://docs.typesafe.ai/models',pricing_checked:'2026-09-21',observed_baseline_run:false,savings:'not measured',scope:'Local durable metadata ledger; no prompts, answers or credentials. Concurrent host processes may contribute.'};
}
export function usageSummary(filter={}) {
 let rows=[];try {rows=readFileSync(ledgerFile(),'utf8').split('\n').filter(Boolean).map(x=>JSON.parse(x));}catch(e){if(e.code!=='ENOENT')throw new Error('Ledger cannot be read');}
 if(filter.comparison_model) rows=rows.filter(r=>r.comparison_model===filter.comparison_model);
 return summarize(rows);
}
export async function execute(name,input={},deps={}) {
 const internal=name.replace(/^jevriel_/,'typesafe_');
 if(name==='jevriel_status')return {configured:Boolean(deps.apiKey??getKey()),model:modelId(),session:getSessionMode(),onboarding:'Run npx --yes github:thehan-co/jevriel setup',benchmark:new URL('../benchmark/flight_test.py',import.meta.url).pathname,ledger:'Local metadata only. Configure JEVRIEL_LEDGER_DIR to choose its home.'};
 if(internal==='typesafe_session_mode')return input.mode===undefined?getSessionMode():setSessionMode(input);
 if(internal==='typesafe_usage_summary')return usageSummary(input);
 if(internal==='typesafe_escalation_gate') {
  assert(input.signals?.every(s=>typeof s.value==='number'&&typeof s.threshold==='number'),'Every signal requires an explicit value and threshold');
  return escalationGate(input);
 }
 const handler=handlers[internal];assert(handler,'Unknown tool');
 const started=performance.now();let receipt={id:randomUUID(),at:new Date().toISOString(),tool:name,requested_model:modelId(),resolved_model:null,comparison_model:input.comparison_model??null,status:'error',attempts:0,input_tokens:null,output_tokens:null,estimated_input_cost_usd:null};
 // Reserve writable ledger before inference. Never send a request if its ledger cannot be opened.
 if(!deps.noLedger)mkdirSync(ledgerDir(),{recursive:true,mode:0o700});
 if(!deps.noLedger)appendFileSync(ledgerFile(),'',{mode:0o600});
 try {
  assert(isJevEnabled(),'Jev is disabled for this session');
  const apiKey=deps.apiKey??getKey();assert(apiKey,'TypeSafe setup required. Run: npx --yes github:thehan-co/jevriel setup');
  const auditedFetch=async(url,options)=>{
   const packet=JSON.parse(options.body);packet.model=modelId();
   for(const q of Object.values(packet.questions)) {
    if(q.type==='choice')assert(q.criteria&&Object.keys(q.criteria).length>=2&&Object.keys(q.criteria).length<=255,'Choice needs 2-255 options');
    if(q.type==='score')assert(Array.isArray(q.criteria)&&q.criteria.length>=2&&q.criteria.length<=10,'Score needs 2-10 ordered levels');
   }
   receipt.attempts++;
   const response=await (deps.fetchImpl??fetch)(url,{...options,body:JSON.stringify(packet)});
   let body;try{body=await response.json();}catch{throw new Error('Invalid provider JSON');}
   receipt.resolved_model=typeof body?.model==='string'?body.model:null;
   receipt.input_tokens=tokens(body?.usage?.input_tokens);receipt.output_tokens=tokens(body?.usage?.output_tokens);
   receipt.estimated_input_cost_usd=receipt.input_tokens===null?null:receipt.input_tokens*.042/1e6;
   if(!response.ok)throw new Error(`TypeSafe HTTP ${response.status}`);
   validateAnswers(body,packet.questions);
   return {ok:true,status:response.status,json:async()=>body};
  };
  const result=await handler(input,{apiKey,fetchImpl:auditedFetch,maxAttempts:1});
  receipt.status='ok';
  return {...result,requested_model:receipt.requested_model,resolved_model:receipt.resolved_model,attempts:receipt.attempts,receipt_id:receipt.id,estimated_input_cost_usd:receipt.estimated_input_cost_usd,cost_basis:'published-rate estimate',authority:'advisory_only'};
 } catch(e) {
  // Do not expose provider response text, input content or credentials.
  const safe=/^(TypeSafe setup required|Jev is disabled)/.test(e.message)?e.message:'Jev judgment failed validation or execution. Review or use the declared fallback; inspect the receipt status.';
  throw new Error(safe);
 } finally {
  receipt.elapsed_ms=Number((performance.now()-started).toFixed(3));
  if(!deps.noLedger)appendFileSync(ledgerFile(),JSON.stringify(receipt)+'\n',{mode:0o600});
  if(deps.onReceipt)deps.onReceipt(receipt);
 }
}
