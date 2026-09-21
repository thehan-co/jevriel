const VALID_MODES = new Set(["auto", "enabled", "disabled"]);
const VALID_BILLING_CONTEXTS = new Set(["unknown", "plan", "api"]);

let state = {
  mode: "auto",
  billing_context: "unknown",
  reason: "Default automatic policy.",
};

function validString(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function getSessionMode() {
  return { ...state, scope: "current MCP server process; resets when the process restarts" };
}

export function setSessionMode({ mode = "auto", billing_context = "unknown", reason = "" } = {}) {
  if (!VALID_MODES.has(mode)) {
    throw new Error("mode must be auto, enabled, or disabled.");
  }
  if (!VALID_BILLING_CONTEXTS.has(billing_context)) {
    throw new Error("billing_context must be unknown, plan, or api.");
  }
  state = {
    mode,
    billing_context,
    reason: validString(reason, mode === "auto" ? "Automatic policy." : `Explicitly ${mode}.`),
  };
  return getSessionMode();
}

export function isJevEnabled() {
  return state.mode !== "disabled";
}
