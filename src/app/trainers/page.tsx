import Link from 'next/link';
import { redirect } from 'next/navigation';
import { GraduationCap } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Trainer Directory' };

/**
 * GET /trainers — authenticated directory of approved faculty (all roles):
 * specialization, rating, cohorts delivered and strongest domains, with
 * stable per-trainer anchors for global-search deep links.
 */
export default async function TrainersPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainers');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const trainers = await prisma.user.findMany({
    where: { role: 'TRAINER', status: 'APPROVED' },
    orderBy: { createdAt: 'asc' },
    include: {
      profile: { select: { fullName: true, headline: true, organization: true } },
      station: { select: { name: true } },
      competencies: { include: { competency: { select: { domainCode: true } } }, orderBy: { proficiencyLevel: 'desc' }, take: 3 },
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#9a7224] dark:text-[#dfb76c]">
          IMD Faculty
        </p>
        <h1 className="font-display mt-2 text-3xl font-black text-[#0b1e36] dark:text-white">Trainer directory</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {trainers.length} approved facult{trainers.length === 1 ? 'y' : 'ies'} • specializations, ratings and strongest domains
        </p>
      </header>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trainers.map((t) => {
          const name = t.profile?.fullName ?? t.email;
          const domains = t.competencies.map((c) => c.competency.domainCode).filter((d): d is string => !!d);
          return (
            <article
              key={t.id}
              id={t.id}
              aria-label={name}
              className="flex scroll-mt-24 flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60"
            >
              <span className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] font-display text-sm font-black text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
                  {name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-base font-extrabold text-[#0b1e36] dark:text-white">{name}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {t.specialization ?? t.profile?.headline ?? 'IMD Faculty'}
                    {t.station ? ` • ${t.station.name}` : ''}
                  </span>
                </span>
              </span>
              {domains.length > 0 && (
                <span className="flex flex-wrap gap-1.5" aria-label="Strongest domains">
                  {domains.map((d) => (
                    <span key={d} className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      {d}
                    </span>
                  ))}
                </span>
              )}
              <span className="mt-auto flex items-center justify-between pt-1 font-mono text-[11px] font-bold text-slate-500">
                <span>{t.rating !== null && t.rating !== undefined ? `★ ${Number(t.rating).toFixed(1)} rating` : 'Unrated'}</span>
                <span>{t.cohortsDelivered} cohort(s)</span>
              </span>
              <Link
                href="/catalog"
                className="mt-1 inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-extrabold text-slate-600 transition-colors hover:border-[#c59b48] hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
              >
                Browse tracks they teach
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
