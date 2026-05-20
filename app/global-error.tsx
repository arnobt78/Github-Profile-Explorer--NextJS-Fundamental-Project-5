/**
 * Global Error Boundary — App Router root-level error handler.
 *
 * Rendered by Next.js App Router when an unhandled error escapes the root layout.
 * Must include its own <html> and <body> tags because it REPLACES the root layout
 * entirely during an error (the root layout itself may be the source of the error).
 *
 * Responsibilities:
 *   1. Capture the error in Sentry on mount.
 *   2. Render a minimal full-page fallback so users know something is wrong.
 *   3. Offer a "Try again" button that calls Next.js's built-in `reset` function
 *      to attempt re-rendering the root segment.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */

"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface GlobalErrorProps {
  /** The unhandled Error object thrown during rendering. */
  error: Error & { digest?: string };
  /**
   * Provided by Next.js — call to attempt re-rendering the root segment.
   * Equivalent to a full page refresh from the framework's perspective.
   */
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps): React.JSX.Element {
  useEffect(() => {
    // Capture the root-level error in Sentry with the Next.js digest for correlation.
    Sentry.captureException(error, {
      tags: {
        error_boundary: "global",
        // `digest` is a Next.js-generated hash for server-side errors — allows
        // correlating client-visible error IDs with server logs.
        ...(error.digest ? { nextjs_digest: error.digest } : {}),
      },
    });
  }, [error]);

  return (
    // Minimal standalone HTML document — no access to root layout styles or providers.
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#0f0f0f",
          color: "#e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 400, padding: "2rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#f87171" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a3a3a3", marginBottom: "1.5rem" }}>
            An unexpected error occurred. The issue has been reported automatically.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.375rem",
              border: "1px solid #374151",
              background: "#1f2937",
              color: "#e5e5e5",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
