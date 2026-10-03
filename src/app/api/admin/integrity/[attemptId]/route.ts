import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { setAttemptVerdict } from '@/services/examService';
import { uuidParamSchema, verdictUpdateSchema } from '@/lib/validations';

/**
 * PUT /api/admin/integrity/[attemptId] — ADMIN only.
 * { verdict: VALID | INVALID | ESCALATED }. Marks the attempt and writes
 * ATTEMPT_VERDICT to the append-only audit log (before/after). Trainers
 * are read-only on verdicts.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  try {
    const session = await requireAdminSession();
    const { attemptId: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Attempt id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = verdictUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Verdict payload is invalid.');
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const attempt = await setAttemptVerdict(session.userId, ip, idParsed.data, parsed.data.verdict);
    return apiOk({ attempt });
  } catch (err) {
    return apiFail(err, 'VERDICT_UNAVAILABLE');
  }
}
