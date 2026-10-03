'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, FlaskConical, Loader2, RotateCcw, Settings2, TableProperties, TestTube2 } from 'lucide-react';
import { MatchResults } from './MatchResults';
import { BacktestPanel } from './BacktestPanel';
import {
  DEFAULT_CONSTRAINTS,
  DEFAULT_WEIGHTS,
  SLIDER_MAX,
  SLIDER_MIN,
  outOfPolicyKeys,
  type MatcherConstraints,
  type MatcherCohortOption,
  type MatcherRunResult,
  type MatcherWeights,
} from '@/services/matcherTypes';

interface OptionsApiResponse {
  success: boolean;
  data?: {
    cohorts: MatcherCohortOption[];
    defaults: { weights: MatcherWeights; constraints: MatcherConstraints };
    slider: { min: number; max: number };
    policyBands: Record<keyof MatcherWeights, [number, number]>;
    regions: string[];
    devPinMode: boolean;
  };
  error?: { message: string };
}

interface RunApiResponse {
  success: boolean;
  data?: MatcherRunResult & { devPin?: boolean };
  error?: { code: string; message: string };
}

const WEIGHT_META: Array<{ key: keyof MatcherWeights; label: string; hint: string }> = [
  { key: 'skill', label: 'Competency overlap', hint: 'Trainer domain proficiency vs track needs' },
  { key: 'rating', label: 'Trainer rating', hint: 'Past performance (neutral 50 if unrated)' },
  { key: 'experience', label: 'Cohorts delivered', hint: 'Experience count (capped at 15)' },
];

/**
 * 55/30/15 matcher simulator shell: Configure (sliders + constraints + PIN
 * guard) → Results (ranked matches, why-expand, override) → Backtest
 * (active weights vs default 55/30/15 on historical cohorts).
 */
