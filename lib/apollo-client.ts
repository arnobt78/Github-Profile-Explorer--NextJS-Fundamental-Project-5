"use client";

/**
 * Apollo Client for GitHub GraphQL via same-origin proxy `/api/github/graphql`.
 * Token stays on the server (GITHUB_TOKEN); browser never calls api.github.com directly.
 */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import {
  agentDebugLog,
  parseLoginFromGraphQLBody,
} from "@/lib/agent-debug-log";
import {
  getGraphQLErrorCode,
  getGitHubErrorMessage,
} from "@/lib/github-api-errors";
import { reportGitHubGraphQLExtensions } from "@/lib/report-github-api-error";

/** Same-origin proxy — avoids CORS masking when GitHub returns 502 HTML. */
const GITHUB_GRAPHQL_PROXY = "/api/github/graphql";

/** Logs GraphQL and network errors; reports GitHub failures to Sentry. */
const errorLink = onError(
  ({ graphQLErrors, networkError, operation }) => {
    const login =
      (operation.variables?.login as string | undefined) ?? "unknown";
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        const code = getGraphQLErrorCode(
          extensions as Record<string, unknown> | undefined
        );
        console.error(
          `[GraphQL error]: Message: ${message}, Location:${String(locations)}, Path:${String(path)}`
        );
        reportGitHubGraphQLExtensions(
          {
            code,
            login,
            status:
              typeof extensions?.status === "number"
                ? extensions.status
                : undefined,
            attempts:
              typeof extensions?.attempts === "number"
                ? extensions.attempts
                : undefined,
          },
          "apollo-client"
        );
        // #region agent log
        agentDebugLog({
          location: "lib/apollo-client.ts:errorLink:graphQL",
          message: "GraphQL error from proxy/GitHub",
          hypothesisId: "B",
          runId: "post-fix",
          data: { login, message, code },
        });
        // #endregion
      });
    }
    if (networkError) {
      console.error(`[Network Error]: ${networkError.message}`);
      const statusCode =
        "statusCode" in networkError
          ? (networkError as { statusCode?: number }).statusCode
          : undefined;
      // #region agent log
      agentDebugLog({
        location: "lib/apollo-client.ts:errorLink:network",
        message: "Apollo network error",
        hypothesisId: "A",
        runId: "post-fix",
        data: {
          login,
          message: networkError.message,
          name: networkError.name,
          statusCode,
        },
      });
      // #endregion
    }
  }
);

/** Records proxy HTTP status + rate-limit headers (debug session). */
const instrumentedFetch: typeof fetch = async (input, init) => {
  const login = parseLoginFromGraphQLBody(init?.body);
  const startedAt = Date.now();
  try {
    const response = await fetch(input, init);
    const graphqlRemaining = response.headers.get("x-ratelimit-remaining");
    const graphqlLimit = response.headers.get("x-ratelimit-limit");
    const graphqlReset = response.headers.get("x-ratelimit-reset");
    const githubRequestId = response.headers.get("x-github-request-id");
    // #region agent log
    agentDebugLog({
      location: "lib/apollo-client.ts:instrumentedFetch:response",
      message: "GitHub proxy HTTP response",
      hypothesisId: response.ok ? "D" : "A",
      runId: "post-fix",
      data: {
        login,
        status: response.status,
        ok: response.ok,
        durationMs: Date.now() - startedAt,
        graphqlRemaining,
        graphqlLimit,
        graphqlReset,
        githubRequestId,
        contentType: response.headers.get("content-type"),
      },
    });
    // #endregion
    return response;
  } catch (err) {
    // #region agent log
    agentDebugLog({
      location: "lib/apollo-client.ts:instrumentedFetch:catch",
      message: "Proxy fetch threw",
      hypothesisId: "A",
      runId: "post-fix",
      data: {
        login,
        durationMs: Date.now() - startedAt,
        errorName: err instanceof Error ? err.name : "unknown",
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    // #endregion
    throw err;
  }
};

const httpLink = new HttpLink({
  uri: GITHUB_GRAPHQL_PROXY,
  fetch: instrumentedFetch,
});

const link = ApolloLink.from([errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

/** Maps Apollo error to UI copy (proxy extensions or generic network). */
export function getApolloGitHubErrorMessage(
  error: { message: string; graphQLErrors?: ReadonlyArray<{ extensions?: Record<string, unknown> }> }
): string {
  const first = error.graphQLErrors?.[0];
  const code = getGraphQLErrorCode(first?.extensions);
  if (code) return getGitHubErrorMessage(code);
  return error.message || getGitHubErrorMessage();
}
