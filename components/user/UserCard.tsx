"use client";

/**
 * User card: avatar, name, @login, bio, company/location/website/twitter/joined, and "View on GitHub".
 * Receives props from UserProfile (data.user). Uses Next Image for avatar.
 */
import Image from "next/image";
import { Building2, Calendar, Globe, MapPin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UserCardProps = {
  avatarUrl: string;
  name: string;
  bio: string;
  url: string;
  login?: string;
  company?: string;
  location?: string;
  websiteUrl?: string;
  createdAt?: string;
  twitterUsername?: string;
};

/** Format ISO date as "Nov 2015" for "Joined" display. */
function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function UserCard({
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
}: UserCardProps) {
  return (
    <Card className="mb-8 w-full">
      <CardHeader className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <Image
          src={avatarUrl}
          alt={name}
          width={144}
          height={144}
          className="h-36 w-36 shrink-0 rounded-lg object-cover"
        />
        <div className="flex flex-1 flex-col gap-y-2">
          <div>
            <CardTitle>{name || login || "Coding Addict"}</CardTitle>
            {login && (
              <p className="text-sm text-muted-foreground">@{login}</p>
            )}
          </div>
          <CardDescription>
            {bio || "Passionate about coding and technology"}
          </CardDescription>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {company}
              </span>
            )}
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {location}
              </span>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {twitterUsername && (
              <a
                href={`https://twitter.com/${twitterUsername}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
                @{twitterUsername}
              </a>
            )}
            {createdAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(createdAt)}
              </span>
            )}
          </div>
          <Button asChild size="sm" className="mt-2 w-fit">
            <a href={url} target="_blank" rel="noreferrer">
              View on GitHub
            </a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
