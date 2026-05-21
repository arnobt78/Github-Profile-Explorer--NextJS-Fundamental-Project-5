/**
 * Shrinks GET_USER repo page size when GitHub returns 502/503/504.
 * Total repo count (263 vs 187) is not the limit — nested nodes per page are.
 * @see https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api
 */

import type { GitHubGraphQLRequestBody } from "@/types/github-api";

/** Try full query first, then smaller pages to stay under GitHub node/time limits. */
export const REPO_PAGE_FALLBACK_SIZES = [100, 50, 25] as const;

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
