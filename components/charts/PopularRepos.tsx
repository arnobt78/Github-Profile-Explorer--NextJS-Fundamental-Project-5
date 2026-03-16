"use client";

/**
 * Bar chart: top 10 most starred repos (from calculateMostStarredRepos).
 * X-axis: repo name (truncated); Y-axis: stars. Label on bar; tooltip on hover.
 */
import type { Repository } from "@/types";
import { calculateMostStarredRepos } from "@/lib/data-utils";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PopularReposProps = {
  repositories: Repository[];
};

export function PopularRepos({ repositories }: PopularReposProps) {
  const popularRepos = calculateMostStarredRepos(repositories);

  const chartConfig = {
    repo: {
      label: "Repository",
      color: "#e11c47",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      <h2 className="mb-1 text-center text-2xl font-semibold">
        Popular Repos
      </h2>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Repositories with the most stars
      </p>
      <ChartContainer config={chartConfig} className="h-[160px] w-full pt-4">
        <BarChart accessibilityLayer data={popularRepos} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="repo"
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value: string) => value.slice(0, 10)}
          />
          <YAxis dataKey="stars" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="stars" fill="var(--color-repo)" radius={4}>
            <LabelList dataKey="stars" position="top" className="fill-foreground" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
