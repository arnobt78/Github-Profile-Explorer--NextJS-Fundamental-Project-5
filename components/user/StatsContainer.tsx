"use client";

import { StatsCard } from "./StatsCard";

type StatsContainerProps = {
  totalRepos: number;
  followers: number;
  following: number;
  gists: number;
};

export function StatsContainer({
  totalRepos,
  followers,
  following,
  gists,
}: StatsContainerProps) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
      <StatsCard title="Total Repositories" count={totalRepos} />
      <StatsCard title="Followers" count={followers} />
      <StatsCard title="Following" count={following} />
      <StatsCard title="Gists" count={gists} />
    </div>
  );
}
