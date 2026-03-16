"use client";

/**
 * Convenience hook: same as useSearchHistoryContext().
 * Use in components that need recent searches, addSearch, or clearHistory.
 */
import { useSearchHistoryContext } from "@/context/SearchHistoryContext";

export function useSearchHistory() {
  return useSearchHistoryContext();
}
