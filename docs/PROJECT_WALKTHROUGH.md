# Project Walkthrough — GitHub Profile Explorer

> Short overview of codebase architecture, data flow, and system design. Updated to reflect latest state.  
> Last updated: 2026-05-21

---

## What This App Does

Search any GitHub username → display their profile, repository list, language usage charts, and stats. Built as a learning project to demonstrate Next.js, Apollo GraphQL, Recharts, shadcn/ui, and TypeScript working together.

Live: `https://github-dev-explorer.vercel.app`

---

## Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | Next.js 16 / React 19 | App Router, fast dev experience |
| Styling | Tailwind CSS 3 + shadcn/ui + Radix UI | Utility-first; accessible primitives |
| Data | Apollo Client 3 → `/api/github/graphql` → GitHub GraphQL | Single query returns all user data; token on server |
| Charts | Recharts 2 | Composable chart primitives |
| Animations | Framer Motion 11 | Scroll/entrance animations |
| Error tracking | Sentry (`@sentry/nextjs`) | Error capture + performance tracing |
| Deployment | Vercel | Zero-config Next.js deploy |

**Not in this project:** Redis, PostHog, database, SSR/ISR data fetching.

---

## Architecture: CSR-Heavy + API Proxy

```
┌─────────────────────────────────────────────────────────────┐
│  Browser (client-side rendering)                              │
│                                                               │
│  Next.js shell (layout.tsx)                                   │
│    ├─ Providers (ThemeProvider > SearchHistory > Search >     │
│    │             ApolloProvider)                              │
│    ├─ Header                                                  │
│    ├─ ExplorerPage ──────────────────────────────────────┐    │
│    │    ├─ SearchForm / RecentSearches                   │    │
│    │    │    └─ updates SearchContext.userName           │    │
│    │    ├─ UserProfile                                   │    │
│    │    │    └─ Apollo useQuery(GET_USER, {login})  ───┼──┐ │
│    │    ├─ UserCard, StatsContainer, RepoList          │  │ │
│    │    ├─ UsedLanguages (PieChart)                    │  │ │
│    │    ├─ PopularRepos (BarChart)                     │  │ │
│    │    └─ ForkedRepos (BarChart)                      │  │ │
│    └─ Footer                                           │  │ │
└────────────────────────────────────────────────────────│──│─┘
                                                         │  │
                         POST /api/github/graphql ◄──────┘  │
┌─────────────────────────────────────────────────────────────┐
│  Next.js server (API route)                                   │
│    app/api/github/graphql/route.ts                            │
│      ├─ Validates GET_USER-shaped query + login variable      │
│      ├─ lib/github-graphql-server.ts → GitHub with GITHUB_TOKEN │
│      ├─ Retries 502/503/504 (max 3)                           │
│      └─ Returns JSON (GraphQL data or structured errors)        │
└───────────────────────────────┬───────────────────────────────┘
                                ▼
                    https://api.github.com/graphql
```

**Key architectural facts:**

- UI is **client-rendered**; Apollo runs in the browser.
- **No** `getServerSideProps`, no server components that `fetch()` user data.
- **No database** — GitHub GraphQL API is the only data source.
- GitHub calls go through a **same-origin proxy** so the PAT stays server-side (`GITHUB_TOKEN`) and responses stay JSON-shaped for Apollo.
- Apollo **`InMemoryCache`** keys results by query + `login` (repeat search for same user is instant until refresh).

---

## Data Flow

```
1. User types GitHub username in SearchForm (or picks RecentSearches)
2. SearchContext updates userName → ExplorerPage / UserProfile re-render
3. Apollo useQuery(GET_USER, { variables: { login } }) runs
4. HttpLink POST → /api/github/graphql  { query, variables }
5. API route forwards to GitHub with Bearer GITHUB_TOKEN
6. Response: { data: { user: { ... repositories, followers, ... } } }
   Typed: UserData → User → Repository[] → LanguageEdge[]
7. Apollo cache stores result
8. UserProfile renders UserCard, StatsContainer, RepoList, charts
9. lib/data-utils.ts transforms repo nodes for chart components
```

**Search / cache behavior:** Changing `login` triggers a new fetch. Same `login` again uses Apollo cache (no page reload). Recent searches and theme use `localStorage`; current username is in-memory only.

**Response time:** `GET_USER` requests up to **100 repos** with languages and topics in one round trip. Large profiles commonly take **several seconds to ~30s** depending on GitHub load and repo count.

---

## GraphQL Query (lib/queries.ts)

Single query `GET_USER` fetches everything in one round trip:

