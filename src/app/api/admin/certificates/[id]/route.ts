import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { setCertificateStatus } from '@/services/adminService';
import { certificateStatusSchema, uuidParamSchema } from '@/lib/validations';

/**
 * PUT /api/admin/certificates/[id] — ADMIN only.
 * { status: VALID | REVOKED, reason? } — revocation requires a mandatory
 * reason. Both directions write CERT_REVOKED / CERT_REINSTATED to the
 * append-only audit log and notify the holder. The public /verify page
 * reflects the new status immediately.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Certificate id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = certificateStatusSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Certificate payload is invalid.');
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const certificate = await setCertificateStatus(session.userId, ip, idParsed.data, parsed.data.status, parsed.data.reason);
    return apiOk({ certificate });
  } catch (err) {
    return apiFail(err, 'CERTIFICATE_UNAVAILABLE');
  }
}
