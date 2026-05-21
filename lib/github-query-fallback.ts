/**
 * Shrinks GET_USER repo page size when GitHub returns 502/503/504.
 * Order: 50 → 25 → 100 — heavy profiles (e.g. many languages/topics per repo) often
 * fail at 100; 50 stays under GitHub node limits and Vercel function duration.
 * @see https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api
 */

import type { GitHubGraphQLRequestBody } from "@/types/github-api";

/** Smaller pages first to avoid Vercel timeout when 100 repeatedly 502s. */
export const REPO_PAGE_FALLBACK_SIZES = [50, 25, 100] as const;

export type RepoPageSize = (typeof REPO_PAGE_FALLBACK_SIZES)[number];

/** Replaces `repositories(first: N)` in the serialized GraphQL body. */
export function withRepoPageSize(body: string, pageSize: RepoPageSize): string {
  try {
    const parsed = JSON.parse(body) as GitHubGraphQLRequestBody;
    if (typeof parsed.query !== "string") return body;
    parsed.query = parsed.query.replace(
      /repositories\s*\(\s*first:\s*\d+\s*\)/gi,
      `repositories(first: ${pageSize})`
    );
    return JSON.stringify(parsed);
  } catch {
    return body;
  }
}

/** True when upstream JSON includes a user object (success for our GET_USER query). */
export function isSuccessfulUserGraphQLResponse(text: string): boolean {
  try {
    const parsed = JSON.parse(text) as {
      data?: { user?: unknown };
      errors?: unknown[];
    };
    return Boolean(parsed.data?.user) && !parsed.errors?.length;
  } catch {
    return false;
  }
}
