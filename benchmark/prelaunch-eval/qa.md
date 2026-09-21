# Early-release QA

2026-09-21. This is an early public release with incomplete frontier evaluation.

- 36 offline tests pass: 29 Node checks and 7 Python checks. They cover malformed answers, probability/score consistency, session disabling, failure receipts, source-result parsing, benchmark scoring and a simulated installer with an existing marketplace entry.
- Codex plugin/skill validation and Claude plugin manifest validation pass.
- npm inventory excludes private research, local-model development runs, local configuration and caches.
- MCP initialize and status calls succeed without inference. Codex installation from the public GitHub npm command succeeded. The installed cache exposes all nine tools and the skill; initialize and status were verified there. Selected-provider onboarding is still pending on this host. The earlier Gateway MCP is unchanged.
- An independent reviewer found two blocking defects (package exclusions and score consistency); both were fixed and verified. Public-copy review: 96/100, with no remaining blockers in that bounded review.

The five-prompt, 100-source frontier comparison has not completed. The 429-document case study is separate; human accuracy scoring is pending. Offline tests do not establish model quality or certify autonomous actions. Claude packaging validation does not establish a live Claude installation or model qualification.

GitHub CI passed for the release and installer path correction. The first real installation exposed the personal marketplace root convention; the installer now places its source at `~/plugins/jevriel`, and the corrected public command was verified.

Version 0.1.1 adds provider selection, Cloudflare and OpenRouter request fixtures, custom HTTPS endpoints, a tested subprocess adapter and existing-MCP mode. Cloudflare/OpenRouter fixtures are not live account certification. TypeSafe reference price estimates are kept separate from actual provider billing. No paid model calls were made for this update.

Version 0.1.2: existing-MCP onboarding and safe HTTP diagnostics pass offline tests. A live check through the maintainer's existing Vercel JEV MCP succeeded. The separate Cloudflare credential returned HTTP 401; Cloudflare access is not qualified.
