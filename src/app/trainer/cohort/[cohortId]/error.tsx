'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';

/** Error boundary for the cohort workspace. */
export default function CohortError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
        <TriangleAlert className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="font-display text-2xl font-black text-[#0b1e36] dark:text-white">Cohort workspace unavailable</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        We could not load this cohort. It may not be allocated to you.
        {error.digest && <span className="mt-1 block font-mono text-xs">Reference: {error.digest}</span>}
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
        >
          Try again
        </button>
        <Link
          href="/trainer"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-[#c59b48] dark:border-white/15 dark:text-slate-300"
        >
          Back to Faculty Hub
        </Link>
      </div>
    </div>
  );
}
