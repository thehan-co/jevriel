# Flight Test adapter contract

A configured command receives one UTF-8 JSON object on stdin:
`{"id":"...","text":"...","criteria":{"label":"definition"},"instructions":"..."}`.

Return exactly one JSON object on stdout:
`{"label":"task","probabilities":{"task":0.9,"reference":0.04,"meeting":0.03,"manual_review":0.03},"model":"returned-id","provider":"route","usage":{"input_tokens":123,"output_tokens":8},"cost_usd":null,"cost_basis":"unknown"}`.

Probabilities, usage and monetary cost may be null when unavailable. `cost_basis` is `billed`, `estimated` or `unknown`. Add `confidence` only with its native meaning. Do not manufacture probabilities from a generated confidence sentence. Log diagnostics to stderr without credentials. Exit nonzero on service failure. No retries are enabled by the bundled runner; add bounded retries inside an adapter only if their entire time and cost are retained.

The parent measures wall time including adapter startup and records failures. Commands are argv arrays, executed without a shell. Credentials stay in the environment or the user's secret-backed launcher. The supplied MCP adapter needs `@modelcontextprotocol/sdk` and a configured server command; it supports the community `jev_classify` tool, not arbitrary MCP servers.
