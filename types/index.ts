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
  isFork?: boolean;
  url: string;
  languages: {
    edges: LanguageEdge[];
  };
  repositoryTopics?: {
    nodes: { topic: { name: string } }[];
  };
};

/** User shape from GitHub GraphQL API */
export type User = {
  login?: string;
  name: string;
  avatarUrl: string;
  bio: string;
  url: string;
  company?: string;
  location?: string;
  websiteUrl?: string;
  createdAt?: string;
  twitterUsername?: string;
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
