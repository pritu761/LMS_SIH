import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getCurrentUser, type TokenPayload } from './auth';
import { reportError } from './errors';

// ============================================================================
// Shared API helpers: consistent envelopes + role guards.
// Envelope: { success: boolean, data?: T, error?: { code, message } }
// ============================================================================

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  /** Extra response headers (e.g. rate-limit / retry-after). */
  readonly headers?: Record<string, string>;
  constructor(status: number, code: string, message: string, headers?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.headers = headers;
  }
}

/** Incoming correlation context stamped by the proxy (trace + start). */
async function traceContext(): Promise<{ traceId: string; startMs: number | null }> {
  try {
    const h = await headers();
    const traceId = h.get('x-trace-id') ?? crypto.randomUUID();
    const raw = h.get('x-request-start');
    const startMs = raw !== null && Number.isFinite(Number(raw)) ? Number(raw) : null;
    return { traceId, startMs };
  } catch {
    return { traceId: crypto.randomUUID(), startMs: null };
  }
}

function logApiLine(input: { traceId: string; startMs: number | null; status: number; code?: string; path?: string }): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: input.status >= 500 ? 'error' : 'info',
      event: 'api-response',
      traceId: input.traceId,
      statusCode: input.status,
      ...(input.code ? { code: input.code } : {}),
      ...(input.startMs !== null ? { durationMs: Date.now() - input.startMs } : {}),
    })
  );
}

export async function apiOk<T>(data: T, init?: { status?: number; headers?: Record<string, string> }): Promise<NextResponse> {
  const { traceId, startMs } = await traceContext();
  logApiLine({ traceId, startMs, status: init?.status ?? 200 });
  return NextResponse.json({ success: true, data }, { status: init?.status ?? 200, headers: { 'X-Trace-Id': traceId, ...(init?.headers ?? {}) } });
}

export async function apiFail(err: unknown, fallback = 'REQUEST_FAILED'): Promise<NextResponse> {
  const { traceId, startMs } = await traceContext();
  if (err instanceof ApiError) {
    logApiLine({ traceId, startMs, status: err.status, code: err.code });
    return NextResponse.json(
      { success: false, error: { code: err.code, message: err.message } },
      { status: err.status, headers: { 'X-Trace-Id': traceId, ...(err.headers ?? {}) } }
    );
  }
  // Service-layer errors carry numeric status + string code properties.
  const shaped = err as { status?: unknown; code?: unknown } | null | undefined;
  const status = typeof shaped?.status === 'number' ? shaped.status : 500;
  const code = typeof shaped?.code === 'string' ? shaped.code : fallback;
  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  if (status >= 500) reportError(err, { traceId });
  logApiLine({ traceId, startMs, status, code });
  return NextResponse.json({ success: false, error: { code, message } }, { status, headers: { 'X-Trace-Id': traceId } });
}

/**
 * Require an authenticated, non-suspended session whose role is in `roles`.
 * PENDING accounts are rejected (403) — they may only see /auth/pending.
 * Throws ApiError(401/403) on failure; RBAC is enforced per-route by passing
 * the allowed roles explicitly.
 */
export async function requireRoles(roles: TokenPayload['role'][]): Promise<TokenPayload> {
  const session = await getCurrentUser();
  if (!session) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'Authentication required. Please sign in.');
  }
  if (session.status === 'PENDING') {
    throw new ApiError(403, 'ACCOUNT_PENDING', 'Account is pending approval and cannot access this resource yet.');
  }
  if (!roles.includes(session.role)) {
    throw new ApiError(403, 'FORBIDDEN_ROLE', 'Your role is not permitted to access this resource.');
  }
  return session;
}

/**
 * Trainee-area guard. ADMIN is admitted (proxy parity: /trainee allows
 * TRAINEE + ADMIN) but every query is scoped to the caller's own userId, so
 * no cross-role data exposure is possible through these routes.
 */
export async function requireTraineeSession(): Promise<TokenPayload> {
  return requireRoles(['TRAINEE', 'ADMIN']);
}

/**
 * Trainer-area guard. ADMIN is admitted (proxy parity: /trainer allows
 * TRAINER + ADMIN). Non-admin trainers are scoped to their allocated
 * cohorts inside the service layer; ADMIN callers get governance-wide
 * read access (documented per-route).
 */
export async function requireTrainerSession(): Promise<TokenPayload> {
  return requireRoles(['TRAINER', 'ADMIN']);
}

/**
 * Authenticated-area guard for cross-role features (assistant, radar
 * training, catalog-adjacent tools): every approved role is admitted and
 * role-scoping happens inside the service layer.
 */
export async function requireAssistantSession(): Promise<TokenPayload> {
  return requireRoles(['TRAINEE', 'TRAINER', 'ADMIN']);
}

/**
 * Admin-area guard. Only ADMIN role is admitted; every mutation is written
 * to the append-only audit log by the service layer.
 */
export async function requireAdminSession(): Promise<TokenPayload> {
  return requireRoles(['ADMIN']);
}
