/**
 * Sentry Client-Side Configuration
 *
 * Initializes Sentry in the browser. Loaded automatically by @sentry/nextjs
 * before any app code runs.
 *
 * TUNNEL: All Sentry SDK calls route through `/api/monitoring` (our own domain)
 * instead of directly to sentry.io — this bypasses ad-blocker extensions (uBlock,
 * Privacy Badger, etc.) in both normal browser and incognito. The tunnel endpoint
 * validates the DSN host and proxies only to verified sentry.io addresses.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  /**
   * Route all events through our own domain → bypasses ad-blocker extension lists
   * that block `*.sentry.io` and `*.ingest.sentry.io` directly.
   * Matches the tunnel endpoint defined in `app/api/monitoring/route.ts`.
   */
  tunnel: "/api/monitoring",

  /**
   * Sample 20% of traces in production to control volume/cost.
   * 100% in dev so every action is visible during local development.
   */
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  /** Session replay: record 5% of normal sessions, 100% of sessions with errors. */
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  /** Suppress Sentry's own console output in all environments. */
  debug: false,

  environment: process.env.NODE_ENV ?? "development",

  /**
   * Release tracking — set `NEXT_PUBLIC_SENTRY_RELEASE` to the git commit SHA
   * (e.g. via `NEXT_PUBLIC_SENTRY_RELEASE=$(git rev-parse HEAD)` in CI) to get
   * source-map-enriched stack traces per deploy.
   */
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  integrations: [
    /**
     * Session Replay: captures DOM snapshots on errors.
     * maskAllText + blockAllMedia ensures PII is not sent.
     */
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  /**
   * Skip reporting common browser noise:
   * - ResizeObserver loop errors from browser layout engine quirks
   * - Non-Error rejection captures from third-party scripts / extensions
   * - top.GLOBALS from old IE/edge browser extensions
   */
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    "top.GLOBALS",
    // Network-level noise (offline users, flaky connections)
    "NetworkError",
    "Failed to fetch",
    "Load failed",
  ],
});
