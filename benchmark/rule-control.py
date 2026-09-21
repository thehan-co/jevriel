"""Deterministic P5 negative control; not a general relevance classifier."""
import argparse,json,re,time
from urllib.parse import urlparse

def route(item):
    u=urlparse(item['url']);host=(u.hostname or '').lower()
    if (host=='linkedin.com' or host.endswith('.linkedin.com')) and u.path.startswith('/in/'):
        return 'retain_profile_only'
    if host=='docs.typesafe.ai':return 'add_reference'
    if re.search(r'\bJev\b',item['title']+' '+item['text'],re.I):return 'verify_claims'
    return 'park'

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('inputs');p.add_argument('references');a=p.parse_args()
    items=[json.loads(x) for x in open(a.inputs)];refs={x['id']:x['labels']['P5'] for x in map(json.loads,open(a.references))}
    start=time.perf_counter();pred={x['id']:route(x) for x in items};elapsed=(time.perf_counter()-start)*1000
    print(json.dumps({'task':'P5 deterministic control','attempts':len(pred),'agreement':sum(v==refs[k] for k,v in pred.items()),'batch_ms':elapsed,'latency_scope':'One local 100-item loop; excludes input loading; not a stable microbenchmark','inference_calls':0,'api_fee_usd':0,'predictions':pred},indent=2))
