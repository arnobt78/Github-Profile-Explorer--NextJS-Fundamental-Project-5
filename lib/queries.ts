import { gql } from "@apollo/client";

/**
 * GraphQL query to fetch a GitHub user with repos and language stats.
 *
 * API: GitHub GraphQL (https://api.github.com/graphql).
 * Variable: $login (username, e.g. "octocat").
 *
 * Returns: user profile, up to 100 repos (with languages + topics), follower/following/gist counts.
 * repositories.first: 100 is the max we request; totalCount can be higher (badge shows "X of Y" when so).
 */
export const GET_USER = gql`
  query ($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      bio
      url
      company
      location
      websiteUrl
      createdAt
      twitterUsername
      repositories(first: 100) {
        totalCount
        nodes {
          name
          description
          stargazerCount
          forkCount
          isFork
          url
          languages(first: 5) {
            edges {
              node {
                name
              }
              size
            }
          }
          repositoryTopics(first: 8) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
      followers {
        totalCount
      }
      following {
        totalCount
      }
      gists {
        totalCount
      }
    }
  }
`;
