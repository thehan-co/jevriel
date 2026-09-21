# Security and data handling

Never place credentials or private source material in public issues. Use GitHub private vulnerability reporting on this repository when enabled. Otherwise contact the maintainer through the GitHub profile without including the sensitive payload in public.

The runtime sends the state and questions you supply to TypeSafe. It records only metadata locally. Model output is untrusted advisory evidence; application permissions and deterministic validation remain outside the model. The optional credential file is plaintext protected by owner-only permissions; use environment injection from a secret manager when that better fits your environment.

No automatic telemetry or community upload is performed. Benchmark output can contain source inputs, predictions and configuration. Review and sanitize it before sharing. Do not put secrets inside benchmark configuration; use environment variables.
