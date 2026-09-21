# A real implementation: 429 documents, two hosted decision paths

**Completed 21 September 2026.** This earlier experiment informed JEVRIEL. It is not a test of the finished skill, and it does not replace the separate frontier-model prelaunch checks.

| Flight Card | Jev | GPT-5.6 Luna through OpenRouter |
|---|---:|---:|
| Documents attempted | 429 | 429 |
| Identical chunks attempted | 1,708 | 1,708 |
| Median / p95 request time | 0.422 / 0.849 seconds | 2.092 / 3.683 seconds |
| Total active request time, failures included | 311 seconds | 1,182 seconds |
| Fully valid documents | 417/429 | 427/429 |
| Valid requests | 477/489 | 487/489 |
| Failed or invalid requests | 12 | 2 |
| Recorded-usage list-price estimate | $0.0542 | $0.2975 |
| Human-measured accuracy | Pending | Pending |

**Verdict: narrow pilot and further evaluation.** Jev was about five times faster at the median request on this measured path. The GPT path returned more valid outputs. Neither has an established semantic-accuracy advantage.

The two models agreed on 1,137 of 1,650 jointly valid chunks, **68.9%**. Agreement is not accuracy. Valid output is not accurate classification. A frozen random human-review sample of 100 documents awaits independent labels.

## What was held constant

Both arms received the same full-text extraction, chunk boundaries and six genre definitions. The corpus has 2,670,029 Unicode characters across 429 documents, with 418 distinct text hashes. Requests contained up to eight chunks; chunk limits were 1,800 Unicode characters and 2,000 UTF-16 units. Job and arm order were randomized with seed 20260921, concurrency one, fresh caches and no runner retries. Jev used a persistent MCP connection; the hosted baseline was `openai/gpt-5.6-luna`, reasoning disabled.

The six categories were commercial proposal, working notes, positioning strategy, achievement evidence, research reference and other/unclear. This classified content genre. It did not verify the truth of professional claims or personal contribution.

A timeout interrupted the run; continuation processed only previously unattempted batches. Earlier failures were preserved. Timing includes adapter and network overhead and failed work, but excludes the preceding document-extraction stage. It is a configured-system comparison, not intrinsic model latency.

## Cost basis

Jev's recorded 1,290,999 input tokens × [TypeSafe's published $0.042 per million input tokens](https://docs.typesafe.ai/models) = **$0.054221958**, with free output. The GPT estimate is **$0.2975036**, using the experiment's captured $0.20/M input and $1.20/M output rates and its recorded tokens. The rate snapshot belongs to this run; refresh current provider pricing before another comparison.

One usage receipt is missing in each arm. Jev's actual billed amount was not returned. GPT API-reported fees were $0.3467 plus one unknown call. Estimates and API-reported fees must not be silently combined. No complete invoice-level savings claim is made.

## What JEVRIEL takes from this

Validate every expected item ID, label and distribution, including null or missing wrapper output. Declare whether a malformed item rejects its entire batch. Keep operational acceptance separate from individually valid outputs and semantic accuracy. Preserve failed attempts when continuing interrupted jobs. Tune confidence against independent labels rather than treating it as authority.

Next: score the frozen human-review sample; repair or review invalid output; then test the complete absorption and query workflow. That larger workflow remained unfinished when this classification experiment completed.

## Evidence

[Aggregate metrics](metrics.json), [usage and validity diagnostics](additional-metrics.json), and [run provenance](provenance.json) were imported from the completed experiment. This package includes aggregate results only. Original documents, client names and per-person judgments remain private, so this is an inspected case study rather than a publicly reproducible corpus benchmark.
