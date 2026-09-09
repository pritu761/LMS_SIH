import { apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { REPORTS } from '@/services/adminTypes';

/**
 * GET /api/admin/reports — ADMIN only. Catalogue of the six pre-built
 * governance reports (fetch each via /api/admin/reports/[name]).
 */
export async function GET() {
  try {
    await requireAdminSession();
    return apiOk({ reports: REPORTS });
  } catch (err) {
    return apiFail(err, 'REPORTS_UNAVAILABLE');
  }
}
