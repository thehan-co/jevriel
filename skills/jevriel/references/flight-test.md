# JEVRIEL Flight Test 1.0

An original JEVRIEL benchmark and reporting format by Han Rabinovitz. The identity and presentation are JEVRIEL's; the statistical methods are standard. It is not a TypeSafe benchmark or an industry certification.

## Pick the evidence mode

- **PROBE:** a small synthetic or convenience sample. Tests wiring and reveals examples. Report actual measurements with sample size; do not generalize.
- **CONTROLLED:** freeze data, expected outcomes, criteria, model configurations and acceptance rules before testing. Match every arm on the same held-out inputs; interleave request order. Preserve the manifest and raw receipts.
- **OBSERVE:** real workflow use without a matched control. Report observed latency, expense, overrides and later corrections. Never turn before/after differences into causal gains.

No live execution means **PLAN ONLY**, not a benchmark result. Include the evidence mode in every card and chart.

Copy only measurements actually supplied or captured. Missing comparator correctness stays unknown even when its sample size is known. Report agreement with AI-authored reference labels as agreement, not proven errors or human-validated accuracy. Deterministic code needs tests too; do not invent timing or a perfect score for an unexecuted rule. See the PLAN ONLY card in SKILL.md.

## Three arms, two scopes

A: **LLM-only** performs the narrow decision using an appropriate structured output contract.
B: **Jev-only** makes the same decision with typed questions and the same state/options.
C: **Jev + fallback** sends uncertain, invalid and failed judgments to the same LLM as A. Measure the live cascade separately. An offline projection from A and B is a projection, not measured C latency.

Measure both the decision component and, when possible, the user-visible workflow. Freeze the semantic question and equivalent evidence; provider-specific wrappers can differ but must be retained. Add a rules baseline when useful. Treat local-versus-hosted measurements as a system-path comparison, never as a pure model-speed comparison.

## LIFT: four dimensions, no magic aggregate

| Dimension | Required measures |
|---|---|
| **L: Latency** | Median and p95 end-to-end wall time; cold/warm state; queueing, pre/postprocessing, retries and fallback included; batch size/concurrency fixed and reported. |
| **I: Inference cost** | Total billed or explicitly estimated model cost; cost per 1,000 attempted decisions and per correct outcome; gateway, fallback and retries included. Report local compute separately and leave unknown values null. |
| **F: Fidelity** | Overall accuracy with all attempts in the denominator, per-class errors/macro F1, important false positives and negatives; independently labeled held-out cases; calibration only for genuine probability signals. |
| **T: Throughput and trust** | Successful decisions per wall second at stated concurrency; auto-accept coverage and selected accuracy together; abstentions, failures, overrides and evidence coverage. |

For classification, define escape labels and how correct abstention is scored. Do not count a model's `verified` label as a human-verified outcome. Keep repeated trials clustered by case: repeats increase timing observations, not the number of independently labeled examples.

Relative latency reduction = `100 * (LLM median - candidate median) / LLM median`.
Speed factor = `LLM median / candidate median`. Report both denominators.
Cost saving uses the same formula only when both totals cover the same cost scope and the baseline is positive. A zero API-fee baseline produces an undefined saving ratio, not infinite savings. Quality change is in percentage points, with sample counts.

## Controlled protocol

1. Define task, labels, ambiguous/unknown cases, error consequence and minimum acceptable quality. Include simple, boundary, adversarial and out-of-distribution slices.
2. Keep a development set for wording and threshold tuning. Freeze a held-out test set before the run; never expose gold labels to model inputs. For serious claims, obtain independent human label review and resolve disagreements before scoring.
3. Pin exact models, SDK/adapter versions, endpoint, reasoning setting, temperature, token limits, region/hardware, concurrency, timeout and retry policy. Capture alias resolution. Record missing metadata as missing.
4. Use equal input semantics and fair output constraints. Hold useful caching conditions consistent or report cold and warm separately. Counterbalance arm order; do not time one model while another unrelated local job changes load unnoticed.
5. Choose sample size and repeats before running based on precision/risk and budget. The bundled 16-case fixture is a wiring probe, not production evidence. Timing p95 on tiny samples is descriptive only.
6. Count all attempts. Failed or invalid results stay in accuracy denominators and in time/cost totals; preserve service failure separately from judgment error. Keep deliberate abstention separate from both.
7. Summarize uncertainty. Prefer a paired bootstrap over case IDs for accuracy differences and timing estimates; for small samples, show raw counts and refrain from declaring equivalence or superiority. Calibration should use held-out chosen-option probabilities, reliability bins, coverage and a proper scoring rule. Never conflate native confidence with probability.
8. Apply the frozen quality floor before claiming a useful speed or cost win. Return **adopt**, **narrow**, **retest** or **reject**. Small probes default to retest for deployment decisions.

## The seven-line Flight Card

```text
JEVRIEL FLIGHT TEST 1.0 | PROBE / CONTROLLED / OBSERVE | task | n cases, repeats
Latency: LLM ... -> Jev ... -> hybrid ...; median / p95, scope
Cost: ... per 1k attempts; billed / estimate / unknown; compute scope
Fidelity: ... correct / attempted; class errors; label provenance
Trust: auto coverage ...; selected accuracy ...; escapes ...; failures ...
Verdict: adopt / narrow / retest / reject; reason and evidence limits
Next: the next specific decision boundary worth testing
```

The full record backs this card: immutable data hash, run ID/time, source/config hashes, exact returned models, raw answers, attempt timings and usage, pricing provenance, labels, scorer version and output. Save it beside the code, outside private source material.

The repository's `benchmark/flight_test.py` supplies a standard-library scorer and runnable classification probe. It reports explicit unknown cost and supports command adapters for Jev, direct TypeSafe REST and a JSON-constrained local Ollama baseline. Broader frontier-provider comparisons should implement the same adapter contract after discovering their real APIs. Do not claim cross-provider validation from one local baseline.
