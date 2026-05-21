"use client";

/**
 * Debug-session logging (NDJSON ingest). Folded regions in callers; no secrets in payloads.
 * Remove this module after the debug session is verified complete.
 */

const DEBUG_INGEST =
  "http://127.0.0.1:7329/ingest/e1258c68-1928-491a-8efc-05886b180647";
const DEBUG_SESSION_ID = "fbb05b";

export type AgentDebugPayload = {
  location: string;
  message: string;
  data?: Record<string, unknown>;
  hypothesisId: string;
  runId?: string;
};

/** POST one NDJSON event to the local debug ingest (browser → debug server). */
export function agentDebugLog(payload: AgentDebugPayload): void {
  if (typeof window === "undefined") return;
  // #region agent log
  fetch(DEBUG_INGEST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
  // #endregion
}

/** Extract GraphQL login variable from a POST body without logging the full query. */
export function parseLoginFromGraphQLBody(
  body: BodyInit | null | undefined
): string | undefined {
  if (!body || typeof body !== "string") return undefined;
  try {
    const parsed = JSON.parse(body) as { variables?: { login?: string } };
    return parsed.variables?.login;
  } catch {
    return undefined;
  }
}
