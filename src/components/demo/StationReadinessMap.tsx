'use client';

import dynamic from 'next/dynamic';
import { Map as MapIcon } from 'lucide-react';
import type { DemoStation } from './StationReadinessMapInner';

const Inner = dynamic(() => import('./StationReadinessMapInner').then((m) => m.StationReadinessMapInner), {
  ssr: false,
  loading: () => (
    <div
      aria-busy="true"
      aria-label="Loading station map"
      className="flex h-[380px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 sm:h-[440px] dark:border-white/10 dark:bg-white/5"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0b1e36]/5 text-[#c59b48] dark:bg-[#c59b48]/15">
        <MapIcon className="h-6 w-6 animate-pulse" aria-hidden="true" />
      </span>
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Loading station map…
      </p>
    </div>
  ),
});

/**
 * Demo station-readiness map with legend. Leaflet is client-only, so the
 * inner map mounts exclusively in the browser; tile data comes from
 * OpenStreetMap while all station data is local mock JSON (no DB calls).
 */
export function StationReadinessMap({ stations }: { stations: DemoStation[] }) {
  return (
    <div>
      <Inner stations={stations} />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300" aria-label="Map legend">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#16a34a]" aria-hidden="true" /> Ready (≥ 80%)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#d97706]" aria-hidden="true" /> Watch (50–79%)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#dc2626]" aria-hidden="true" /> At risk (&lt; 50%)
        </span>
        <span className="ml-auto font-mono font-semibold text-slate-500">{stations.length} demo stations • click a marker</span>
      </div>
    </div>
  );
}
