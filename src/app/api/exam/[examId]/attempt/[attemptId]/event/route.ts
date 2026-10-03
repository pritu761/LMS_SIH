import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { logIntegrityEvent } from '@/services/examService';
import { integrityEventSchema, uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/exam/[examId]/attempt/[attemptId]/event — TRAINEE/ADMIN (own).
 * { type, metadata? }: fullscreen exits, blurs, copy/paste blocks,
 * right-clicks, devtools heuristics, feed drops. Each call recomputes
 * risk + flag; the response carries { warnings, riskScore, integrityFlag,
 * autoSubmit } — the client auto-submits when autoSubmit is true (3rd
 * fullscreen exit). Ephemeral POSTs (sendBeacon-safe); no WebSocket needed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string; attemptId: string }> }
) {
  try {
    const session = await requireTraineeSession();
    const { examId: examRaw, attemptId: attemptRaw } = await params;
    if (!uuidParamSchema.safeParse(examRaw).success) throw new ApiError(400, 'INVALID_ID', 'Exam id is invalid.');
    const attemptParsed = uuidParamSchema.safeParse(attemptRaw);
    if (!attemptParsed.success) throw new ApiError(400, 'INVALID_ATTEMPT', 'attemptId is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = integrityEventSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_EVENT', parsed.error.issues[0]?.message ?? 'Event payload is invalid.');
    }
    const result = await logIntegrityEvent(
      session.userId,
      attemptParsed.data,
      parsed.data.type,
      (parsed.data.metadata ?? {}) as Record<string, unknown>
    );
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'EVENT_UNAVAILABLE');
  }
}
