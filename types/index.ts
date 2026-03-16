/**
 * Shared types for GitHub GraphQL API responses.
 * Language edge = one language on a repo (name + size).
 */
/** Language edge from GitHub GraphQL repository languages */
export type LanguageEdge = {
  node: {
    name: string;
  };
  size: number;
};

/** Repository shape from GitHub GraphQL API */
export type Repository = {
  name: string;
  description: string;
  stargazerCount: number;
  forkCount: number;
  url: string;
  languages: {
    edges: LanguageEdge[];
  };
};

/** User shape from GitHub GraphQL API */
export type User = {
  name: string;
  avatarUrl: string;
  bio: string;
  url: string;
  repositories: {
    totalCount: number;
    nodes: Repository[];
  };
  followers: {
    totalCount: number;
  };
  following: {
    totalCount: number;
  };
  gists: {
    totalCount: number;
  };
};

/** GET_USER query response payload */
export type UserData = {
  user: User;
};
