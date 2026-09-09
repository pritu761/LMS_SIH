import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { confirmBulkJob } from '@/services/adminService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/admin/bulk/[jobId]/confirm — ADMIN only. Step 2 of the import:
 * processes the staged rows (creates accounts + invites, updates stations,
 * assigns batches), records DONE/PARTIAL/FAILED with per-row errors and an
 * error CSV, and writes BULK_IMPORTED to the audit log. Queued jobs only.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    const session = await requireAdminSession();
    const { jobId: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Job id is invalid.');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const result = await confirmBulkJob(session.userId, ip, parsed.data);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'IMPORT_UNAVAILABLE');
  }
}
