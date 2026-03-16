"use client";

/**
 * Single stat card: title (e.g. "Total Repositories") and count. Reused 4x in StatsContainer.
 */
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  count: number;
};

export function StatsCard({ title, count }: StatsCardProps) {
  return (
    <Card>
      <div className="flex flex-row items-center justify-between p-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{count}</CardDescription>
      </div>
    </Card>
  );
}
