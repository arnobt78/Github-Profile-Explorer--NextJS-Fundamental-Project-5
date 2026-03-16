"use client";

/**
 * Apollo Client for GitHub GraphQL API.
 * Uses NEXT_PUBLIC_GITHUB_TOKEN in the browser; error link logs GraphQL/network errors.
 *
 * Walkthrough:
 * - errorLink: logs GraphQL and network errors to console (no UI; components handle errors via useQuery).
 * - httpLink: sends POST requests to GitHub's GraphQL endpoint; adds Authorization header when token exists.
 * - Token is read only in browser (typeof window) so SSR does not expose it.
 */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

/** Logs GraphQL and network errors; does not block the request. */
const errorLink = onError(
  ({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location:${String(locations)}, Path:${String(path)}`
        );
      });
    }
    if (networkError) {
      console.error(`[Network Error]: ${networkError.message}`);
    }
  }
);

/** GitHub's public GraphQL endpoint (single URL for all queries). */
const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
/** Token only in browser to avoid leaking in SSR; optional (unauthenticated requests have lower rate limit). */
const token =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_GITHUB_TOKEN
    : undefined;

/** Sends queries to GitHub; adds Bearer token when available. */
const httpLink = new HttpLink({
  uri: GITHUB_GRAPHQL_API,
  headers: token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {},
});

/** Link chain: error handling first, then HTTP. */
const link = ApolloLink.from([errorLink, httpLink]);

/** Single Apollo Client instance; used by ApolloProvider in Providers.tsx. */
export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
