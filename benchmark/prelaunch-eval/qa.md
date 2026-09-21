# Early-release QA

2026-09-21. This is an early public release with incomplete frontier evaluation.

- 26 offline tests pass: 19 Node checks and 7 Python checks. They cover malformed answers, probability/score consistency, session disabling, failure receipts, source-result parsing, benchmark scoring and a simulated installer with an existing marketplace entry.
- Codex plugin/skill validation and Claude plugin manifest validation pass.
- npm inventory excludes private research, local-model development runs, local configuration and caches.
- MCP initialize and status calls succeed without inference. Codex installed-cache verification is recorded after installation.
- An independent reviewer found two blocking defects (package exclusions and score consistency); both were fixed and verified. Public-copy review: 96/100, with no remaining blockers in that bounded review.

The five-prompt, 100-source frontier comparison has not completed. The 429-document case study is separate; human accuracy scoring is pending. Offline tests do not establish model quality or certify autonomous actions. Claude packaging validation does not establish a live Claude installation or model qualification.
