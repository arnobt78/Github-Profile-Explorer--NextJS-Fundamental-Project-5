/**
 * Sentry Server-Side Configuration
 *
 * Initializes Sentry in the Node.js runtime (API routes, server components,
 * middleware). Loaded via `instrumentation.ts` when NEXT_RUNTIME === "nodejs".
 *
 * Server-side events are sent directly from the Node.js process to sentry.io —
 * no tunnel needed here since server requests are not subject to browser ad-blockers.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  /** Sample 20% of server traces in production; 100% in dev. */
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  debug: false,

  environment: process.env.NODE_ENV ?? "development",

  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,

  integrations: [
    /**
     * Capture console.warn and console.error calls as Sentry breadcrumbs.
     * Omit "log" level to avoid spamming breadcrumbs with debug output.
     */
    Sentry.consoleLoggingIntegration({ levels: ["warn", "error"] }),
  ],
});
