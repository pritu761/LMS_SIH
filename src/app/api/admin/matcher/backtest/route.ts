import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { backtestCohort } from '@/services/matcherService';
import { matcherBacktestSchema } from '@/lib/validations';

/**
 * GET /api/admin/matcher/backtest?cohortId=&skill=&rating=&experience=
 * ADMIN only. Re-ranks one cohort under the active weights vs default
 * 55/30/15 with fixed neutral constraints: top picks, top-3 lists, score
 * delta and rank-order swaps, plus a plain-language verdict. No history is
 * fabricated — the comparison is strictly score-based on live data.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const num = (key: string) => {
      const v = searchParams.get(key);
      return v === null ? NaN : Number(v);
    };
    const parsed = matcherBacktestSchema.safeParse({
      cohortId: searchParams.get('cohortId') ?? undefined,
      weights: { skill: num('skill'), rating: num('rating'), experience: num('experience') },
    });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', parsed.error.issues[0]?.message ?? 'Backtest parameters are invalid.');
    }
    const result = await backtestCohort(parsed.data.cohortId, parsed.data.weights);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'BACKTEST_UNAVAILABLE');
  }
}
