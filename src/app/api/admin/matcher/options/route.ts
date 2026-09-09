import { apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { getMatcherCohorts } from '@/services/matcherService';
import { DEFAULT_CONSTRAINTS, DEFAULT_WEIGHTS, POLICY_BANDS, SLIDER_MAX, SLIDER_MIN } from '@/services/matcherTypes';
import { isDevPinMode } from '@/lib/policy-pin';

/**
 * GET /api/admin/matcher/options — ADMIN only. Simulator selectors and
 * policy metadata: recent cohorts (with track domains + headcounts),
 * default weights/constraints, slider bounds, the governance policy band
 * and whether the dev PIN fallback is active.
 */
export async function GET() {
  try {
    await requireAdminSession();
    const cohorts = await getMatcherCohorts();
    const regions = ['ANY', 'NORTH', 'SOUTH', 'EAST', 'WEST', 'CENTRAL', 'NE'];
    return apiOk({
      cohorts,
      defaults: { weights: DEFAULT_WEIGHTS, constraints: DEFAULT_CONSTRAINTS },
      slider: { min: SLIDER_MIN, max: SLIDER_MAX },
      policyBands: POLICY_BANDS,
      regions,
      devPinMode: isDevPinMode(),
    });
  } catch (err) {
    return apiFail(err, 'MATCHER_UNAVAILABLE');
  }
}
