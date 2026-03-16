"use client";

import type { Repository } from "@/types";
import { calculatePopularLanguages } from "@/lib/data-utils";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type UsedLanguagesProps = {
  repositories: Repository[];
};

export function UsedLanguages({ repositories }: UsedLanguagesProps) {
  const popularLanguages = calculatePopularLanguages(repositories);

  const chartConfig = {
    language: {
      label: "Language",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full">
      <h2 className="mb-1 text-center text-2xl font-semibold">
        Used Languages
      </h2>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        Top languages used across your repositories
      </p>
      <ChartContainer config={chartConfig} className="h-[160px] w-full pt-4">
        <BarChart accessibilityLayer data={popularLanguages} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="language" tickLine={false} tickMargin={10} />
          <YAxis dataKey="count" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-language)" radius={4}>
            <LabelList dataKey="count" position="top" className="fill-foreground" />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
