import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { sendRemediationPack } from '@/services/trainerService';
import { remediationPackSchema, uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/trainer/cohorts/[id]/remediation
 *
 * "Send Remediation Pack": { title, message?, lessonCodes[], traineeIds[] }.
 * Validates cohort allocation, membership and lesson publication, then
 * atomically creates the pack, per-trainee tasks and in-app notifications
 * (surfaced in the trainee dashboard notification feed).
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { packId, assigned, notified } }
 *   400/403: { success: false, error: { code, message } }
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Cohort id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = remediationPackSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Remediation payload is invalid.');
    }
    const result = await sendRemediationPack(session.userId, idParsed.data, parsed.data);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'REMEDIATION_UNAVAILABLE');
  }
}
