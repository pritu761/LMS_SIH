import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, BookCopy, LineChart, PenSquare, Users } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { getAssignedCohorts } from '@/services/trainerService';
import { listBanks } from '@/services/trainerService';

export const metadata = { title: 'Faculty Hub' };

/**
 * GET /trainer — faculty overview (TRAINER role; ADMIN admitted by proxy
 * with governance-wide cohort visibility). Assigned cohorts with live
 * stats, question-bank totals and studio shortcuts.
 */
export default async function TrainerOverviewPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainer');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const isAdmin = session.role === 'ADMIN';
  const [cohorts, banks] = await Promise.all([
    getAssignedCohorts(session.userId, isAdmin),
    listBanks(session.userId),
  ]);
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId }, select: { fullName: true } });
  const name = session.fullName || profile?.fullName || 'Faculty';
  const trainees = cohorts.reduce((n, c) => n + c.traineeCount, 0);
  const bankTotal = banks.reduce((n, b) => n + b.total, 0);
  const avgGap = cohorts.length === 0 ? 0 : Math.round(cohorts.reduce((n, c) => n + c.avgGap, 0) / cohorts.length);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINER" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header>
          <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">
            Faculty Hub — welcome, {name.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {cohorts.length} cohort{cohorts.length === 1 ? '' : 's'} • {trainees} trainees • {bankTotal} bank questions
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Assigned cohorts', value: String(cohorts.length) },
            { label: 'Trainees mentored', value: String(trainees) },
            { label: 'Avg cohort gap', value: `${avgGap}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="font-display mt-1 text-3xl font-black text-[#0b1e36] dark:text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <section aria-label="Assigned cohorts" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
          <header className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Cohort management</h2>
          </header>
          {cohorts.length === 0 ? (
            <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
              No cohorts are allocated to you yet. Allocations appear here after the next 55/30/15 matcher run.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                    <th scope="col" className="px-5 py-2.5 font-extrabold">Cohort</th>
                    <th scope="col" className="py-2.5 pr-3 font-extrabold">Station</th>
                    <th scope="col" className="py-2.5 pr-3 text-right font-extrabold">Trainees</th>
                    <th scope="col" className="py-2.5 pr-3 text-right font-extrabold">Avg gap</th>
                    <th scope="col" className="py-2.5 pr-3 font-extrabold">Started</th>
                    <th scope="col" className="px-5 py-2.5 text-right font-extrabold">Open</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                  {cohorts.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="px-5 py-3">
                        <span className="block font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]">{c.code}</span>
                        <span className="block font-bold text-slate-700 dark:text-slate-200">{c.name}</span>
                      </td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{c.station ?? '—'}</td>
                      <td className="py-3 pr-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">{c.traineeCount}</td>
                      <td className="py-3 pr-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">{c.avgGap}%</td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                        {new Date(c.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/trainer/cohort/${c.id}`}
                          aria-label={`Open ${c.code}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0b1e36] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
                        >
                          Manage <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { href: '/trainer/courses/new', icon: PenSquare, title: 'Course authoring', desc: 'Block-based lesson builder with versions' },
            { href: '/trainer/questions', icon: BookCopy, title: 'Question bank', desc: `${bankTotal} questions • CSV import • item analysis` },
            { href: '/trainer/analytics', icon: LineChart, title: 'Analytics', desc: 'Mastery curves, histograms, hardest items' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c59b48]/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/10 dark:bg-[#0b1e36]/60"
            >
              <a.icon className="h-6 w-6 text-[#c59b48]" aria-hidden="true" />
              <span className="font-display mt-2 block text-base font-extrabold text-[#0b1e36] dark:text-white">{a.title}</span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{a.desc}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
