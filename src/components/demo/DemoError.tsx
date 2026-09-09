'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

interface DemoErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}

/**
 * Shared error UI for /demo routes. Demo pages are static, so failures here
 * are rendering faults — never data faults. No internals are exposed.
 */
export function DemoError({ error, reset, backHref = '/demo', backLabel = 'Back to demos' }: DemoErrorProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-black text-[#0b1e36] dark:text-white">This demo could not be displayed</h1>
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Something went wrong rendering this fictional dashboard. Please try again.
        {error.digest && <span className="mt-1 block font-mono text-xs">Reference: {error.digest}</span>}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] focus-visible:ring-offset-2 dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
        >
          Try again
        </button>
        <Link
          href={backHref}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-[#c59b48] hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
