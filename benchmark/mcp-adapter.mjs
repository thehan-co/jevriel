// Community Jev MCP adapter. No credentials are read or printed here.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const resolve = (name) => process.env.JEVRIEL_MCP_SDK_ROOT
  ? pathToFileURL(`${process.env.JEVRIEL_MCP_SDK_ROOT}/dist/esm/${name}.js`).href
  : pathToFileURL(require.resolve(`@modelcontextprotocol/sdk/${name}.js`)).href;
const {Client} = await import(resolve('client/index'));
const {StdioClientTransport} = await import(resolve('client/stdio'));
let input=''; for await (const chunk of process.stdin) input += chunk;
const packet=JSON.parse(input);
const argv=JSON.parse(process.env.JEVRIEL_MCP_COMMAND || '[]');
if(!argv.length) throw new Error('Set JEVRIEL_MCP_COMMAND to a JSON argv array.');
const client=new Client({name:'jevriel-flight-test',version:'1.0.0'});
try {
 await client.connect(new StdioClientTransport({command:argv[0],args:argv.slice(1),stderr:'pipe'}));
 const response=await client.callTool({name:'jev_classify',arguments:{
  purpose:packet.instructions,classes:Object.entries(packet.criteria).map(([id,description])=>({id,description})),
  items:[{id:packet.id,text:packet.text}]
 }});
 if(response.isError) throw new Error('Jev MCP returned a tool error.');
 const data=JSON.parse(response.content.find(c=>c.type==='text').text);
 const result=data.results?.[0];
 if(!result || !result.classification) throw new Error('Missing classification.');
 console.log(JSON.stringify({label:result.classification,probabilities:result.probabilities,
 confidence:result.confidence,model:data.model,provider:data.provider,usage:data.usage??null,
 cost_usd:null,cost_basis:'unknown',adapter:'jev_classify',model_resolution:'gateway-alias'}));
} finally {await client.close();}
