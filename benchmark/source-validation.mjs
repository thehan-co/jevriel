export function matchingResult(results,id){
 if(!Array.isArray(results))return null;
 const matches=results.filter(r=>r!==null&&typeof r==='object'&&!Array.isArray(r)&&r.id===id);
 return matches.length===1?matches[0]:null;
}
export function validProbabilities(p,criteria,label){
 if(!p||typeof p!=='object'||Array.isArray(p))return false;
 const keys=Object.keys(criteria),values=Object.values(p);
 return keys.includes(label)&&Object.keys(p).length===keys.length&&keys.every(k=>Object.hasOwn(p,k)&&Number.isFinite(p[k])&&p[k]>=0&&p[k]<=1)&&Math.abs(values.reduce((a,b)=>a+b,0)-1)<.02&&p[label]>=Math.max(...values)-1e-9;
}