export function MatcherSimulator() {
  const [options, setOptions] = useState<OptionsApiResponse['data'] | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [tab, setTab] = useState<'configure' | 'results' | 'backtest'>('configure');

  const [cohortId, setCohortId] = useState('');
  const [weights, setWeights] = useState<MatcherWeights>(DEFAULT_WEIGHTS);
  const [constraints, setConstraints] = useState<MatcherConstraints>(DEFAULT_CONSTRAINTS);
  const [pin, setPin] = useState('');
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [result, setResult] = useState<MatcherRunResult | null>(null);

  useEffect(() => {
    fetch('/api/admin/matcher/options')
      .then(async (res) => {
        const body = (await res.json()) as OptionsApiResponse;
        if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load simulator.');
        setOptions(body.data);
        setWeights(body.data.defaults.weights);
        setConstraints(body.data.defaults.constraints);
        if (body.data.cohorts.length > 0) setCohortId(body.data.cohorts[0].id);
      })
      .catch((e: unknown) => setOptionsError(e instanceof Error ? e.message : 'Could not load simulator.'));
  }, []);

  const sum = weights.skill + weights.rating + weights.experience;
  const sumOk = sum === 100;
  const oop = outOfPolicyKeys(weights);
  const cohort = options?.cohorts.find((c) => c.id === cohortId) ?? null;

  const resetDefaults = useCallback(() => {
    if (!options) return;
    setWeights(options.defaults.weights);
    setConstraints(options.defaults.constraints);
    setPin('');
    setRunError(null);
  }, [options]);

  const run = useCallback(async () => {
    if (!cohortId || !sumOk) return;
    setRunning(true);
    setRunError(null);
    try {
      const res = await fetch('/api/admin/matcher/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cohortId, weights, constraints, ...(oop.length > 0 && pin ? { pin } : {}) }),
      });
      const body = (await res.json()) as RunApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Matcher run failed.');
      setResult(body.data);
      setTab('results');
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Matcher run failed.');
    } finally {
      setRunning(false);
    }
  }, [cohortId, sumOk, weights, constraints, pin, oop.length]);

  if (optionsError) {
    return <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm font-semibold text-slate-500" role="alert">{optionsError}</p>;
  }
  if (!options) {
    return (
      <div aria-busy="true" aria-label="Loading simulator" className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
        ))}
      </div>
    );
  }

  const tabs = [
    { id: 'configure', label: 'Configure', Icon: Settings2 },
    { id: 'results', label: `Results${result ? ` (${result.results.filter((r) => !r.excluded).length})` : ''}`, Icon: TableProperties },
    { id: 'backtest', label: 'Backtest', Icon: TestTube2 },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60" role="tablist" aria-label="Simulator sections">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            disabled={t.id === 'results' && !result}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-40 ${
              tab === t.id ? 'bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36]' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'
            }`}
          >
            <t.Icon className="h-4 w-4" aria-hidden="true" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'configure' && (
        <div className="grid gap-5 xl:grid-cols-2">
          {/* Weights */}
          <section aria-label="Weight configuration" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Weights</h2>
              <button
                type="button"
                onClick={resetDefaults}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                Reset to 55/30/15
              </button>
            </div>
            <div className="mt-4 space-y-5">
              {WEIGHT_META.map(({ key, label, hint }) => {
                const [lo, hi] = options.policyBands[key];
                const out = weights[key] < lo || weights[key] > hi;
                return (
                  <div key={key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <label htmlFor={`w-${key}`} className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
                        {label} <span className="font-normal text-slate-500">({hint})</span>
                      </label>
                      <span className={`rounded-lg px-2 py-0.5 font-mono text-sm font-black ${out ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-slate-100 text-[#0b1e36] dark:bg-white/10 dark:text-white'}`}>
                        {weights[key]}%
                      </span>
                    </div>
                    <input
                      id={`w-${key}`}
                      type="range"
                      min={options.slider.min}
                      max={options.slider.max}
                      step={1}
                      value={weights[key]}
                      onChange={(e) => setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))}
                      aria-describedby={`w-${key}-band`}
                      className="mt-1.5 w-full accent-[#c59b48]"
                    />
                    <p id={`w-${key}-band`} className="font-mono text-[11px] text-slate-500">
                      slider {SLIDER_MIN}–{SLIDER_MAX} • policy band {lo}–{hi}
                      {out && <span className="font-bold text-amber-600 dark:text-amber-400"> • outside policy</span>}
                    </p>
                  </div>
                );
              })}
            </div>
            <div
              className={`mt-4 rounded-xl px-4 py-2.5 text-sm font-extrabold ${sumOk ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}
              role="status"
              aria-live="polite"
            >
              {sumOk ? `Total ${sum}% — valid` : `Weights must total 100% (now ${sum}%)`}
            </div>
            {oop.length > 0 && (
              <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                <p className="flex items-start gap-2 font-bold text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {oop.join(', ')} outside the governance policy band — a super-admin PIN is required to run.
                </p>
                <label htmlFor="matcher-pin" className="mt-2 block text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Super-admin PIN
                </label>
                <input
                  id="matcher-pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN to authorize"
                  autoComplete="off"
                  className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-2 font-mono text-sm focus:border-amber-500 focus:outline-none dark:border-amber-500/30 dark:bg-black/20 dark:text-slate-100"
                />
                {options.devPinMode && (
                  <p className="mt-1.5 flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                    <FlaskConical className="h-3 w-3" aria-hidden="true" />
                    Dev PIN active (SUPER_ADMIN_PIN unset): 000000
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Cohort + constraints */}
          <section aria-label="Cohort and constraints" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Batch & constraints</h2>
            <label htmlFor="matcher-cohort" className="mt-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cohort to staff
            </label>
            <select
              id="matcher-cohort"
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            >
              {options.cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.name} ({c.memberCount} trainees{c.trackCode ? ` • ${c.trackCode}` : ''})
                </option>
              ))}
            </select>
            {cohort && cohort.domains.length > 0 && (
              <p className="mt-1.5 font-mono text-[11px] text-slate-500">Track domains scored: {cohort.domains.join(' • ')}</p>
            )}

            <fieldset className="mt-4 space-y-3">
              <legend className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Constraints engine</legend>
              <label className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                Max trainees per trainer
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={constraints.maxTrainees}
                  onChange={(e) => setConstraints((c) => ({ ...c, maxTrainees: Math.max(1, Number(e.target.value) || 25) }))}
                  className="w-24 rounded-xl border border-slate-200 px-3 py-1.5 font-mono text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20"
                />
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={constraints.avoidConsecutive}
                  onChange={(e) => setConstraints((c) => ({ ...c, avoidConsecutive: e.target.checked }))}
                  className="h-4 w-4 accent-[#c59b48]"
                />
                Avoid same trainer for consecutive cohorts
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={constraints.excludeOnLeave}
                  onChange={(e) => setConstraints((c) => ({ ...c, excludeOnLeave: e.target.checked }))}
                  className="h-4 w-4 accent-[#c59b48]"
                />
                Exclude trainers on leave
                <span className="font-normal text-slate-500">(live from availability)</span>
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                Station / region preference
                <select
                  value={constraints.regionPref}
                  onChange={(e) => setConstraints((c) => ({ ...c, regionPref: e.target.value }))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20"
                >
                  {options.regions.map((r) => (
                    <option key={r} value={r}>{r === 'ANY' ? 'No preference' : r}</option>
                  ))}
                </select>
              </label>
            </fieldset>

            {runError && (
              <p className="mt-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" role="alert">
                {runError}
              </p>
            )}
            <button
              type="button"
              onClick={run}
              disabled={running || !sumOk || !cohortId}
              className="mt-4 w-full rounded-xl bg-[#0b1e36] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
            >
              {running ? 'Running matcher…' : `Run matcher for ${cohort?.code ?? '…'}`}
            </button>
            <p className="mt-2 text-[11px] text-slate-500">Every run is snapshotted (MatcherRun) and audited as MATCHER_RUN.</p>
          </section>
        </div>
      )}

      {tab === 'results' && result && (
        <MatchResults result={result} onRerun={() => setTab('configure')} />
      )}

      {tab === 'backtest' && (
        <BacktestPanel cohorts={options.cohorts} weights={weights} />
      )}
    </div>
  );
}
