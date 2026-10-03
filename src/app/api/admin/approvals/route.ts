import { apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { getApprovals } from '@/services/adminService';

/**
 * GET /api/admin/approvals — ADMIN only. Pending registrations with SLA
 * timers (breach flag past 48h) plus the 20 most recent decisions.
 */
export async function GET() {
  try {
    await requireAdminSession();
    const data = await getApprovals();
    return apiOk(data);
  } catch (err) {
    return apiFail(err, 'APPROVALS_UNAVAILABLE');
  }
}
