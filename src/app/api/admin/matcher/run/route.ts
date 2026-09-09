import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { runMatcher } from '@/services/matcherService';
import { outOfPolicyKeys } from '@/services/matcherTypes';
import { verifyPolicyPin } from '@/lib/policy-pin';
import { matcherRunSchema } from '@/lib/validations';

/**
 * POST /api/admin/matcher/run — ADMIN only.
 * { cohortId, weights {skill,rating,experience}, constraints?, pin? }.
 * Validates weights (10–70 each, sum 100), enforces the governance policy
 * band (out-of-band runs require a correct super-admin PIN, else 403),
 * ranks every approved trainer with score breakdowns + constraint
 * violations, persists a MatcherRun snapshot and audits MATCHER_RUN.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = matcherRunSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Matcher payload is invalid.');
    }
    const { cohortId, weights, constraints, pin } = parsed.data;
    const outOfPolicy = outOfPolicyKeys(weights);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    let pinUsed = false;
    let devPin = false;
    if (outOfPolicy.length > 0) {
      if (!pin) {
        throw new ApiError(403, 'POLICY_PIN_REQUIRED', `Weights outside policy band (${outOfPolicy.join(', ')}) require super-admin PIN confirmation.`);
      }
      const check = verifyPolicyPin(pin, ip);
      devPin = check.devMode;
      if (check.locked) throw new ApiError(429, 'PIN_LOCKED', check.reason ?? 'PIN locked.');
      if (!check.ok) throw new ApiError(403, 'INVALID_PIN', check.reason ?? 'Incorrect PIN.');
      pinUsed = true;
    }
    const result = await runMatcher(session.userId, ip, cohortId, weights, constraints, pinUsed);
    return apiOk({ ...result, devPin });
  } catch (err) {
    return apiFail(err, 'MATCHER_UNAVAILABLE');
  }
}
