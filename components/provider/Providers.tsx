"use client";

import { ApolloProvider } from "@apollo/client";
import { client } from "@/lib/apollo-client";
import { Toaster } from "@/components/ui/toaster";

/**
 * Wraps the app with Apollo (GraphQL) and Toast providers.
 * Client-only so Apollo and toasts run in the browser.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ApolloProvider client={client}>
      {children}
      <Toaster />
    </ApolloProvider>
  );
}
