const API_URL = "https://api.typesafe.ai/v1/systemone";
const DEFAULT_MODEL = "jev-latest";
const MAX_PAYLOAD_BYTES = 256 * 1024;
const RETRYABLE_STATUS_CODES = new Set([429, 529]);

export class JudgeInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "JudgeInputError";
  }
}

export class TypeSafeApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "TypeSafeApiError";
    this.status = status;
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function assertPlainObject(value, name) {
  if (!isPlainObject(value)) {
    throw new JudgeInputError(`${name} must be a JSON object.`);
  }
}

function assertNonEmptyString(value, name) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new JudgeInputError(`${name} must be a non-empty string.`);
  }
}

function assertProbability(value, name, fallback) {
  const result = value ?? fallback;
  if (typeof result !== "number" || !Number.isFinite(result) || result < 0 || result > 1) {
    throw new JudgeInputError(`${name} must be a number between 0 and 1.`);
  }
  return result;
}

function assertJson(value, name) {
  if (value === undefined) {
    throw new JudgeInputError(`${name} is required.`);
  }
  try {
    JSON.stringify(value);
  } catch {
    throw new JudgeInputError(`${name} must be JSON-serializable.`);
  }
}

function safeJson(value) {
  return JSON.stringify(value);
}

function assertPayloadSize(payload) {
  const bytes = Buffer.byteLength(safeJson(payload));
  if (bytes > MAX_PAYLOAD_BYTES) {
    throw new JudgeInputError(
      `The TypeSafe request is ${bytes} bytes, above the ${MAX_PAYLOAD_BYTES}-byte safety limit. Narrow the state or candidate set.`,
    );
  }
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function apiErrorMessage(status, body) {
  if (body && typeof body === "object") {
    const detail = body.message ?? body.error?.message ?? body.error ?? body.detail;
    if (typeof detail === "string" && detail.length < 500) {
      return `TypeSafe returned HTTP ${status}: ${detail}`;
    }
  }
  return `TypeSafe returned HTTP ${status}.`;
}

export async function evaluateSystemOne(
  { state, questions, model = DEFAULT_MODEL },
  { apiKey = process.env.TYPESAFE_API_KEY, fetchImpl = fetch, maxAttempts = 3 } = {},
) {
  const startedAt = performance.now();
  assertJson(state, "state");
  assertPlainObject(questions, "questions");
  if (Object.keys(questions).length === 0) {
    throw new JudgeInputError("questions must contain at least one question.");
  }
  assertNonEmptyString(model, "model");
  if (typeof apiKey !== "string" || apiKey.trim() === "") {
    throw new JudgeInputError("TYPESAFE_API_KEY is not configured. Set it in the environment that launches Codex or Claude.");
  }

  const payload = { state, model, questions };
  assertPayloadSize(payload);

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response;
    try {
      response = await fetchImpl(API_URL, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: safeJson(payload),
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new TypeSafeApiError(`TypeSafe could not be reached: ${error.message}`);
      }
      await sleep(250 * 2 ** (attempt - 1));
      continue;
    }

    let body;
    try {
      body = await response.json();
    } catch {
      body = undefined;
    }

    if (response.ok) {
      if (!isPlainObject(body) || !isPlainObject(body.answers)) {
        throw new TypeSafeApiError("TypeSafe returned a response without an answers object.", response.status);
      }
      return { ...body, elapsed_ms: Number((performance.now() - startedAt).toFixed(2)) };
    }

    if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < maxAttempts) {
      await sleep(250 * 2 ** (attempt - 1));
      continue;
    }
    throw new TypeSafeApiError(apiErrorMessage(response.status, body), response.status);
  }

  throw new TypeSafeApiError("TypeSafe did not return a result.");
}

function answerSummary(answer) {
  if (!isPlainObject(answer)) {
    throw new TypeSafeApiError("TypeSafe returned a malformed answer.");
  }
  if (answer.type === "choice") {
    return {
      type: "choice",
      value: answer.choice,
      confidence: answer.confidence,
      probabilities: answer.probabilities,
    };
  }
  if (answer.type === "score") {
    return {
      type: "score",
      value: answer.score,
      confidence: answer.confidence,
      probabilities: answer.probabilities,
      legend: answer.legend,
    };
  }
  if (answer.type === "noul") {
    return {
      type: "noul",
      probability: answer.noul,
    };
  }
  throw new TypeSafeApiError(`TypeSafe returned an unsupported answer type: ${answer.type}.`);
}

function metadata(response) {
  return {
    model: response.model,
    usage: response.usage,
    elapsed_ms: response.elapsed_ms,
  };
}

function requireArray(value, name, { min = 1, max = Infinity } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max) {
    throw new JudgeInputError(`${name} must contain between ${min} and ${max} items.`);
  }
}

