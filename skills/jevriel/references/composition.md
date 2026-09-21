# Compose judgments into application behavior

Start with the behavior the user needs, then choose judgments that help produce it. Keep exact rules, arithmetic, lookup and execution in code. These patterns are options, not a checklist for every integration.

| Desired behavior | Useful design | What to verify |
|---|---|---|
| Choose a handler and known arguments | Choice for the handler; independent questions for its bounded arguments | An argument is used only by its applicable handler; permissions remain in code |
| Extract or reconstruct source content | Find candidate spans in code, select with JEV, then copy and format in code | Candidate coverage and no-match behavior; never ask JEV to generate missing text |
| Find relevant evidence | Per-item Noul for membership or comparable Scores for graded relevance | Recall of decisive evidence and final task quality, not just ranking speed |
| Let users change priorities | Score stable dimensions once; combine with explicit weights in code | Same evidence and question meanings; invalidate stale judgments |
| Enforce any serious violation | Separate conditions and a deterministic gate | A good score elsewhere must not cancel a disqualifying condition |
| React to new observations | Retain goals and observed facts in code; ask a fresh bounded judgment | Evidence freshness; keep inferred state distinct from observations |

## Speculative parallel questions

For a support ticket, ask the category and, under an explicit bug-report premise, the severity in the same request. Each question sees the supplied state, never another answer. Code consumes severity only when the selected category makes it relevant; uncertainty on an unused branch does not block the applicable path.

Use a second request when a prior answer is needed to fetch evidence, construct state or select the next candidate set. Additional speculative questions cost tokens even if they save a round trip. Compare total tokens, end-to-end latency and selected-branch quality in the Flight Test.

## Reusable dimensions

For a reading queue, score relevance to the current project and evidence depth separately. Keep raw distributions, rubric version and source version. Code can change display weights without calling JEV again while those meanings and evidence remain unchanged. Evaluate the resulting ordering against the user's purpose. Do not use weighted averages for non-compensating restrictions such as missing permission.

## Question design

Use named state fields for identities, relationships and facts. Refer to nested fields explicitly, for example `ticket.messages[0].text`. Instructions and criteria may use JSON objects or arrays to provide definitions, exclusions and examples. Score levels should describe distinct concrete situations, not merely "low", "medium" and "high".

Choice represents competing alternatives. Use separate Noul questions for labels that can coexist. A Noul near 0.5 expresses ambiguity about yes/no, not medium intensity. Choice/Score confidence describes distribution concentration; several acceptable options can spread probability without making a harmless preference choice unusable. Evaluate thresholds for the actual consequences rather than adding a confidence cutoff everywhere.

The bundled `jevriel_judge` accepts structured instructions and mixed question types, with a local wrapper limit of 25 questions. Use the chosen provider's current API/SDK when its capabilities exceed a convenience wrapper. The wrapper limit is not a universal JEV model limit.

Sources: [official skill](https://github.com/typesafe-ai/skills/blob/main/skills/typesafe-ai/SKILL.md), [parallel questions](https://docs.typesafe.ai/patterns/fan-out), [composite scoring](https://docs.typesafe.ai/patterns/composite-scoring), [structured questions](https://docs.typesafe.ai/primitives/advanced). Reviewed 2026-09-21.
