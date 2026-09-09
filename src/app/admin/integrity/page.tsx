import { redirect } from 'next/navigation';
import { ShieldAlert } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { IntegrityBoard } from '@/components/integrity/IntegrityBoard';
import { prisma } from '@/lib/prisma';

export const metadata = { title: 'Exam Integrity' };

/**
 * GET /admin/integrity — governance-wide attempt oversight (ADMIN only)
 * with VALID / INVALID / ESCALATED verdicts (audited as ATTEMPT_VERDICT).
 */
export default async function AdminIntegrityPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/admin/integrity');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'ADMIN') redirect('/');

  // Cohort filter options (governance-wide).
  const cohorts = await prisma.cohort.findMany({ orderBy: { code: 'asc' }, select: { id: true, code: true } });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="ADMIN" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Exam integrity</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">All attempts • verdicts are audit-logged</p>
          </div>
        </header>
        <IntegrityBoard
          endpoint="/api/admin/integrity"
          verdictEndpoint="/api/admin/integrity"
          canVerdict
          cohorts={cohorts}
        />
      </main>
    </div>
  );
}
