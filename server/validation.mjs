export function assert(ok, message) { if (!ok) throw new Error(message); }
export const probability = v => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;
export function validateAnswers(body, questions) {
  assert(body && body.answers && typeof body.answers === 'object', 'Missing answers');
  const ids = Object.keys(questions), got = Object.keys(body.answers);
  assert(ids.length === got.length && ids.every(id => got.includes(id)), 'Incomplete or unexpected answer IDs');
  for (const [id,q] of Object.entries(questions)) {
    const a = body.answers[id];
    assert(a && a.type === q.type, 'Missing answer or wrong type');
    if (q.type === 'noul') { assert(probability(a.noul), 'Invalid yes/no probability'); continue; }
    assert(probability(a.confidence), 'Missing or invalid native confidence');
    const keys = q.type === 'choice' ? Object.keys(q.criteria) : q.criteria.map((_,i)=>String(i));
    const p = a.probabilities;
    assert(p && Object.keys(p).length === keys.length && keys.every(k=>Object.hasOwn(p,k) && probability(p[k])), 'Invalid distribution keys or values');
    assert(Math.abs(Object.values(p).reduce((s,v)=>s+v,0)-1) <= .02, 'Distribution is not normalized');
    if (q.type === 'choice') {
      assert(keys.includes(a.choice), 'Unknown choice');
      assert(p[a.choice] >= Math.max(...Object.values(p))-1e-8, 'Choice disagrees with distribution');
    } else {
      assert(typeof a.score === 'number' && Number.isFinite(a.score) && a.score >= 0 && a.score <= keys.length-1, 'Invalid score');
      const expected = keys.reduce((sum,k)=>sum+Number(k)*p[k],0);
      assert(Math.abs(a.score-expected)<=.02, 'Score disagrees with distribution');
    }
  }
  return body;
}
