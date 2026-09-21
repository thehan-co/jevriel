# Architecture and provenance

JEVRIEL has three parts: a portable skill, optional host plugins, and a Flight Test protocol with a public benchmark runner.

The runtime adapter reuses the Apache-2.0 judgment functions and tool schemas from Arik Aizikovich's [TypeSafe-as-a-Judge](https://github.com/E-FL/typesafe-as-a-judge/tree/d7a70549fcc539aabbe8645dd0e2ba44e0deffd0), pinned at `d7a70549fcc539aabbe8645dd0e2ba44e0deffd0`. Source and license notices live under `vendor/typesafe-as-a-judge/`. The two upstream function modules remain unchanged; the tool schema module is an attributed extraction. Updates require a source review and the adapter regression tests.

JEVRIEL's separate adapter pins the outgoing model, disables upstream retries, validates every expected answer ID, checks types, allowed choices, finite confidence, probability keys/sums and score bounds, and records metadata for successful and failed calls. Missing usage is unknown. A response-validation failure never proceeds to an action. A ledger write failure prevents an unrecorded successful result from being handed to the caller.

The MCP process handles requests sequentially. It provides no file mutation, messaging or application execution tools. Its own side effect is the local metadata ledger. The installer changes plugin registration and optionally stores a local credential after user input. No automatic telemetry or dataset upload exists.

The usage summary estimates known input-token costs at the published TypeSafe rate, dated in the output. It cannot infer savings against an LLM that did not run. The dedicated Flight Test compares actual paths and includes fallback, startup, invalid outputs and errors. Historical corpus aggregates are reported separately from plugin qualification.

## Repository practice

Owner: Han Rabinovitz. Source of truth: this repository, default branch `main`. Use focused branches and pull requests for contributions. Preserve unrelated dirty changes. Never commit credentials, local configs, private research, source documents or personal receipts. Release assets and installation instructions belong here; private project governance lives in the author's Vault project.
