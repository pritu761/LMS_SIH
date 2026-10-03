import { redirect } from 'next/navigation';
import { Inbox } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { ApprovalQueueClient } from '@/components/admin/ApprovalQueueClient';
import { getApprovals } from '@/services/adminService';

export const metadata = { title: 'Approval Queue' };

/**
 * GET /admin/approvals — registration review (ADMIN only): pending queue
 * with 48h SLA timers, approve (temp credentials) / reject (mandatory
 * reason) / request-info actions and breach escalation.
 */
export default async function ApprovalsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/admin/approvals');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'ADMIN') redirect('/');

  const data = await getApprovals();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="ADMIN" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Approval queue</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {data.pendingCount} pending • {data.breachedCount} breached • every decision is audited
            </p>
          </div>
        </header>
        <ApprovalQueueClient initial={data} />
      </main>
    </div>
  );
}
