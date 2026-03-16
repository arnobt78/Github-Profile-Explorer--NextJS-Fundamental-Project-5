"use client";

/**
 * App header: logo + title (left), recent searches (center), theme toggle (right).
 * Sticky; max-w-9xl for wide layout. RecentSearches calls setUserName when a pill is clicked.
 */
import Link from "next/link";
import { UserRoundSearch } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { RecentSearches } from "@/components/form/RecentSearches";
import { useSearchContext } from "@/context/SearchContext";

export function Header() {
  const { setUserName } = useSearchContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-9xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <UserRoundSearch className="h-8 w-8 text-foreground" aria-hidden />
          <span className="hidden font-semibold text-foreground sm:inline-block">
            GitHub Profile Explorer
          </span>
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center px-2 sm:px-4">
          <RecentSearches onSelect={setUserName} />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
