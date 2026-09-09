import { redirect } from 'next/navigation';
import { LineChart } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { AnalyticsDash } from '@/components/trainer/AnalyticsDash';
import { getAssignedCohorts, getTrainerAnalytics } from '@/services/trainerService';

export const metadata = { title: 'Trainer Analytics' };

/**
 * GET /trainer/analytics — trainer analytics (Section D): mastery curves,
 * domain distribution, time-on-task, score histogram and hardest items,
 * scoped to the caller's cohorts. Every panel exports CSV; charts export PNG.
 */
export default async function TrainerAnalyticsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainer/analytics');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const isAdmin = session.role === 'ADMIN';
  const [cohorts, initial] = await Promise.all([
    getAssignedCohorts(session.userId, isAdmin),
    getTrainerAnalytics(session.userId, isAdmin, null),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINER" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <LineChart className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Trainer analytics</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {initial.members} trainee(s) in scope • attempt-backed • export any panel
            </p>
          </div>
        </header>
        <AnalyticsDash cohorts={cohorts} initial={initial} />
      </main>
    </div>
  );
}
