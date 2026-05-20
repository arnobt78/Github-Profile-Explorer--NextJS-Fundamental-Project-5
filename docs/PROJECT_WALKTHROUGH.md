# Project Walkthrough — GitHub Profile Explorer

> Short overview of codebase architecture, data flow, and system design. Updated to reflect latest state.
> Last updated: 2026-05-20

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
| Data | Apollo Client 3 → GitHub GraphQL API | Single query returns all user data |
| Charts | Recharts 2 | Composable chart primitives |
| Animations | Framer Motion 11 | Scroll/entrance animations |
| Error tracking | Sentry (`@sentry/nextjs`) | Error capture + performance tracing |
| Deployment | Vercel | Zero-config Next.js deploy |

---

## Architecture: CSR-Heavy, No Server Data Fetching

```
┌─────────────────────────────────────────────────────────────┐
│  Browser                                                      │
│                                                               │
│  Next.js shell (layout.tsx)                                   │
│    ├─ Providers (ThemeProvider > SearchHistory > Search >     │
│    │             ApolloProvider)                              │
│    ├─ Header                                                  │
│    ├─ ExplorerPage ──────────────────────────────────────┐    │
│    │    ├─ SearchForm                                    │    │
│    │    │    └─ Apollo useQuery(GET_USER, {login})  ──→  │    │
│    │    │                                               │    │
│    │    │         GitHub GraphQL API ←─────────────────-┘    │
│    │    │         (api.github.com/graphql)                    │
│    │    │                                                     │
│    │    ├─ UserProfile (avatarUrl, bio, stats)                │
│    │    ├─ RepoList (up to 100 repos)                         │
│    │    ├─ UsedLanguages (PieChart)                           │
│    │    ├─ PopularRepos (BarChart)                            │
│    │    └─ ForkedRepos (BarChart)                             │
│    └─ Footer                                                  │
└─────────────────────────────────────────────────────────────-┘
```

**Key architectural facts:**
- All data fetching is client-side (Apollo Client runs in the browser).
- No SSR data fetching, no server components with `fetch()`, no `getServerSideProps`.
- No database — GitHub API is the only data source.
- `NEXT_PUBLIC_GITHUB_TOKEN` is browser-safe (public prefix) but gates higher API rate limits.

---

## Data Flow

```
1. User types GitHub username in SearchForm
2. SearchContext updates → ExplorerPage re-renders
3. Apollo useQuery(GET_USER, { variables: { login } }) fires
4. Request: POST https://api.github.com/graphql
   Headers: Authorization: Bearer NEXT_PUBLIC_GITHUB_TOKEN
5. Response: { user: { login, name, avatarUrl, repositories, followers, ... } }
   Typed as: UserData → User → Repository[] → LanguageEdge[]
6. Apollo InMemoryCache stores result (keyed by query + variables)
7. Components consume: UserProfile, StatsContainer, charts
8. lib/data-utils.ts transforms raw repo data into chart-ready format
```

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

`repositories(first: 100)` is GitHub API max per request. `totalCount` can exceed 100; the UI shows "X of Y" in that case.

---

## State Management

| State | Location | Persistence |
|-------|----------|-------------|
| Current search username | `SearchContext` | In-memory (lost on refresh) |
| Search history (recent usernames) | `SearchHistoryContext` | `localStorage` |
| Theme (dark/light) | `ThemeContext` | `localStorage` key: `"github-explorer-theme"` |
| API query results | Apollo `InMemoryCache` | In-memory |

**Theme flash prevention**: An inline `<script>` in `<head>` (layout.tsx) reads localStorage before React hydrates and applies `"dark"` or `"light"` class to `<html>`. This runs synchronously so there's no visible flash on first paint.

---

## Component Tree

```
app/layout.tsx
└─ Providers.tsx
   ├─ ThemeProvider       (context/ThemeContext.tsx)
   ├─ SearchHistoryProvider (context/SearchHistoryContext.tsx)
   ├─ SearchProvider      (context/SearchContext.tsx)
   └─ ApolloProvider      (lib/apollo-client.ts → client)
      ├─ Header            (components/layout/Header.tsx)
      ├─ {children} = page.tsx → ExplorerPage
      │   ├─ SearchForm    (components/form/SearchForm.tsx)
      │   ├─ RecentSearches (components/form/RecentSearches.tsx)
      │   ├─ UserProfile   (components/user/UserProfile.tsx)
      │   ├─ UserCard      (components/user/UserCard.tsx)
      │   ├─ StatsContainer / StatsCard
      │   ├─ RepoList
      │   ├─ UsedLanguages (components/charts/UsedLanguages.tsx)
      │   ├─ PopularRepos  (components/charts/PopularRepos.tsx)
      │   └─ ForkedRepos   (components/charts/ForkedRepos.tsx)
      ├─ Footer            (components/layout/Footer.tsx)
      └─ Toaster           (components/ui/toaster.tsx)
```

