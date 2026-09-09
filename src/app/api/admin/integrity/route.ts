import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { getIntegrityAttempts } from '@/services/examService';
import { integrityFilterSchema } from '@/lib/validations';

/**
 * GET /api/admin/integrity — ADMIN only. Governance-wide attempt list with
 * the same filters as the trainer board. Verdict changes go through
 * PUT /api/admin/integrity/[attemptId].
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const parsed = integrityFilterSchema.safeParse({
      cohortId: searchParams.get('cohortId') ?? undefined,
      flag: searchParams.get('flag') ?? undefined,
      verdict: searchParams.get('verdict') ?? undefined,
      q: searchParams.get('q') ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', parsed.error.issues[0]?.message ?? 'Integrity filters are invalid.');
    }
    const attempts = await getIntegrityAttempts(session.userId, true, parsed.data);
    return apiOk({ attempts, count: attempts.length });
  } catch (err) {
    return apiFail(err, 'INTEGRITY_UNAVAILABLE');
  }
}
