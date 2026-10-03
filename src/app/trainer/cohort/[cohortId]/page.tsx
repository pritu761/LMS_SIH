import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { CohortDetailClient } from '@/components/trainer/CohortDetailClient';
import { getCohortDetail, listAuthoringLessons } from '@/services/trainerService';

export const metadata = { title: 'Cohort Detail' };

/**
 * GET /trainer/cohort/[cohortId] — cohort workspace (TRAINER allocations
 * only; ADMIN sees all). Members with live risk flags, session attendance,
 * trainer-only notes and the remediation-pack sender.
 */
export default async function CohortDetailPage({ params }: { params: Promise<{ cohortId: string }> }) {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainer');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const { cohortId } = await params;
  const isAdmin = session.role === 'ADMIN';
  let detail = null;
  try {
    detail = await getCohortDetail(session.userId, isAdmin, cohortId);
  } catch {
    detail = null;
  }
  if (!detail) redirect('/trainer');

  const lessons = (await listAuthoringLessons()).filter((l) => l.status === 'PUBLISHED');

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINER" />
      <main className="min-w-0 flex-1 pb-10">
        <CohortDetailClient cohortId={cohortId} initial={detail} lessons={lessons} />
      </main>
    </div>
  );
}
