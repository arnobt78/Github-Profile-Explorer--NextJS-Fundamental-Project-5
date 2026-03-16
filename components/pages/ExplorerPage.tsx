"use client";

import { useState } from "react";
import { SearchForm } from "@/components/form/SearchForm";
import { UserProfile } from "@/components/user/UserProfile";

/**
 * Main explorer page — Client Component (CSR).
 * Holds search state (userName) and composes SearchForm + UserProfile.
 * Kept client-side so hooks (useState) and Apollo useQuery run in the browser.
 */
export function ExplorerPage() {
  const [userName, setUserName] = useState("quincylarson");

  return (
    <main className="mx-auto max-w-7xl px-2 py-10 lg:px-0 lg:py-20">
      <section className="mb-12 flex flex-col items-center justify-center text-center">
        <h1 className="mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent drop-shadow-lg sm:text-5xl">
          Search GitHub User Explorer
        </h1>
        <p className="mb-4 max-w-2xl text-muted-foreground sm:text-xl md:text-base">
          Effortlessly search and visualize GitHub user profiles, repositories,
          and language stats with interactive charts.
          <br className="hidden sm:block" />
          Powered by GraphQL, Apollo Client, and a modern UI for a seamless
          developer experience.
        </p>
      </section>
      <SearchForm userName={userName} setUserName={setUserName} />
      <UserProfile userName={userName} />
    </main>
  );
}
