/**
 * Next.js Configuration
 *
 * Wrapped with `withSentryConfig` for:
 *   - Source map upload to Sentry at build time (enriches error stack traces).
 *   - Tree-shaking Sentry's internal logger from the client bundle.
 *   - Hiding source maps from being publicly served by Next.js.
 *
 * Security headers (Vercel Production Guardrails):
 *   Applied to ALL routes to prevent clickjacking, MIME sniffing, and XSS.
 *   Also sets immutable cache on `/_next/static/` to eliminate repeated bot
 *   downloads of content-hashed JS/CSS bundles (primary cause of Vercel cost spikes).
 *
 * @see docs/VERCEL_PRODUCTION_GUARDRAILS.md
 */

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Security headers applied to every response.
 * These prevent the most common class of web attacks and comply with
 * OWASP security header recommendations.
 */
const securityHeaders = [
  /** Prevent MIME-type sniffing — browser must respect Content-Type. */
  { key: "X-Content-Type-Options", value: "nosniff" },
  /** Block the page from being loaded in an <iframe> — prevents clickjacking. */
  { key: "X-Frame-Options", value: "DENY" },
  /** Enable browser's XSS filter (legacy browsers). */
  { key: "X-XSS-Protection", value: "1; mode=block" },
  /** Control what information is sent in the Referer header on cross-origin navigation. */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /** Disable browser APIs not used by this app — camera and geolocation. */
  { key: "Permissions-Policy", value: "camera=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    return [
      {
        /**
         * Apply security headers to ALL routes.
         * `(.*)` matches every path including `/`, `/api/...`, etc.
         */
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        /**
         * Immutable cache on Next.js static assets.
         *
         * Next.js content-hashes every file in `/_next/static/` at build time
         * (e.g. `/_next/static/chunks/abc123.js`). Because the hash changes when
         * the file changes, it is safe to cache indefinitely. Without this header,
         * bots and crawlers re-download the entire JS bundle on every visit,
         * which is the #1 cause of "Fast Origin Transfer" overages on Vercel.
         *
         * max-age=31536000 = 1 year in seconds
         * immutable = browser/CDN must not revalidate even if max-age expires
         */
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

/**
 * Sentry build-time configuration.
 * `withSentryConfig` wraps the Next.js config with Sentry's webpack plugin which:
 *   - Uploads source maps to Sentry during `next build` (requires SENTRY_AUTH_TOKEN).
 *   - Removes source maps from the public Next.js output (hideSourceMaps).
 *   - Strips the Sentry SDK's internal debug logger from client bundles (disableLogger).
 *
 * Note: `tunnelRoute` is intentionally NOT set here — the tunnel endpoint at
 * `/api/monitoring` is written manually (app/api/monitoring/route.ts) with
 * strict DSN-host validation to prevent open-proxy misuse.
 * The `tunnel` option in sentry.client.config.ts handles runtime routing.
 */
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,

  /** Suppress Sentry webpack plugin build output (keep build logs clean). */
  silent: true,

  /**
   * Include source maps for files in node_modules that Sentry instruments.
   * Improves stack trace quality for errors originating in dependencies.
   */
  widenClientFileUpload: true,

  /**
   * Delete source maps from the Next.js build output after uploading to Sentry.
   * Prevents source maps from being publicly served (replaces `hideSourceMaps` from
   * older Sentry versions — renamed in @sentry/nextjs v10 to `sourcemaps.deleteSourcemapsAfterUpload`).
   */
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  webpack: {
    /**
     * Tree-shake Sentry's internal logger from the browser bundle (reduces JS size).
     * Replaces deprecated top-level `disableLogger` option (@sentry/nextjs v10+).
     * Not supported with Turbopack — webpack only.
     */
    treeshake: { removeDebugLogging: true },

    /**
     * Disable automatic Vercel cron job monitoring (not applicable to this app).
     * Replaces deprecated top-level `automaticVercelMonitors` option (@sentry/nextjs v10+).
     */
    automaticVercelMonitors: false,
  },
});
