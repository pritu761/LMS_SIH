import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { escalateApproval } from '@/services/adminService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * POST /api/admin/approvals/[id]/escalate — ADMIN only. Alerts every other
 * active admin (in-app SLA_BREACH notification + email) about an
 * SLA-breached pending registration and records SLA_ESCALATED in audit.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdminSession();
    const { id: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Registration id is invalid.');
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    const result = await escalateApproval(session.userId, ip, parsed.data);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'ESCALATION_UNAVAILABLE');
  }
}
