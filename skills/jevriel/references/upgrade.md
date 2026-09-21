# Upgrade an existing app or codebase

Trace expensive or unreliable LLM calls from their callers to actual output consumption. Look for text generation used only to select a label, rank known candidates, score a short rubric or check support for a claim. Inspect retries, parsing repairs, prompt size and fallback behavior.

Choose one candidate with recorded cost or user-visible delay. Capture the current behavior and fixtures before editing. Preserve API contracts, feature flags and a rollback path. Introduce a Jev adapter at that boundary, with the smallest relevant evidence packet and an explicit abstention route.

Begin in shadow mode where the existing path remains authoritative and Jev produces receipts only. Shadow mode still incurs cost and data transfer; use permitted, minimized data. Compare to independently labeled outcomes, not just agreement with the old model. Freeze thresholds on a development split, then evaluate held-out examples.

Example: replace an LLM passage-relevance call with independent Noul questions, then evaluate retrieval recall and final-answer quality. A faster filter that drops decisive evidence is a regression. Candidate matching needs a no-match result; wrong merges require special error accounting.

Adopt only when the user's quality and operational requirements hold. If the gain is marginal, retain the simpler existing path. Record a small next-embedding map, including at least one location where Jev adds no value.
