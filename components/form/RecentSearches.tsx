"use client";

/**
 * Recent searches: pills for each saved username. Clicking a pill calls onSelect(username).
 * Used in Header; onSelect is setUserName from SearchContext. Trash clears history.
 */
import { motion } from "framer-motion";
import { History, Trash2 } from "lucide-react";
import { useSearchHistory } from "@/hooks/useSearchHistory";

type RecentSearchesProps = {
  onSelect: (username: string) => void;
};

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const { recentSearches, clearHistory } = useSearchHistory();

  if (recentSearches.length === 0) return null;

  return (
    <div className="flex w-full max-w-lg items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-1.5 sm:max-w-xl md:max-w-2xl">
      <History className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-wrap items-center gap-1.5">
        {recentSearches.map((username, i) => (
          <motion.button
            key={username}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            onClick={() => onSelect(username)}
            className="rounded-md bg-background px-2.5 py-1 text-xs font-medium text-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            {username}
          </motion.button>
        ))}
      </div>
      <button
        type="button"
        onClick={clearHistory}
        aria-label="Clear search history"
        className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
