"use client";

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

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserName] = useState("quincylarson");
  const setUserNameStable = useCallback((username: string) => {
    setUserName(username.trim());
  }, []);

  return (
    <SearchContext.Provider value={{ userName, setUserName: setUserNameStable }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext(): SearchContextValue {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchContext must be used within SearchProvider");
  }
  return ctx;
}
