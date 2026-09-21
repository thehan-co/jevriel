# Adapt to the host, not a model nickname

The same Markdown skill can guide a frontier coding agent or a general agent with files and tools. Capability determines the adapter. Astra, Fable, Gemini 3.8, DeepSeek 4.1 and GLM 5.3 are user-requested target labels, not compatibility certifications or verified API IDs.

At runtime inspect the host's skill loader, tools, model catalog and permissions. Record provider, exact model identifier, returned version, reasoning configuration, context limits, output contract and price source. Never silently substitute a cheaper model or guess an endpoint from a display name.

Before autonomous integration or reporting, follow [host-qualification.md](host-qualification.md). A written skill alone does not guarantee compliance; require evidence from the actual target host.

| Available capability | Adaptation |
|---|---|
| Native Markdown skills | Install the `jevriel` folder in the host's documented skill directory. Load only the chosen mode reference. |
| File reading and terminal | Read SKILL.md, inspect the app and run the benchmark from the retained repository checkout. Ask for its path if only the skill folder was installed; never assume the runner was copied with it. |
| JEV MCP | Discover actual tool schemas; record the wrapper version and how it transforms confidence or usage. |
| Direct TypeSafe API | Use the native state/questions endpoint and validate the returned contract. |
| LLM API with structured output | Use a supported JSON/schema constraint for a fair baseline; do not force prose and then charge it for parsing. |
| No execution or credentials | Produce the concrete integration diff and commands with execution marked unrun; never invent results. |
| No reliable model probabilities | Report accuracy and abstentions, but mark probability calibration unavailable. Self-reported LLM confidence is a different signal. |

Do not require a particular thinking budget, system prompt, chain-of-thought output, MCP brand or host-only feature. Re-evaluate when the task, model version, criteria or data distribution changes.
