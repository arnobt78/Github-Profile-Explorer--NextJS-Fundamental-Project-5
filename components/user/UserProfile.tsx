"use client";

/**
 * User profile section: fetches GitHub user via GET_USER (Apollo useQuery), then renders
 * UserCard, StatsContainer, RepoList, and three charts. Handles loading, error, and not-found.
 */
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import { GET_USER } from "@/lib/queries";
import { getApolloGitHubErrorMessage } from "@/lib/apollo-client";
import type { UserData } from "@/types";
import { UserCard } from "./UserCard";
import { StatsContainer } from "./StatsContainer";
import { RepoList } from "./RepoList";
import { ForkedRepos } from "@/components/charts/ForkedRepos";
import { PopularRepos } from "@/components/charts/PopularRepos";
import { UsedLanguages } from "@/components/charts/UsedLanguages";
import { Loading } from "./Loading";
import { AnimatedSection } from "@/components/ui/AnimatedSection";

type UserProfileProps = {
  userName: string;
};

/** Framer stagger: children animate with 0.08s delay between them. */
const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export function UserProfile({ userName }: UserProfileProps) {
  const { data, loading, error } = useQuery<UserData>(GET_USER, {
    variables: { login: userName },
  });

  if (loading) return <Loading />;

  if (error) {
    const displayMessage = getApolloGitHubErrorMessage(error);
    return (
      <AnimatedSection>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="mb-4 text-destructive">{displayMessage}</p>
          <p className="text-sm text-muted-foreground">
            Check your connection or try again later.
          </p>
        </div>
      </AnimatedSection>
    );
  }

  if (!data) {
    return (
      <AnimatedSection>
        <div className="rounded-lg border border-border bg-muted/30 p-12 text-center">
          <p className="mb-2 text-xl font-medium">User not found</p>
          <p className="text-muted-foreground">
            No GitHub user with that username exists.
          </p>
        </div>
      </AnimatedSection>
    );
  }

  const {
    avatarUrl,
    name,
    bio,
    url,
    login,
    company,
    location,
    websiteUrl,
    createdAt,
    twitterUsername,
    repositories,
    followers,
    following,
    gists,
  } = data.user;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <AnimatedSection delay={0}>
        <UserCard
          avatarUrl={avatarUrl}
          name={name}
          bio={bio}
          url={url}
          login={login}
          company={company}
          location={location}
          websiteUrl={websiteUrl}
          createdAt={createdAt}
          twitterUsername={twitterUsername}
        />
      </AnimatedSection>
      <AnimatedSection delay={0.1}>
        <StatsContainer
          totalRepos={repositories.totalCount}
          followers={followers.totalCount}
          following={following.totalCount}
          gists={gists.totalCount}
        />
      </AnimatedSection>
      {repositories.nodes.length > 0 && (
        <AnimatedSection delay={0.15}>
          <RepoList
            repositories={repositories.nodes}
            totalCount={repositories.totalCount}
          />
        </AnimatedSection>
      )}
      {repositories.totalCount > 0 && (
        <div className="flex w-full flex-col gap-6">
          <AnimatedSection delay={0.2}>
            <div className="w-full">
              <UsedLanguages repositories={repositories.nodes} />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.25}>
            <div className="w-full">
              <PopularRepos repositories={repositories.nodes} />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="w-full">
              <ForkedRepos repositories={repositories.nodes} />
            </div>
          </AnimatedSection>
        </div>
      )}
    </motion.div>
  );
}
