# Connect JEV through your provider

JEVRIEL separates the model from the API that serves it. You choose the connection. An existing setup is not silently migrated, and an exhausted free allowance never triggers an automatic paid route.

```bash
npx --yes github:thehan-co/jevriel setup
```

| Route | Required settings | Contract and qualification |
|---|---|---|
| Cloudflare | CLOUDFLARE_ACCOUNT_ID plus CLOUDFLARE_API_TOKEN or JEV_CLOUDFLARE_API_TOKEN | Workers AI wrapper; typesafe/jev alias. Adapter fixture-tested; live access must be verified in your account. |
| TypeSafe direct | TYPESAFE_API_KEY | Native state/questions contract |
| OpenRouter | OPENROUTER_API_KEY | Native alpha decisions endpoint; distinct from its LLM chat endpoint. Fixture-tested, live qualification pending. |
| Compatible endpoint | JEVRIEL_ENDPOINT, JEVRIEL_API_KEY, JEVRIEL_MODEL | Explicit trusted HTTPS endpoint accepting native state/questions and returning answers |
| Custom adapter | JEVRIEL_ADAPTER_COMMAND as JSON argv; optional JEVRIEL_MODEL | Any API source, through a trusted local request/response adapter |
| Existing MCP | Select existing; keep that connector installed | Skill uses the connector's available tools. Bundled inference is disabled; this is not transparent MCP proxying. |

Select a route explicitly with `JEVRIEL_PROVIDER` or `setup --provider cloudflare` (replace the provider as needed). The config file at `~/.config/jevriel/provider.json` stores the selected route and optional local credentials with owner-only permissions. Environment variables override stored values for that route. No implicit provider priority chooses where your data goes.

## Custom adapter contract

Use an adapter when a provider has different authentication, request formats, response envelopes or transport. JEVRIEL does not pretend every API speaks the same format.

The trusted command receives one JSON packet on stdin:

```json
{"model":"provider-model-id","state":{"text":"example"},"questions":{"route":{"type":"choice","instructions":"Classify","criteria":{"yes":"Fits","no":"Does not fit"}}}}
```

It returns one normalized JSON object on stdout:

```json
{"model":"resolved-provider-id","answers":{"route":{"type":"choice","choice":"yes","confidence":0.8,"probabilities":{"yes":0.9,"no":0.1}}},"usage":{"input_tokens":20,"output_tokens":2}}
```

Usage and model resolution may be absent; they remain unknown. Do not invent native confidence or probabilities. If the source cannot supply the required contract, fail rather than manufacturing fields. Supply credentials through your secret manager/environment, never command arguments. The runtime executes the argv without a shell, with a 30-second timeout and 1 MiB output limit. No runtime retry is enabled. Adapter-internal retries must be disclosed in benchmark receipts; the outer ledger's attempt count measures adapter invocations.

## Pricing and free allowances

Provider billing, free-tier consumption and TypeSafe published reference estimates are separate. The ledger retains TypeSafe's published input-rate estimate for comparison, as requested for the Flight Test. It does not present that estimate as your Cloudflare or gateway bill. Actual charges and remaining free allowance stay unknown until provider billing evidence establishes them.

[Cloudflare's published pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) describes a daily free allocation and paid-plan rules. It does not prove a particular account's remaining quota or JEV eligibility. Confirm model availability and billing in your chosen provider before a large run.

Built-in Cloudflare/OpenRouter adapters follow the corresponding routes in the inspected community JEV connector. Their contract tests are not live provider certification. A custom endpoint or adapter can accommodate another route without changing the skill or replacing TypeSafe's JEV with a different model.
