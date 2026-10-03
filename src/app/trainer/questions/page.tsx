import { redirect } from 'next/navigation';
import { BookCopy } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { QuestionBankManager } from '@/components/trainer/QuestionBankManager';
import { listBanks } from '@/services/trainerService';

export const metadata = { title: 'Question Bank' };

/**
 * GET /trainer/questions — question bank studio (Section C): create/edit
 * with competency/difficulty/Bloom's/WMO metadata, CSV bulk import with
 * template, filters and per-item analysis.
 */
export default async function QuestionBankPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainer/questions');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const banks = await listBanks(session.userId);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINER" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <BookCopy className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Question bank</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {banks.length} bank(s) • validated metadata • usage-backed item analysis
            </p>
          </div>
        </header>
        <QuestionBankManager banks={banks} />
      </main>
    </div>
  );
}
