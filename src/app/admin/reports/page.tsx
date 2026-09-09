import { redirect } from 'next/navigation';
import { TableProperties } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { ReportsExplorer } from '@/components/admin/ReportsExplorer';

export const metadata = { title: 'Reports' };

/**
 * GET /admin/reports — governance reports (ADMIN only): six pre-built
 * reports generated on demand with a custom date window, on-screen preview
 * and CSV / PDF export.
 */
export default async function ReportsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/admin/reports');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'ADMIN') redirect('/');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="ADMIN" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <TableProperties className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Reports</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">On-demand governance evidence • CSV + paginated PDF</p>
          </div>
        </header>
        <ReportsExplorer />
      </main>
    </div>
  );
}
