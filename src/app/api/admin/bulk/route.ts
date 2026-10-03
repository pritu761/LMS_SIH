import { apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { listBulkJobs } from '@/services/adminService';

/**
 * GET /api/admin/bulk — ADMIN only. Bulk job history (newest 50) with
 * Queued | Processing | Done | Failed | Partial statuses and row counts.
 */
export async function GET() {
  try {
    await requireAdminSession();
    const jobs = await listBulkJobs();
    return apiOk({ jobs });
  } catch (err) {
    return apiFail(err, 'JOBS_UNAVAILABLE');
  }
}
