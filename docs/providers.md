# Connect JEV through your provider

JEVRIEL separates the model from the API that serves it. You choose the connection. An existing setup is not silently migrated, and an exhausted free allowance never triggers an automatic paid route.

```bash
npx --yes github:thehan-co/jevriel setup
```

| Route | Required settings | Contract and qualification |
|---|---|---|
| Cloudflare | CLOUDFLARE_ACCOUNT_ID plus CLOUDFLARE_API_TOKEN or JEV_CLOUDFLARE_API_TOKEN | Workers AI wrapper; typesafe/jev alias. Adapter fixture-tested; live access must be verified in your account. |
| TypeSafe direct | TYPESAFE_API_KEY | Native state/questions contract |
| OpenRouter | OPENROUTER_API_KEY | Native alpha decisions endpoint; distinct from its LLM chat endpoint. Contract-tested and live-probed on OpenRouter; see [release evidence](release-0.2.0.md). |
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

Provider billing, free-tier consumption and TypeSafe published reference estimates are separate. The ledger retains TypeSafe's published input-rate estimate for comparison, as requested for the Flight Test. It does not present that estimate as your Cloudflare or gateway bill. Provider-reported USD usage costs are preserved when available; invoice reconciliation and remaining free allowance stay separate.

[Cloudflare's published pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) describes a daily free allocation and paid-plan rules. It does not prove a particular account's remaining quota or JEV eligibility. Confirm model availability and billing in your chosen provider before a large run.

Built-in Cloudflare/OpenRouter adapters follow the corresponding routes in the inspected community JEV connector. Contract tests alone are not live provider certification. A custom endpoint or adapter can accommodate another route without changing the skill or replacing TypeSafe's JEV with a different model.

## OpenRouter quick start

```bash
npx --yes github:thehan-co/jevriel setup --provider openrouter
npx --yes github:thehan-co/jevriel doctor
```

Enter an ordinary OpenRouter key in the hidden terminal prompt, or inject `OPENROUTER_API_KEY`. No TypeSafe account is required. The route is `POST https://openrouter.ai/api/alpha/decisions`, default model `typesafe/jev-1.13`. The [official schema](https://openrouter.ai/docs/api/api-reference/alphadecisions/submit-a-decisions-request) documents this separately from Chat Completions. SDK request wrappers are not part of the HTTP body.

## Unattended setup and secret managers

Setup accepts `--model`, `--endpoint`, `--account-id`, `--adapter-command` and `--key-command`. Commands are JSON argv arrays, never shell snippets. `--no-check` saves configuration without inference and reports it as unverified. Run setup without it for one small live check. `doctor` reads configuration only; a configured secret reference is not proof of unlocked access.

```bash
# Generic example; replace with your own secret manager command and reference.
npx --yes github:thehan-co/jevriel setup --provider openrouter \
  --key-command '["op","read","op://MyVault/MyOpenRouter/credential"]' --no-check

# A service implementing the native JEV contract:
npx --yes github:thehan-co/jevriel setup --provider compatible \
  --endpoint https://your-trusted-service.example/decisions \
  --model your-jev-model --no-check
# Provide JEVRIEL_API_KEY through your environment or the hidden prompt.

# A service with a different contract:
npx --yes github:thehan-co/jevriel setup --provider adapter \
  --adapter-command '["node","/absolute/path/to/your-adapter.mjs"]' \
  --model your-jev-model --no-check
```

The credential command runs lazily at inference time with a 15-second timeout and 64 KiB output bound. It must emit only the key. Provider-specific environment keys take precedence. The command is trusted local executable code; never place a secret in its arguments. `JEVRIEL_KEY_COMMAND` can supply the same JSON argv through the environment. No credential command or secret is printed by status.

A [custom adapter template](../examples/custom-adapter.mjs) demonstrates an alternate request/response envelope. Adapt it to the API's documented transport, authentication, model IDs and response fields. It is not a claim that arbitrary APIs natively support JEV. The normalized `usage.cost` field means USD only; leave it absent for tokens, credits or unknown currency.

## Cost receipts

The runtime retains finite, nonnegative `usage.cost` as provider-reported USD, including a genuine zero and a charge attached to an invalid answer. Missing or malformed costs remain unknown. The summary exposes both the known subtotal and missing-cost count; it reports a complete total only when every included receipt has cost evidence. Legacy receipts remain unknown. Request IDs and resolved model IDs help reconciliation. Provider reports are not invoices or proof of remaining free quota.
