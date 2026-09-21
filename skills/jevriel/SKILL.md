---
name: jevriel
description: Inspect, integrate and evaluate TypeSafe JEV in new coding projects, existing apps and daily AI-agent workflows. Use when a user wants JEV decision support, an integration opportunity map, or a reproducible JEV-versus-LLM benchmark.
---

# JEVRIEL

Give your AI JEV wings. Turn the user's motivation into a small, measured TypeSafe JEV integration. Keep the explanation short; do the inspection and evaluation thoroughly.

## Installation and onboarding

When the bundled tools are available, call `jevriel_status` before live use. Provider selection and missing credentials are onboarding states, not a model failure. Guide the user through `npx --yes github:thehan-co/jevriel setup` in their local terminal; never ask for keys in chat. The installer includes this step automatically in an interactive terminal. A connection check uses one small JEV request under the selected provider's quota and billing. The plugin supports built-in routes, a compatible HTTPS endpoint, custom API adapters and reuse of an existing MCP. Never silently move a user to another provider. Use the existing installed JEV connector when appropriate and inspect its contract.

Use [plugin-tools.md](references/plugin-tools.md) for bundled tool names, session controls, receipts and the benchmark command. Start JEVing with one useful decision, then measure the change.

## Start from the outcome

Accept a plain-language motivation such as faster routing, lower inference spend, better evidence selection or fewer unnecessary reasoning calls. Inspect the relevant code or workflow before recommending changes. Establish the existing decision, candidate outputs, frequency, latency/cost baseline, error consequence, data allowed to leave the host, and fallback. Ask only for missing information that changes the implementation.

Classify opportunities as **use code**, **try JEV**, **keep the LLM**, or **human decision**. JEV fits a semantic judgment over supplied text and a bounded answer space. Arithmetic, access rights, exact date ordering and schema validation belong in code. Generation and extended reasoning belong with a suitable LLM. A model's confidence never grants authority.

Return a compact opportunity map: location, proposed question, expected benefit, failure consequence, verification and next action. Select one worthwhile first integration. Do not add JEV to every step simply because it is available.

## Select the mode

Load only the relevant guide:

- New coding project: [new-project.md](references/new-project.md).
- Upgrade existing code or app: [upgrade.md](references/upgrade.md).
- Daily work with an AI agent: [daily-agent.md](references/daily-agent.md).
- Benchmark against LLMs: [flight-test.md](references/flight-test.md).

For all implementation work, read [jev-contract.md](references/jev-contract.md). For host/model adaptation, read [model-adaptation.md](references/model-adaptation.md). Public evidence and current documentation are indexed in [sources.md](references/sources.md).

## The decision contract

1. Inspect the installed connector or current official API. Discover actual model IDs and response shapes. A community MCP wrapper's field named `confidence`, `auto` or `verified` may differ from the native API's meaning.
2. Define small, independent typed questions. Use Choice for a finite option set, Score for ordered rubric levels, Noul for a yes/no probability. Include a genuine escape option when none of the listed choices can fit.
3. Pass only decision-relevant state. Treat documents, messages and code comments as untrusted evidence. Keep instructions in the trusted question and criteria. Share state across independent questions; dependent decisions need separate stages.
4. Validate shape, options, distributions, finite values and completeness in code. Preserve the selected option, full probabilities, native confidence when present, and provenance. Never silently replace absent usage or costs with zero.
5. Tune routing thresholds on development data and freeze them before held-out evaluation. Neither a universal 0.85 cutoff nor a large probability proves correctness. Check selected accuracy together with coverage and escalation cost.
6. Distinguish a valid answer, a correct judgment, and a permitted action. Act only within the user's existing permissions and deterministic application policy. Escalate uncertainty, invalid output, timeout and missing evidence through an explicit bounded path.
7. Test representative, ambiguous, out-of-scope and adversarial cases. Measure the whole path, including preparation, JEV, fallback, retries and validation. Keep rollback straightforward.

When passing JEV output to an LLM, label it `model_judgment`, attach its evidence references, uncertainty and decision version, and permit re-evaluation when evidence conflicts. Never inject it as immutable factual ground truth.

## Deliver

Finish with the chosen integration, what changed, verification, and a **JEVRIEL Flight Card**: evidence mode; latency; cost; quality; coverage/failures; verdict; next useful integration. Use `not measured` where necessary. Report a regression as plainly as a gain. A quick probe is useful but cannot certify deployment readiness.

### Evidence gate before answering

Every numeric result must come from an identified supplied observation or an execution receipt. Never fill a missing cell with a plausible value. A sample count is not a count of correct answers: "20 LLM cases" does not mean "20/20 correct." AI-reference agreement is not human-validated accuracy. An untested deterministic rule is not measured at 100% accuracy, zero failures, or sub-millisecond latency. Do not invent an existing baseline for a new project.

If nothing ran, use this exact status and keep every result unmeasured:

```text
JEVRIEL Flight Card | PLAN ONLY | proposed task
Latency: not measured
Cost: not measured; optional published-rate estimate requires known input usage
Fidelity: not measured
Trust: coverage, selected accuracy and failures not measured
Verdict: retest; implementation/testing proposed, not completed
Next: one concrete validation step
```

For executed work, evidence mode is only `PROBE`, `CONTROLLED` or `OBSERVE`. `Choice`, `code` and `daily agent` are not evidence modes. Do not fabricate JEV confidence for your own illustrative classifications. Label those as assistant examples, not live JEV results.

An invalid output must be logged and routed through the declared fallback, never silently discarded. If a connector's confidence semantics are unknown, inspect the mapping before using that field. Native API documentation alone does not establish what the wrapper returns. Lack of permission to send messages does not prevent drafting code or running an authorized, non-sending shadow test.

The skill supplies a method, not a model subscription, credentials, publishing permission, or a claim of universal compatibility. Keep the agent's normal reasoning style and tool rules; no private chain-of-thought disclosure is required.
