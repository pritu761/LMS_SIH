'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Map as MapIcon } from 'lucide-react';
import { StationReadinessMap } from '@/components/demo/StationReadinessMap';
import type { RegionDatum } from './RegionReadinessMapInner';
import type { AdminStation, StationSummary } from '@/services/adminTypes';

const RegionMap = dynamic(() => import('./RegionReadinessMapInner').then((m) => m.RegionReadinessMapInner), {
  ssr: false,
  loading: () => (
    <div aria-busy="true" aria-label="Loading region overlay" className="flex h-[380px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50 sm:h-[440px] dark:border-white/10 dark:bg-white/5">
      <MapIcon className="h-6 w-6 animate-pulse text-[#c59b48]" aria-hidden="true" />
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-500">Loading region overlay…</p>
    </div>
  ),
});

/**
 * Station readiness explorer (Section C): summary cards, station-marker map
 * with a region-overlay toggle (choropleth-style circles), and the
 * needs-attention list. All station data is live from the DB.
 */
export function AdminStationsExplorer({ stations, summary }: { stations: AdminStation[]; summary: StationSummary }) {
  const [mode, setMode] = useState<'stations' | 'regions'>('stations');

  const regions: RegionDatum[] = useMemo(() => {
    const acc = new Map<string, { lat: number; lng: number; n: number; info: { avg: number; count: number; atRisk: number } }>();
    for (const s of stations) {
      const cur = acc.get(s.region) ?? { lat: 0, lng: 0, n: 0, info: { avg: 0, count: 0, atRisk: 0 } };
      cur.lat += s.lat;
      cur.lng += s.lng;
      cur.n += 1;
      acc.set(s.region, cur);
    }
    const out: RegionDatum[] = [];
    acc.forEach((v, region) => {
      const info = summary.byRegion.find((r) => r.region === region);
      out.push({
        region,
        avg: info?.avg ?? 0,
        count: info?.count ?? v.n,
        atRisk: info?.atRisk ?? 0,
        lat: v.lat / Math.max(1, v.n),
        lng: v.lng / Math.max(1, v.n),
      });
    });
    return out;
  }, [stations, summary]);

  const lowest = useMemo(() => [...stations].sort((a, b) => a.readiness - b.readiness).slice(0, 5), [stations]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'National avg readiness', value: `${summary.nationalAvg}%` },
          { label: 'Stations at risk (<60%)', value: String(summary.atRisk) },
          { label: 'Stations tracked', value: String(summary.total) },
          { label: 'Certs issued this month', value: String(summary.certsThisMonth) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
            <p className="font-display mt-1 text-2xl font-black text-[#0b1e36] dark:text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <section aria-label="Readiness map" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-display min-w-0 flex-1 text-base font-extrabold text-[#0b1e36] dark:text-white">
            {summary.total} radar stations
          </h2>
          <div className="flex rounded-xl border border-slate-200 p-0.5 text-xs font-extrabold dark:border-white/15" role="group" aria-label="Map layer">
            {(['stations', 'regions'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                  mode === m ? 'bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36]' : 'text-slate-500 hover:text-[#0b1e36] dark:text-slate-400'
                }`}
              >
                <Layers className="h-3 w-3" aria-hidden="true" />
                {m === 'stations' ? 'Stations' : 'Regions'}
              </button>
            ))}
          </div>
        </header>
        <div className="p-4 sm:p-5">
          {mode === 'stations' ? <StationReadinessMap stations={stations} /> : <RegionMap regions={regions} />}
        </div>
      </section>

      <section aria-label="Stations needing attention" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Needs attention — lowest readiness</h2>
        </header>
        <ul className="divide-y divide-slate-100 dark:divide-white/10">
          {lowest.map((s) => (
            <li key={s.code} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm">
              <span className="font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]">{s.code}</span>
              <span className="min-w-0 flex-1 truncate font-bold text-slate-700 dark:text-slate-200">
                {s.name} <span className="font-normal text-slate-500">• {s.region}</span>
              </span>
              <span className="font-mono text-[11px] text-slate-500">gap: {s.topGap}</span>
              <span className="rounded-lg bg-rose-100 px-2 py-0.5 font-mono text-xs font-black text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                {s.readiness}%
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
