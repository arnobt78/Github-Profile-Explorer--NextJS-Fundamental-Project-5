/**
 * ErrorBoundary — Reusable React error boundary with Sentry integration.
 *
 * Catches runtime errors in any part of the React tree below it and:
 *   1. Reports the error and component stack to Sentry via `captureException`.
 *   2. Renders a fallback UI so the rest of the page remains usable.
 *
 * Usage:
 *   // Wrap any subtree that could throw:
 *   <ErrorBoundary>
 *     <ComponentThatMightThrow />
 *   </ErrorBoundary>
 *
 *   // Custom fallback UI:
 *   <ErrorBoundary fallback={<p>Something broke here.</p>}>
 *     <ComponentThatMightThrow />
 *   </ErrorBoundary>
 *
 * Note: Error boundaries must be class components — React does not provide a
 * hook equivalent for `componentDidCatch`. This is intentional by the React team.
 * The "use client" directive is required because error boundaries only work in
 * client components (they intercept client-side rendering errors).
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorBoundaryProps {
  /** React subtree to protect. */
  children: ReactNode;
  /** Custom fallback rendered when an error is caught. Defaults to built-in card. */
  fallback?: ReactNode;
  /** Optional extra CSS class on the built-in fallback container. */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  /**
   * getDerivedStateFromError: called during render phase on error — update state
   * to show fallback UI on the next render pass.
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  /**
   * componentDidCatch: called after render, safe for side-effects.
   * Send the error + React component stack to Sentry for diagnosis.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    Sentry.captureException(error, {
      contexts: {
        react: {
          // Component stack trace — shows exactly which component threw.
          componentStack: errorInfo.componentStack ?? undefined,
        },
      },
    });
  }

  /** Reset the error state — allows retrying the failed subtree. */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Render custom fallback if provided.
    if (this.props.fallback != null) {
      return this.props.fallback;
    }

    // Built-in fallback: minimal error card, theme-aware via Tailwind dark: classes.
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/40 dark:bg-red-950/20 ${this.props.className ?? ""}`}
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm font-medium text-red-700 dark:text-red-400">
          Something went wrong
        </p>
        <p className="text-xs text-red-600/70 dark:text-red-400/60">
          The error has been reported. You can try again.
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="mt-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
        >
          Try again
        </button>
      </div>
    );
  }
}
