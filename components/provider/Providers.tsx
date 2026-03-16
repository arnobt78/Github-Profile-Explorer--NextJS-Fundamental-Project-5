"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { Toaster } from "@/components/ui/toaster";
import { SearchHistoryProvider } from "@/context/SearchHistoryContext";
import { SearchProvider } from "@/context/SearchContext";
import { ThemeProvider } from "@/context/ThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SearchHistoryProvider>
        <SearchProvider>
          <ApolloProvider client={client}>
            {children}
            <Toaster />
          </ApolloProvider>
        </SearchProvider>
      </SearchHistoryProvider>
    </ThemeProvider>
  );
}
