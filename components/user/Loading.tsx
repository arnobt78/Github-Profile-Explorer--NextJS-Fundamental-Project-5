"use client";

/**
 * Loading state while user profile is fetching: skeleton placeholders for card and stats grid.
 * Shown by UserProfile when useQuery loading is true.
 * Card skeleton mirrors UserCard layout (avatar + content) so height/width match when content loads.
 */
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function Loading() {
  return (
    <div>
      <Card className="mb-8 w-full">
        <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <Skeleton className="h-36 w-36 shrink-0 rounded-lg" />
          <div className="flex flex-1 flex-col gap-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-sm" />
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="mt-2 h-9 w-28 rounded-md" />
          </div>
        </CardHeader>
      </Card>
      <div className="mb-8 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        <Skeleton className="h-[70px] rounded" />
        <Skeleton className="h-[70px] rounded" />
        <Skeleton className="h-[70px] rounded" />
        <Skeleton className="h-[70px] rounded" />
      </div>
    </div>
  );
}
