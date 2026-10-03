import { apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getTraineeTracks } from '@/services/traineeService';

/**
 * GET /api/trainee/tracks
 *
 * Authenticated (TRAINEE or ADMIN, own data only). Returns all published
 * tracks with module outlines, per-module status
 * (completed/in-progress/locked/failed/available), lesson progress flags and
 * a resume pointer — the dataset behind the learning-path player and the
 * prerequisite graph.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { tracks, cohortTrackCode, resume } }
 *   401/403: { success: false, error: { code, message } }
 */
export async function GET() {
  try {
    const session = await requireTraineeSession();
    const data = await getTraineeTracks(session.userId);
    return apiOk(data);
  } catch (err) {
    return apiFail(err, 'TRACKS_UNAVAILABLE');
  }
}
