import type { Repository } from "@/types";

export type RepoSortOption = "popular" | "stars" | "forks";

/**
 * Sort repositories by popularity (stars + forks combined).
 */
export function sortReposByPopularity(repositories: Repository[]): Repository[] {
  return [...repositories].sort(
    (a, b) =>
      b.stargazerCount + b.forkCount - (a.stargazerCount + a.forkCount)
  );
}

/**
 * Sort repositories by star count.
 */
export function sortReposByStars(repositories: Repository[]): Repository[] {
  return [...repositories].sort((a, b) => b.stargazerCount - a.stargazerCount);
}

/**
 * Sort repositories by fork count.
 */
export function sortReposByForks(repositories: Repository[]): Repository[] {
  return [...repositories].sort((a, b) => b.forkCount - a.forkCount);
}

/**
 * Filter repositories by primary language.
 */
export function filterReposByLanguage(
  repositories: Repository[],
  language: string
): Repository[] {
  if (!language || language === "all") return repositories;
  return repositories.filter((repo) => {
    const primary = repo.languages.edges[0]?.node.name;
    return primary === language;
  });
}

export type RepoTypeFilter = "all" | "originals" | "forks";

/**
 * Filter repositories by type (originals vs forks).
 */
export function filterReposByType(
  repositories: Repository[],
  type: RepoTypeFilter
): Repository[] {
  if (!type || type === "all") return repositories;
  if (type === "originals") return repositories.filter((r) => !r.isFork);
  return repositories.filter((r) => r.isFork);
}

/**
 * Get unique languages from repositories (for filter dropdown).
 */
export function getRepoLanguages(repositories: Repository[]): string[] {
  const set = new Set<string>();
  for (const repo of repositories) {
    for (const edge of repo.languages.edges) {
      set.add(edge.node.name);
    }
  }
  return Array.from(set).sort();
}

/**
 * Data helpers for chart series.
 * Top 10 most forked repos — used by ForkedRepos chart.
 */
export function calculateMostForkedRepos(
  repositories: Repository[]
): { repo: string; count: number }[] {
  if (repositories.length === 0) return [];
  return repositories
    .map((repo) => ({ repo: repo.name, count: repo.forkCount }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Top 10 most starred repositories.
 * Used for the "Popular Repos" chart.
 */
export function calculateMostStarredRepos(
  repositories: Repository[]
): { repo: string; stars: number }[] {
  if (repositories.length === 0) return [];
  return repositories
    .map((repo) => ({ repo: repo.name, stars: repo.stargazerCount }))
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 10);
}

/**
 * Top 10 most used languages across all repositories (by repo count).
 * Used for the "Used Languages" chart.
 */
export function calculatePopularLanguages(
  repositories: Repository[]
): { language: string; count: number }[] {
  if (repositories.length === 0) return [];
  const languageMap: Record<string, number> = {};
  for (const repo of repositories) {
    if (repo.languages.edges.length === 0) continue;
    for (const lang of repo.languages.edges) {
      const name = lang.node.name;
      languageMap[name] = (languageMap[name] ?? 0) + 1;
    }
  }
  if (Object.keys(languageMap).length === 0) return [];
  return Object.entries(languageMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([language, count]) => ({ language, count }));
}
