"use client";

/**
 * Search context: holds the current GitHub username to fetch and display.
 * SearchForm and RecentSearches update it; UserProfile and RepoList read it.
 */
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type SearchContextValue = {
  userName: string;
  setUserName: (username: string) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

/** Provides global userName state; default "quincylarson" for demo. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("quincylarson");
  /** Trims input so queries use a clean username. */
  const setUserNameStable = useCallback((username: string) => {
    setUserName(username.trim());
  }, []);

  return (
    <SearchContext.Provider value={{ userName, setUserName: setUserNameStable }}>
      {children}
    </SearchContext.Provider>
  );
}

/** Hook to read/update the current search username. Must be used inside SearchProvider. */
export function useSearchContext(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return ctx;
}
