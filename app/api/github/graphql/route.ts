/**
 * Same-origin GitHub GraphQL proxy.
 * Browser → POST /api/github/graphql → GitHub (server token + retries).
 * Avoids CORS masking on GitHub 502 HTML pages and keeps the PAT off the client.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  fetchGitHubGraphQLUpstream,
  getGitHubServerToken,
  isAllowedGraphQLBody,
} from "@/lib/github-graphql-server";
import {
  buildProxyGraphQLError,
  getGitHubErrorMessage,
} from "@/lib/github-api-errors";
import { reportGitHubApiError } from "@/lib/report-github-api-error";
import type { GitHubGraphQLRequestBody } from "@/types/github-api";

export const runtime = "nodejs";
/** Allow full fallback chain (50 → 25 → 100 × 9s) on Vercel; avoids platform HTTP 500. */
export const maxDuration = 60;

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {}
): NextResponse {
  return NextResponse.json(body, {
    status: init.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!getGitHubServerToken()) {
    const payload = buildProxyGraphQLError(
      getGitHubErrorMessage("GITHUB_PROXY_NO_TOKEN"),
      { code: "GITHUB_PROXY_NO_TOKEN" }
    );
    return jsonResponse(payload, { status: 200 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    const payload = buildProxyGraphQLError(
      getGitHubErrorMessage("GITHUB_PROXY_INVALID_BODY"),
      { code: "GITHUB_PROXY_INVALID_BODY" }
    );
    return jsonResponse(payload, { status: 200 });
  }

  let parsed: GitHubGraphQLRequestBody;
  try {
    parsed = JSON.parse(rawBody) as GitHubGraphQLRequestBody;
  } catch {
    const payload = buildProxyGraphQLError(
      getGitHubErrorMessage("GITHUB_PROXY_INVALID_BODY"),
      { code: "GITHUB_PROXY_INVALID_BODY" }
    );
    return jsonResponse(payload, { status: 200 });
  }

  if (!isAllowedGraphQLBody(parsed)) {
    const payload = buildProxyGraphQLError(
      getGitHubErrorMessage("GITHUB_PROXY_INVALID_BODY"),
      { code: "GITHUB_PROXY_INVALID_BODY" }
    );
    return jsonResponse(payload, { status: 200 });
  }

  const login = parsed.variables?.login as string;

  try {
    const upstream = await fetchGitHubGraphQLUpstream(rawBody);

    if (upstream.status >= 500 || upstream.status === 429) {
      reportGitHubApiError({
        source: "github-proxy",
        login,
        status: upstream.status,
        attempts: upstream.attempts,
        githubRequestId: upstream.headers["x-github-request-id"],
        message: `GitHub upstream HTTP ${upstream.status} after ${upstream.attempts} attempt(s) (repo page tried through ${upstream.repoPageSize ?? 100})`,
      });

      const payload = buildProxyGraphQLError(
        getGitHubErrorMessage("GITHUB_UPSTREAM_ERROR"),
        {
          code: "GITHUB_UPSTREAM_ERROR",
          status: upstream.status,
          login,
          attempts: upstream.attempts,
          githubRequestId: upstream.headers["x-github-request-id"],
        }
      );
      return jsonResponse(payload, {
        status: 200,
        headers: upstream.headers,
      });
    }

    let responseBody: unknown;
    try {
      responseBody = JSON.parse(upstream.text) as unknown;
    } catch {
      reportGitHubApiError({
        source: "github-proxy",
        login,
        status: upstream.status,
        attempts: upstream.attempts,
        message: "GitHub upstream returned non-JSON body",
      });
      const payload = buildProxyGraphQLError(
        getGitHubErrorMessage("GITHUB_UPSTREAM_ERROR"),
        {
          code: "GITHUB_UPSTREAM_ERROR",
          status: upstream.status,
          login,
          attempts: upstream.attempts,
        }
      );
      return jsonResponse(payload, { status: 200, headers: upstream.headers });
    }

    return jsonResponse(responseBody, {
      status: 200,
      headers: upstream.headers,
    });
  } catch (err) {
    reportGitHubApiError({
      source: "github-proxy",
      login,
      message:
        err instanceof Error ? err.message : "GitHub proxy fetch threw",
    });
    const payload = buildProxyGraphQLError(
      getGitHubErrorMessage("GITHUB_UPSTREAM_ERROR"),
      { code: "GITHUB_UPSTREAM_ERROR", login }
    );
    return jsonResponse(payload, { status: 200 });
  }
}
