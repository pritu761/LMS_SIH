'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Radar as RadarIcon, TriangleAlert } from 'lucide-react';
import type { TraineeCompetencyPoint } from '@/services/traineeTypes';

interface ProfileApiResponse {
  success: boolean;
  data?: { points: TraineeCompetencyPoint[] };
  error?: { code: string; message: string };
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  dataKey?: string | number;
  color?: string;
}

function RadarTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0];
  const domain = typeof label === 'string' ? label : (point.name ?? '');
  const current = payload.find((p) => p.dataKey === 'Current')?.value;
  const required = payload.find((p) => p.dataKey === 'Required')?.value;
  const gap =
    typeof current === 'number' && typeof required === 'number' && required > 0
      ? Math.round(((required - current) / required) * 100)
      : null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/15 dark:bg-slate-900">
      <p className="font-mono font-extrabold text-[#0b1e36] dark:text-white">{domain}</p>
      <p className="mt-1 font-semibold text-slate-600 dark:text-slate-300">
        Current <span className="font-mono font-bold text-[#2563eb]">{current}</span> • Required{' '}
        <span className="font-mono font-bold text-[#dc2626]">{required}</span>
        {gap !== null && (
          <>
            {' '}• <span className="font-bold text-rose-600">gap {gap}%</span>
          </>
        )}
      </p>
    </div>
  );
}

/**
 * Competency radar (Section A): current vs required levels per domain with
 * per-domain gap %. Data is fetched from /api/trainee/competency-profile
 * (own data only, RBAC enforced server-side), with retry on failure.
 */
export function CompetencyRadarCard() {
  const [points, setPoints] = useState<TraineeCompetencyPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch('/api/trainee/competency-profile')
      .then(async (res) => {
        const body = (await res.json()) as ProfileApiResponse;
        if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load competency profile.');
        setPoints(body.data.points);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load competency profile.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = points?.map((p) => ({ domain: p.domain, Current: p.score, Required: p.requiredScore, gap: p.gap })) ?? [];
  const weakest = points ? [...points].sort((a, b) => b.gap - a.gap)[0] : null;

  return (
    <section id="competency" aria-labelledby="competency-heading" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
          <RadarIcon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <h2 id="competency-heading" className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
            Competency radar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current level (blue) vs required level (red dashed)</p>
        </span>
      </header>
      <div className="p-5">
        {loading && (
          <div aria-busy="true" aria-label="Loading competency chart" className="h-[340px] animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
        )}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-white/15">
            <TriangleAlert className="h-8 w-8 text-amber-500" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{error}</p>
            <button
              type="button"
              onClick={load}
              className="rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-bold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
            >
              Retry
            </button>
          </div>
        )}
        {!loading && !error && points && (
          <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="h-[340px] w-full" role="img" aria-label={`Competency radar. ${points.map((p) => `${p.domain} ${p.score} of ${p.requiredScore}`).join('; ')}`}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={rows} outerRadius="72%">
                  <PolarGrid stroke="#94a3b8" strokeOpacity={0.35} />
                  <PolarAngleAxis dataKey="domain" tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                  <Radar name="Required" dataKey="Required" stroke="#dc2626" strokeWidth={2} strokeDasharray="6 4" fill="none" />
                  <Radar name="Current" dataKey="Current" stroke="#2563eb" strokeWidth={2.5} fill="#2563eb" fillOpacity={0.32} />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gap per domain</h3>
              <ul className="mt-2 space-y-2.5">
                {points.map((p) => (
                  <li key={p.domain}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{p.domain}</span>
                      <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                        {p.score}/{p.requiredScore} • <strong className="text-rose-600 dark:text-rose-400">{Math.round((p.gap / p.requiredScore) * 100)}% gap</strong>
                      </span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`${p.domain} gap`}
                      aria-valuenow={Math.round((p.gap / p.requiredScore) * 100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                    >
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.min(100, (p.gap / p.requiredScore) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              {weakest && (
                <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  Weakest domain: {weakest.domain} — the player below recommends where to start.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