function uniqueIds(items, name) {
  const ids = new Set();
  for (const item of items) {
    assertPlainObject(item, `${name} item`);
    assertNonEmptyString(item.id, `${name} item id`);
    if (ids.has(item.id)) {
      throw new JudgeInputError(`${name} ids must be unique.`);
    }
    ids.add(item.id);
  }
}

export async function route(input, dependencies) {
  assertPlainObject(input, "input");
  assertJson(input.state, "state");
  assertNonEmptyString(input.instructions, "instructions");
  assertPlainObject(input.routes, "routes");
  const threshold = assertProbability(input.confidence_threshold, "confidence_threshold", 0.8);
  const routes = { ...input.routes };
  const reviewRoute = input.review_route ?? "needs_review";
  assertNonEmptyString(reviewRoute, "review_route");
  if (Object.prototype.hasOwnProperty.call(routes, reviewRoute)) {
    throw new JudgeInputError(`routes must not define the reserved review route '${reviewRoute}'.`);
  }
  if (Object.keys(routes).length < 2 || Object.keys(routes).length > 254) {
    throw new JudgeInputError("routes must contain between 2 and 254 routes.");
  }
  routes[reviewRoute] = "No listed route is a good match, the evidence is insufficient, or a human should review it.";

  const response = await evaluateSystemOne(
    {
      state: input.state,
      questions: {
        route: {
          type: "choice",
          instructions: input.instructions,
          criteria: routes,
        },
      },
    },
    dependencies,
  );
  const result = answerSummary(response.answers.route);
  const action = result.value === reviewRoute || result.confidence < threshold ? "review" : "proceed";
  return {
    ...metadata(response),
    route: result.value,
    confidence: result.confidence,
    probabilities: result.probabilities,
    confidence_threshold: threshold,
    recommended_action: action,
    review_reason:
      action === "review"
        ? result.value === reviewRoute
          ? "No listed route was selected confidently."
          : `Route confidence is below the ${threshold} threshold.`
        : undefined,
  };
}

export async function rank(input, dependencies) {
  assertPlainObject(input, "input");
  assertNonEmptyString(input.instructions, "instructions");
  requireArray(input.candidates, "candidates", { min: 2, max: 50 });
  uniqueIds(input.candidates, "candidate");
  requireArray(input.criteria, "criteria", { min: 2, max: 10 });
  const threshold = assertProbability(input.confidence_threshold, "confidence_threshold", 0.7);

  const state = {
    context: input.context ?? null,
    candidates: Object.fromEntries(input.candidates.map((candidate) => [candidate.id, candidate.value])),
  };
  const questions = Object.fromEntries(
    input.candidates.map((candidate) => [
      candidate.id,
      {
        type: "score",
        instructions: {
          task: input.instructions,
          candidate_id: candidate.id,
          candidate: candidate.value,
          context: input.context ?? null,
        },
        criteria: input.criteria,
      },
    ]),
  );
  const response = await evaluateSystemOne({ state, questions }, dependencies);
  const ranked = input.candidates
    .map((candidate) => {
      const result = answerSummary(response.answers[candidate.id]);
      return {
        id: candidate.id,
        value: candidate.value,
        score: result.value,
        confidence: result.confidence,
        probabilities: result.probabilities,
        legend: result.legend,
      };
    })
    .sort((left, right) => right.score - left.score || right.confidence - left.confidence);
  const top = ranked[0];
  return {
    ...metadata(response),
    ranked,
    confidence_threshold: threshold,
    recommended_action: top.confidence >= threshold ? "proceed" : "review",
    review_reason: top.confidence >= threshold ? undefined : `The highest-ranked candidate is below the ${threshold} confidence threshold.`,
  };
}

