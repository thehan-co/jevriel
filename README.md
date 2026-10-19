> **Public release frozen, 19 October 2026.** This repository preserves JEVRIEL 0.2.0 under Apache-2.0. Future marketplace editions are developed privately. See [Han's Agensi storefront](https://www.agensi.io/creators/han-hanoch-rabinovitz) for current marketplace availability and [the release policy](docs/public-release-freeze.md) for the licensing and maintenance boundary. The last public release and its existing licence grants remain available.

<p align="center">
  <img src="assets/jevriel-header-color.png" alt="JEVRIEL: Give your AI JEV wings. An angel carries a blue AI agent through a blue and gold sky." width="100%">
</p>

# JEVRIEL

**Give your AI JEV wings.**

JEVRIEL helps your AI agent use TypeSafe JEV for fast, structured decisions: route a request, rank evidence, classify a document or choose the next step. It helps you build the integration and measure whether it improves the work.

**Choose your AI host, your JEV provider and how deeply to adopt it.**

[Install](#install) · [Light or Deep](#choose-light-or-deep) · [Choose a provider](#connect-your-jev-api) · [Examples](#four-ways-to-use-jevriel) · [Measured results](#what-happened-on-429-real-documents) · [Documentation](docs/installation.md)

**Codex · Claude Code · Portable skill and CLI** | [Apache-2.0](LICENSE) | [v0.2.0](docs/release-0.2.0.md)

### Choose Light or Deep

| | Light | Deep |
|---|---|---|
| **When it runs** | When you ask for JEVRIEL | Your agent assesses each workflow for useful JEV decisions |
| **How you work** | Request a pilot, a judgment or a benchmark | Continue your normal work; the agent uses JEV where it can help |
| **How it is enabled** | Default for new installations | Explicit opt-in through persistent host instructions |

Deep makes JEV part of the agent's working policy. The agent considers each workflow, then chooses an appropriate tool. Exact calculations and rules stay in code; writing and extended reasoning stay with the LLM. JEV handles suitable bounded judgments within your permissions, privacy constraints and budget.

Deep depends on the host loading and following its instructions. It does not intercept every tool call or require a JEV request for every step. [Full adoption policy](docs/adoption.md).

### Install

Choose **one** command for your host:

```bash
# Codex
npx --yes github:thehan-co/jevriel install codex

# Claude Code
npx --yes github:thehan-co/jevriel install claude

# Other AI hosts with file and terminal access
npx --yes github:thehan-co/jevriel install portable
```

Requires Node.js 20+, npm and Git. Native plugin installation also requires the selected host's CLI. The interactive installer asks for your JEV connection and offers Light or Deep adoption. Start a new host session after installation.

Portable installation supplies a Markdown skill and a local runtime. Point your agent at `~/.agents/skills/jevriel/SKILL.md`, or copy the skill to its documented skill directory. Hosts with MCP support can register the bundled server. [Installation details](docs/installation.md#any-fileterminal-capable-ai).

### Connect your JEV API

Use **OpenRouter, TypeSafe direct, Cloudflare, an existing JEV MCP, a compatible HTTPS endpoint or a custom adapter**. Your AI host and JEV provider are independent choices.

For example, connect through OpenRouter using your OpenRouter API key:

```bash
npx --yes github:thehan-co/jevriel setup --provider openrouter
npx --yes github:thehan-co/jevriel doctor
```

Setup asks for the key in a hidden terminal prompt and makes one small verification request billed by your chosen provider. Secret-manager injection is also supported. `doctor` checks configuration without running inference.

Already connected through a JEV MCP? Choose **existing MCP** during setup. For an API with a different request or authentication format, supply a custom adapter. [Provider choices and adapter guide](docs/providers.md).

### Enable Deep across your work

You can choose Deep during interactive installation, or enable it afterward:

```bash
# Install the shared policy, including when you already use a native plugin.
npx --yes github:thehan-co/jevriel install portable --skip-setup

# Choose the instruction file for your host. Codex example:
npx --yes github:thehan-co/jevriel adoption deep --instructions "$HOME/.codex/AGENTS.md"

# For Claude Code, use "$HOME/.claude/CLAUDE.md" instead.
```

This adds a managed policy pointer while preserving other instructions. Other hosts can use their own documented persistent instruction file. Start a new session to load the policy. Provider setup is separate.

Switch back to manual use whenever you want:

```bash
npx --yes github:thehan-co/jevriel adoption light
```

[Adoption settings, host verification and controls](docs/adoption.md).

### Try one useful decision

Ask your agent:

> Use JEVRIEL to inspect this app. Find one decision where TypeSafe JEV could reduce latency or cost without hurting quality. Implement a reversible pilot and give me a JEVRIEL Flight Card.

For daily work, try:

> Use JEVRIEL to classify these notes as tasks, references, meetings or manual review. Keep ambiguous items for review and show the usage receipt.

The [runnable daily triage example](examples/daily-triage/README.md) uses synthetic data and shows how typed judgments become application decisions. The runtime also supports routing, ranking, candidate extraction, evidence verification and shared-state questions. [Tool guide](docs/tools.md).

### What JEV brings to the work

| At this junction | JEV can contribute | Your application retains |
|---|---|---|
| A request arrives | A choice among known handlers | Permissions and execution |
| Retrieval returns candidates | Relevance judgments | Evidence provenance and recall checks |
| A workflow needs a next step | A bounded choice with uncertainty | Allowed actions and fallback |
| An agent drafts a claim | A judgment of support in supplied evidence | Source checking and accountability |

JEV returns typed decisions rather than arbitrary prose. A permitted output can still be the wrong decision. Exact calculations, dates, permissions and validation belong in code; open-ended reasoning and writing remain jobs for a suitable LLM. [Known weaknesses](https://docs.typesafe.ai/model-jaggedness/jev-1.13).

### Four ways to use JEVRIEL

| Your starting point | What the agent does | Guide |
|---|---|---|
| **A new coding project** | Design useful decision points, build an adapter and fallback, test the baseline. | [Build](skills/jevriel/references/new-project.md) |
| **An existing app** | Inspect current LLM calls, choose a replacement candidate, shadow-test and compare. | [Upgrade](skills/jevriel/references/upgrade.md) |
| **Daily agent work** | Add bounded advice to triage, classification, routing and evidence checks. | [Daily work](skills/jevriel/references/daily-agent.md) |
| **JEV versus LLMs** | Run a controlled comparison or clearly labeled probe/observation, then report the result. | [Benchmark](skills/jevriel/references/flight-test.md) |

### The JEVRIEL Flight Test

A short answer to a practical question: **does JEV improve this particular job?**

JEVRIEL's original **LIFT** format reports four dimensions: **Latency, Inference cost, Fidelity, and Throughput/trust**. There is no single score that can hide a quality loss behind a speed gain.

Compare an LLM-only path, a JEV-only path, and JEV with LLM fallback. The result card shows timing, cost, correctness, coverage, failures and the next place worth testing. Full receipts sit behind it.

Every result identifies its evidence level:

- **PROBE:** a quick wiring and behavior check.
- **CONTROLLED:** matched held-out inputs and frozen rules.
- **OBSERVE:** real work without a matched control.

The bundled public example classifies synthetic inbox notes into task, reference, meeting or manual review. It includes normal requests, ambiguous notes and attempts to bypass policy. No private messages or company documents are included.

```bash
# Python 3.10+, no Python dependencies.
cp benchmark/config.example.json benchmark/config.local.json
# Verify the hosted OpenRouter model ID and JSON-schema support.
# Supply OPENROUTER_API_KEY for the LLM baseline.
# Complete provider setup first; this uses your selected JEV API source.
python3 benchmark/flight_test.py \
  --config benchmark/config.local.json \
  --out benchmark/runs/my-first-flight
```

For an existing community JEV MCP connection, use the [MCP adapter contract](benchmark/adapter-contract.md). A full paid run is optional; the [protocol](skills/jevriel/references/flight-test.md) also covers observations from normal work.

### What happened on 429 real documents

The same **1,708 text chunks from 429 documents** went to JEV and hosted **GPT-5.6 Luna through OpenRouter**. JEV's median request took **0.422 seconds**, versus **2.092 seconds** for GPT, about **5x faster on this path**. The result includes failures.

There was a tradeoff: JEV had **12 invalid batches out of 489**, versus **2 failed or invalid batches** for GPT. The models agreed on **68.9%** of jointly valid chunks. Human accuracy scoring is pending, so there is no accuracy winner yet.

Estimated inference cost from recorded usage was **$0.0542 for JEV versus $0.2975 for GPT**. JEV uses TypeSafe's published $0.042 per million input tokens; one usage receipt is missing in each arm. These are list-price estimates, not reconciled bills.

[Read the measured case study](benchmark/career-corpus/flight-card.md). It informed JEVRIEL's validation and fallback guidance; it is a separate experiment from the skill's prelaunch test below.

### JEV, meet your homework

We are testing the JEV skill on JEV's own homework: **70 TypeSafe documentation pages, 15 news articles and 15 public LinkedIn profile excerpts**. Five frozen decision rubrics assess segment, industry, relevance, evidence quality and next action.

The launch comparison targets GPT-6 Astra, Claude Fable 5.1, Gemini 3.8 Flash, DeepSeek V4.1 Flash and GLM 5.3 Flash through OpenRouter. Each model sees each source once and returns all five classifications together to avoid repeated input tokens. JEV estimates use [TypeSafe's published list price](https://docs.typesafe.ai/models).

**Frontier evaluation pending:** The prepared run has not completed. No local-model comparison is used as launch evidence. Final numerical claims and host qualification await the frontier run.

### Why I built this

Daniel Kahneman's *Thinking, Fast and Slow* is, in my opinion, one of the most important books ever written. His account of fast, intuitive System 1 and deliberate System 2 gives me a useful way to think about building with AI. It also reminds me that fast judgment can be wrong. [About the book](https://www.penguinrandomhouse.com/books/89308/thinking-fast-and-slow-by-daniel-kahneman/).

TypeSafe's JEV brings a fast decision model into the software around an AI agent. Give it relevant state and defined questions; it returns choices, scores or yes/no probabilities that code can use. Independent questions can share one request and run in parallel. [TypeSafe's introduction](https://docs.typesafe.ai/introduction).

**I see this as a breakthrough in how we build with AI: a decision capability we can place throughout a workflow.** JEV can help the larger agent decide where to spend its reasoning, attention and computation. That is what I mean by an AI catalyst.

I've connected JEV and put it into the triage and classification stages of my morning agent. I also ran a paired classification test on 429 documents, covering 2.67 million characters. Those experiments led to JEVRIEL: a way to teach other agents this pattern and check whether it actually helps.

The angel supplies the wings. Your measurements decide whether they help.

### A little JEVine consultation

<p align="center">
  <img src="assets/jevriel-adviser-freehand-v1.png" alt="A seated male angel advises a blue AI agent at a desk, pointing to one of three choices." width="360">
</p>

Sometimes the useful contribution is one small decision at the right moment. JEVRIEL teaches your agent to bring JEV the relevant evidence, ask a clear question, and keep uncertainty visible.

Even an angel needs a fallback.

### Works with your agent's capabilities

JEVRIEL is Markdown with focused references and a standard-library benchmark. It adapts to the host's actual tools, output formats and model IDs. It can guide a frontier coding agent without depending on one model's private prompting conventions.

Astra, Fable, Gemini 3.8, DeepSeek 4.1 and GLM 5.3 are target environments to verify through their host/provider catalogs. This package does not claim that every named version has been tested. [Adaptation guide](skills/jevriel/references/model-adaptation.md).

### Contribute a Flight Test

Found a useful junction? Try it, measure it and share the evidence. Submit a sanitized dataset, frozen rubric, model IDs, pricing source and receipts. We review the comparison, reproduce what we can and turn accepted findings into examples and regression tests. Gains, regressions and inconclusive results are welcome.

[Contribution guide](CONTRIBUTING.md) · [Open a Flight Test](https://github.com/thehan-co/jevriel/issues/new?template=flight-test.yml) · [Discuss an idea](https://github.com/thehan-co/jevriel/discussions)

### Evidence, authorship and status

Created by **Han Rabinovitz**. Its integration guidance incorporates lessons from [TypeSafe’s official skill](https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md), with [the applied improvements documented here](docs/official-skill-review.md). The bundled judgment adapter credits and reuses [Arik Aizikovich's TypeSafe-as-a-Judge](https://github.com/E-FL/typesafe-as-a-judge), with independent validation and accounting. [Architecture and provenance](docs/architecture.md). JEVRIEL and the Flight Test format are independent work; TypeSafe JEV is TypeSafe's product. No TypeSafe endorsement is implied. This is an early public release. Code and documentation use Apache-2.0; names and illustration permissions are explained in [NOTICE](NOTICE). Frontier-model QA remains pending; no autonomous-host certification is claimed.

The research combines official contracts, dated public discussion, and implementation experience. X reports, Reddit comments and YouTube demos carry their own evidence labels. The [source guide](skills/jevriel/references/sources.md) distinguishes what was read, what was measured and what remains unverified.

**Start with one useful decision. Measure the lift.**

Release verification: [0.2.0 evidence and limits](docs/release-0.2.0.md).
