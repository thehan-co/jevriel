# 100-source prelaunch evaluation

The prepared evaluation contains 70 official Jev documentation excerpts, 15 news excerpts and 15 public LinkedIn profile excerpts. Five frozen rubrics cover segment, industry, relevance, evidence and next action. Reference labels were authored by an independent AI reviewer, not by human annotators.

Frontier execution is pending. No local-model result is release evidence. The original research harness and source excerpts remain private; this release does not pretend to distribute a reproducible 100-source result.

For a reproducible public wiring probe, use `flight_test.py`, `cases.jsonl` and `config.example.json`. The hosted baseline uses OpenRouter and short schema-constrained answers. Discover a current model that supports JSON schema before running. The synthetic fixture has 16 held-out probe cases and 4 development examples; it cannot establish general quality.

Community source tests should submit a redistributable dataset, frozen rubrics and label provenance under [the contribution protocol](../CONTRIBUTING.md). Failures, missing usage and incomplete cases remain in the denominator.