```graphql
query ($login: String!) {
  user(login: $login) {
    login, name, avatarUrl, bio, url, company, location, websiteUrl,
    createdAt, twitterUsername
    repositories(first: 100) {
      totalCount
      nodes {
        name, description, stargazerCount, forkCount, isFork, url
        languages(first: 5) { edges { node { name } size } }
        repositoryTopics(first: 8) { nodes { topic { name } } }
      }
    }
    followers { totalCount }
    following { totalCount }
    gists { totalCount }
  }
}
```

`repositories(first: 100)` is the max requested per query. `totalCount` can exceed 100; the UI shows "X of Y" when applicable.

---

## State Management

| State | Location | Persistence |
|-------|----------|-------------|
| Current search username | `SearchContext` | In-memory (lost on refresh) |
| Search history (recent usernames) | `SearchHistoryContext` | `localStorage` |
| Theme (dark/light) | `ThemeContext` | `localStorage` key: `"github-explorer-theme"` |
| API query results | Apollo `InMemoryCache` | In-memory |

**Theme flash prevention:** Inline `<script>` in `<head>` (`layout.tsx`) reads localStorage before React hydrates and applies `"dark"` or `"light"` on `<html>` synchronously.

**Invalidation pattern:** No full page refresh. `setUserName` updates context → `useQuery` refetches when `login` changes. Apollo cache invalidates implicitly per variable set; same variable hits cache.

---

## Component Tree

```
app/layout.tsx
└─ Providers.tsx
   ├─ ThemeProvider            (context/ThemeContext.tsx)
   ├─ SearchHistoryProvider    (context/SearchHistoryContext.tsx)
   ├─ SearchProvider           (context/SearchContext.tsx)
   └─ ApolloProvider           (lib/apollo-client.ts → client)
      ├─ Header                (components/layout/Header.tsx)
      ├─ {children} = page.tsx → ExplorerPage
      │   ├─ SearchForm        (components/form/SearchForm.tsx)
      │   ├─ RecentSearches    (components/form/RecentSearches.tsx)
      │   ├─ UserProfile       (components/user/UserProfile.tsx)
      │   ├─ UserCard          (components/user/UserCard.tsx)
      │   ├─ StatsContainer / StatsCard
      │   ├─ RepoList
      │   ├─ UsedLanguages     (components/charts/UsedLanguages.tsx)
      │   ├─ PopularRepos      (components/charts/PopularRepos.tsx)
      │   └─ ForkedRepos       (components/charts/ForkedRepos.tsx)
      ├─ Footer                (components/layout/Footer.tsx)
      └─ Toaster               (components/ui/toaster.tsx)
```

---

## Shared Libs & Types

| Path | Role |
|------|------|
| `lib/apollo-client.ts` | Apollo client, proxy URI, error link, `getApolloGitHubErrorMessage` |
| `lib/github-graphql-server.ts` | Server upstream fetch, retries, token helper |
| `lib/github-api-errors.ts` | Error codes and user-facing messages |
| `lib/report-github-api-error.ts` | Sentry reporting (`github-api` tag) |
| `lib/queries.ts` | `GET_USER` document |
| `lib/data-utils.ts` | Sort/filter/chart data transforms |
| `lib/utils.ts` | `cn()` (clsx + tailwind-merge) |
| `types/index.ts` | `User`, `Repository`, `UserData`, `LanguageEdge` |
| `types/github-api.ts` | Proxy request/error extension types |
| `hooks/useSearchHistory.ts` | Search history hook |
| `hooks/use-toast.ts` | Toast hook |

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `POST /api/github/graphql` | POST | GitHub GraphQL proxy — auth, validation, retries, JSON errors |
| `POST /api/monitoring` | POST | Sentry tunnel proxy — ad-block bypass |

### GitHub proxy workflow

1. Apollo sends standard GraphQL POST body.
2. Route parses JSON; `isAllowedGraphQLBody()` ensures `user(login:` query + `variables.login`.
3. `fetchGitHubGraphQLUpstream()` calls GitHub with `GITHUB_TOKEN` (or legacy `NEXT_PUBLIC_GITHUB_TOKEN` fallback in dev).
4. On upstream 5xx → retries; then **smaller** `repositories(first:)` (100 → 50 → 25) — node limit is per-page nested data, not `totalCount`.
5. Still failing after fallbacks → HTTP **200** with `{ errors: [{ extensions: { code: GITHUB_UPSTREAM_ERROR, status: 502 } }] }` (browser shows 200; GitHub upstream was 502).
6. Rate-limit headers forwarded when present.

