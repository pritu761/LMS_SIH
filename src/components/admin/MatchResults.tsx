'use client';

import { useState } from 'react';
import { AlertTriangle, Ban, ChevronDown, HelpCircle, Send, Star, X } from 'lucide-react';
import type { MatcherRunResult, RankedTrainer } from '@/services/matcherTypes';

const BADGE_STYLE: Record<RankedTrainer['badge'], string> = {
  BEST_MATCH: 'bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  GOOD_FIT: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  STRETCH: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  EXCLUDED: 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-white/10 dark:text-slate-400 dark:border-white/15',
};

function ContributionBars({ row }: { row: RankedTrainer }) {
  const total = row.contributions.skill + row.contributions.rating + row.contributions.experience;
  const segs = [
    { label: 'Skill', value: row.contributions.skill, cls: 'bg-[#2563eb]' },
    { label: 'Rating', value: row.contributions.rating, cls: 'bg-[#c59b48]' },
    { label: 'Experience', value: row.contributions.experience, cls: 'bg-[#7c3aed]' },
  ];
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" role="img" aria-label={`Score breakdown: skill ${row.contributions.skill}, rating ${row.contributions.rating}, experience ${row.contributions.experience}`}>
        {segs.map((s) => (
          <span key={s.label} className={s.cls} style={{ width: `${total > 0 ? (s.value / total) * 100 : 0}%` }} title={`${s.label}: ${s.value}`} />
        ))}
      </div>
      <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
        {segs.map((s) => (
          <div key={s.label} className="rounded-lg bg-slate-50 px-1 py-1.5 dark:bg-white/5">
            <dt className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">{s.label}</dt>
            <dd className="font-mono text-sm font-black text-slate-700 dark:text-slate-200">+{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Match output table: ranked trainers with composite scores, badges,
 * violation highlights, expandable "why this match" breakdowns (score
 * contributions, best domains, gaps) and per-row admin override.
 */
export function MatchResults({ result, onRerun }: { result: MatcherRunResult; onRerun: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(result.results.find((r) => !r.excluded)?.trainerId ?? null);
  const [overrideFor, setOverrideFor] = useState<RankedTrainer | null>(null);
  const [alternateId, setAlternateId] = useState('');
  const [justification, setJustification] = useState('');
  const [sending, setSending] = useState(false);
  const [overrideMsg, setOverrideMsg] = useState<string | null>(null);
  const [overridden, setOverridden] = useState<string[]>([]);

  const eligible = result.results.filter((r) => !r.excluded);
  const excluded = result.results.filter((r) => r.excluded);

  const submitOverride = async () => {
    if (!overrideFor || !alternateId || justification.trim().length < 10) return;
    setSending(true);
    setOverrideMsg(null);
    try {
      const res = await fetch('/api/admin/matcher/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cohortId: result.cohortId,
          recommendedTrainerId: overrideFor.trainerId,
          alternateTrainerId: alternateId,
          justification: justification.trim(),
          weights: result.weights,
        }),
      });
      const body = (await res.json()) as { success: boolean; data?: { allocated: { name: string; score: number } }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Override failed.');
      setOverrideMsg(`Recorded: ${body.data.allocated.name} allocated to ${result.cohortCode} (score ${body.data.allocated.score}). Audited as OVERRIDE_CREATED.`);
      setOverridden((o) => [...o, overrideFor.trainerId]);
      setOverrideFor(null);
      setAlternateId('');
      setJustification('');
    } catch (e) {
      setOverrideMsg(e instanceof Error ? e.message : 'Override failed.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <p className="min-w-0 flex-1">
          <strong className="font-display text-[#0b1e36] dark:text-white">{result.cohortCode}</strong>
          <span className="text-slate-500 dark:text-slate-400">
            {' '}• {result.weights.skill}/{result.weights.rating}/{result.weights.experience}
            {result.outOfPolicy.length > 0 && <span className="font-bold text-amber-600"> • out-of-policy ({result.outOfPolicy.join(', ')}, PIN used)</span>}
            {' '}• run {result.runId.slice(0, 8)}
          </span>
        </p>
        <button
          type="button"
          onClick={onRerun}
          className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
        >
          Adjust & re-run
        </button>
      </div>

      {overrideMsg && (
        <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300" aria-live="polite">
          {overrideMsg}
        </p>
      )}

      <section aria-label="Ranked trainer matches" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <ol className="divide-y divide-slate-100 dark:divide-white/10">
          {eligible.map((r) => {
            const open = expanded === r.trainerId;
            const wasOverridden = overridden.includes(r.trainerId);
            return (
              <li key={r.trainerId}>
                <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
                  <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-display text-sm font-black ${r.rank === 1 ? 'bg-[#c59b48] text-[#0b1e36]' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300'}`}>
                    {r.rank}
                  </span>
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b1e36]/5 font-display text-xs font-black text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
                    {r.initials}
                  </span>
                  <span className="min-w-0 flex-1 basis-40">
                    <span className="block truncate font-bold text-slate-800 dark:text-slate-100">
                      {r.name}
                      {r.rank === 1 && <Star className="ml-1.5 inline h-3.5 w-3.5 text-[#c59b48]" aria-label="Top recommendation" />}
                    </span>
                    <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                      {r.station ?? 'No station'} • overlap {r.skillOverlapPct}% • ★ {r.rating ?? 'unrated'} • {r.cohortsDelivered} cohorts
                    </span>
                  </span>
                  <span className="w-28 shrink-0" aria-label={`Composite score ${r.composite}`}>
                    <span className="block h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <span className="block h-full rounded-full bg-gradient-to-r from-[#0b1e36] to-[#c59b48]" style={{ width: `${Math.min(100, r.composite)}%` }} />
                    </span>
                    <span className="mt-0.5 block text-right font-mono text-sm font-black text-[#0b1e36] dark:text-white">{r.composite}</span>
                  </span>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${BADGE_STYLE[r.badge]}`}>
                    {r.badge.replace('_', ' ')}
                  </span>
                  {r.violations.length > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" title={r.violations.join(' • ')}>
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      {r.violations.length} flag{r.violations.length === 1 ? '' : 's'}
                    </span>
                  )}
                  {wasOverridden && (
                    <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-extrabold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      OVERRIDDEN
                    </span>
                  )}
                  <span className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : r.trainerId)}
                      aria-expanded={open}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
                    >
                      <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Why?
                      <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOverrideFor(r);
                        setAlternateId('');
                        setJustification('');
                        setOverrideMsg(null);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-violet-300 px-2.5 py-1.5 text-[11px] font-extrabold text-violet-700 hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 dark:text-violet-300"
                    >
                      <Send className="h-3 w-3" aria-hidden="true" />
                      Override
                    </button>
                  </span>
                </div>
                {open && (
                  <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 px-4 py-4 sm:px-5 lg:grid-cols-2 dark:border-white/10 dark:bg-black/20">
                    <ContributionBars row={r} />
                    <div className="space-y-2 text-sm">
                      {r.bestMatched.length > 0 && (
                        <p><strong className="text-emerald-700 dark:text-emerald-300">Best matched:</strong>{' '}<span className="text-slate-600 dark:text-slate-300">{r.bestMatched.join(' • ')}</span></p>
                      )}
                      {r.gaps.length > 0 && (
                        <p><strong className="text-amber-700 dark:text-amber-300">Potential gaps:</strong>{' '}<span className="text-slate-600 dark:text-slate-300">{r.gaps.join(' • ')}</span></p>
                      )}
                      {r.violations.length > 0 && (
                        <ul className="space-y-1">
                          {r.violations.map((v) => (
                            <li key={v} className="flex items-start gap-1.5 rounded-lg bg-amber-100/70 px-2.5 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              {v}
                            </li>
                          ))}
                        </ul>
                      )}
                      {r.violations.length === 0 && (
                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">No constraint violations.</p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {excluded.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 dark:border-white/10">
            <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Ban className="h-3.5 w-3.5" aria-hidden="true" />
              Excluded by the leave filter: {excluded.map((r) => `${r.name} (${r.availability})`).join(', ')}
            </p>
          </div>
        )}
      </section>

      {overrideFor && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="override-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <h2 id="override-title" className="font-display text-lg font-black text-[#0b1e36] dark:text-white">
              Override recommendation
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Recommended: <strong>{overrideFor.name}</strong> ({overrideFor.composite}) for <strong>{result.cohortCode}</strong>.
              The override, both scores and your justification are written to the audit log.
            </p>
            <label htmlFor="override-alt" className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Alternate trainer
            </label>
            <select
              id="override-alt"
              value={alternateId}
              onChange={(e) => setAlternateId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold focus:border-violet-500 focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            >
              <option value="">Select alternate…</option>
              {eligible.filter((r) => r.trainerId !== overrideFor.trainerId).map((r) => (
                <option key={r.trainerId} value={r.trainerId}>
                  {r.name} — composite {r.composite}
                </option>
              ))}
            </select>
            <label htmlFor="override-why" className="mt-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Justification (mandatory, min 10 chars)
            </label>
            <textarea
              id="override-why"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="e.g. Regional language requirement for this cohort…"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setOverrideFor(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={submitOverride}
                disabled={sending || !alternateId || justification.trim().length < 10}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50"
              >
                {sending ? 'Recording…' : 'Record override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
