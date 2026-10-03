'use client';

import { AlertTriangle, Megaphone } from 'lucide-react';
import type { WeatherAlert } from '@/services/radarTypes';

const SEVERITY_STYLE: Record<WeatherAlert['severity'], string> = {
  RED: 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
  ORANGE: 'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200',
  YELLOW: 'border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-500/30 dark:bg-yellow-500/10 dark:text-yellow-200',
};

const SEVERITY_DOT: Record<WeatherAlert['severity'], string> = {
  RED: 'bg-red-500',
  ORANGE: 'bg-orange-500',
  YELLOW: 'bg-yellow-500',
};

function formatRange(from: string, to: string): string {
  const f = new Date(from);
  const t = new Date(to);
  const day = (d: Date) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const time = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day(f)} ${time(f)} → ${day(t)} ${time(t)}`;
}

/**
 * Active warnings panel (Phase 2.3E): color-coded list (district, validity,
 * phenomenon). Selecting an alert highlights its polygon on the ops map.
 */
export function AlertsPanel({
  alerts,
  selectedId,
  onSelect,
  updatedAt,
  source,
}: {
  alerts: WeatherAlert[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  updatedAt: string;
  source: string;
}) {
  const ordered = [...alerts].sort((a, b) => ({ RED: 0, ORANGE: 1, YELLOW: 2 })[a.severity] - ({ RED: 0, ORANGE: 1, YELLOW: 2 })[b.severity]);
  return (
    <section aria-label="Active warnings" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3.5 dark:border-white/10">
        <Megaphone className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
        <h2 className="font-display min-w-0 flex-1 text-sm font-extrabold text-[#0b1e36] dark:text-white">
          Active warnings ({alerts.length})
        </h2>
        <span className="font-mono text-[10px] text-slate-500" title="Demonstration feed — wire the IMD warnings API for production">
          {source} feed
        </span>
      </header>
      {ordered.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">No active warnings.</p>
      ) : (
        <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
          {ordered.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onSelect(selectedId === a.id ? null : a.id)}
                aria-pressed={selectedId === a.id}
                className={`block w-full rounded-none border-l-4 px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c59b48] ${SEVERITY_STYLE[a.severity]} ${selectedId === a.id ? 'brightness-95 ring-1 ring-inset ring-current' : ''}`}
                style={{ borderLeftColor: 'currentColor' }}
              >
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className={`h-2 w-2 rounded-full ${SEVERITY_DOT[a.severity]}`} aria-hidden="true" />
                  {a.severity} — {a.district}, {a.state}
                </span>
                <span className="mt-1 block text-[13px] font-bold leading-snug">{a.phenomenon}</span>
                <span className="mt-0.5 block font-mono text-[11px] opacity-80">Valid {formatRange(a.validFrom, a.validTo)}</span>
                {selectedId === a.id && <span className="mt-1 block text-xs leading-relaxed opacity-90">{a.description}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="border-t border-slate-100 px-4 py-2 font-mono text-[10px] text-slate-500 dark:border-white/10">
        Updated {new Date(updatedAt).toLocaleString('en-IN')} • polygons approximate
      </p>
    </section>
  );
}
