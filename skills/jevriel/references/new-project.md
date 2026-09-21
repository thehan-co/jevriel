# New coding project

Start with the app's intended behavior and its decision points. Sketch the smallest working path: input, exact checks in code, JEV judgment where useful, handler or fallback, result. Keep JEV behind an adapter so a model outage or version change does not spread through the app.

Example: a support app must send a request to billing, engineering, sales or review. Define each queue with precedence and counterexamples. Ask independent questions about topic and urgency in one request; compose the route in code. A request for a refund is not authorization to pay one.

Build the baseline first or preserve an existing equivalent. Use a fixture-driven adapter mock for offline development and a bounded live canary for the actual API. Add feature/config switches for model ID, threshold, timeout and fallback. Log the source ID or safe hash, policy version, returned model ID, probabilities, decision, timing and usage.

Acceptance: known routes behave correctly, unknowns escape, invalid/service-error responses fall back, and side effects obey policy. Then run a Flight Test against an LLM performing the same narrow job, using equivalent information and useful structured output. Also compare a simple rules implementation when the job may not need a model.

Deliver the integration and a compact explanation of where it helps. Rank subsequent opportunities by measured frequency and savings, expected quality, engineering effort and error consequence. Do not claim whole-app speedup from one fast classification call.
