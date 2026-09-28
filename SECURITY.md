# Security and data handling

Never place credentials or private source material in public issues. Use GitHub private vulnerability reporting on this repository when enabled. Otherwise contact the maintainer through the GitHub profile without including the sensitive payload in public.

The runtime sends the state and questions you supply to your explicitly selected API provider or trusted local adapter. It records only metadata locally. Model output is untrusted advisory evidence; application permissions and deterministic validation remain outside the model. Custom adapters run as local programs with your environment; review their code before configuring them. No provider fallback occurs automatically. The optional credential file is plaintext protected by owner-only permissions; use environment injection from a secret manager when that better fits your environment.

No automatic telemetry or community upload is performed. Benchmark output can contain source inputs, predictions and configuration. Review and sanitize it before sharing. Do not put secrets inside benchmark configuration; use environment variables.

Credential commands are trusted local executables, passed argv without a shell, bounded to 15 seconds and 64 KiB output. Only explicit inference resolves them. Their stdout must contain only the credential. Use secret references in arguments, never key values. Provider environment keys override the saved command.

Deep adoption is explicit opt-in and appends a marked pointer only to the instruction file the user supplies. It is a prompt policy, not a permission system. Light remains the default. Changes to host instructions require a new session in hosts that load them only at startup. Private configuration, instruction paths and credential references belong outside the public checkout. CLI output and manually saved judgments can contain user data even though the automatic ledger does not.
