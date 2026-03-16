"use client";

/**
 * User profile — fetches one GitHub user via GraphQL (useQuery).
 * Renders Loading / error / UserCard + stats + charts (UsedLanguages, PopularRepos, ForkedRepos).
 */
import { useQuery } from "@apollo/client";
import { GET_USER } from "@/lib/queries";
import type { UserData } from "@/types";
import { UserCard } from "./UserCard";
import { StatsContainer } from "./StatsContainer";
import { ForkedRepos } from "@/components/charts/ForkedRepos";
import { PopularRepos } from "@/components/charts/PopularRepos";
import { UsedLanguages } from "@/components/charts/UsedLanguages";
import { Loading } from "./Loading";

type UserProfileProps = {
  userName: string;
};

export function UserProfile({ userName }: UserProfileProps) {
  const { data, loading, error } = useQuery<UserData>(GET_USER, {
    variables: { login: userName },
  });

  if (loading) return <Loading />;
  if (error) return <h2 className="text-xl">{error.message}</h2>;
  if (!data) return <h2 className="text-xl">User Not Found.</h2>;

  const {
    avatarUrl,
    name,
    bio,
    url,
    repositories,
    followers,
    following,
    gists,
  } = data.user;

  return (
    <div>
      <UserCard avatarUrl={avatarUrl} name={name} bio={bio} url={url} />
      <StatsContainer
        totalRepos={repositories.totalCount}
        followers={followers.totalCount}
        following={following.totalCount}
        gists={gists.totalCount}
      />
      {repositories.totalCount > 0 && (
        <div className="flex w-full flex-col gap-6">
          <div className="w-full">
            <UsedLanguages repositories={repositories.nodes} />
          </div>
          <div className="w-full">
            <PopularRepos repositories={repositories.nodes} />
          </div>
          <div className="w-full">
            <ForkedRepos repositories={repositories.nodes} />
          </div>
        </div>
      )}
    </div>
  );
}
