// Template for a trusted JEV service with {input: packet} / {result: response} envelopes.
// Replace the two envelope mappings with your provider's documented contract.
let raw='';
try {
 for await(const chunk of process.stdin){raw+=chunk;if(Buffer.byteLength(raw)>256*1024)throw new Error();}
 const packet=JSON.parse(raw);
 const url=new URL(process.env.CUSTOM_JEV_URL);
 if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw new Error();
 const key=process.env.CUSTOM_JEV_KEY;
 if(!key)throw new Error();
 const response=await fetch(url,{method:'POST',redirect:'error',signal:AbortSignal.timeout(25000),headers:{'content-type':'application/json',authorization:`Bearer ${key}`},body:JSON.stringify({input:packet})});
 if(!response.ok)throw new Error();
 const body=await response.json();
 if(!body.result?.answers)throw new Error();
 // Preserve native probabilities and USD usage.cost only when documented by your provider.
 process.stdout.write(JSON.stringify(body.result));
} catch {
 console.error('Custom JEV adapter failed; inspect configuration and provider contract locally.');
 process.exitCode=1;
}
