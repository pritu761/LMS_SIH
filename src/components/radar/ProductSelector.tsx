'use client';

import { FlaskConical, Info, Satellite } from 'lucide-react';
import { RADAR_PRODUCTS, productById } from '@/lib/radarProducts';
import type { RadarProductId } from '@/services/radarTypes';

/**
 * Multi-product selector (Phase 2.3B): Z/V/ZDR/KDP/CC/ET tabs with
 * per-product color scales, units and interpretation. Only Z is a live
 * mosaic — the rest are explicitly badged simulated training overlays.
 */
export function ProductSelector({
  product,
  onChange,
}: {
  product: RadarProductId;
  onChange: (p: RadarProductId) => void;
}) {
  const active = productById(product);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-[#0b1e36]/60">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Radar product">
        {RADAR_PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={product === p.id}
            onClick={() => onChange(p.id)}
            title={`${p.name} (${p.unit || 'unitless'}) — ${p.live ? 'live mosaic' : 'simulated training overlay'}`}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 font-mono text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
              product === p.id
                ? 'border-[#0b1e36] bg-[#0b1e36] text-white dark:border-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]'
                : 'border-slate-200 text-slate-500 hover:border-[#c59b48]/60 hover:text-[#0b1e36] dark:border-white/10 dark:text-slate-400'
            }`}
          >
            {p.live ? <Satellite className="h-3 w-3 text-emerald-500" aria-hidden="true" /> : <FlaskConical className="h-3 w-3 text-amber-500" aria-hidden="true" />}
            {p.id}
          </button>
        ))}
        <span className="ml-auto hidden items-center gap-1 font-mono text-[11px] text-slate-500 sm:inline-flex">
          <Info className="h-3 w-3" aria-hidden="true" />
          hover the map for cursor values
        </span>
      </div>

      <div className="mt-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-sm font-extrabold text-[#0b1e36] dark:text-white">
            {active.name} {active.unit ? <span className="font-mono text-xs font-bold text-slate-500">({active.unit})</span> : null}
          </h3>
          <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-black uppercase ${active.live ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>
            {active.live ? 'live' : 'simulated'}
          </span>
        </div>
        <div className="mt-2 flex h-3.5 overflow-hidden rounded-full border border-slate-200 dark:border-white/10" role="img" aria-label={`${active.name} color scale`}>
          {active.steps.map((s) => (
            <span key={s.label} title={`${s.label} ${active.unit}`} className="h-full flex-1" style={{ backgroundColor: s.color }} />
          ))}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500">
          {active.steps.map((s) => (
            <span key={s.label}>{s.label}</span>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <strong className="text-slate-600 dark:text-slate-300">{active.description}</strong> {active.interpretation}
        </p>
      </div>
    </div>
  );
}
