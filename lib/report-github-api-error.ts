/**
 * Reports GitHub API failures to Sentry (server route + client Apollo link).
 * Uses tags so events are not dropped as generic "Failed to fetch" noise.
 */

import * as Sentry from "@sentry/nextjs";
import type { GitHubGraphQLErrorExtension } from "@/types/github-api";

type GitHubApiReportContext = {
  login?: string;
  status?: number;
  attempts?: number;
  message: string;
  githubRequestId?: string;
  source: "github-proxy" | "apollo-client";
};

export function reportGitHubApiError(context: GitHubApiReportContext): void {
  Sentry.withScope((scope) => {
    scope.setTag("github-api", "true");
    scope.setTag("github-api-source", context.source);
    if (context.login) scope.setExtra("login", context.login);
    if (context.status !== undefined) scope.setExtra("status", context.status);
    if (context.attempts !== undefined) {
      scope.setExtra("attempts", context.attempts);
    }
    if (context.githubRequestId) {
      scope.setExtra("githubRequestId", context.githubRequestId);
    }
    Sentry.captureMessage(context.message, "error");
  });
}

export function reportGitHubGraphQLExtensions(
  extensions: GitHubGraphQLErrorExtension | undefined,
  source: GitHubApiReportContext["source"]
): void {
  if (!extensions?.code) return;
  reportGitHubApiError({
    source,
    login: extensions.login,
    status: extensions.status,
    attempts: extensions.attempts,
    githubRequestId: extensions.githubRequestId,
    message: `GitHub GraphQL: ${extensions.code}`,
  });
}
