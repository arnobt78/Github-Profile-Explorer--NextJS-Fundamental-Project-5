"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const STORAGE_KEY = "github-explorer-recent-searches";
const MAX_RECENT = 10;

type SearchHistoryContextValue = {
  recentSearches: string[];
  addSearch: (username: string) => void;
  clearHistory: () => void;
};

const SearchHistoryContext = createContext<SearchHistoryContextValue | null>(
  null
);

function loadFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENT)
      : [];
  } catch {
    return [];
  }
}

function saveToStorage(searches: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(searches));
  } catch {
    // ignore
  }
}

export function SearchHistoryProvider({ children }: { children: React.ReactNode }) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const stored = loadFromStorage();
    const id = setTimeout(() => setRecentSearches(stored), 0);
    return () => clearTimeout(id);
  }, []);

  const addSearch = useCallback((username: string) => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const next = [trimmed, ...filtered].slice(0, MAX_RECENT);
      saveToStorage(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setRecentSearches([]);
    saveToStorage([]);
  }, []);

  return (
    <SearchHistoryContext.Provider
      value={{ recentSearches, addSearch, clearHistory }}
    >
      {children}
    </SearchHistoryContext.Provider>
  );
}

export function useSearchHistoryContext(): SearchHistoryContextValue {
  const ctx = useContext(SearchHistoryContext);
  if (!ctx) {
    throw new Error("useSearchHistoryContext must be used within SearchHistoryProvider");
  }
  return ctx;
}
