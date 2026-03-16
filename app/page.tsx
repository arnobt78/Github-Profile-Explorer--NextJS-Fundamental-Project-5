/**
 * Home page — Server Component (SSR).
 * Renders the GitHub User Explorer client shell for fast initial paint.
 * All search state and data fetching (CSR) live in ExplorerPage so the server
 * sends minimal HTML first; the client then hydrates and runs Apollo/GraphQL.
 *
 * Route: / (root). This is the only page in the app; all UI lives in ExplorerPage.
 */
import { ExplorerPage } from "@/components/pages/ExplorerPage";

/** Root page: delegates to ExplorerPage for hero, search, and user profile. */
export default function Home() {
  return <ExplorerPage />;
}
