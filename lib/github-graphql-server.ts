/**
 * Server-only GitHub GraphQL client used by `/api/github/graphql`.
 * Retries transient 502/503/504; falls back to smaller `repositories(first:)` pages.
 */

import type { GitHubGraphQLUpstreamResult } from "@/types/github-api";
import type { GitHubGraphQLRequestBody } from "@/types/github-api";
import {
  isSuccessfulUserGraphQLResponse,
  REPO_PAGE_FALLBACK_SIZES,
  withRepoPageSize,
  type RepoPageSize,
} from "@/lib/github-query-fallback";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const RETRYABLE_STATUS = new Set([502, 503, 504]);
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

type UpstreamResultWithMeta = GitHubGraphQLUpstreamResult & {
  repoPageSize?: RepoPageSize;
};

/**
 * Single page-size attempt: retries only on gateway HTTP codes.
 */
async function fetchGitHubGraphQLAttempt(
  body: string,
  maxAttempts: number
): Promise<GitHubGraphQLUpstreamResult> {
  const token = getGitHubServerToken();
  const login = parseGraphQLLogin(body);
  let lastStatus = 502;
  let lastText = "";
  let lastHeaders: Record<string, string> = {};

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
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

    if (response.ok && isSuccessfulUserGraphQLResponse(lastText)) {
      return {
        status: lastStatus,
        text: lastText,
        headers: lastHeaders,
        attempts: attempt + 1,
        login,
      };
    }

    if (response.ok) {
      return {
        status: lastStatus,
        text: lastText,
        headers: lastHeaders,
        attempts: attempt + 1,
        login,
      };
    }

    if (!RETRYABLE_STATUS.has(response.status)) {
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
    attempts: maxAttempts,
    login,
  };
}

/**
 * POST to GitHub with gateway retries, then smaller `repositories(first:)` on 502/503/504.
 * Fixes profiles where 100 repos × languages × topics exceeds GitHub node/time limits.
 */
export async function fetchGitHubGraphQLUpstream(
  body: string
): Promise<UpstreamResultWithMeta> {
  let lastResult: GitHubGraphQLUpstreamResult | null = null;

  for (const pageSize of REPO_PAGE_FALLBACK_SIZES) {
    const sizedBody = withRepoPageSize(body, pageSize);
    const maxAttempts = pageSize === 100 ? 2 : 1;
    const result = await fetchGitHubGraphQLAttempt(sizedBody, maxAttempts);
    lastResult = result;

    if (isSuccessfulUserGraphQLResponse(result.text)) {
      return { ...result, repoPageSize: pageSize };
    }

    if (!RETRYABLE_STATUS.has(result.status)) {
      return { ...result, repoPageSize: pageSize };
    }
  }

  return { ...lastResult!, repoPageSize: REPO_PAGE_FALLBACK_SIZES.at(-1) };
}
