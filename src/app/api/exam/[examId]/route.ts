import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getExamMeta } from '@/services/examService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/exam/[examId] — TRAINEE/ADMIN (own data). Pre-exam metadata:
 * title, limits, attempt budget, question count, rules and the trainee's
 * identity block for the confirmation step. No questions, no answers.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await requireTraineeSession();
    const { examId: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Exam id is invalid.');
    const meta = await getExamMeta(session.userId, parsed.data);
    if (!meta) throw new ApiError(404, 'EXAM_NOT_FOUND', 'Exam not found or unpublished.');
    return apiOk({ exam: meta });
  } catch (err) {
    return apiFail(err, 'EXAM_UNAVAILABLE');
  }
}
