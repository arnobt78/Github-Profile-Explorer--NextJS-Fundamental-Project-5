import type { Repository } from "@/types";

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
