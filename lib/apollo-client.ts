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
  getGraphQLErrorCode,
  getGitHubErrorMessage,
} from "@/lib/github-api-errors";
import { reportGitHubGraphQLExtensions } from "@/lib/report-github-api-error";

/** Same-origin proxy — avoids CORS masking when GitHub returns 502 HTML. */
const GITHUB_GRAPHQL_PROXY = "/api/github/graphql";

/** Logs GraphQL/network errors; reports GitHub failures to Sentry (tag: github-api). */
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
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
    });
  }
  if (networkError) {
    console.error(`[Network Error]: ${networkError.message}`);
  }
});

const httpLink = new HttpLink({
  uri: GITHUB_GRAPHQL_PROXY,
});

const link = ApolloLink.from([errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

/** Maps Apollo error to UI copy (proxy extensions or generic network). */
export function getApolloGitHubErrorMessage(error: {
  message: string;
  graphQLErrors?: ReadonlyArray<{ extensions?: Record<string, unknown> }>;
}): string {
  const first = error.graphQLErrors?.[0];
  const code = getGraphQLErrorCode(first?.extensions);
  if (code) return getGitHubErrorMessage(code);
  return error.message || getGitHubErrorMessage();
}
