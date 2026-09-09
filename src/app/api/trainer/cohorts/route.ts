import { apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getAssignedCohorts } from '@/services/trainerService';

/**
 * GET /api/trainer/cohorts
 *
 * Trainer cohorts with stats (trainee count, average gap %, station,
 * dates, status). TRAINER callers see only allocated cohorts; ADMIN
 * callers see all cohorts (governance oversight, scope flag included).
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { cohorts: AssignedCohort[] } }
 *   401/403: { success: false, error: { code, message } }
 */
export async function GET() {
  try {
    const session = await requireTrainerSession();
    const cohorts = await getAssignedCohorts(session.userId, session.role === 'ADMIN');
    return apiOk({ cohorts });
  } catch (err) {
    return apiFail(err, 'COHORTS_UNAVAILABLE');
  }
}
