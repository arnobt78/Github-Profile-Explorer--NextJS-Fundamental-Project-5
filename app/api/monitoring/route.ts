/**
 * Sentry Tunnel Endpoint — `/api/monitoring`
 *
 * Proxies Sentry error/performance/replay envelopes through the app's own domain
 * so ad-blocker extensions (uBlock Origin, Privacy Badger, etc.) cannot intercept
 * them. Direct requests to `*.sentry.io` or `*.ingest.sentry.io` are on most
 * ad-blocker filter lists — routing through the same origin as the app bypasses this.
 *
 * How it works:
 *   Browser SDK (sentry.client.config.ts: `tunnel: "/api/monitoring"`)
 *     → POST /api/monitoring  (same-origin, not blocked)
 *       → this handler validates + forwards to the real Sentry ingest URL
 *
 * Security: validates the DSN hostname before forwarding — prevents this endpoint
 * from being used as an open proxy for arbitrary hosts.
 *
 * Sentry envelope format: newline-delimited JSON where the FIRST line is a header
 * containing `{ dsn, sdk, trace, ... }`. All subsequent lines are item headers
 * and payloads (events, transactions, sessions, replays, etc.).
 *
 * @see https://develop.sentry.dev/sdk/envelopes/
 */

import { NextRequest } from "next/server";

/** Only forward to verified Sentry ingest hosts. */
const ALLOWED_SENTRY_HOSTS = ["sentry.io", "ingest.sentry.io", "ingest.us.sentry.io", "ingest.de.sentry.io"];

/**
 * Returns true if the given hostname is a verified Sentry host.
 * Accepts exact matches and subdomains (e.g. o123456.ingest.sentry.io).
 */
function isAllowedSentryHost(hostname: string): boolean {
  return ALLOWED_SENTRY_HOSTS.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
  );
}

/** Shape of the Sentry envelope header (first line of every envelope). */
interface SentryEnvelopeHeader {
  dsn?: string;
  sdk?: { name: string; version: string };
  trace?: Record<string, string>;
  [key: string]: unknown;
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.text();

    if (!body) {
      return new Response("Empty request body", { status: 400 });
    }

    // The first line of a Sentry envelope is always the envelope header JSON.
    const firstNewline = body.indexOf("\n");
    const headerLine = firstNewline === -1 ? body : body.slice(0, firstNewline);

    let envelopeHeader: SentryEnvelopeHeader;
    try {
      envelopeHeader = JSON.parse(headerLine) as SentryEnvelopeHeader;
    } catch {
      return new Response("Invalid envelope header JSON", { status: 400 });
    }

    if (!envelopeHeader.dsn) {
      return new Response("Missing dsn in envelope header", { status: 400 });
    }

    // Parse and validate the DSN URL embedded in the envelope header.
    let dsn: URL;
    try {
      dsn = new URL(envelopeHeader.dsn);
    } catch {
      return new Response("Malformed DSN URL", { status: 400 });
    }

    // Security: reject requests targeting any host that is not a verified Sentry host.
    if (!isAllowedSentryHost(dsn.hostname)) {
      return new Response(`Forbidden: DSN host "${dsn.hostname}" is not a trusted Sentry host`, { status: 403 });
    }

    // DSN path format: /<projectId>  e.g. /1234567
    const projectId = dsn.pathname.replace(/^\//, "").split("/")[0];
    if (!projectId || !/^\d+$/.test(projectId)) {
      return new Response("Invalid or missing project ID in DSN path", { status: 400 });
    }

    // Construct the Sentry ingest envelope URL:
    // https://{org_subdomain}.ingest.sentry.io/api/{projectId}/envelope/
    const sentryIngestUrl = `https://${dsn.hostname}/api/${projectId}/envelope/`;

    // Preserve the original client IP so Sentry can associate events with the
    // correct geographic location and user context (not the Vercel server IP).
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "";

    const forwardHeaders: HeadersInit = {
      /**
       * Required: tells Sentry this is an envelope (not a legacy event).
       * Do NOT forward the browser's Content-Type directly — it may include
       * boundary params or charset info that Sentry's parser rejects.
       */
      "Content-Type": "application/x-sentry-envelope",
    };

    if (clientIp) {
      // X-Forwarded-For propagates the original client IP through the proxy chain.
      forwardHeaders["X-Forwarded-For"] = clientIp;
    }

    const sentryResponse = await fetch(sentryIngestUrl, {
      method: "POST",
      headers: forwardHeaders,
      body,
    });

    // Return Sentry's response status verbatim; SDK uses this to determine retry behavior.
    return new Response(sentryResponse.body, {
      status: sentryResponse.status,
      headers: {
        "Content-Type":
          sentryResponse.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch (error) {
    // Do not expose internal error details in the response body.
    console.error("[monitoring/tunnel] Unhandled error:", error);
    return new Response("Tunnel error", { status: 500 });
  }
}
