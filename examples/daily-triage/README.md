# One request, three judgments, local policy replay

This synthetic example combines queue selection, record conflict detection and an actionability rubric. The questions are independent; all see the same small state. No mailbox, calendar or task changes occur. Code, JEV and the agent have separate jobs.

From the repository root, after choosing your provider:

```bash
node bin/jevriel.mjs judge --input examples/daily-triage/packet.json > /tmp/jevriel-judgment.json
node examples/daily-triage/policy.mjs /tmp/jevriel-judgment.json
```

The first command makes one billed request using your saved provider. The second replays three illustrative thresholds without network calls. The CLI output uses the MCP wrapper's normalized fields: Choice/Score `value`, Noul `probability`. Native HTTP uses `choice`, `score` and `noul`. Do not mix these contracts.

The example reports a conflict, so even a confident meeting classification should stay in review. A good score elsewhere cannot cancel that condition. The score is retained for inspection, not treated as a permission or an absolute measurement of urgency.

To adopt this in everyday work: choose a known candidate catalog, minimize the permitted source text, keep source IDs in your own records, review a labeled development sample, freeze thresholds, then evaluate an untouched sample. Measure missed work, review volume, corrections, end-to-end time and provider-reported cost. Never report the demonstration thresholds as calibrated or the synthetic request as an accuracy benchmark.

For sensitive real data, choose your own private output location with appropriate file permissions. JEVRIEL's automatic ledger stores metadata only. Explicit CLI output contains your model judgments, and is your responsibility to retain or delete.

Inspired by the [OpenRouter JEV tutorial](https://openrouter.ai/blog/tutorials/how-to-use-jev/); the example and policy here are original and domain-independent.