export async function extract(input, dependencies) {
  assertPlainObject(input, "input");
  assertJson(input.source, "source");
  requireArray(input.fields, "fields", { min: 1, max: 20 });
  uniqueIds(input.fields, "field");
  const threshold = assertProbability(input.confidence_threshold, "confidence_threshold", 0.8);
  const reviewFields = [];
  const fieldCandidates = new Map();
  const questions = {};

  for (const field of input.fields) {
    assertNonEmptyString(field.instructions, `field '${field.id}' instructions`);
    requireArray(field.candidates, `field '${field.id}' candidates`, { min: 1, max: 100 });
    uniqueIds(field.candidates, `field '${field.id}' candidate`);
    const noMatchId = "no_match";
    if (field.candidates.some((candidate) => candidate.id === noMatchId)) {
      throw new JudgeInputError(`field '${field.id}' candidate ids must not use '${noMatchId}'.`);
    }
    const criteria = Object.fromEntries(
      field.candidates.map((candidate) => [candidate.id, candidate.description ?? null]),
    );
    criteria[noMatchId] = "The source does not support any supplied candidate value.";
    fieldCandidates.set(field.id, new Map(field.candidates.map((candidate) => [candidate.id, candidate])));
    questions[field.id] = {
      type: "choice",
      instructions: {
        task: field.instructions,
        source: input.source,
        candidates: Object.fromEntries(field.candidates.map((candidate) => [candidate.id, candidate.value])),
      },
      criteria,
    };
  }

  const response = await evaluateSystemOne({ state: { source: input.source }, questions }, dependencies);
  const fields = input.fields.map((field) => {
    const result = answerSummary(response.answers[field.id]);
    const selected = result.value === "no_match" ? null : fieldCandidates.get(field.id).get(result.value);
    const recommendedAction = selected === null || result.confidence < threshold ? "review" : "proceed";
    if (recommendedAction === "review") {
      reviewFields.push(field.id);
    }
    return {
      id: field.id,
      selected_candidate_id: selected?.id ?? null,
      selected_value: selected?.value ?? null,
      confidence: result.confidence,
      probabilities: result.probabilities,
      recommended_action: recommendedAction,
    };
  });
  return {
    ...metadata(response),
    fields,
    confidence_threshold: threshold,
    recommended_action: reviewFields.length === 0 ? "proceed" : "review",
    review_fields: reviewFields,
  };
}

export async function verify(input, dependencies) {
  assertPlainObject(input, "input");
  assertNonEmptyString(input.claim, "claim");
  assertJson(input.evidence, "evidence");
  const threshold = assertProbability(input.support_threshold, "support_threshold", 0.85);
  const response = await evaluateSystemOne(
    {
      state: {
        claim: input.claim,
        evidence: input.evidence,
        context: input.context ?? null,
      },
      questions: {
        supported: {
          type: "noul",
          instructions: "Does the supplied evidence directly support the claim? Treat missing, contradictory, or merely related evidence as not supporting the claim.",
          criteria: {
            true: "The evidence directly supports the entire claim.",
            false: "The evidence does not support, contradicts, or only partially supports the claim.",
          },
        },
      },
    },
    dependencies,
  );
  const result = answerSummary(response.answers.supported);
  const recommendedAction = result.probability >= threshold ? "proceed" : "review";
  return {
    ...metadata(response),
    support_probability: result.probability,
    support_threshold: threshold,
    recommended_action: recommendedAction,
    review_reason: recommendedAction === "review" ? `Evidence support is below the ${threshold} threshold.` : undefined,
  };
}

export async function judge(input, dependencies) {
  assertPlainObject(input, "input");
  assertJson(input.state, "state");
  assertPlainObject(input.questions, "questions");
  const questionIds = Object.keys(input.questions);
  if (questionIds.length === 0 || questionIds.length > 25) {
    throw new JudgeInputError("questions must contain between 1 and 25 independent questions.");
  }
  for (const [id, question] of Object.entries(input.questions)) {
    assertNonEmptyString(id, "question id");
    assertPlainObject(question, `question '${id}'`);
    if (!["choice", "score", "noul"].includes(question.type)) {
      throw new JudgeInputError(`question '${id}' must have type choice, score, or noul.`);
    }
    assertJson(question.instructions, `question '${id}' instructions`);
  }
  const response = await evaluateSystemOne({ state: input.state, questions: input.questions }, dependencies);
  return {
    ...metadata(response),
    answers: Object.fromEntries(Object.entries(response.answers).map(([id, answer]) => [id, answerSummary(answer)])),
    note: "Interpret each raw judgment with an explicit, task-specific policy. Typed answers are evidence signals, not authorization to act.",
  };
}

export function escalationGate(input) {
  assertPlainObject(input, "input");
  requireArray(input.signals, "signals", { min: 1, max: 100 });
  const fired = [];
  for (const signal of input.signals) {
    assertPlainObject(signal, "signal");
    assertNonEmptyString(signal.id, "signal id");
    const value = assertProbability(signal.value, `signal '${signal.id}' value`);
    const threshold = assertProbability(signal.threshold, `signal '${signal.id}' threshold`);
    const comparator = signal.comparator ?? ">=";
    if (![">=", "<="].includes(comparator)) {
      throw new JudgeInputError(`signal '${signal.id}' comparator must be >= or <=.`);
    }
    const fires = comparator === ">=" ? value >= threshold : value <= threshold;
    if (fires) {
      fired.push({ id: signal.id, value, threshold, comparator, reason: signal.reason ?? null });
    }
  }
  return {
    recommended_action: fired.length > 0 ? "review" : "proceed",
    fired_signals: fired,
    gate: "max",
    note: "This deterministic gate recommends review only. The caller must decide the review path and any subsequent action.",
  };
}

export function formatError(error) {
  if (error instanceof JudgeInputError || error instanceof TypeSafeApiError) {
    return error.message;
  }
  return "The TypeSafe judge failed unexpectedly. Check the server logs without exposing secrets.";
}
