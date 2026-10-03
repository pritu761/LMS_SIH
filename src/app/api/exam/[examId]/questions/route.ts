import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getAttemptQuestions } from '@/services/examService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/exam/[examId]/questions?attemptId= — TRAINEE/ADMIN (own attempt).
 * Serves the deterministically shuffled, SANITIZED question set: text,
 * options (shuffled) and weights only. Correct answers and explanations
 * never leave the server on this endpoint. Attempt-scoped: 410 once the
 * attempt closes. Nothing is written to localStorage by the client.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await requireTraineeSession();
    const { examId: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Exam id is invalid.');
    const { searchParams } = new URL(request.url);
    const attemptParsed = uuidParamSchema.safeParse(searchParams.get('attemptId') ?? '');
    if (!attemptParsed.success) throw new ApiError(400, 'INVALID_ATTEMPT', 'attemptId is required.');
    const bundle = await getAttemptQuestions(session.userId, idParsed.data, attemptParsed.data);
    return apiOk(bundle, { status: 200 });
  } catch (err) {
    return apiFail(err, 'QUESTIONS_UNAVAILABLE');
  }
}
