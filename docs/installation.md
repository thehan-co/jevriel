# Installation and provider onboarding

Choose your host:

```bash
npx --yes github:thehan-co/jevriel install codex
npx --yes github:thehan-co/jevriel install claude
```

Requirements: Node.js 20+, npm, Git and the host CLI. Python 3.10+ is needed only for the public benchmark. This installs the npm executable from GitHub; it is not an npm-registry publication.

The Codex installer copies the plugin to `~/plugins/jevriel`, preserves personal marketplace entries and installs it. Claude adds the repository's marketplace and plugin. Start a new host session after installation.

## Choose where JEV runs

Onboarding asks for your API source: Cloudflare, TypeSafe direct, OpenRouter, a compatible HTTPS endpoint, a custom adapter, or your existing MCP. Credentials belong to that provider. There is no mandatory TypeSafe account and no automatic paid fallback. [Provider options and adapter contract](providers.md).

```bash
npx --yes github:thehan-co/jevriel setup
# Or select a route directly:
npx --yes github:thehan-co/jevriel setup --provider cloudflare
npx --yes github:thehan-co/jevriel doctor
```

Interactive setup requests credentials in a hidden terminal prompt, never in chat. Optional local credentials are stored as plaintext with owner-only permissions in `~/.config/jevriel/provider.json`. Use environment injection from your secret manager if preferred. `JEVRIEL_CONFIG_DIR` changes the directory. For older TypeSafe-only setups, the legacy credentials file remains readable when selecting TypeSafe.

Setup makes one small verification request under your selected provider's quota/billing. Unattended installs with incomplete configuration finish as setup-required. Selecting an existing MCP skips credential migration and verification calls; the skill uses that connector, while bundled inference remains disabled.

A compatible endpoint receives only its explicitly configured credential. HTTPS redirects are rejected. Custom adapters run trusted local commands without a shell. They are the extension point for APIs with different authentication or payload formats; arbitrary APIs are not assumed to share a contract.

## Pricing and runtime controls

Actual provider charges and free allowance are distinct from the TypeSafe published reference estimate. The plugin cannot infer that an account has remaining free quota. Choose auto/enabled/disabled with `jevriel_session_mode`; enabled never overrides user permissions or chooses another provider.

Metadata receipts go to `~/.local/state/jevriel/usage.jsonl`; configure `JEVRIEL_LEDGER_DIR` to change that home. No source text, answers or credentials are stored in the ledger. No automatic community upload exists.

The default benchmark uses your selected JEV provider, plus a separate hosted OpenRouter LLM key for the baseline. An existing chat subscription is not inferred to cover either API.

## Updates, existing connectors and qualification

Rerun the installer to update. Existing Jev/JEV MCP installations are retained. The skill can use them after inspecting their contracts; installing this plugin does not prove replacement parity.

Use the host's removal command to disable the plugin. Local configuration and receipts remain yours. Codex installation and offline tests are recorded in the release QA file. Cloudflare/OpenRouter contract fixtures and Claude manifest validation do not imply completed live provider tests or frontier-model certification.
