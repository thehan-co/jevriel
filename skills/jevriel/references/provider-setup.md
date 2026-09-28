# Choose the API independently of the AI host

The user chooses where JEV runs. Keep that choice across sessions; never infer a provider from whichever key happens to exist. OpenRouter, TypeSafe direct and Cloudflare have built-in routes. A native-compatible HTTPS service needs its endpoint, model and key. A different API needs a trusted local adapter that maps both requests and responses. Existing MCP mode uses that connector directly and disables bundled inference.

Run `jevriel doctor` without making a model call. `configured` means settings are present, not that a secret is unlocked or a live call succeeded. `setup` performs one small connection check unless `--no-check` is supplied. Run only the verification appropriate to the user's request.

Keys belong in environment variables, a local hidden prompt, or a configured `--key-command` JSON argv. The command is trusted local code, executed without a shell only at inference time. Its stdout must contain only the key; never put keys in its arguments. Status output omits the command and credential.

For a host that cannot load plugins, run `npx --yes github:thehan-co/jevriel install portable`. The user-level skill is at `~/.agents/skills/jevriel`; the standalone runtime is at `~/.local/share/jevriel`. A file-capable AI reads the skill; a terminal-capable AI can run `node ~/.local/share/jevriel/bin/jevriel.mjs judge --input packet.json`. The packet contains `state` and `questions`. Returned Choice/Score fields use `value`, and Noul uses `probability`. Other skill hosts may need this folder copied into their documented skill directory.

For an MCP host, register `node` with the absolute `server/index.mjs` path. Read the repository's `docs/installation.md` and `docs/providers.md` before changing host configuration. Capability-based portability does not certify every AI product.

Provider-reported `usage.cost` is retained as USD when finite and nonnegative. Missing costs remain unknown, including old ledger entries. Reference-price estimates, account invoices and remaining quota are different evidence. A failed answer can still have a reported charge.
