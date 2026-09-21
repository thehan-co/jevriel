import unittest
from unittest.mock import patch
import flight_test as f

class FlightTests(unittest.TestCase):
    def answer(self, **kw):
        return dict(label='task', probabilities={'task':.9,'reference':.05,'meeting':.04,'manual_review':.01}, **kw)
    def test_invalid_cost_never_enters_accounting(self):
        for cost in ('bad',-1,float('nan'),float('inf'),True):
            a=self.answer(cost_usd=cost,cost_basis='billed')
            with self.assertRaises(ValueError): f.validate(a)
            self.assertEqual(f.monetary(a),(None,'unknown'))
        self.assertEqual(f.monetary(self.answer(cost_usd=0,cost_basis='billed')),(0,'billed'))
    def test_shapes_and_distribution(self):
        for a in ([],None,{},dict(label='made_up'),dict(label='task', probabilities={'task':1}),dict(label='task',probabilities={'task':float('nan'),'reference':0,'meeting':0,'manual_review':0})):
            with self.assertRaises((ValueError,TypeError)):f.validate(a)
    def test_missing_probabilities_never_auto(self):
        self.assertFalse(f.accepted({'label':'task'},.85,.5))
    def test_review_never_auto(self):
        self.assertFalse(f.accepted({'label':'manual_review','probabilities':{'manual_review':1,'task':0}},.85,.5))
    def test_invalid_response_accounted(self):
        with patch.object(f,'call',return_value=[]):self.assertEqual(f.attempt({}, {},1)['status'],'invalid')
    def test_recovered_error_is_visible(self):
        rows=[dict(arm='hybrid',case_id='a',status='ok',gold='task',prediction='task',correct=True,auto_accepted=False,latency_ms=100,cost_usd=None,fallback=True,stages=[{'status':'error'},{'status':'ok'}])]
        s=f.summarize(rows)['hybrid'];self.assertEqual(s['failures'],0);self.assertEqual(s['stage_errors'],1);self.assertEqual(s['fallbacks'],1);self.assertIsNone(s['cost_usd'])
    def test_failures_remain_in_accuracy_denominator(self):
        rows=[dict(arm='jev',case_id=str(i),status='ok' if i==0 else 'error',gold='task',prediction='task' if i==0 else None,correct=i==0,latency_ms=1,cost_usd=None) for i in range(2)]
        s=f.summarize(rows)['jev'];self.assertEqual(s['accuracy'],.5);self.assertEqual(s['failures'],1)
if __name__=='__main__':unittest.main()
