import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getIntegrityAttempts } from '@/services/examService';
import { integrityFilterSchema } from '@/lib/validations';

/**
 * GET /api/trainer/integrity?cohortId=&flag=&verdict=&q= — TRAINER/ADMIN.
 * Proctored attempts with risk scores, flags and timelines, scoped to the
 * caller's allocated cohorts (trainers) or all attempts (admins).
 * Read-only: verdict changes live on the admin endpoint only.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession();
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
    const attempts = await getIntegrityAttempts(session.userId, session.role === 'ADMIN', parsed.data);
    return apiOk({ attempts, count: attempts.length });
  } catch (err) {
    return apiFail(err, 'INTEGRITY_UNAVAILABLE');
  }
}
