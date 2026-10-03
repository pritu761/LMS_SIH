import Link from 'next/link';
import { ArrowRight, FlaskConical, GraduationCap, LineChart, ShieldCheck } from 'lucide-react';
import { MotionSection } from '@/components/shared/MotionPrimitives';

const PERSONAS = [
  {
    href: '/demo/trainee',
    icon: GraduationCap,
    title: 'View as Trainee',
    desc: 'Competency radar, module progress, exam window and earned certificates.',
    accent: 'text-sky-600 dark:text-sky-400',
    chip: 'bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/30',
  },
  {
    href: '/demo/trainer',
    icon: LineChart,
    title: 'View as Trainer',
    desc: 'Cohort gaps, question bank and assessment item analytics.',
    accent: 'text-violet-600 dark:text-violet-400',
    chip: 'bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/30',
  },
  {
    href: '/demo/admin',
    icon: ShieldCheck,
    title: 'View as Admin',
    desc: 'Station readiness map, approval queue and audit trail.',
    accent: 'text-emerald-600 dark:text-emerald-400',
    chip: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30',
  },
];

/**
 * Landing-page band: "Explore Without Login". Routes visitors to the three
 * static persona demos (/demo/trainee, /demo/trainer, /demo/admin).
 */
export function DemoPromoBand() {
  return (
    <section id="demo" aria-labelledby="demo-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 scroll-mt-24">
      <MotionSection variant="slide-up">
        <div className="relative overflow-hidden rounded-[28px] border-2 border-[#c59b48]/40 bg-gradient-to-br from-[#0b1e36] via-[#122c4d] to-[#0b1e36] p-8 text-white shadow-xl sm:p-12">
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#c59b48] to-transparent" aria-hidden="true" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c59b48]/15 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-sans font-bold text-[#dfb76c]">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              EXPLORE WITHOUT LOGIN
            </span>
            <h2 id="demo-heading" className="mt-4 text-2xl sm:text-4xl font-black tracking-tight !text-white">
              Try every role. No account needed.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base !text-slate-200 leading-relaxed">
              Step into fully interactive demo dashboards for trainees, trainers and admins — pre-loaded with realistic
              fictional data. Nothing here is real, and nothing requires sign-in.
            </p>
          </div>
          <div className="relative z-10 mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            {PERSONAS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#c59b48]/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48]"
              >
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border ${p.chip} ${p.accent}`}>
                  <p.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="mt-3 block font-display text-base font-extrabold !text-white">
                  {p.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed !text-slate-300">{p.desc}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#dfb76c]">
                  Open demo
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
          <p className="relative z-10 mt-6 text-center font-mono text-[11px] text-slate-500">
            DEMO MODE — all data on demo pages is fictional mock data.
          </p>
        </div>
      </MotionSection>
    </section>
  );
}
