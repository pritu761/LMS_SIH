import type { Metadata } from 'next';
import {
  AlertTriangle,
  BarChart3,
  BookCopy,
  CheckCircle2,
  ClipboardList,
  Users,
} from 'lucide-react';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { SectionCard } from '@/components/demo/SectionCard';
import { ProgressBar } from '@/components/demo/ProgressBar';
import { demoTrainer } from '@/services/demoData';

export const metadata: Metadata = {
  title: 'Demo: Trainer View',
  description: 'Fictional trainer dashboard demo — cohorts, learner gaps, question bank and assessment analytics.',
};

function verdictTone(verdict: string): string {
  if (verdict.startsWith('Good')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30';
  if (verdict.startsWith('Review')) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/30';
  return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30';
}

/**
 * GET /demo/trainer — fictional trainer dashboard. Fully static: all content
 * comes from src/demo-data/demo-trainer.json (no DB calls, no PII).
 */
export default function DemoTrainerPage() {
  const d = demoTrainer;
  const bankMax = Math.max(...d.questionBank.byDifficulty.map((b) => b.count), 1);

  return (
    <div className="min-h-screen">
      <DemoBanner persona={`Trainer — ${d.persona.name}`} />
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1e36] font-display text-lg font-black text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]"
          >
            {d.persona.initials}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black text-[#0b1e36] sm:text-3xl dark:text-white">
              {d.persona.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {d.persona.headline} • {d.persona.station}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <span className="rounded-lg bg-[#0b1e36]/5 px-2.5 py-1 font-mono text-xs font-bold text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
              ★ {d.persona.rating} rating
            </span>
            <span className="rounded-lg bg-[#0b1e36]/5 px-2.5 py-1 font-mono text-xs font-bold text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
              {d.persona.cohortsDelivered} cohorts delivered
            </span>
          </div>
        </header>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {/* Cohorts */}
          <SectionCard
            icon={Users}
            title={`Assigned cohorts (${d.cohorts.length})`}
            subtitle="Trainee count, average gap and status"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                    <th scope="col" className="py-2 pr-3 font-extrabold">Cohort</th>
                    <th scope="col" className="py-2 pr-3 font-extrabold">Station</th>
                    <th scope="col" className="py-2 pr-3 text-right font-extrabold">Trainees</th>
                    <th scope="col" className="py-2 pr-3 text-right font-extrabold">Avg gap</th>
                    <th scope="col" className="py-2 font-extrabold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {d.cohorts.map((c) => (
                    <tr key={c.code} className="align-top">
                      <td className="py-3 pr-3">
                        <span className="block font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]">{c.code}</span>
                        <span className="block font-bold text-slate-700 dark:text-slate-200">{c.name}</span>
                        <span className="block text-xs text-slate-500">Since {c.start}</span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{c.station}</td>
                      <td className="py-3 pr-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">{c.trainees}</td>
                      <td className="py-3 pr-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">{c.avgGap}%</td>
                      <td className="py-3">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${
                            c.status === 'ACTIVE'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                              : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400'
                          }`}
                        >
                          {c.status === 'ACTIVE' ? 'Active' : 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Learners with gap scores */}
          <SectionCard
            icon={ClipboardList}
            title={`Learners — DRSTC-04 (${d.learners.length})`}
            subtitle="Overall readiness, attendance and top competency gaps"
          >
            <ul className="space-y-4">
              {d.learners.map((l) => (
                <li key={l.name} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1e36]/5 font-display text-sm font-black text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]"
                    >
                      {l.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{l.name}</span>
                      <span className="block text-xs text-slate-500 dark:text-slate-400">
                        {l.station} • {l.attendance}% attendance • active {l.lastActive}
                      </span>
                    </span>
                    {l.risk ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                        At risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        On track
                      </span>
                    )}
                  </div>
                  {l.risk && l.riskReason && (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                      {l.riskReason}
                    </p>
                  )}
                  <div className="mt-3 space-y-2.5">
                    {l.gaps.map((g) => (
                      <ProgressBar key={g.domain} label={g.domain} detail={`${g.gap}% gap`} percent={g.gap} tone="rose" />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          {/* Question bank */}
          <SectionCard
            icon={BookCopy}
            title={d.questionBank.name}
            subtitle="Starter bank snapshot"
            action={
              <span className="rounded-xl bg-[#0b1e36] px-3 py-1.5 font-mono text-sm font-black text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
                {d.questionBank.total} questions
              </span>
            }
          >
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              By difficulty
            </h3>
            <ul className="mt-2 space-y-2.5">
              {d.questionBank.byDifficulty.map((b) => (
                <li key={b.label}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{b.label}</span>
                    <span className="font-mono text-xs font-bold text-slate-500">{b.count}</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${b.label} questions`}
                    aria-valuenow={b.count}
                    aria-valuemin={0}
                    aria-valuemax={bankMax}
                    className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                  >
                    <div className="h-full rounded-full bg-[#c59b48]" style={{ width: `${(b.count / bankMax) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <h3 className="mt-5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              By domain
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.questionBank.byDomain.map((b) => (
                <span
                  key={b.label}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300"
                >
                  {b.label} × {b.count}
                </span>
              ))}
            </div>
          </SectionCard>

          {/* Assessment analytics */}
          <SectionCard
            icon={BarChart3}
            title="Sample assessment analytics"
            subtitle={`${d.sampleAssessment.title} • ${d.sampleAssessment.attempts} attempts • avg ${d.sampleAssessment.avgScore} • pass ${d.sampleAssessment.passRate}%`}
          >
            <ol className="space-y-4">
              {d.sampleAssessment.items.map((item) => (
                <li key={item.id} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#0b1e36] px-2 py-0.5 font-mono text-[11px] font-bold text-[#dfb76c]">
                      {item.id}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {item.competency}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {item.difficulty}
                    </span>
                    <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${verdictTone(item.verdict)}`}>
                      {item.verdict}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">{item.topic}</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400">Difficulty index</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {item.difficultyIndex.toFixed(2)}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${item.id} difficulty index`}
                        aria-valuenow={Math.round(item.difficultyIndex * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                      >
                        <div className="h-full rounded-full bg-sky-500" style={{ width: `${item.difficultyIndex * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-slate-500 dark:text-slate-400">Discrimination</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                          {item.discrimination.toFixed(2)}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${item.id} discrimination index`}
                        aria-valuenow={Math.round(item.discrimination * 100)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                      >
                        <div
                          className={`h-full rounded-full ${item.discrimination >= 0.3 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                          style={{ width: `${item.discrimination * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Reading guide: difficulty 0.30–0.80 is ideal (higher = easier); discrimination ≥ 0.30 separates strong
              from weak trainees. Q4 and Q5 are flagged for revision.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
