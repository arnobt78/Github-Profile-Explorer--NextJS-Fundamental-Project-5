/**
 * Robots Configuration — `/robots.txt`
 *
 * App Router generates this file automatically from the export below.
 * Single source of truth: do NOT also add `public/robots.txt` — two robots
 * policies conflict and confuse crawlers.
 *
 * Strategy (Static/CSR app — no server-rendered SEO pages beyond the root):
 *   - Allow all crawlers to index the homepage and all user-facing routes.
 *   - Disallow /_next/ (Next.js build output — no SEO value, wastes crawl budget).
 *   - Disallow /api/ (server endpoints — not indexable content).
 *   - Explicitly block AI training scrapers that ignore the default rules above.
 *
 * Why block AI scrapers:
 *   GPTBot, CCBot, and similar bots index public apps for training datasets.
 *   They contributed to Vercel usage spikes (see docs/VERCEL_PRODUCTION_GUARDRAILS.md).
 *   Blocking them here reduces edge request count without affecting real users.
 */

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        /** Default rule — all crawlers (search engines, general bots). */
        userAgent: "*",
        allow: "/",
        disallow: [
          "/_next/",  // Next.js static build output — not indexable content
          "/api/",    // API endpoints — not HTML pages
        ],
      },
      {
        /**
         * AI training scrapers — disallow everything.
         * These bots download entire sites for model training; they are not
         * search engine crawlers and provide no SEO benefit.
         */
        userAgent: [
          "GPTBot",        // OpenAI
          "ChatGPT-User",  // OpenAI ChatGPT browse plugin
          "CCBot",         // Common Crawl (used by many LLM training pipelines)
          "anthropic-ai",  // Anthropic
          "Claude-Web",    // Anthropic Claude browse
          "Google-Extended", // Google Bard/Gemini training
          "cohere-ai",     // Cohere
        ],
        disallow: "/",
      },
    ],
  };
}
