"use client";

import { useSearchHistoryContext } from "@/context/SearchHistoryContext";

export function useSearchHistory() {
  return useSearchHistoryContext();
}
