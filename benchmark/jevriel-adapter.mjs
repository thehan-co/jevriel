// Flight Test bridge to the selected provider; model calls are explicitly requested by the runner.
import {execute} from '../server/runtime.mjs';
let input='';for await(const chunk of process.stdin)input+=chunk;
const packet=JSON.parse(input);
const result=await execute('jevriel_judge',{state:{message:packet.text},questions:{route:{type:'choice',instructions:packet.instructions,criteria:packet.criteria}}});
const a=result.answers.route;
console.log(JSON.stringify({label:a.value,probabilities:a.probabilities,confidence:a.confidence,model:result.resolved_model,requested_model:result.requested_model,provider:result.provider,usage:result.usage??null,cost_usd:result.actual_cost_usd,cost_basis:'unknown',typesafe_reference_input_cost_usd:result.typesafe_reference_input_cost_usd,receipt_id:result.receipt_id,attempts:result.attempts}));
