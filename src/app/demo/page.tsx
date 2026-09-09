import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Award, FlaskConical, GraduationCap, LineChart, ShieldCheck } from 'lucide-react';
import { DemoBanner } from '@/components/demo/DemoBanner';

export const metadata: Metadata = {
  title: 'Explore Without Login',
  description:
    'Try CapacityConnect as a trainee, trainer or admin with realistic fictional demo data. No account, no real records.',
};

const PERSONAS = [
  {
    href: '/demo/trainee',
    icon: GraduationCap,
    code: 'TRAINEE',
    title: 'Trainee dashboard',
    bullets: ['Competency radar vs required levels', 'Module progress + exam window', 'Recommended next lesson + certificate'],
    style: 'hover:border-sky-400/60',
    iconStyle: 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  },
  {
    href: '/demo/trainer',
    icon: LineChart,
    code: 'TRAINER',
    title: 'Trainer dashboard',
    bullets: ['Cohort list + learner gap scores', 'Question bank snapshot', 'Assessment item analytics'],
    style: 'hover:border-violet-400/60',
    iconStyle:
      'bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
  },
  {
    href: '/demo/admin',
    icon: ShieldCheck,
    code: 'ADMIN',
    title: 'Admin dashboard',
    bullets: ['38-station readiness map', 'Approval queue + audit trail', 'Bulk ops preview (disabled)'],
    style: 'hover:border-emerald-400/60',
    iconStyle:
      'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  },
];

/**
 * GET /demo — persona picker for Demo Mode. Fully static: no DB calls, all
 * downstream dashboards render from local mock JSON via @/services/demoData.
 */
export default function DemoHubPage() {
  return (
    <div className="min-h-screen">
      <DemoBanner persona="Overview" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#c59b48]/40 bg-[#c59b48]/10 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a7224] dark:text-[#dfb76c]">
            <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
            Explore without login
          </p>
          <h1 className="font-display mt-4 text-3xl font-black text-[#0b1e36] sm:text-4xl dark:text-white">
            Pick a role. Look around.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            Three fully interactive demo dashboards, pre-loaded with fictional IMD data. No account, no tracking, no
            real records — <Link href="/auth/login" className="font-bold text-[#9a7224] underline decoration-[#c59b48]/60 underline-offset-2 hover:text-[#0b1e36] dark:text-[#dfb76c]">sign in</Link> any
            time for your live data.
          </p>
        </header>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {PERSONAS.map((p) => (
            <article
              key={p.href}
              className={`group flex flex-col rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl sm:p-7 dark:border-white/10 dark:bg-[#0b1e36]/60 ${p.style}`}
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border ${p.iconStyle}`}>
                <p.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <p className="mt-4 font-mono text-[11px] font-bold tracking-[0.18em] text-slate-500">{p.code}</p>
              <h2 className="font-display mt-1 text-xl font-extrabold text-[#0b1e36] dark:text-white">{p.title}</h2>
              <ul className="mt-3 flex-1 space-y-2">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-[#c59b48]" aria-hidden="true" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={p.href}
                aria-label={`View demo as ${p.code.toLowerCase()}`}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b1e36] px-5 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] focus-visible:ring-offset-2 dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
              >
                View as {p.code.charAt(0) + p.code.slice(1).toLowerCase()}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-slate-500">
          DEMO MODE — every name, score, station and log entry on demo pages is fictional.
        </p>
      </div>
    </div>
  );
}
