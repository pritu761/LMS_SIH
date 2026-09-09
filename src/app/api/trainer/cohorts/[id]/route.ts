import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getCohortDetail } from '@/services/trainerService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/trainer/cohorts/[id]
 *
 * Cohort detail: member rows (name, domain scores, attendance %, last
 * active, auto risk flags), sessions and the attendance matrix. TRAINER
 * callers are limited to allocated cohorts (403 otherwise); ADMIN sees all.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { cohort, members, sessions, attendance } }
 *   400/403/404: { success: false, error: { code, message } }
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Cohort id is invalid.');
    const detail = await getCohortDetail(session.userId, session.role === 'ADMIN', parsed.data);
    return apiOk(detail);
  } catch (err) {
    return apiFail(err, 'COHORT_UNAVAILABLE');
  }
}
