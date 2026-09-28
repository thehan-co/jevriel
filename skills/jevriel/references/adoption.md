# JEVRIEL adoption policy

Read the persisted mode through `jevriel_status`, `jevriel adoption`, or `~/.config/jevriel/adoption.json` (`JEVRIEL_CONFIG_DIR` can override the directory). Missing, invalid or unreadable settings mean Light. A mode is a user preference, never a grant of permissions beyond the current task. The separate session setting `disabled` always prevents bundled inference.

## Light: invoke when asked

Use JEV only when the user requests JEV/JEVRIEL or explicitly includes it in the current task. No automatic workflow scan or unrequested inference. An explicit JEV workflow may contain several necessary judgments; do not ask permission again for every step already covered by that request.

## Deep: assess each process automatically

At task start and when the workflow materially changes, briefly assess the planned steps for useful JEV decisions. Do this with the agent's own reasoning, without a model call. No checklist needs to appear in routine replies. For each candidate choose code, JEV, LLM or human:

- Code: arithmetic, dates, exact lookups, validation, access control and deterministic routing.
- JEV: semantic decisions with a bounded answer space, such as queue choice, evidence selection, contradictions, candidate matching and draft verification.
- LLM: writing, synthesis, explanation, programming and extended reasoning.
- Human: missing authority, consequential ambiguity or a decision reserved for the user.

When useful and within the current task, use the configured JEV route automatically. Expected benefit must justify added latency, cost and complexity; skip trivial tasks and decisions code already settles. Collect evidence first, minimize state, batch independent questions, preserve uncertainty, and use an explicit fallback. Never run a JEV call just to decide whether to run JEV. Do not recursively optimize the optimization check.

Use one bounded judgment stage per decision unless a dependent stage has a concrete need. Avoid duplicate calls on unchanged evidence. Observe receipts and the user's existing budget; bulk runs, newly introduced data scopes or consequential execution need their own authorization when not already covered. Do not silently move providers, buy capacity or retry indefinitely.

For code changes, identify worthwhile decision points and implement the selected integration within the requested scope. Do not automatically rewrite unrelated projects. For daily work, use judgments to improve drafts, routing suggestions and evidence review. Filing, sending, deleting, deploying or spending still follows normal permissions.

If JEV fails, is unavailable, or returns incomplete answers, keep unresolved items visible and continue through the declared code/LLM/manual fallback. Report a meaningful failure once. Keep uncertain suggestions distinct from verified facts. Preserve provider, model, decision version, cost and validation outcome; never claim a benefit without matched evidence.

## Installation and limits

Deep must be explicitly selected. A plugin alone does not make the host load it for every task. Add the supplied pointer to the host's persistent instruction surface using `jevriel adoption deep --instructions /absolute/path/to/instructions.md`. Start a new session, verify that the host loaded the policy, and check its behavior on a small suitable task and a deterministic task that should skip JEV.

This is prompt-guided workflow assessment. It is not a daemon, hidden scheduler, enforcement sandbox, or guarantee that every host/model complies. Higher-priority host rules win. `jevriel adoption light` changes the persisted preference back to manual use; existing pointers read the new mode next task. Removing the managed pointer disables automatic loading. `jevriel_session_mode disabled` temporarily disables bundled calls in the current server process.
