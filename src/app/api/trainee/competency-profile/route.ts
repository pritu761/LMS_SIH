import { apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getCompetencyProfile } from '@/services/traineeService';

/**
 * GET /api/trainee/competency-profile
 *
 * Authenticated (TRAINEE or ADMIN, own data only). Returns the caller's
 * per-domain competency scores (0–100) with required levels and gaps —
 * the dataset behind the trainee dashboard radar chart.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { points: [{ domain, score, requiredScore, gap }] } }
 *   401/403: { success: false, error: { code, message } }
 */
export async function GET() {
  try {
    const session = await requireTraineeSession();
    const points = await getCompetencyProfile(session.userId);
    return apiOk({ points });
  } catch (err) {
    return apiFail(err, 'COMPETENCY_UNAVAILABLE');
  }
}
