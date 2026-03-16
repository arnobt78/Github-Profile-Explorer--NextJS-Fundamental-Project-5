"use client";

import type { Repository } from "@/types";
import { calculateMostForkedRepos } from "@/lib/data-utils";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
      <h2 className="mb-4 text-center text-2xl font-semibold">Forked Repos</h2>
      <ChartContainer config={chartConfig} className="h-[100px] w-full">
        <BarChart accessibilityLayer data={mostForkedRepos}>
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
          <Bar dataKey="count" fill="var(--color-repo)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
