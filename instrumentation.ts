/**
 * Next.js Instrumentation Hook
 *
 * Called once at server startup before any requests are handled.
 * Bootstraps Sentry in the correct runtime (Node.js or Edge).
 *
 * Next.js 15+ enables this file by default — no `experimental.instrumentationHook`
 * flag required. Must live at the project root (alongside next.config.ts).
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Node.js runtime: API routes, server components, server actions
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    // Edge runtime: middleware, edge API routes (restricted Node.js API surface)
    await import("./sentry.edge.config");
  }
}

/**
 * onRequestError: Next.js 15+ instrumentation hook called for every unhandled
 * server-side request error. Re-exported as captureRequestError from @sentry/nextjs
 * (same signature) so Sentry automatically captures these structured errors.
 *
 * @sentry/nextjs v10 removed the `/server` subpath export — captureRequestError
 * is now exported directly from the root package and has the same parameter
 * shape that Next.js passes to this hook.
 */
export { captureRequestError as onRequestError } from "@sentry/nextjs";
