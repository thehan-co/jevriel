import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {probability} from '../../server/validation.mjs';

// These are demonstration thresholds, not calibrated production defaults.
export function decide(result, {queueConfidence=.85, conflictProbability=.5}={}) {
 if (!probability(queueConfidence)||!probability(conflictProbability)) throw new Error('Invalid policy threshold');
 const {queue,contradiction,actionability}=result?.answers??{};
 const p=queue?.probabilities;
 const keys=['meeting','task','reference','review'];
 if (queue?.type!=='choice'||!keys.includes(queue.value)||!probability(queue.confidence)||
     !p||Object.keys(p).length!==keys.length||!keys.every(k=>probability(p[k]))||
     Math.abs(Object.values(p).reduce((s,v)=>s+v,0)-1)>.02||p[queue.value]<Math.max(...Object.values(p))-1e-8||
     contradiction?.type!=='noul'||!probability(contradiction.probability)||
     actionability?.type!=='score'||!probability(actionability.confidence)||
     !Number.isFinite(actionability.value)||actionability.value<0||actionability.value>2) {
  return {recommendation:'review',reasons:['missing_or_invalid_judgment'],authority:'advisory_only'};
 }
 const reasons=[];
 if(queue.value==='review')reasons.push('no_suitable_queue');
 if(queue.confidence<queueConfidence)reasons.push('uncertain_queue');
 if(contradiction.probability>=conflictProbability)reasons.push('reported_record_conflict');
 return {recommendation:reasons.length?'review':queue.value,reasons,authority:'advisory_only'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
 const result=JSON.parse(readFileSync(process.argv[2],'utf8'));
 for(const queueConfidence of [.7,.85,.95])console.log(JSON.stringify({queueConfidence,...decide(result,{queueConfidence})}));
}
