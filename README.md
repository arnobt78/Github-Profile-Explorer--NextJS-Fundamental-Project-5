# GitHub Profile Explorer - Next.js, React, TypeScript, Apollo Client, GraphQL, TailwindCSS Fundamental Project 5

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Apollo Client](https://img.shields.io/badge/Apollo_Client-3.11-purple)](https://www.apollographql.com/docs/react/)
[![GraphQL](https://img.shields.io/badge/GraphQL-16.9-pink)](https://graphql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)](https://tailwindcss.com/)

A modern, feature-rich web application to search and explore GitHub user profiles using the GitHub GraphQL API. Built with Next.js App Router, React, TypeScript, Tailwind CSS, Apollo Client, and shadcn/ui, this project demonstrates advanced state management, data visualization, responsive design, and a clean UI—ideal for learning full-stack web development, GraphQL, and modern React patterns.

- **Live Demo:** [https://github-dev-explorer.vercel.app/](https://github-dev-explorer.vercel.app/)

![Image 1](https://github.com/user-attachments/assets/edbee62d-bbcc-4f9e-b7fe-430cbf75200a)
![Image 2](https://github.com/user-attachments/assets/139c5426-06ea-4d5a-86f5-64f6e6df66d9)
![Image 3](https://github.com/user-attachments/assets/7b6152e1-99b6-4947-98b4-4ec2a0c9c1fa)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Routes & API](#routes--api)
- [Components & Functionalities](#components--functionalities)
- [How GraphQL & Apollo Client Work](#how-graphql--apollo-client-work)
- [Libraries & Dependencies](#libraries--dependencies)
- [Reusing Components](#reusing-components)
- [Keywords](#keywords)
- [License](#license)

---

## Features

- **Search GitHub Users** — Search by username using the GitHub GraphQL API
- **User Profile** — View avatar, name, bio, company, location, website, and profile link
- **Statistics** — Total repositories, followers, following, and gists in card layout
- **Repository List** — Filterable and sortable repo cards with language/topic badges
- **Charts** — Interactive bar charts: most used languages, popular repos, forked repos
- **Theme Toggle** — Light/dark mode with persistent preference
- **Recent Searches** — Quick access to previous searches in the navbar
- **Toast Notifications** — User feedback for invalid input and errors
- **Loading Skeletons** — Smooth loading experience
- **Responsive UI** — Mobile, tablet, and desktop support
- **TypeScript** — Type-safe codebase

---

## Project Structure

```bash
├── app/
│   ├── layout.tsx          # Root layout, metadata, fonts, theme script
│   ├── page.tsx            # Home page (renders ExplorerPage)
│   └── globals.css         # Global styles, CSS variables, animations
├── components/
│   ├── charts/             # UsedLanguages, PopularRepos, ForkedRepos
│   ├── form/               # SearchForm, RecentSearches
│   ├── layout/             # Header, Footer
│   ├── pages/              # ExplorerPage (main landing + search)
│   ├── provider/            # Providers (Apollo, Theme, Search, History)
│   ├── ui/                 # shadcn/ui: button, card, chart, input, select, skeleton, toast, etc.
│   └── user/               # UserCard, UserProfile, RepoList, StatsContainer, Loading
├── context/
│   ├── SearchContext.tsx       # Global search username state
│   ├── SearchHistoryContext.tsx # Recent searches (localStorage)
│   └── ThemeContext.tsx        # Light/dark theme (localStorage)
├── hooks/
│   ├── use-toast.ts        # Toast notifications
│   └── useSearchHistory.ts # Search history hook
├── lib/
│   ├── apollo-client.ts    # Apollo Client setup for GitHub GraphQL
│   ├── data-utils.ts      # Sort/filter helpers, chart data
│   ├── queries.ts         # GraphQL queries
│   └── utils.ts           # cn() and utilities
├── types/
│   └── index.ts           # User, Repository, Language types
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── .env.example           # Environment variable template
├── .env.local             # Your secrets (gitignored)
├── package.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Technology Stack

| Technology             | Purpose                            |
| ---------------------- | ---------------------------------- |
| **Next.js 16**         | App Router, SSR, routing, metadata |
| **React 19**           | UI components, hooks               |
| **TypeScript 5.6**     | Type safety                        |
| **Apollo Client 3.11** | GraphQL client, caching            |
| **GraphQL 16.9**       | Query language                     |
| **Tailwind CSS 3.4**   | Utility-first styling              |
| **shadcn/ui**          | Accessible UI primitives (Radix)   |
| **Recharts**           | Bar charts                         |
| **Framer Motion**      | Animations                         |
| **Lucide React**       | Icons                              |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd 21-search-github-users-graphql
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment variables (optional)

The app can run **without** a GitHub token for basic exploration, but the GitHub GraphQL API has strict rate limits for unauthenticated requests (60 requests/hour). For production or heavy use, a token is **recommended**.

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_GITHUB_TOKEN=your-github-personal-access-token
```

See [Environment Variables](#environment-variables) for how to create a token.

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### 5. Build for production

```bash
npm run build
npm start
```

### 6. Lint

```bash
npm run lint
```

---

## Environment Variables

| Variable                   | Required     | Description                                  |
| -------------------------- | ------------ | -------------------------------------------- |
| `NEXT_PUBLIC_GITHUB_TOKEN` | Optional\*\* | GitHub Personal Access Token for GraphQL API |

**Without a token:** The app works but is subject to GitHub's unauthenticated rate limit (60 requests/hour). For learning and light use, you may not need it.

**To create a token:**

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic)
3. Enable at least: `read:user`, `public_repo`
4. Copy the token and add it to `.env.local`

Example `.env.local`:

```env
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Routes & API

### Routes

| Route | Description                                    |
| ----- | ---------------------------------------------- |
| `/`   | Home page — hero, search, user profile, charts |

### API (No Backend)

This project has **no custom backend**. It talks directly to GitHub's public GraphQL API:

- **Endpoint:** `https://api.github.com/graphql`
- **Method:** POST (GraphQL)
- **Auth:** Optional Bearer token via `NEXT_PUBLIC_GITHUB_TOKEN`

The app uses the `user` query from GitHub's schema to fetch profile, repositories, followers, following, and gists.

---

## Components & Functionalities

### ExplorerPage

Main landing page with hero section, streaming animated text, search form, and user profile section.

**Reuse:** Import and render where you need the full explorer UI.

---

### SearchForm

Controlled input with validation and toast feedback. Submits username to `SearchContext`.

```tsx
import { SearchForm } from "@/components/form/SearchForm";

<SearchForm userName={userName} setUserName={setUserName} />;
```

---

### RecentSearches

Displays recent usernames as clickable pills. Uses `SearchHistoryContext`.

```tsx
import { RecentSearches } from "@/components/form/RecentSearches";

<RecentSearches onSelect={(username) => setUserName(username)} />;
```

---

### UserProfile

Fetches user data via Apollo `useQuery`, displays profile, stats, repo list, and charts.

```tsx
import { UserProfile } from "@/components/user/UserProfile";

<UserProfile userName={userName} />;
```

---

### RepoList

Displays repos with filters (sort, language, type). Shows language and topic badges.

**Reuse:** Pass `repositories` and `totalCount` from your GraphQL response.

---

### Charts (UsedLanguages, PopularRepos, ForkedRepos)

Bar charts built with Recharts. Each has a subtitle and label values.

```tsx
import { UsedLanguages } from "@/components/charts/UsedLanguages";

<UsedLanguages repositories={repositories} />;
```

---

### ThemeToggle

Light/dark mode toggle. Uses `ThemeContext` and persists to `localStorage`.

---

### How Data Flows

1. User enters a username in **SearchForm**
2. **SearchForm** validates and calls `setUserName` from **SearchContext**
3. **UserProfile** receives `userName`, runs `useQuery(GET_USER, { variables: { login: userName } })`
4. **Apollo Client** sends the query to GitHub GraphQL API
5. Data is cached; loading and error states are handled
6. **UserProfile** renders **UserCard**, **StatsContainer**, **RepoList**, and charts
7. **Data utils** (`lib/data-utils.ts`) transform repo data for charts and filters

---

## How GraphQL & Apollo Client Work

### GraphQL

GraphQL is a query language for APIs. Unlike REST, you specify exactly which fields you need in one request.

**Example query used in this project:**

```graphql
query ($login: String!) {
  user(login: $login) {
    name
    avatarUrl
    repositories(first: 100) {
      totalCount
      nodes {
        name
        stargazerCount
        forkCount
      }
    }
  }
}
```

### Apollo Client

Apollo Client handles:

- **ApolloProvider** — Wraps the app to provide GraphQL state
- **useQuery** — Fetches data and handles loading/error
- **InMemoryCache** — Caches query results
- **HttpLink** — Sends requests to GitHub's API
- **Error link** — Logs GraphQL and network errors

**Usage in this project:**

```tsx
const { data, loading, error } = useQuery<UserData>(GET_USER, {
  variables: { login: userName },
});
```

---

## Libraries & Dependencies

### Core

- **Next.js** — React framework with App Router, SSR, routing
- **React** — UI library
- **TypeScript** — Static typing

### Data & API

- **@apollo/client** — GraphQL client (fetch, cache, hooks)
- **graphql** — GraphQL parser and utilities

### UI

- **tailwindcss** — Utility-first CSS
- **tailwindcss-animate** — Animation utilities
- **@radix-ui** — Accessible primitives (label, select, slot, toast)
- **class-variance-authority** — Variant styling for components
- **clsx** + **tailwind-merge** — Conditional class merging
- **lucide-react** — UI icons
- **react-icons** — Additional icons (e.g. MdCopyright)
- **recharts** — Charts
- **framer-motion** — Animations

### Example: Using `cn()` for class merging

```tsx
import { cn } from "@/lib/utils";

<div className={cn("base-class", className, isActive && "active-class")} />;
```

---

## Reusing Components

### In another Next.js project

1. Copy `components/`, `context/`, `hooks/`, `lib/`, `types/`
2. Install dependencies: `@apollo/client`, `graphql`, `recharts`, `framer-motion`, Radix packages
3. Wrap your app with `Providers` (ThemeProvider, SearchProvider, etc.)
4. Use `ExplorerPage` or individual components as needed

### Standalone components

- **SearchForm** — Needs `SearchContext` and `useToast`
- **UserProfile** — Needs `ApolloProvider` and `client`
- **Charts** — Need `repositories` array; copy `lib/data-utils.ts` helpers

---

## Keywords

- GitHub Profile Explorer
- GitHub GraphQL API
- Next.js
- React
- TypeScript
- Apollo Client
- GraphQL
- Tailwind CSS
- shadcn/ui
- Recharts
- Data Visualization
- User Search
- Repository Stats
- Responsive UI

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute the code as per the terms of the license.

## Happy Coding! 🎉

This is an **open-source project** - feel free to use, enhance, and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com](https://www.arnobmahmud.com).

**Enjoy building and learning!** 🚀

Thank you! 😊
