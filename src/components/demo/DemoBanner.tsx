import Link from 'next/link';
import { FlaskConical, LayoutGrid, LogIn } from 'lucide-react';

interface DemoBannerProps {
  persona: string;
}

/**
 * Mandatory banner for every /demo/* page: makes it unmistakable that all
 * data on screen is fictional mock data, never real user records.
 */
export function DemoBanner({ persona }: DemoBannerProps) {
  return (
    <div
      role="note"
      aria-label="Demo mode — no real data"
      className="sticky top-0 z-40 border-b-2 border-[#c59b48] bg-[#0b1e36] text-white"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2.5 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#c59b48] px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#0b1e36]">
          <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
          Demo mode — no real data
        </span>
        <p className="text-xs font-semibold text-slate-200">
          Viewing as <span className="font-bold text-[#dfb76c]">{persona}</span> · All names, scores and stations on
          this page are fictional mock data.
        </p>
        <span className="ml-auto inline-flex items-center gap-3 text-xs font-bold">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1 text-slate-300 transition-colors hover:text-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48]"
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            All demos
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-1 text-[#dfb76c] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48]"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            Sign in for live data
          </Link>
        </span>
      </div>
    </div>
  );
}
