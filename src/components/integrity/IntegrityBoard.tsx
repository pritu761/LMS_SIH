'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Flag, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useDebouncedValue } from '@/components/catalog/useDebouncedValue';
import type { IntegrityAttemptView } from '@/services/examTypes';

interface BoardApiResponse {
  success: boolean;
  data?: { attempts: IntegrityAttemptView[]; count: number };
  error?: { message: string };
}

const FLAG_STYLE: Record<string, string> = {
  CLEAN: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  REVIEW: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30',
  FLAGGED: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
};

function riskTone(risk: number): string {
  if (risk >= 70) return 'bg-rose-500';
  if (risk >= 30) return 'bg-amber-500';
  return 'bg-emerald-500';
}

/**
 * Integrity board (Section E): per-attempt risk scores, event counts and
 * expandable event-timeline visualizations with CLEAN/REVIEW/FLAGGED
 * statuses. Admins additionally set VALID/INVALID/ESCALATED verdicts
 * (audited server-side); trainers are read-only.
 */
export function IntegrityBoard({
  endpoint,
  verdictEndpoint,
  canVerdict,
  cohorts,
}: {
  endpoint: '/api/trainer/integrity' | '/api/admin/integrity';
  verdictEndpoint: string | null;
  canVerdict: boolean;
  cohorts: Array<{ id: string; code: string }>;
}) {
  const [flag, setFlag] = useState('');
  const [verdict, setVerdict] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [attempts, setAttempts] = useState<IntegrityAttemptView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [working, setWorking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (flag) params.set('flag', flag);
      if (verdict) params.set('verdict', verdict);
      if (cohortId) params.set('cohortId', cohortId);
      if (debouncedQuery) params.set('q', debouncedQuery);
      const res = await fetch(`${endpoint}?${params.toString()}`);
      const body = (await res.json()) as BoardApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load attempts.');
      setAttempts(body.data.attempts);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load attempts.');
    } finally {
      setLoading(false);
    }
  }, [endpoint, flag, verdict, cohortId, debouncedQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const applyVerdict = async (attemptId: string, value: 'VALID' | 'INVALID' | 'ESCALATED') => {
    if (!verdictEndpoint) return;
    setWorking(attemptId + value);
    setNotice(null);
    try {
      const res = await fetch(`${verdictEndpoint}/${attemptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verdict: value }),
      });
      const body = (await res.json()) as { success: boolean; data?: { attempt: IntegrityAttemptView }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Verdict failed.');
      setAttempts((list) => list.map((a) => (a.attemptId === attemptId ? body.data?.attempt as IntegrityAttemptView : a)));
      setNotice(`Attempt marked ${value} — written to the audit log.`);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Verdict failed.');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Flag
          <select value={flag} onChange={(e) => setFlag(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
            <option value="">All flags</option>
            {['CLEAN', 'REVIEW', 'FLAGGED'].map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Verdict
          <select value={verdict} onChange={(e) => setVerdict(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
            <option value="">All verdicts</option>
            {['PENDING', 'VALID', 'INVALID', 'ESCALATED'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </label>
        {cohorts.length > 0 && (
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Cohort
            <select value={cohortId} onChange={(e) => setCohortId(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
              <option value="">All cohorts</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
          </label>
        )}
        <span className="relative min-w-0 flex-1 basis-48" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="integrity-search" className="sr-only">Search trainee</label>
          <input
            id="integrity-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Trainee name or email…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
          />
        </span>
        <span className="ml-auto font-mono text-xs font-bold text-slate-500" aria-live="polite">{attempts.length} attempts</span>
      </div>

      {notice && (
        <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300" aria-live="polite">
          {notice}
        </p>
      )}

      {loading ? (
        <div aria-busy="true" aria-label="Loading attempts" className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-semibold text-slate-500" role="alert">{error}</p>
      ) : attempts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          No attempts match. Proctored attempts appear here with live risk scores.
        </p>
      ) : (
        <ol className="space-y-3">
          {attempts.map((a) => {
            const open = expanded === a.attemptId;
            return (
              <li key={a.attemptId} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
                <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-sm font-black text-white ${riskTone(a.riskScore)}`} aria-label={`Risk score ${a.riskScore}`}>
                    {a.riskScore}
                  </span>
                  <span className="min-w-0 flex-1 basis-48">
                    <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{a.traineeName}</span>
                    <span className="block truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {a.assessmentTitle}{a.cohortCode ? ` • ${a.cohortCode}` : ''} • {a.eventCount} events
                      {a.percentage !== null ? ` • ${a.percentage}%` : ''}
                    </span>
                  </span>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${FLAG_STYLE[a.integrityFlag] ?? FLAG_STYLE.CLEAN}`}>
                    {a.integrityFlag === 'CLEAN' ? <ShieldCheck className="h-3 w-3" aria-hidden="true" /> : <ShieldAlert className="h-3 w-3" aria-hidden="true" />}
                    {a.integrityFlag}
                  </span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    {a.verdict}
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : a.attemptId)}
                    aria-expanded={open}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
                  >
                    Timeline
                    <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                </div>
                {open && (
                  <div className="grid gap-4 border-t border-slate-100 px-4 py-4 sm:px-5 lg:grid-cols-2 dark:border-white/10">
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Event timeline</h3>
                      {a.timeline.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">No events recorded.</p>
                      ) : (
                        <ol className="mt-2 space-y-0 border-l-2 border-slate-200 pl-4 dark:border-white/15">
                          {a.timeline.map((e) => (
                            <li key={e.id} className="relative pb-3 last:pb-0">
                              <span aria-hidden="true" className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${e.type === 'EXAM_START' || e.type === 'EXAM_SUBMIT' ? 'bg-[#c59b48]' : 'bg-slate-300 dark:bg-slate-600'}`} />
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{e.detail}</p>
                              <p className="font-mono text-[11px] text-slate-500">
                                {new Date(e.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </p>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Attempt</h3>
                      <dl className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs dark:bg-black/20">
                        {[
                          ['Started', new Date(a.startedAt).toLocaleString('en-IN')],
                          ['Submitted', a.submittedAt ? new Date(a.submittedAt).toLocaleString('en-IN') : '—'],
                          ['Status', a.status],
                          ['Score', a.percentage === null ? '—' : `${a.percentage}%`],
                        ].map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2">
                            <dt className="font-bold text-slate-500">{k}</dt>
                            <dd className="font-mono text-slate-700 dark:text-slate-200">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {canVerdict && (
                        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={`Verdict for ${a.traineeName}`}>
                          <Flag className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                          {(['VALID', 'INVALID', 'ESCALATED'] as const).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => applyVerdict(a.attemptId, v)}
                              disabled={working !== null || a.verdict === v}
                              aria-pressed={a.verdict === v}
                              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-60 ${
                                a.verdict === v
                                  ? 'border-[#0b1e36] bg-[#0b1e36] text-white dark:border-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]'
                                  : v === 'VALID'
                                    ? 'border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300'
                                    : v === 'INVALID'
                                      ? 'border-rose-300 text-rose-700 hover:bg-rose-50 dark:text-rose-300'
                                      : 'border-amber-300 text-amber-700 hover:bg-amber-50 dark:text-amber-300'
                              }`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
