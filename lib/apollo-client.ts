"use client";

/**
 * Apollo Client for GitHub GraphQL API.
 * Uses NEXT_PUBLIC_GITHUB_TOKEN in the browser; error link logs GraphQL/network errors.
 */
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

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

const GITHUB_GRAPHQL_API = "https://api.github.com/graphql";
const token =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_GITHUB_TOKEN
    : undefined;

const httpLink = new HttpLink({
  uri: GITHUB_GRAPHQL_API,
  headers: token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {},
});

const link = ApolloLink.from([errorLink, httpLink]);

export const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
