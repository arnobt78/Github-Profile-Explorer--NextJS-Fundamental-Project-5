/**
 * Server-only GitHub GraphQL client used by `/api/github/graphql`.
 * Falls back through smaller `repositories(first:)` pages; bounded time for Vercel limits.
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
/** GitHub often 502 near ~10s; keep each attempt under Vercel hobby limit. */
const UPSTREAM_TIMEOUT_MS = 9_000;

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

/** One upstream POST; timeouts count as retryable gateway failures. */
async function fetchGitHubGraphQLOnce(
  body: string
): Promise<GitHubGraphQLUpstreamResult> {
  const token = getGitHubServerToken();
  const login = parseGraphQLLogin(body);
  const emptyFail = (): GitHubGraphQLUpstreamResult => ({
    status: 504,
    text: "",
    headers: {},
    attempts: 1,
    login,
  });

  try {
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

    const lastStatus = response.status;
    const lastText = await response.text();
    const lastHeaders = pickForwardHeaders(response);

    return {
      status: lastStatus,
      text: lastText,
      headers: lastHeaders,
      attempts: 1,
      login,
    };
  } catch {
    return emptyFail();
  }
}

/**
 * Tries 50 → 25 → 100 repo pages (one 9s attempt each) until data.user is returned.
 * Prevents Vercel FUNCTION_INVOCATION_TIMEOUT (generic HTTP 500) from long 100-only retries.
 */
export async function fetchGitHubGraphQLUpstream(
  body: string
): Promise<UpstreamResultWithMeta> {
  let lastResult: GitHubGraphQLUpstreamResult = {
    status: 502,
    text: "",
    headers: {},
    attempts: 0,
    login: parseGraphQLLogin(body),
  };

  for (const pageSize of REPO_PAGE_FALLBACK_SIZES) {
    const sizedBody = withRepoPageSize(body, pageSize);
    const result = await fetchGitHubGraphQLOnce(sizedBody);
    lastResult = result;

    if (isSuccessfulUserGraphQLResponse(result.text)) {
      return { ...result, repoPageSize: pageSize };
    }

    if (!RETRYABLE_STATUS.has(result.status)) {
      return { ...result, repoPageSize: pageSize };
    }
  }

  return { ...lastResult, repoPageSize: REPO_PAGE_FALLBACK_SIZES.at(-1) };
}
