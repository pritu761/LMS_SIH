import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { IntegrityBoard } from '@/components/integrity/IntegrityBoard';
import { getAssignedCohorts } from '@/services/trainerService';

export const metadata = { title: 'Proctoring Integrity' };

/**
 * GET /trainer/integrity — attempt oversight for the caller's cohorts
 * (read-only): risk scores, flags and event timelines. Verdict changes
 * are an admin power (see /admin/integrity).
 */
export default async function TrainerIntegrityPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainer/integrity');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'TRAINER' && session.role !== 'ADMIN') redirect('/');

  const cohorts = await getAssignedCohorts(session.userId, session.role === 'ADMIN');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINER" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Proctoring integrity</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">Your cohorts • read-only (verdicts are set by admins)</p>
          </div>
        </header>
        <IntegrityBoard
          endpoint="/api/trainer/integrity"
          verdictEndpoint={null}
          canVerdict={false}
          cohorts={cohorts.map((c) => ({ id: c.id, code: c.code }))}
        />
      </main>
    </div>
  );
}
