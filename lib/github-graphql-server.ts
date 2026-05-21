/**
 * Server-only GitHub GraphQL client used by `/api/github/graphql`.
 * Retries transient 502/503/504 from GitHub; token never sent to the browser.
 */

import type { GitHubGraphQLRequestBody } from "@/types/github-api";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const RETRYABLE_STATUS = new Set([502, 503, 504]);
const MAX_ATTEMPTS = 3;
const UPSTREAM_TIMEOUT_MS = 25_000;

/** Prefer server-only token; fall back for local setups still using NEXT_PUBLIC_*. */
export function getGitHubServerToken(): string | undefined {
  return process.env.GITHUB_TOKEN ?? process.env.NEXT_PUBLIC_GITHUB_TOKEN;
}

/** Reads login from GraphQL variables for logging/Sentry (no query text stored). */
export function parseGraphQLLogin(body: string): string | undefined {
  try {
    const parsed = JSON.parse(body) as GitHubGraphQLRequestBody;
    const login = parsed.variables?.login;
    return typeof login === "string" ? login : undefined;
  } catch {
    return undefined;
  }
}

/** Only allow the app's GET_USER-shaped query through the proxy. */
export function isAllowedGraphQLBody(body: GitHubGraphQLRequestBody): boolean {
  return (
    typeof body.query === "string" &&
    body.query.includes("user(login:") &&
    typeof body.variables?.login === "string" &&
    body.variables.login.trim().length > 0
  );
}

function backoffMs(attemptIndex: number): number {
  return 400 * 2 ** attemptIndex;
}

function pickForwardHeaders(res: Response): Record<string, string> {
  const keys = [
    "x-ratelimit-limit",
    "x-ratelimit-remaining",
    "x-ratelimit-reset",
    "x-ratelimit-used",
    "x-github-request-id",
  ] as const;
  const out: Record<string, string> = {};
  for (const key of keys) {
    const value = res.headers.get(key);
    if (value) out[key] = value;
  }
  return out;
}

/**
 * POST to GitHub GraphQL with retries on gateway errors.
 * Heavy users (many repos) can exceed ~10s and trigger 502 without retries.
 */
export async function fetchGitHubGraphQLUpstream(
  body: string
): Promise<import("@/types/github-api").GitHubGraphQLUpstreamResult> {
  const token = getGitHubServerToken();
  const login = parseGraphQLLogin(body);
  let lastStatus = 502;
  let lastText = "";
  let lastHeaders: Record<string, string> = {};

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoffMs(attempt - 1)));
    }

    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    lastStatus = response.status;
    lastText = await response.text();
    lastHeaders = pickForwardHeaders(response);

    if (response.ok || !RETRYABLE_STATUS.has(response.status)) {
      return {
        status: lastStatus,
        text: lastText,
        headers: lastHeaders,
        attempts: attempt + 1,
        login,
      };
    }
  }

  return {
    status: lastStatus,
    text: lastText,
    headers: lastHeaders,
    attempts: MAX_ATTEMPTS,
    login,
  };
}
