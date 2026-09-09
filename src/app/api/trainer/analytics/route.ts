import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getTrainerAnalytics } from '@/services/trainerService';
import { analyticsQuerySchema } from '@/lib/validations';

/**
 * GET /api/trainer/analytics?cohort=
 *
 * Trainer analytics over the caller's cohorts (or one allocated cohort):
 * weekly mastery curve, domain score distribution, time-on-task per module,
 * assessment score histogram and the 5 hardest questions. TRAINER callers
 * are scoped to allocations; ADMIN callers may pass any cohort id.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: TrainerAnalytics }
 *   400/403: { success: false, error: { code, message } }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession();
    const { searchParams } = new URL(request.url);
    const parsed = analyticsQuerySchema.safeParse({ cohort: searchParams.get('cohort') ?? undefined });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', 'cohort must be a valid UUID.');
    }
    const data = await getTrainerAnalytics(session.userId, session.role === 'ADMIN', parsed.data.cohort ?? null);
    return apiOk(data);
  } catch (err) {
    return apiFail(err, 'ANALYTICS_UNAVAILABLE');
  }
}
