import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { submitCaseAttempt } from '@/services/radarService';
import { caseAttemptSchema, uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/radar/cases/[id]/attempt — authenticated (own data).
 * { score, total, answers? }: records a guided-replay completion and
 * returns the caller's best (bestScore, attempts). Scores map to the
 * RAD-NOWCAST interpretation competency (displayed on the case card;
 * history is kept per attempt).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTraineeSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Case id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = caseAttemptSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Attempt payload is invalid.');
    }
    const result = await submitCaseAttempt(session.userId, idParsed.data, parsed.data.score, parsed.data.total, parsed.data.answers);
    return apiOk(result, { status: 201 });
  } catch (err) {
    return apiFail(err, 'ATTEMPT_UNAVAILABLE');
  }
}
