import { gql } from "@apollo/client";

/** GraphQL query to fetch a GitHub user with repos and language stats */
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
