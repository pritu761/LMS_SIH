import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { overrideRecommendation } from '@/services/matcherService';
import { matcherOverrideSchema } from '@/lib/validations';

/**
 * POST /api/admin/matcher/override — ADMIN only.
 * { cohortId, recommendedTrainerId, alternateTrainerId, justification, weights }.
 * Records an admin override of the recommendation: upserts the alternate's
 * TrainerCohort allocation (override=true) and audits OVERRIDE_CREATED with
 * the original recommendation, the alternate, scores and justification.
 * Justification is mandatory.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = matcherOverrideSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Override payload is invalid.');
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const result = await overrideRecommendation(session.userId, ip, parsed.data);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'OVERRIDE_UNAVAILABLE');
  }
}
