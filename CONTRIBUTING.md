# Contribute a Flight Test

JEVRIEL grows through useful, reproducible evidence. A result showing where Jev fails is as welcome as a gain.

1. Open a Flight Test issue describing one decision junction and why it matters.
2. Agree the input/output contract, fallback, reference labels and evidence mode before running a large paid test.
3. Freeze development thresholds and held-out cases. Record model IDs, provider, prompt/schema versions, pricing source/date, concurrency, retries and complete timing boundaries.
4. Submit a small pull request with sanitized, redistributable cases and receipts. Include failures, unknown costs, coverage and selected quality. Explain who authored or reviewed the labels.
5. A maintainer checks the contract, privacy, reproducibility and comparison. Independent reproduction is labeled separately from an author-reported run.
6. Accepted findings enter the example gallery and regression fixtures. Changes to the skill or Flight Test protocol are versioned and recorded in CHANGELOG.md.

Use PROBE, CONTROLLED or OBSERVE exactly as defined in the skill. Do not pool unmatched hardware, datasets, model versions or budget settings into a universal leaderboard. Do not call AI-reference agreement human accuracy. No model should be called a winner based only on speed or valid JSON.

## Other contributions

We welcome installation fixes, bounded tool adapters, clearer guides, adversarial fixtures and host compatibility receipts. Discuss new runtime dependencies and substantial features first. Keep pull requests focused and include relevant tests. Respectful disagreement is useful; see CODE_OF_CONDUCT.md.

```bash
npm test
python3 -m unittest discover -s benchmark -p 'test_*.py'
```

These tests use fixtures and make no paid model calls. Live tests must declare their budget and required credentials separately.

## Submission rights

Code and documentation contributions are accepted under Apache-2.0, matching the repository license. Identify the license and provenance of contributed datasets and images explicitly. Do not submit private messages, LinkedIn contact details, confidential documents, API keys or material you cannot redistribute. Links and your own minimal summaries may be appropriate where full source redistribution is not permitted.

JEVRIEL Flight Test is the project's named format. Contributions do not grant permission to imply endorsement by Han Rabinovitz or TypeSafe. Image permissions differ from code; see NOTICE and assets/LICENSE.md.
