# Bundled JEVRIEL runtime

- `jevriel_status`: setup and exact benchmark location, no paid call.
- `jevriel_route`, `jevriel_rank`, `jevriel_extract`, `jevriel_verify`: bounded judgments over supplied evidence. Extraction selects pre-found candidates only.
- `jevriel_judge`: up to 25 independent typed questions sharing state.
- `jevriel_session_mode`: auto/enabled/disabled, billing context. Enabled never overrides user permission; auto is agent policy, not an autonomous dispatcher.
- `jevriel_escalation_gate`: deterministic review when any explicit signal crosses its threshold. No inference.
- `jevriel_usage_summary`: durable local metadata ledger, including failed attempts and unknown usage. No measured baseline or savings is implied.

The runtime uses a pinned default JEV model, no retries, complete response validation and local receipts. Confidence remains task-dependent. Tune thresholds before a held-out test. Treat every result as advisory.

Run `npx --yes github:thehan-co/jevriel benchmark --config PATH --out NEW_DIRECTORY` for the public probe. Python 3.10+ required. Selected-provider setup and a separate OPENROUTER_API_KEY are required for the two hosted arms. The benchmark does not inherit an existing chat subscription. Request only the data and budget already authorized.
