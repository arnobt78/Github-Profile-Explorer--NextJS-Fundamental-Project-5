/**
 * Shared GitHub API error helpers for proxy route, Apollo link, and UI.
 */

import type {
  GitHubApiErrorCode,
  GitHubGraphQLErrorExtension,
  GitHubGraphQLProxyErrorResponse,
} from "@/types/github-api";

/** User-facing copy for known proxy/upstream codes. */
export function getGitHubErrorMessage(code?: GitHubApiErrorCode): string {
  switch (code) {
    case "GITHUB_UPSTREAM_ERROR":
      return "GitHub is temporarily unavailable. Please try again in a moment.";
    case "GITHUB_PROXY_NO_TOKEN":
      return "GitHub API token is not configured on the server.";
    case "GITHUB_PROXY_INVALID_BODY":
      return "Invalid search request.";
    default:
      return "Could not load this GitHub profile. Please try again.";
  }
}

/** Build a GraphQL-shaped JSON body Apollo can surface as `graphQLErrors` (HTTP 200). */
export function buildProxyGraphQLError(
  message: string,
  extensions: GitHubGraphQLErrorExtension
): GitHubGraphQLProxyErrorResponse {
  return {
    errors: [{ message, extensions }],
  };
}

/** Read extension code from an Apollo GraphQL error entry. */
export function getGraphQLErrorCode(
  extensions: Record<string, unknown> | undefined
): GitHubApiErrorCode | undefined {
  const code = extensions?.code;
  return typeof code === "string" ? (code as GitHubApiErrorCode) : undefined;
}
