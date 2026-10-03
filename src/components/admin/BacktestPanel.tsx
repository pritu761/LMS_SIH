'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftRight, FlaskConical, Loader2 } from 'lucide-react';
import type { BacktestResult, MatcherCohortOption, MatcherWeights } from '@/services/matcherTypes';

interface BacktestApiResponse {
  success: boolean;
  data?: BacktestResult;
  error?: { message: string };
}

/**
 * Backtesting tab: re-rank one historical cohort under the active slider
 * weights vs default 55/30/15 (fixed neutral constraints). Strictly
 * score-based on live data — top picks, top-3 lists, score delta and
 * rank-order swaps, with a plain-language verdict.
 */
export function BacktestPanel({ cohorts, weights }: { cohorts: MatcherCohortOption[]; weights: MatcherWeights }) {
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? '');
  const [data, setData] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staleWeights, setStaleWeights] = useState(false);

  const load = useCallback(async () => {
    if (!cohortId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ cohortId, skill: String(weights.skill), rating: String(weights.rating), experience: String(weights.experience) });
      const res = await fetch(`/api/admin/matcher/backtest?${params.toString()}`);
      const body = (await res.json()) as BacktestApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Backtest failed.');
      setData(body.data);
      setStaleWeights(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Backtest failed.');
    } finally {
      setLoading(false);
    }
  }, [cohortId, weights.skill, weights.rating, weights.experience]);

  useEffect(() => {
    load();
  }, [load]);

  // Sliders may move while this tab shows an older comparison.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    setStaleWeights(true);
  }, [weights.skill, weights.rating, weights.experience]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <ArrowLeftRight className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
        <label htmlFor="bt-cohort" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Historical batch
        </label>
        <select
          id="bt-cohort"
          value={cohortId}
          onChange={(e) => setCohortId(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
        >
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} — {c.name} ({c.status.toLowerCase()})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={load}
          disabled={loading || !cohortId}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />}
          Re-run backtest
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm font-semibold text-slate-500" role="alert">
          {error}
        </p>
      )}
      {staleWeights && data && !loading && (
        <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" aria-live="polite">
          Slider weights changed since this comparison — re-run to refresh.
        </p>
      )}

      {data && (
        <section aria-label="Backtest comparison" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
          <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
              {data.cohortCode}: active {data.active.weights.skill}/{data.active.weights.rating}/{data.active.weights.experience} vs default 55/30/15
            </h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                  <th scope="col" className="px-5 py-2.5 font-extrabold">Configuration</th>
                  <th scope="col" className="py-2.5 pr-3 font-extrabold">Top pick</th>
                  <th scope="col" className="py-2.5 pr-3 text-right font-extrabold">Top score</th>
                  <th scope="col" className="px-5 py-2.5 font-extrabold">Top 3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {[
                  { row: data.active, tag: 'ACTIVE' },
                  { row: data.def, tag: 'DEFAULT' },
                ].map(({ row, tag }) => (
                  <tr key={tag}>
                    <td className="px-5 py-3">
                      <span className="rounded-md bg-[#0b1e36] px-2 py-0.5 font-mono text-[11px] font-bold text-[#dfb76c]">{tag}</span>
                      <span className="ml-2 font-mono text-xs text-slate-500">{row.weights.skill}/{row.weights.rating}/{row.weights.experience}</span>
                    </td>
                    <td className="py-3 pr-3 font-bold text-slate-700 dark:text-slate-200">{row.topPick ?? '—'}</td>
                    <td className="py-3 pr-3 text-right font-mono font-black text-[#0b1e36] dark:text-white">
                      {row.topScore === null ? '—' : row.topScore}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">{row.topThree.join(' • ') || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-3.5 text-xs font-bold dark:border-white/10">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-600 dark:bg-white/10 dark:text-slate-300">
              Δ top score: {data.deltaTop === null ? '—' : `${data.deltaTop > 0 ? '+' : ''}${data.deltaTop}`}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-600 dark:bg-white/10 dark:text-slate-300">
              rank swaps: {data.rankSwaps}
            </span>
          </div>
          <p className="border-t border-slate-100 px-5 py-3.5 text-sm font-semibold leading-relaxed text-slate-600 dark:border-white/10 dark:text-slate-300">
            {data.verdict}
          </p>
        </section>
      )}
    </div>
  );
}
