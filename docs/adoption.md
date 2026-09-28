# Light or Deep

Choose how the agent adopts JEV, independently of your provider.

| Mode | Behavior | Default |
|---|---|---|
| Light | User calls JEVRIEL when needed; no automatic assessment or inference | Yes |
| Deep | Agent reviews every workflow for useful JEV decisions and uses it where beneficial within the authorized task | Explicit opt-in |

Deep runs at the persistent host-instruction layer. It does not mean every step makes a JEV request. Arithmetic, permissions and exact lookups stay in code; generation and extended reasoning stay with the LLM. The assessment itself is lightweight agent reasoning. [Full adoption policy](../skills/jevriel/references/adoption.md).

## Activate

First install the portable user-level skill, which supplies a stable policy path even if you also use a native plugin:

```bash
npx --yes github:thehan-co/jevriel install portable --skip-setup
# Codex example. Use your configured Codex home if it differs.
npx --yes github:thehan-co/jevriel adoption deep --instructions "$HOME/.codex/AGENTS.md"
# Claude Code example:
npx --yes github:thehan-co/jevriel adoption deep --instructions "$HOME/.claude/CLAUDE.md"
```

These commands append or replace one marked pointer, preserve unrelated text, and back up the prior file beside it. They store your mode under `~/.config/jevriel/adoption.json`. Provider setup and live verification are separate. Start a new host session to load changed instructions.

Other AI hosts can use the same policy in their documented persistent instruction surface. Supply its absolute file path. For hosted assistants without filesystem access, put the policy in their persistent instructions and connect an authorized JEV tool separately. A Markdown file cannot supply unavailable tools or credentials.

If your own knowledge system owns policy, pass `--policy /absolute/path/to/your/policy.md`. That file should route to the shipped adoption reference and keep local preferences local. The installer does not guess a host's instruction path or modify system prompts without explicit opt-in.

## Switch or inspect

```bash
npx --yes github:thehan-co/jevriel adoption light
npx --yes github:thehan-co/jevriel adoption
npx --yes github:thehan-co/jevriel doctor
```

Light stops automatic use by policy; it still permits explicit requests. The existing pointer loads the new preference. `jevriel_session_mode` with `disabled` is a separate inference stop for the current MCP process, including explicit tool calls. It resets on restart. Deep does not override that stop, user budgets, privacy boundaries or permissions.

## Verify the host

Test one synthetic semantic routing task, one deterministic date/arithmetic task that should make no JEV call, and a missing-credential fallback. Inspect receipts rather than trusting a claim that JEV ran. Qualification of one host does not certify another. The mechanism is prompt-guided behavior, not interception of every tool call, a daemon, or a scheduler. Missing policy/configuration falls back to Light.

Codex's [global instruction documentation](https://developers.openai.com/codex/guides/agents-md) explains its user-level AGENTS.md loading. Verify other hosts against their own documentation and permissions.
