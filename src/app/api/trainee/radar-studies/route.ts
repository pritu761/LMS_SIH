import { apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getSharedStudies } from '@/services/radarService';

/**
 * GET /api/trainee/radar-studies — TRAINEE/ADMIN (own cohorts only).
 * Annotated radar frames trainers shared with the caller's cohorts, with
 * case context and drawing payloads for thumbnail rendering.
 */
export async function GET() {
  try {
    const session = await requireTraineeSession();
    const studies = await getSharedStudies(session.userId);
    return apiOk({ studies, count: studies.length });
  } catch (err) {
    return apiFail(err, 'STUDIES_UNAVAILABLE');
  }
}
