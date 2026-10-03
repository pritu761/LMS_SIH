'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Camera, Download, LineChart as LineChartIcon, Loader2 } from 'lucide-react';
import { toCsv } from '@/lib/csv';
import type { AssignedCohort, TrainerAnalytics } from '@/services/trainerTypes';

interface AnalyticsApiResponse {
  success: boolean;
  data?: TrainerAnalytics;
  error?: { message: string };
}

function downloadFile(filename: string, href: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const blob = new Blob([toCsv(header, rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  downloadFile(filename, url);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Rasterize a rendered chart SVG to PNG (2x) via canvas. Exported PNGs use
 * system fonts (SVG text does not embed page fonts) — fine for reports.
 */
function exportSvgAsPng(container: HTMLElement | null, filename: string) {
  const svg = container?.querySelector('svg');
  if (!svg) return;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const xml = new XMLSerializer().serializeToString(clone);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const img = new Image();
  img.onload = () => {
    const w = svg.clientWidth > 0 ? svg.clientWidth * 2 : 1200;
    const h = svg.clientHeight > 0 ? svg.clientHeight * 2 : 600;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    downloadFile(filename, canvas.toDataURL('image/png'));
  };
  img.src = `data:image/svg+xml;base64,${svg64}`;
}

const AXIS_TICK = { fontSize: 11, fontWeight: 700, fill: '#64748b' } as const;

/**
 * Trainer analytics (Section D): cohort mastery curve, domain score
 * distribution, time-on-task, score histogram and hardest items — each with
 * CSV export, plus PNG export for the chart panels.
 */
export function AnalyticsDash({ cohorts, initial }: { cohorts: AssignedCohort[]; initial: TrainerAnalytics }) {
  const [cohortId, setCohortId] = useState<string>('');
  const [data, setData] = useState<TrainerAnalytics>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const masteryRef = useRef<HTMLDivElement>(null);
  const domainRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);
  const histRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = id ? `/api/trainer/analytics?cohort=${id}` : '/api/trainer/analytics';
      const res = await fetch(url);
      const body = (await res.json()) as AnalyticsApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load analytics.');
      setData(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (cohortId) load(cohortId);
  }, [cohortId, load]);

  const slug = data.cohortCode ?? 'all-cohorts';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <label htmlFor="an-cohort" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Cohort scope
        </label>
        <select
          id="an-cohort"
          value={cohortId}
          onChange={(e) => setCohortId(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
        >
          <option value="">All my cohorts ({data.members} trainees)</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-[#c59b48]" aria-label="Loading analytics" />}
      </div>

      {error && (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm font-semibold text-slate-500" role="alert">
          {error}
        </p>
      )}

      {data.members === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
          No trainees in scope yet — analytics appear once cohorts have members and attempts.
        </p>
      ) : (
        <>
          {/* Mastery curve */}
          <ChartCard
            title="Cohort mastery curve"
            subtitle="Weekly average score • attempts • lessons completed (12 weeks)"
            onCsv={() =>
              downloadCsv(`mastery-${slug}.csv`, ['week', 'avg_score', 'attempts', 'lessons_completed'], data.masteryCurve.map((p) => [p.week, p.avgScore === null ? '' : String(p.avgScore), String(p.attempts), String(p.lessonsCompleted)]))
            }
            onPng={() => exportSvgAsPng(masteryRef.current, `mastery-${slug}.png`)}
          >
            <div ref={masteryRef} className="h-[300px] w-full" role="img" aria-label="Cohort mastery curve over the last 12 weeks">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.masteryCurve} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                  <XAxis dataKey="week" tick={AXIS_TICK} />
                  <YAxis yAxisId="score" domain={[0, 100]} tick={AXIS_TICK} />
                  <YAxis yAxisId="count" orientation="right" tick={AXIS_TICK} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="count" dataKey="attempts" name="Attempts" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="score" type="monotone" dataKey="avgScore" name="Avg score %" stroke="#0b1e36" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
                  <Line yAxisId="count" type="monotone" dataKey="lessonsCompleted" name="Lessons done" stroke="#c59b48" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* Domain distribution */}
            <ChartCard
              title="Domain score distribution"
              subtitle="Mean current vs required per domain"
              onCsv={() => downloadCsv(`domains-${slug}.csv`, ['domain', 'avg', 'required', 'members'], data.domainDist.map((d) => [d.domain, String(d.avg), String(d.required), String(d.members)]))}
              onPng={() => exportSvgAsPng(domainRef.current, `domains-${slug}.png`)}
            >
              <div ref={domainRef} className="h-[280px] w-full" role="img" aria-label="Average versus required score per domain">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.domainDist} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                    <XAxis dataKey="domain" tick={{ ...AXIS_TICK, fontSize: 10 }} interval={0} angle={-18} dy={10} height={56} />
                    <YAxis domain={[0, 100]} tick={AXIS_TICK} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avg" name="Average" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="required" name="Required" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Time on task */}
            <ChartCard
              title="Time on task per module"
              subtitle="Attempt minutes + completed lessons"
              onCsv={() => downloadCsv(`time-on-task-${slug}.csv`, ['module', 'minutes', 'lessons'], data.timeOnTask.map((t) => [t.module, String(t.minutes), String(t.lessons)]))}
              onPng={() => exportSvgAsPng(timeRef.current, `time-on-task-${slug}.png`)}
            >
              <div ref={timeRef} className="h-[280px] w-full" role="img" aria-label="Time on task per module">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.timeOnTask} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                    <XAxis type="number" tick={AXIS_TICK} />
                    <YAxis type="category" dataKey="module" width={104} tick={{ ...AXIS_TICK, fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="minutes" name="Minutes" fill="#c59b48" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {/* Histogram */}
            <ChartCard
              title="Assessment score histogram"
              subtitle="Distribution of attempt percentages"
              onCsv={() => downloadCsv(`histogram-${slug}.csv`, ['bin', 'count'], data.histogram.map((h) => [h.bin, String(h.count)]))}
              onPng={() => exportSvgAsPng(histRef.current, `histogram-${slug}.png`)}
            >
              <div ref={histRef} className="h-[260px] w-full" role="img" aria-label="Histogram of assessment scores">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.histogram} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                    <XAxis dataKey="bin" tick={{ ...AXIS_TICK, fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={AXIS_TICK} />
                    <Tooltip />
                    <Bar dataKey="count" name="Attempts" fill="#0b1e36" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Hardest */}
            <section aria-label="Hardest questions" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
              <header className="flex items-center justify-between gap-2 border-b border-slate-100 px-5 py-4 dark:border-white/10">
                <div>
                  <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Top 5 hardest questions</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Lowest % correct (min 3 attempts)</p>
                </div>
                <button
                  type="button"
                  onClick={() => downloadCsv(`hardest-${slug}.csv`, ['topic', 'competency', 'difficulty_index', 'discrimination', 'attempts'], data.hardest.map((h) => [h.topic, h.competency ?? '', String(h.difficultyIndex), h.discrimination === null ? '' : String(h.discrimination), String(h.attempts)]))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  CSV
                </button>
              </header>
              {data.hardest.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">Not enough attempt data yet (need 3+ attempts per item).</p>
              ) : (
                <ol className="divide-y divide-slate-100 dark:divide-white/10">
                  {data.hardest.map((h, i) => (
                    <li key={h.id} className="flex items-start gap-3 px-5 py-3.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 font-mono text-xs font-black text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-bold leading-snug text-slate-800 dark:text-slate-100">{h.topic}</span>
                        <span className="mt-1 block font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {h.competency ?? '—'} • {Math.round(h.difficultyIndex * 100)}% correct • {h.attempts} attempts
                          {h.discrimination !== null ? ` • disc ${h.discrimination.toFixed(2)}` : ''}
                        </span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  onCsv,
  onPng,
  children,
}: {
  title: string;
  subtitle: string;
  onCsv: () => void;
  onPng: () => void;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <LineChartIcon className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </span>
        <span className="flex gap-1.5">
          <button
            type="button"
            onClick={onCsv}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            CSV
          </button>
          <button
            type="button"
            onClick={onPng}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
          >
            <Camera className="h-3 w-3" aria-hidden="true" />
            PNG
          </button>
        </span>
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}
