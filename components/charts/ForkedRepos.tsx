"use client";

import type { Repository } from "@/types";
import { calculateMostForkedRepos } from "@/lib/data-utils";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ForkedReposProps = {
  repositories: Repository[];
};

export function ForkedRepos({ repositories }: ForkedReposProps) {
  const mostForkedRepos = calculateMostForkedRepos(repositories);

  const chartConfig = {
    repo: {
      label: "Repository",
      color: "#facd12",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      <h2 className="mb-1 text-center text-2xl font-semibold">Forked Repos</h2>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Repositories with the most forks
      </p>
      <ChartContainer config={chartConfig} className="h-[160px] w-full pt-4">
        <BarChart accessibilityLayer data={mostForkedRepos} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="repo"
            tickLine
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value: string) => value.slice(0, 10)}
          />
          <YAxis dataKey="count" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-repo)" radius={4}>
            <LabelList dataKey="count" position="top" className="fill-foreground" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
