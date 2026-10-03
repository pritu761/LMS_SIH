import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { listCertificates } from '@/services/adminService';
import { certificateFilterSchema } from '@/lib/validations';

/**
 * GET /api/admin/certificates?status=&q= — ADMIN only. Credential registry
 * (holder, module, issue date, verification ID, status) for governance
 * oversight and revocation workflows.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const parsed = certificateFilterSchema.safeParse({
      status: searchParams.get('status') ?? undefined,
      q: searchParams.get('q') ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', parsed.error.issues[0]?.message ?? 'Certificate filters are invalid.');
    }
    const certificates = await listCertificates(parsed.data.status, parsed.data.q);
    return apiOk({ certificates, count: certificates.length });
  } catch (err) {
    return apiFail(err, 'CERTIFICATES_UNAVAILABLE');
  }
}