---

## API Routes

Before this iteration: **none**.

After this iteration:

| Route | Method | Purpose |
|-------|--------|---------|
| `POST /api/monitoring` | POST | Sentry tunnel proxy — see below |

---

## Sentry Error Tracking + Tunnel

### Why a tunnel?

Ad-block browser extensions (uBlock Origin, Privacy Badger, Ghostery) maintain lists of tracking domains. `*.sentry.io` and `*.ingest.sentry.io` are on these lists. A standard Sentry integration fails silently in any browser with these extensions enabled — **errors are never reported**.

### Tunnel solution

```
┌─────────────────────────────────────────────────────┐
│  Browser (with uBlock, Privacy Badger, etc.)         │
│                                                       │
│  Sentry SDK                                           │
│    tunnel: "/api/monitoring"   ← same origin, safe   │
│           │                                           │
│           ▼                                           │
│  POST /api/monitoring          ← not on block lists   │
└───────────────────┬───────────────────────────────────┘
                    │  (Vercel server — no browser in loop)
                    ▼
          app/api/monitoring/route.ts
            1. Parse Sentry envelope (newline-delimited JSON)
            2. Extract DSN from envelope header line 1
            3. Validate: hostname must end with sentry.io (security)
            4. Forward to https://{dsn_host}/api/{projectId}/envelope/
                    │
                    ▼
          Sentry Ingest (sentry.io)
            ✓ Error appears in Sentry dashboard
```

### Config files

| File | Runtime | Purpose |
|------|---------|---------|
| `sentry.client.config.ts` | Browser | Init + tunnel routing |
| `sentry.server.config.ts` | Node.js | Server API route error capture |
| `sentry.edge.config.ts` | Edge | Middleware error capture |
| `instrumentation.ts` | Server startup | Bootstraps server/edge Sentry |

### ErrorBoundary usage

```tsx
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Protect a risky subtree — errors captured in Sentry, fallback shown to user
<ErrorBoundary>
  <ComponentThatMightThrow />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<p>Charts failed to load.</p>}>
  <UsedLanguages data={repos} />
</ErrorBoundary>
```

---

## Vercel Production Guardrails

### Problem (real incident, documented in `docs/VERCEL_PRODUCTION_GUARDRAILS.md`)

Without headers/bot config: bots downloaded JS bundles on every visit (no cache), triggered image transforms, hit API routes — resulting in 163–183% overage on Vercel free tier within one billing cycle.

### Implemented mitigations

| Mitigation | Where | Effect |
|-----------|-------|--------|
| `Cache-Control: public, max-age=31536000, immutable` on `/_next/static/*` | `next.config.ts` + `vercel.json` | Bots/CDN cache content-hashed bundles forever; no repeated downloads |
| Security headers (X-Frame-Options DENY, X-Content-Type-Options, etc.) | `next.config.ts` + `vercel.json` | Prevents clickjacking, MIME sniffing, XSS |
| `robots.ts` | `app/robots.ts` | Disallows `/_next/`, `/api/`; blocks GPTBot, CCBot, Claude-Web, etc. |
| `data-scroll-behavior="smooth"` on `<html>` | `app/layout.tsx` | Suppresses Next.js warning, no functional change |

**Bot Protection and AI Bots** must still be enabled manually in the Vercel Dashboard under `Firewall → Bot Management`.

---

## Type System (types/index.ts)

```typescript
UserData        // root { user: User }
User            // profile + repositories + followers + following + gists
Repository      // name, stars, forks, url, languages, topics
LanguageEdge    // { node: { name }, size }
```

All API responses, component props, context values, and hook return types reference these.

---

## Deployment

1. Push to `main` → Vercel auto-deploys.
2. Set env vars in Vercel Dashboard: `NEXT_PUBLIC_GITHUB_TOKEN`, all `SENTRY_*` vars.
3. Enable **Bot Protection** + **AI Bots** in `Firewall → Bot Management` (manual step — not in code).
4. After deploy: check Vercel Observability → Edge Requests at T+15min and T+1hr for traffic spikes.

---

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_GITHUB_TOKEN
npm run dev                   # http://localhost:3000
```

Sentry works locally without `SENTRY_AUTH_TOKEN` (source maps not uploaded in dev). Set `NEXT_PUBLIC_SENTRY_DSN` to capture local errors in Sentry dashboard.
