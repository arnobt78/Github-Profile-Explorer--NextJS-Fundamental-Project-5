/**
 * Types for the same-origin GitHub GraphQL proxy (`/api/github/graphql`).
 * Keeps server route + Apollo client aligned on error shapes.
 */

/** POST body Apollo sends to the proxy (standard GraphQL over HTTP). */
export type GitHubGraphQLRequestBody = {
  query: string;
  variables?: Record<string, unknown>;
  operationName?: string;
};

/** Extension codes surfaced to Apollo `graphQLErrors` and UI. */
export type GitHubApiErrorCode =
  | "GITHUB_UPSTREAM_ERROR"
  | "GITHUB_PROXY_INVALID_BODY"
  | "GITHUB_PROXY_NO_TOKEN";

export type GitHubGraphQLErrorExtension = {
  code?: GitHubApiErrorCode;
  status?: number;
  login?: string;
  attempts?: number;
  githubRequestId?: string;
};

/** GraphQL error envelope returned when upstream GitHub fails after retries. */
export type GitHubGraphQLProxyErrorResponse = {
  errors: Array<{
    message: string;
    extensions?: GitHubGraphQLErrorExtension;
  }>;
};

/** Result from server-side upstream fetch (before shaping the HTTP response). */
export type GitHubGraphQLUpstreamResult = {
  status: number;
  text: string;
  headers: Record<string, string>;
  attempts: number;
  login?: string;
};
