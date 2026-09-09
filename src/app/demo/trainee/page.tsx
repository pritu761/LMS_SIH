import type { Metadata } from 'next';
import Link from 'next/link';
import {
  AlarmClock,
  ArrowRight,
  Award,
  CalendarClock,
  CheckCircle2,
  Circle,
  Compass,
  ListChecks,
  PlayCircle,
  Radar as RadarIcon,
} from 'lucide-react';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { SectionCard } from '@/components/demo/SectionCard';
import { ProgressBar } from '@/components/demo/ProgressBar';
import { CompetencyRadar } from '@/components/demo/CompetencyRadar';
import { demoTrainee } from '@/services/demoData';

export const metadata: Metadata = {
  title: 'Demo: Trainee View',
  description: 'Fictional trainee dashboard demo — competency radar, module progress, exam window and certificates.',
};

const STATUS_META = {
  completed: { label: 'Completed', tone: 'emerald' as const, Icon: CheckCircle2 },
  'in-progress': { label: 'In progress', tone: 'sky' as const, Icon: PlayCircle },
  'not-started': { label: 'Not started', tone: 'navy' as const, Icon: Circle },
};

/**
 * GET /demo/trainee — fictional trainee dashboard. Fully static: all content
 * comes from src/demo-data/demo-trainee.json (no DB calls, no PII).
 */
export default function DemoTraineePage() {
  const d = demoTrainee;
  const gaps = d.competency.map((c) => ({
    ...c,
    gap: Math.round(((c.required - c.current) / c.required) * 100),
  }));
  const maxGap = Math.max(...gaps.map((g) => g.gap));
  const weakest = gaps.reduce((a, b) => (b.gap > a.gap ? b : a));

  return (
    <div className="min-h-screen">
      <DemoBanner persona={`Trainee — ${d.persona.name}`} />
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        {/* Persona header */}
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
            {[d.persona.track, d.persona.cohort].map((chip) => (
              <span
                key={chip}
                className="rounded-lg bg-[#0b1e36]/5 px-2.5 py-1 font-mono text-xs font-bold text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]"
              >
                {chip}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-6 grid gap-5 xl:grid-cols-3">
          {/* Competency radar */}
          <SectionCard
            icon={RadarIcon}
            title="Competency radar"
            subtitle="Current level (blue) vs required level (red dashed)"
            className="xl:col-span-2"
          >
            <div className="grid items-center gap-6 md:grid-cols-2">
              <CompetencyRadar data={d.competency} />
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Gap per domain
                </h3>
                <ul className="mt-3 space-y-3">
                  {gaps.map((g) => (
                    <li key={g.domain}>
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200">{g.domain}</span>
                        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                          {g.current}/{g.required} • <strong className="text-rose-600 dark:text-rose-400">{g.gap}% gap</strong>
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${g.domain} gap`}
                        aria-valuenow={g.gap}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                      >
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{ width: `${Math.round((g.gap / maxGap) * 100)}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                  Weakest domain: {weakest.domain} ({weakest.gap}% gap) — targeted below.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Upcoming exam */}
          <SectionCard icon={AlarmClock} title="Upcoming exam" subtitle="Proctored window">
            <h3 className="font-display text-base font-extrabold leading-snug text-[#0b1e36] dark:text-white">
              {d.upcomingExam.title}
            </h3>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-[#9a7224] dark:text-[#dfb76c]">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {d.upcomingExam.window}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
              {[
                ['Duration', `${d.upcomingExam.durationMin} min`],
                ['Questions', String(d.upcomingExam.questions)],
                ['Passing', `${d.upcomingExam.passing}%`],
                ['Attempts left', String(d.upcomingExam.attemptsLeft)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 px-2 py-2.5 dark:bg-white/5">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{k}</dt>
                  <dd className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
              {d.upcomingExam.mode}
            </p>
          </SectionCard>

          {/* Module progress */}
          <SectionCard
            icon={ListChecks}
            title="Module progress"
            subtitle={`${d.moduleProgress.filter((m) => m.status === 'completed').length} of ${d.moduleProgress.length} modules complete`}
          >
            <ul className="space-y-4">
              {d.moduleProgress.map((m) => {
                const meta = STATUS_META[m.status];
                return (
                  <li key={m.code}>
                    <div className="flex items-center gap-2">
                      <meta.Icon
                        className={`h-4 w-4 shrink-0 ${m.status === 'completed' ? 'text-emerald-500' : m.status === 'in-progress' ? 'text-sky-500' : 'text-slate-300 dark:text-slate-600'}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                        <span className="mr-1.5 font-mono text-[11px] text-[#9a7224] dark:text-[#dfb76c]">{m.code}</span>
                        {m.title}
                      </span>
                      <span className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-1.5 pl-6">
                      <ProgressBar
                        label={`${m.code} progress`}
                        detail={`${m.completedLessons}/${m.totalLessons} lessons • ${m.percent}%`}
                        percent={m.percent}
                        tone={meta.tone}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </SectionCard>

          {/* Recommended next */}
          <SectionCard icon={Compass} title="Recommended next" subtitle="Picked from your weakest domain">
            <p className="font-mono text-[11px] font-bold text-[#9a7224] dark:text-[#dfb76c]">{d.recommendedNext.module}</p>
            <h3 className="font-display mt-1 text-base font-extrabold text-[#0b1e36] dark:text-white">
              {d.recommendedNext.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{d.recommendedNext.reason}</p>
            <p className="mt-2 font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {d.recommendedNext.code} • ~{d.recommendedNext.estMin} min
            </p>
            <Link
              href="/catalog/DRSTC"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#c59b48] px-4 py-2.5 text-sm font-extrabold text-[#0b1e36] transition-colors hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1e36] focus-visible:ring-offset-2"
            >
              Open the DRSTC outline
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </SectionCard>

          {/* Certificate */}
          <SectionCard icon={Award} title="Certificate earned" subtitle="Verifiable credential">
            <div className="rounded-2xl border-2 border-[#c59b48]/50 bg-gradient-to-br from-[#c59b48]/15 via-transparent to-[#0b1e36]/5 p-5 text-center dark:from-[#c59b48]/20">
              <Award className="mx-auto h-10 w-10 text-[#c59b48]" aria-hidden="true" />
              <h3 className="font-display mt-2 text-base font-extrabold text-[#0b1e36] dark:text-white">
                {d.certificate.title}
              </h3>
              <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                {d.certificate.track} • Issued {d.certificate.issued} • Score {d.certificate.score} ({d.certificate.grade})
              </p>
              <p className="mt-3 break-all rounded-lg bg-white/70 px-3 py-2 font-mono text-[11px] text-slate-600 dark:bg-black/30 dark:text-slate-300">
                Verify: /verify/{d.certificate.verificationId}
              </p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