---

## Sentry Error Tracking + Tunnel

### Why a tunnel?

Ad-block extensions block `*.sentry.io` / `*.ingest.sentry.io`. Errors may never reach Sentry if the SDK posts directly to those hosts.

### Tunnel solution

```
┌─────────────────────────────────────────────────────┐
│  Browser (with uBlock, Privacy Badger, etc.)         │
│  Sentry SDK  tunnel: "/api/monitoring"               │
│           ▼                                          │
│  POST /api/monitoring          (same origin)         │
└───────────────────┬───────────────────────────────────┘
                    ▼
          app/api/monitoring/route.ts
            1. Parse Sentry envelope
            2. Validate DSN host ends with sentry.io
            3. Forward to ingest URL
                    ▼
          Sentry dashboard
```

### Config files

| File | Runtime | Purpose |
|------|---------|---------|
| `sentry.client.config.ts` | Browser | Init + tunnel + replay |
| `sentry.server.config.ts` | Node.js | Server/API errors |
| `sentry.edge.config.ts` | Edge | Middleware errors |
| `instrumentation.ts` | Server startup | Loads server/edge Sentry |

### GitHub API errors in Sentry

`lib/report-github-api-error.ts` sends proxy/upstream failures with tag `github-api`. Generic `"Failed to fetch"` remains in `ignoreErrors` for offline noise.

### ErrorBoundary usage

```tsx
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

<ErrorBoundary>
  <ComponentThatMightThrow />
</ErrorBoundary>

<ErrorBoundary fallback={<p>Charts failed to load.</p>}>
  <UsedLanguages repositories={repos} />
</ErrorBoundary>
```

---

## Vercel Production Guardrails

Documented in `docs/VERCEL_PRODUCTION_GUARDRAILS.md` (real free-tier overage incident from bot/crawler traffic).

| Mitigation | Where | Effect |
|-----------|-------|--------|
| `Cache-Control: immutable` on `/_next/static/*` | `next.config.ts` + `vercel.json` | Content-hashed bundles cached; fewer repeat downloads |
| Security headers | `next.config.ts` + `vercel.json` | X-Frame-Options, nosniff, etc. |
| `robots.ts` | `app/robots.ts` | Disallow `/_next/`, `/api/`; block AI scrapers |
| `data-scroll-behavior="smooth"` on `<html>` | `app/layout.tsx` | Suppresses Next.js scroll warning |

**Manual (Vercel Dashboard):** Firewall → Bot Management → Bot Protection + AI Bots.

---

## Type System (types/index.ts)

```typescript
UserData        // root { user: User }
User            // profile + repositories + followers + following + gists
Repository      // name, stars, forks, url, languages, topics
LanguageEdge    // { node: { name }, size }
```

All API responses, component props, context values, and hooks use these types. Proxy extensions live in `types/github-api.ts`.

---

## Environment Variables

```bash
# GitHub — server only (required for proxy)
GITHUB_TOKEN=ghp_...

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://...@ingest.de.sentry.io/...
SENTRY_ORG=arnob-mahmuds-org
SENTRY_PROJECT=github-dev-explorer
SENTRY_AUTH_TOKEN=sntrys_...          # build: source maps

# Optional
NEXT_PUBLIC_SENTRY_RELEASE=git-commit-sha
```

Use **`GITHUB_TOKEN`** in Vercel (not `NEXT_PUBLIC_GITHUB_TOKEN`) so the PAT is not embedded in client JS.

---

## Deployment

1. Push to `main` → Vercel auto-deploys.
2. Set env vars: `GITHUB_TOKEN`, all `SENTRY_*` vars.
3. Enable **Bot Protection** + **AI Bots** in Vercel Firewall (manual).
4. After deploy: check Observability → Edge Requests for spikes.

---

## Local Development

```bash
npm install
cp .env.example .env.local   # GITHUB_TOKEN + Sentry vars
npm run dev                   # http://localhost:3000
```

Sentry works locally without `SENTRY_AUTH_TOKEN` (source maps not uploaded in dev). Set `NEXT_PUBLIC_SENTRY_DSN` to see local errors in the Sentry project.

---

## Related Docs

- `CLAUDE.md` — AI agent quick context
- `docs/VERCEL_PRODUCTION_GUARDRAILS.md` — Vercel cost/security guardrails
- `docs/Redis_Sentry_PostHog_INTEGRATION_GUIDE.md` — optional Redis/PostHog; Sentry status for this repo
- `README.md` — setup and component reuse
