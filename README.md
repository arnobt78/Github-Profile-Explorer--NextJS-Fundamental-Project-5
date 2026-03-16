# GitHub Profile Explorer - Next.js, React, TypeScript, Apollo Client, GraphQL, TailwindCSS Fundamental Project 5

A modern, feature-rich web application to search and explore GitHub users using the GitHub GraphQL API. Built with React, Vite, TypeScript, Tailwind CSS, Apollo Client, and shadcn/ui, this project demonstrates advanced state management, data visualization, and a clean, responsive UI.

- **Live Demo:** [https://github-dev-explorer.vercel.app/](https://github-dev-explorer.vercel.app/)

![Screenshot 2025-06-15 at 22 00 23](https://github.com/user-attachments/assets/72515557-bec1-42ab-a420-05d79ac03b77)
![Screenshot 2025-06-15 at 21 29 04](https://github.com/user-attachments/assets/00ff6fa3-6cd5-4888-b5dd-4fda0512bce2)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage Guide](#usage-guide)
- [Key Functionalities](#key-functionalities)
- [How GraphQL & Apollo Client Work](#how-graphql--apollo-client-work)
- [Detailed Project Walkthrough](#detailed-project-walkthrough)
- [Keywords](#keywords)
- [License](#license)

---

## Features

- **Search GitHub Users** by username using the GitHub GraphQL API
- **User Profile**: View avatar, name, bio, and profile link
- **Statistics**: See total repositories, followers, following, and gists
- **Charts**: Visualize most used languages, most popular repos, and most forked repos
- **Responsive UI**: Built with Tailwind CSS and shadcn/ui for a modern look
- **Toast Notifications**: User feedback for invalid input and errors
- **Loading Skeletons**: Smooth loading experience
- **TypeScript**: Type-safe codebase

---

## Project Structure

```bash
├── public/
├── src/
│   ├── apolloClient.ts         # Apollo Client setup
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   ├── queries.ts              # GraphQL queries
│   ├── types.ts                # TypeScript types
│   ├── utils.ts                # Data transformation utilities
│   ├── assets/                 # Static assets
│   ├── components/
│   │   ├── charts/             # Chart components (UsedLanguages, PopularRepos, ForkedRepos)
│   │   ├── form/               # SearchForm
│   │   ├── ui/                 # shadcn/ui components (button, card, chart, input, label, skeleton, toast, toaster)
│   │   └── user/               # UserCard, UserProfile, StatsCard, StatsContainer, Loading
│   ├── hooks/                  # Custom hooks (use-toast)
│   └── lib/                    # Shared utilities
├── .env.local                  # Environment variables (GitHub token)
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## Technology Stack

- **React** (with Vite)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (UI primitives)
- **Apollo Client** (GraphQL)
- **Recharts** (Charts)
- **GitHub GraphQL API**

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

### 3. Set up environment variables

- Create a `.env.local` file in the root directory
- Add your GitHub personal access token:

```env
NEXT_PUBLIC_GITHUB_TOKEN=YOUR_TOKEN_HERE
```

> **Note:** [How to create a GitHub personal access token](https://github.com/settings/tokens)

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or as shown in your terminal).

---

## Environment Variables

- `NEXT_PUBLIC_GITHUB_TOKEN`: Your GitHub personal access token (required for API access)

**Note:** Make sure you enable (tick) at least these two fields while generating your GitHub API Token (Classic) for deploying on Netlify or Vercel or other server.

read:user (for reading user profile info)

public_repo (for reading public repository info)

---

## Usage Guide

1. **Search for a user**: Enter a GitHub username in the search bar and submit.
2. **View profile**: See the user's avatar, name, bio, and a link to their GitHub profile.
3. **Explore stats**: View total repositories, followers, following, and gists.
4. **Visualize data**: Check out charts for most used languages, most popular repos, and most forked repos.
5. **Error handling**: Invalid usernames or API errors are shown via toast notifications.

---

## Key Functionalities

- **SearchForm**: Handles user input and search submission with validation and toast feedback.
- **UserProfile**: Fetches and displays user data using Apollo Client and GraphQL.
- **UserCard**: Shows avatar, name, bio, and profile link.
- **StatsContainer & StatsCard**: Display user statistics.
- **Charts**: Visualize language usage, popular repos, and forked repos using Recharts.
- **Loading**: Skeleton UI for loading states.
- **Toast**: User feedback for errors and actions.

---

## How GraphQL & Apollo Client Work

### What is GraphQL?

GraphQL is a query language for APIs and a runtime for executing those queries. Unlike REST, which exposes multiple endpoints, GraphQL exposes a single endpoint and allows clients to specify exactly what data they need. This reduces over-fetching and under-fetching of data.

- **Schema**: Defines the types and structure of data available.
- **Query**: Request to fetch data (like GET in REST).
- **Mutation**: Request to modify data (like POST/PUT/DELETE in REST).
- **Fields & Arguments**: Specify exactly what data and filters you want.
- **Types**: Strongly-typed system (e.g., User, Repository).

**Example GraphQL Query:**

```graphql
query ($login: String!) {
  user(login: $login) {
    name
    avatarUrl
    repositories(first: 5) {
      nodes {
        name
        stargazerCount
      }
    }
  }
}
```

### What is Apollo Client?

Apollo Client is a comprehensive state management library for JavaScript that enables you to manage both local and remote data with GraphQL. It handles fetching, caching, updating, and error handling for your data.

- **ApolloProvider**: Wraps your React app to provide GraphQL data via context.
- **useQuery Hook**: Fetches data from the server and manages loading/error states.
- **InMemoryCache**: Caches query results for performance.
- **Error Handling**: Handles GraphQL and network errors gracefully.

**How it works in this project:**

- The app uses Apollo Client to send queries to the GitHub GraphQL API.
- The `apolloClient.ts` file configures the client, sets up error handling, and injects the GitHub token for authentication.
- Components like `UserProfile` use the `useQuery` hook to fetch user data and display it.

---

## Detailed Project Walkthrough

### Main Files & Their Roles

- **src/apolloClient.ts**: Configures Apollo Client with error handling and authentication for GitHub's GraphQL API.
- **src/queries.ts**: Contains the main GraphQL query to fetch user profile, repositories, followers, following, and gists.
- **src/types.ts**: TypeScript types for all data structures returned by the API (User, Repository, Language, etc).
- **src/utils.ts**: Utility functions to process and aggregate repository data for charts (e.g., most used languages, most starred repos).
- **src/components/form/SearchForm.tsx**: Controlled input form for searching GitHub users, with validation and toast notifications.
- **src/components/user/UserProfile.tsx**: Fetches user data using Apollo's `useQuery`, displays profile, stats, and charts. Handles loading and error states.
- **src/components/user/UserCard.tsx**: Displays avatar, name, bio, and a link to the user's GitHub profile.
- **src/components/user/StatsContainer.tsx & StatsCard.tsx**: Show user statistics (repos, followers, following, gists) in a grid of cards.
- **src/components/charts/UsedLanguages.tsx**: Bar chart of the user's most used programming languages (uses Recharts and utility functions).
- **src/components/charts/PopularRepos.tsx**: Bar chart of the user's most starred repositories.
- **src/components/charts/ForkedRepos.tsx**: Bar chart of the user's most forked repositories.
- **src/components/ui/**: shadcn/ui components for consistent, modern UI (button, card, input, skeleton, toast, etc).
- **src/components/user/Loading.tsx**: Skeleton loading UI for a smooth user experience.

### How Data Flows

1. **User enters a username** in the search form.
2. **SearchForm** validates input and updates the username state.
3. **UserProfile** receives the username, triggers a GraphQL query via Apollo Client.
4. **Apollo Client** sends the query to GitHub's GraphQL API, using the token for authentication.
5. **Data is fetched and cached**; loading and error states are handled.
6. **UserProfile** displays the user's info, stats, and charts using the fetched data.
7. **Charts** use utility functions to aggregate and visualize repository data.

### Error Handling & Feedback

- All API/network errors are caught and displayed to the user.
- Invalid input triggers a toast notification.
- Loading states are shown with skeleton components.

### Customization & Extending

- You can easily add more fields to the GraphQL query in `queries.ts`.
- Add more charts or visualizations by creating new components and utility functions.
- The UI is fully responsive and can be themed via Tailwind/shadcn.

---

## Keywords

React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Apollo Client, GraphQL, GitHub API, Recharts, Data Visualization, User Search, Responsive UI, Toast, Skeleton, Modern Web App

---

## License

This project is for educational/demo purposes. See [LICENSE](./LICENSE) if present.

---
