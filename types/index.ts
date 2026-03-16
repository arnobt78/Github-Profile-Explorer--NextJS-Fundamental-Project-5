/**
 * Shared types for GitHub GraphQL API responses (GET_USER query).
 * Matches the shape returned by GitHub's GraphQL API so TypeScript and components stay in sync.
 */
/** Language edge from GitHub GraphQL repository.languages (name + size in bytes). */
export type LanguageEdge = {
  node: {
    name: string;
  };
  size: number;
};

/** Repository: name, description, stars, forks, url, languages, topics (from GET_USER). */
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

/** User: profile fields + repositories, followers, following, gists (from GET_USER). */
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

/** Root type for useQuery(GET_USER): { data: UserData }. */
export type UserData = {
  user: User;
};
