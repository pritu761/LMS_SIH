import { apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getTrainingCases } from '@/services/radarService';

/**
 * GET /api/radar/cases — authenticated (any role). Published severe-weather
 * training cases with timesteps and guided questions (answers included:
 * guided training is explicitly non-proctored) plus the caller's best
 * scores. Training mode requires login.
 */
export async function GET() {
  try {
    const session = await requireTraineeSession();
    const cases = await getTrainingCases(session.userId);
    return apiOk({ cases, count: cases.length });
  } catch (err) {
    return apiFail(err, 'CASES_UNAVAILABLE');
  }
}
