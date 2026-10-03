import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { reviewRegistration } from '@/services/adminService';
import { registrationReviewSchema, uuidParamSchema } from '@/lib/validations';

function clientIp(request: NextRequest): string | null {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
}

/**
 * POST /api/admin/approvals/[id] — ADMIN only.
 * { action: approve | reject | info, reason?, message?, role? }.
 * - approve: activates the account, issues a one-time temporary password
 *   (returned once in the response + mirrored in-app/email), optional role
 *   override (audited as ROLE_CHANGED).
 * - reject: requires a mandatory reason; user + audit + notification.
 * - info: keeps PENDING, requests more info (audited as INFO_REQUESTED).
 * Every branch writes the append-only audit log.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Registration id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = registrationReviewSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Review payload is invalid.');
    }
    const result = await reviewRegistration(session.userId, clientIp(request), idParsed.data, parsed.data);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'REVIEW_UNAVAILABLE');
  }
}
