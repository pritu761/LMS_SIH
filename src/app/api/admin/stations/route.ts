import { apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { getStations } from '@/services/adminService';

/**
 * GET /api/admin/stations — ADMIN only. All active radar stations with
 * readiness plus the national summary (average, at-risk count, per-region
 * aggregates, certifications this month) behind the readiness map.
 */
export async function GET() {
  try {
    await requireAdminSession();
    const data = await getStations();
    return apiOk(data);
  } catch (err) {
    return apiFail(err, 'STATIONS_UNAVAILABLE');
  }
}
