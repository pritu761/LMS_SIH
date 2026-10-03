import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { ExamRunner } from '@/components/exam/ExamRunner';

export const metadata = { title: 'Proctored Exam', robots: { index: false, follow: false } };

/**
 * GET /exam/[examId] — proctored assessment delivery (authenticated
 * trainees; admins may preview the flow). All question data arrives via
 * ephemeral attempt-scoped API calls — never baked into HTML, never
 * localStorage. Copy/paste and context menu are disabled during delivery.
 */
export default async function ExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/exam');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'TRAINEE' && session.role !== 'ADMIN') redirect('/');

  const { examId } = await params;
  return <ExamRunner examId={examId} />;
}
