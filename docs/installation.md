# Installation and onboarding

Run one command for your host:

```bash
npx --yes github:thehan-co/jevriel install codex
npx --yes github:thehan-co/jevriel install claude
```

Use only the line for your host. Requirements: Node.js 20+, npm, Git and the host CLI available on PATH. Python 3.10+ is needed only for the public benchmark. The GitHub package supplies an npm executable; it is not yet published in the npm registry. For a fixed revision, append `#COMMIT_SHA` to the GitHub package spec.

## What the installer does

For Codex it copies the public plugin into `~/.agents/plugins/plugins/jevriel`, preserves existing personal marketplace entries, saves a backup and calls `codex plugin add`. For Claude Code it adds the GitHub marketplace and installs `jevriel@jevriel`. It then performs TypeSafe onboarding. Start a new host session after installation.

Onboarding checks `TYPESAFE_API_KEY` first, then `~/.config/jevriel/credentials.json`. If neither is available and the terminal is interactive, it requests the key without echoing it. The optional local credential file is plaintext protected by owner-only file permissions, not an encrypted keychain. For managed environments, inject the environment variable from your normal secret manager and avoid the file entirely. Never put a key in a command argument, chat, repository or issue.

The connection check makes one small paid request using TypeSafe's published input pricing. A successful response must pass validation. A failed check is a setup failure, not a benchmark result. The plugin stays installed so you can correct the connection.

Unattended installation finishes with a visible setup-required message when no key is available. Complete it later:

```bash
npx --yes github:thehan-co/jevriel setup
npx --yes github:thehan-co/jevriel doctor
```

To replace a saved key, remove only the credential file above or set a new `TYPESAFE_API_KEY`, then rerun setup. `JEVRIEL_CONFIG_DIR` changes the credential directory. No key is sent anywhere except the TypeSafe API by this runtime.

## Daily control and measurement

Ask for `jevriel_status`, then choose automatic, enabled or disabled with `jevriel_session_mode`. Automatic means the agent follows the skill's decision policy. The server does not autonomously watch your work. Enabled still respects your permissions.

The runtime stores metadata receipts in `~/.local/state/jevriel/usage.jsonl`, including failed attempts. `JEVRIEL_LEDGER_DIR` changes that directory. Prompts, source documents, returned selections and credentials are not persisted there. Export only sanitized evidence you choose to share; there is no automatic community upload.

The default model is `jev-1.13.0`; `JEVRIEL_MODEL` overrides it. Discover a valid model before changing it, and record the resolved model in every comparison. Credentials for the hosted OpenRouter benchmark are separate from TypeSafe onboarding.

## Updates and removal

Rerun the installation command to update. Inspect the commit before upgrading a production deployment. Codex uses a fresh manifest cache suffix so a new thread picks up the changed tools. Use your host's plugin remove/uninstall command to disable it. Local credentials and receipts remain yours; remove them separately if desired.

## Host qualification

Codex local installation is verified separately in the release QA record. Claude packaging is prepared and schema-checked; live Claude execution is not implied unless the QA record says it ran. A host installation is not a frontier-model quality certification.

## Existing Jev MCP installations

Installing JEVRIEL does not remove or replace another Jev MCP. The skill can use an existing connector after inspecting its contract. This bundled runtime calls TypeSafe directly, so an AI Gateway credential from another connector cannot substitute for a TypeSafe key. Keep current workflows on their existing connection until coverage, behavior and credentials have been checked. Avoid asking an agent to call both connectors for the same decision unless you are deliberately comparing them.
