// Tool schemas extracted from upstream index.mjs; see NOTICE.
export const TOOL_DEFINITIONS = [
  {
    name: "typesafe_route",
    description: "Choose one route from a closed set using TypeSafe Jev. Returns a route plus a confidence-aware proceed/review recommendation; it never performs the route.",
    inputSchema: { type: "object", additionalProperties: false, required: ["state", "instructions", "routes"], properties: {
      state: { description: "Minimum relevant JSON state.", anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }] },
      instructions: { type: "string", description: "One narrow routing question." },
      routes: { type: "object", description: "Route id to rubric description. The tool adds needs_review." },
      review_route: { type: "string", description: "Optional reserved no-match route id; defaults to needs_review." },
      comparison_model: { type: "string", description: "Optional model this call intentionally substitutes. Recorded only for a theoretical usage summary; no baseline is run." },
      confidence_threshold: { type: "number", minimum: 0, maximum: 1, default: 0.8 }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: "typesafe_rank",
    description: "Score and rank up to 50 retrieved candidates against a concrete rubric. Returns scores, confidence, and a review recommendation; it never selects or changes a record.",
    inputSchema: { type: "object", additionalProperties: false, required: ["instructions", "candidates", "criteria"], properties: {
      instructions: { type: "string", description: "What makes a candidate good for this task." },
      context: { description: "Optional minimum relevant JSON context.", anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }, { type: "null" }] },
      candidates: { type: "array", minItems: 2, maxItems: 50, items: { type: "object", required: ["id", "value"], properties: { id: { type: "string" }, value: {} } } },
      criteria: { type: "array", minItems: 2, maxItems: 10, items: {} },
      comparison_model: { type: "string", description: "Optional model this call intentionally substitutes. Recorded only for a theoretical usage summary; no baseline is run." },
      confidence_threshold: { type: "number", minimum: 0, maximum: 1, default: 0.7 }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: "typesafe_extract",
    description: "Select supported values from candidates code already found in a source. It cannot generate values. Returns selected values, confidence, and review fields.",
    inputSchema: { type: "object", additionalProperties: false, required: ["source", "fields"], properties: {
      source: { description: "Source text or structured source to evaluate.", anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }] },
      fields: { type: "array", minItems: 1, maxItems: 20, items: { type: "object", required: ["id", "instructions", "candidates"], properties: { id: { type: "string" }, instructions: { type: "string" }, candidates: { type: "array", minItems: 1, maxItems: 100, items: { type: "object", required: ["id", "value"], properties: { id: { type: "string" }, value: {}, description: {} } } } } } },
      comparison_model: { type: "string", description: "Optional model this call intentionally substitutes. Recorded only for a theoretical usage summary; no baseline is run." },
      confidence_threshold: { type: "number", minimum: 0, maximum: 1, default: 0.8 }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: "typesafe_verify",
    description: "Judge whether supplied evidence directly supports a claim. Returns a support probability and an explicit proceed/review recommendation; it never treats a claim as proven on its own.",
    inputSchema: { type: "object", additionalProperties: false, required: ["claim", "evidence"], properties: {
      claim: { type: "string" },
      evidence: { description: "The source passage(s) or structured evidence.", anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }] },
      context: { description: "Optional relevant JSON context.", anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }, { type: "null" }] },
      comparison_model: { type: "string", description: "Optional model this call intentionally substitutes. Recorded only for a theoretical usage summary; no baseline is run." },
      support_threshold: { type: "number", minimum: 0, maximum: 1, default: 0.85 }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: "typesafe_judge",
    description: "Run up to 25 independent, narrow TypeSafe Choice, Score, or Noul questions against shared state. Returns raw typed signals for the caller's explicit policy.",
    inputSchema: { type: "object", additionalProperties: false, required: ["state", "questions"], properties: {
      state: { description: "Minimum relevant JSON state.", anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }] },
      questions: { type: "object", description: "Question id to a TypeSafe Choice, Score, or Noul question." },
      comparison_model: { type: "string", description: "Optional model this call intentionally substitutes. Recorded only for a theoretical usage summary; no baseline is run." }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: "typesafe_usage_summary",
    description: "Summarize Jev calls made by the current MCP server process: tool count, token usage, elapsed time, and declared substitute-model intent. It never runs a baseline and labels savings as theoretical.",
    inputSchema: { type: "object", additionalProperties: false, properties: {
      comparison_model: { type: "string", description: "Optional declared substitute model to filter the current-process summary." }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: "typesafe_session_mode",
    description: "Set or inspect the current MCP process Jev policy. Use enabled to force Jev, disabled to block Jev calls, or auto for the skill's policy. This does not change Codex or Claude global configuration.",
    inputSchema: { type: "object", additionalProperties: false, properties: {
      mode: { type: "string", enum: ["auto", "enabled", "disabled"], description: "Session Jev policy. Omit to inspect the current mode." },
      billing_context: { type: "string", enum: ["unknown", "plan", "api"], description: "Optional context supplied by the user or host; never inferred from credentials." },
      reason: { type: "string", description: "Why this session policy was selected." }
    } },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: "typesafe_escalation_gate",
    description: "Apply a deterministic max-style review gate to explicit probabilities or confidences. No model call, writes, or external action occurs.",
    inputSchema: { type: "object", additionalProperties: false, required: ["signals"], properties: {
      signals: { type: "array", minItems: 1, maxItems: 100, items: { type: "object", required: ["id", "value", "threshold"], properties: { id: { type: "string" }, value: { type: "number", minimum: 0, maximum: 1 }, threshold: { type: "number", minimum: 0, maximum: 1 }, comparator: { type: "string", enum: [">=", "<="] }, reason: { type: "string" } } } }
    } },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }
];

