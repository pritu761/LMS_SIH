import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { startAttempt } from '@/services/examService';
import { examStartSchema, uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/exam/[examId]/start — TRAINEE/ADMIN (own data).
 * { identityConfirmed: true } (literal — anything else 400s). Enforces the
 * per-exam attempt budget, creates a seeded attempt and logs EXAM_START.
 * The client must enter fullscreen immediately after this call.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ examId: string }> }) {
  try {
    const session = await requireTraineeSession();
    const { examId: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Exam id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = examStartSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'IDENTITY_REQUIRED', parsed.error.issues[0]?.message ?? 'Identity confirmation is required.');
    }
    const attempt = await startAttempt(session.userId, idParsed.data);
    return apiOk({ attempt }, { status: 201 });
  } catch (err) {
    return apiFail(err, 'START_UNAVAILABLE');
  }
}
