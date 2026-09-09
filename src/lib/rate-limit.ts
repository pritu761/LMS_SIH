import { ApiError } from './api-helpers';

// ============================================================================
// In-memory fixed-window rate limiter (Phase 3.4D). Per-instance state —
// correct for single-instance dev and documented to move to Redis/Upstash
// (same interface) for multi-instance production. Limits are env-tunable:
// RATE_LIMIT_AUTH_* (login), RATE_LIMIT_BULK_* (bulk validate), the AI
// assistant limit lives in guardrails (ASSISTANT_RATE_LIMIT_PER_HOUR).
// Every denial carries X-RateLimit-* + Retry-After headers.
// ============================================================================

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  reset: number;
  headers: Record<string, string>;
}

function intEnv(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}

export function rateLimitConfig(): { authAttempts: number; authWindowMs: number; bulkJobs: number; bulkWindowMs: number } {
  return {
    authAttempts: intEnv('RATE_LIMIT_AUTH_ATTEMPTS', 5),
    authWindowMs: intEnv('RATE_LIMIT_AUTH_WINDOW_MS', 15 * 60 * 1000),
    bulkJobs: intEnv('RATE_LIMIT_BULK_JOBS', 3),
    bulkWindowMs: intEnv('RATE_LIMIT_BULK_WINDOW_MS', 60 * 60 * 1000),
  };
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return {
      ok: true,
      remaining: Math.max(0, limit - 1),
      reset: resetAt,
      headers: rateHeaders(limit, Math.max(0, limit - 1), resetAt, 0),
    };
  }
  current.count += 1;
  const ok = current.count <= limit;
  const retryAfter = ok ? 0 : Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return {
    ok,
    remaining: Math.max(0, limit - current.count),
    reset: current.resetAt,
    headers: rateHeaders(limit, Math.max(0, limit - current.count), current.resetAt, retryAfter),
  };
}

function rateHeaders(limit: number, remaining: number, reset: number, retryAfter: number): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
  };
  if (retryAfter > 0) headers['Retry-After'] = String(retryAfter);
  return headers;
}

/** Throw a 429 ApiError (with headers) when the bucket is exhausted. */
export function enforceRateLimit(key: string, limit: number, windowMs: number, code = 'RATE_LIMITED'): RateLimitResult {
  const result = checkRateLimit(key, limit, windowMs);
  if (!result.ok) {
    throw new ApiError(429, code, 'Too many requests — slow down and try again.', result.headers);
  }
  return result;
}

/** Best-effort client IP for keying (proxy/CDN aware). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}
