"use client";

import type { Repository } from "@/types";
import { calculateMostStarredRepos } from "@/lib/data-utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
      <h2 className="mb-4 text-center text-2xl font-semibold">
        Popular Repos
      </h2>
      <ChartContainer config={chartConfig} className="h-[100px] w-full">
        <BarChart accessibilityLayer data={popularRepos}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="repo"
            tickLine={false}
            tickMargin={10}
            tickFormatter={(value: string) => value.slice(0, 10)}
          />
          <YAxis dataKey="stars" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="stars" fill="var(--color-repo)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
