/**
 * Sentry Edge Runtime Configuration
 *
 * Initializes Sentry in the Edge runtime (Next.js middleware, edge API routes).
 * Loaded via `instrumentation.ts` when NEXT_RUNTIME === "edge".
 *
 * Edge runtime has restricted APIs — keep this config minimal (no Node.js-specific
 * integrations). No tunnel needed: edge requests originate from Vercel servers,
 * not from the browser, so ad-blockers cannot intercept them.
 */

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,

  debug: false,

  environment: process.env.NODE_ENV ?? "development",

  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
});
