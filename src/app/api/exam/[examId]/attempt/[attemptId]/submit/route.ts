import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { submitAttempt } from '@/services/examService';
import { examSubmitSchema, uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/exam/[examId]/attempt/[attemptId]/submit — TRAINEE/ADMIN (own).
 * { answers: {qid: id|[ids]}, timeSpentSeconds, auto? }. Grades objective
 * items server-side (short answers → needsGrading), enforces total time
 * (120s grace), updates CompetencyScore via EMA per tagged domain, bumps
 * item-analysis counters and logs EXAM_SUBMIT. Closed attempts return the
 * stored result instead of double-grading.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string; attemptId: string }> }
) {
  try {
    const session = await requireTraineeSession();
    const { examId: examRaw, attemptId: attemptRaw } = await params;
    const examParsed = uuidParamSchema.safeParse(examRaw);
    if (!examParsed.success) throw new ApiError(400, 'INVALID_ID', 'Exam id is invalid.');
    const attemptParsed = uuidParamSchema.safeParse(attemptRaw);
    if (!attemptParsed.success) throw new ApiError(400, 'INVALID_ATTEMPT', 'attemptId is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = examSubmitSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Submission payload is invalid.');
    }
    const result = await submitAttempt(
      session.userId,
      examParsed.data,
      attemptParsed.data,
      parsed.data.answers as Record<string, unknown>,
      parsed.data.timeSpentSeconds,
      parsed.data.auto
    );
    return apiOk({ result });
  } catch (err) {
    return apiFail(err, 'SUBMIT_UNAVAILABLE');
  }
}
