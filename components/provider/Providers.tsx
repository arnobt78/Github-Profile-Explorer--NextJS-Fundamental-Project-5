"use client";

/**
 * Global providers: wrap app so theme, search history, search state, and GraphQL are available.
 * Order matters: outer providers are available to inner ones. Toaster renders toast notifications.
 */
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
