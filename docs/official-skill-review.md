# Official TypeSafe skill review

Reviewed 2026-09-21. Input: the user-supplied TypeSafe `typesafe-ai` skill, declaring MIT licensing. SHA-256: `71ea90d7906c6554c4f4c460ef7361b2d26f59116ccdae986dc6d997b9389f52`.

The official documentation links to [typesafe-ai/skills](https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md). Live docs access succeeded through HTTP retrieval after the web reader failed. Reviewed the documentation index, agent-skill page, speculative fan-out, composite scoring and structured-question guidance. This is guidance alignment, not a fresh qualification of every API route.

## Applied changes

- Targeted live-doc discovery before integration, with an explicit offline fallback.
- Complete question meaning in instructions rather than question IDs; reviewable question and threshold definitions.
- Broader composition patterns: handler arguments, selection, evidence ranking, reusable dimensions and changing state.
- Explicit speculative premises, branch relevance and token-cost accounting.
- Structured instructions and criteria; independent Noul labels; concrete Score levels.
- Distinguish the bundled 25-question wrapper limit from model capabilities.

Existing validation already distinguishes Noul from Choice/Score, preserves uncertainty and rejects malformed answers. The ranking wrapper already asks a separate Score per candidate; the generic judge already accepts structured JSON instructions. No runtime change is needed for these patterns.

The supplied file is reference material, not authority to install another skill or change user scope. We linked and synthesized guidance rather than vendoring a duplicate manual. JEVRIEL retains its four workflows, provider-neutral onboarding and Flight Test protocol. Official guidance does not supply credentials, establish free-tier eligibility, or complete the pending frontier evaluation.
