import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getAttemptResult } from '@/services/examService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/exam/[examId]/attempt/[attemptId]/result — TRAINEE/ADMIN (own).
 * Immediate objective score, pass state, competency deltas and the
 * trainee-visible integrity timeline ("your exam had N events").
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ examId: string; attemptId: string }> }
) {
  try {
    const session = await requireTraineeSession();
    const { attemptId: attemptRaw } = await params;
    const attemptParsed = uuidParamSchema.safeParse(attemptRaw);
    if (!attemptParsed.success) throw new ApiError(400, 'INVALID_ATTEMPT', 'attemptId is invalid.');
    const result = await getAttemptResult(session.userId, attemptParsed.data);
    return apiOk({ result });
  } catch (err) {
    return apiFail(err, 'RESULT_UNAVAILABLE');
  }
}
