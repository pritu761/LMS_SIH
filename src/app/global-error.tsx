'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { reportError } from '@/lib/errors';

/**
 * Root error boundary (Phase 3.4C): catches uncaught client render errors,
 * reports them through the error hook (console + optional Sentry) and shows
 * a safe recovery screen. No stack traces or internals are exposed.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportError(error, { path: typeof window !== 'undefined' ? window.location.pathname : undefined });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-[#070f1a]">
        <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
          <span className="font-mono text-4xl font-black text-[#0b1e36] dark:text-white">500</span>
          <h1 className="font-display text-2xl font-black text-[#0b1e36] dark:text-white">Something went wrong</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The error was reported automatically (reference{error.digest ? `: ${error.digest}` : ' logged'}). Please try again.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-bold text-white dark:bg-[#c59b48] dark:text-[#0b1e36]"
            >
              Try again
            </button>
            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300"
            >
              Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
