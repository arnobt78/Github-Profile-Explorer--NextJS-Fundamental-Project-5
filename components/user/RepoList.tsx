"use client";

/**
 * Repository list: heading with count badge, sort/language/type filters (shadcn Select),
 * "Clear Filter" when any filter is active, empty state with reset, and grid of repo cards.
 * Each card: name, link, description, stars/forks, language badges, topic badges.
 * totalCount: when > repositories.length, badge shows "X of Y" (API fetches first 100).
 */
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Repository } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, GitFork, Star } from "lucide-react";
import {
  sortReposByPopularity,
  sortReposByStars,
  sortReposByForks,
  filterReposByLanguage,
  filterReposByType,
  getRepoLanguages,
  type RepoSortOption,
  type RepoTypeFilter,
} from "@/lib/data-utils";

type RepoListProps = {
  repositories: Repository[];
  totalCount?: number;
};

const SORT_OPTIONS: { value: RepoSortOption; label: string }[] = [
  { value: "popular", label: "Most Popular" },
  { value: "stars", label: "Most Stars" },
  { value: "forks", label: "Most Forked" },
];

const TYPE_OPTIONS: { value: RepoTypeFilter; label: string }[] = [
  { value: "all", label: "All Repos" },
  { value: "originals", label: "Originals" },
  { value: "forks", label: "Forked Only" },
];

export function RepoList({ repositories, totalCount }: RepoListProps) {
  const [sort, setSort] = useState<RepoSortOption>("popular");
  const [language, setLanguage] = useState<string>("all");
  const [repoType, setRepoType] = useState<RepoTypeFilter>("all");

  const languages = useMemo(() => getRepoLanguages(repositories), [repositories]);

  /** Apply type + language filters, then sort; used for badge count and empty state. */
  const filteredAndSortedFull = useMemo(() => {
    let result = filterReposByType(repositories, repoType);
    result = filterReposByLanguage(result, language);
    if (sort === "popular") result = sortReposByPopularity(result);
    else if (sort === "stars") result = sortReposByStars(result);
    else result = sortReposByForks(result);
    return result;
  }, [repositories, sort, language, repoType]);

  /** Display only first 12 repos in the grid. */
  const filteredAndSorted = useMemo(
    () => filteredAndSortedFull.slice(0, 12),
    [filteredAndSortedFull]
  );

  const hasActiveFilters =
    language !== "all" || repoType !== "all" || sort !== "popular";

  const clearFilters = () => {
    setSort("popular");
    setLanguage("all");
    setRepoType("all");
  };

  if (repositories.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-semibold">
          Repositories
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-medium text-primary-foreground">
            {totalCount != null && totalCount > repositories.length
              ? `${filteredAndSortedFull.length} of ${totalCount}`
              : filteredAndSortedFull.length}
          </span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              Clear Filter
            </button>
          )}
          <Select value={sort} onValueChange={(v) => setSort(v as RepoSortOption)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={repoType} onValueChange={(v) => setRepoType(v as RepoTypeFilter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {filteredAndSorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            No repositories match your filters
          </p>
          <p className="mb-4 text-sm text-muted-foreground">
            Try adjusting your filters or reset to see all repositories
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Reset Filters
          </button>
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {filteredAndSorted.map((repo, i) => (
          <motion.div
            key={repo.url}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-foreground hover:underline"
                >
                  {repo.name}
                </a>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${repo.name} on GitHub`}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </CardHeader>
              <CardContent className="pt-0">
                {repo.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {repo.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    {repo.stargazerCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="h-4 w-4" />
                    {repo.forkCount}
                  </span>
                  {repo.languages.edges.length > 0 && (
                    <span className="flex flex-wrap items-center gap-1">
                      {repo.languages.edges.slice(0, 3).map((edge) => (
                        <span
                          key={edge.node.name}
                          className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {edge.node.name}
                        </span>
                      ))}
                    </span>
                  )}
                  {repo.repositoryTopics?.nodes &&
                    repo.repositoryTopics.nodes.length > 0 && (
                      <span className="flex flex-wrap items-center gap-1">
                        {repo.repositoryTopics.nodes.slice(0, 3).map((t) => (
                          <span
                            key={t.topic.name}
                            className="rounded-md border border-border bg-background px-1.5 py-0.5 text-xs font-medium text-foreground"
                          >
                            {t.topic.name}
                          </span>
                        ))}
                      </span>
                    )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  );
}
