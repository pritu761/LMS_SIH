// ============================================================================
// Super-admin PIN gate for out-of-policy matcher weights (Phase 2.1A).
//
// This is a governance speedbump, not authentication: role checks still
// apply, and every out-of-policy run is flagged in the audit trail. The PIN
// comes from SUPER_ADMIN_PIN; in non-production without the env var, a
// documented dev fallback ('000000') applies and callers are told so.
// Brute force is throttled per IP (5 failures → 10 minute lock, per server
// instance).
// ============================================================================

const DEV_FALLBACK_PIN = '000000';
const MAX_FAILURES = 5;
const LOCK_MS = 10 * 60 * 1000;

interface AttemptState {
  failures: number;
  lockedUntil: number;
}

const attempts = new Map<string, AttemptState>();

function expectedPin(): { pin: string; devMode: boolean } {
  const configured = process.env.SUPER_ADMIN_PIN;
  if (configured && configured.length > 0) return { pin: configured, devMode: false };
  return { pin: DEV_FALLBACK_PIN, devMode: process.env.NODE_ENV !== 'production' };
}

/** Constant-time string comparison (lengths must match first). */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export interface PinCheck {
  ok: boolean;
  devMode: boolean;
  locked: boolean;
  reason?: string;
}

export function verifyPolicyPin(pin: string, ip: string | null): PinCheck {
  const { pin: expected, devMode } = expectedPin();
  if (!devMode && process.env.SUPER_ADMIN_PIN === undefined) {
    return { ok: false, devMode: false, locked: false, reason: 'Super-admin PIN is not configured (set SUPER_ADMIN_PIN).' };
  }
  const key = ip ?? 'unknown';
  const now = Date.now();
  const state = attempts.get(key) ?? { failures: 0, lockedUntil: 0 };
  if (state.lockedUntil > now) {
    return { ok: false, devMode, locked: true, reason: 'Too many wrong PINs — try again in a few minutes.' };
  }
  if (timingSafeEqual(pin, expected)) {
    attempts.delete(key);
    return { ok: true, devMode, locked: false };
  }
  state.failures += 1;
  if (state.failures >= MAX_FAILURES) {
    state.lockedUntil = now + LOCK_MS;
    state.failures = 0;
  }
  attempts.set(key, state);
  return { ok: false, devMode, locked: false, reason: 'Incorrect PIN.' };
}

export function isDevPinMode(): boolean {
  return !process.env.SUPER_ADMIN_PIN && process.env.NODE_ENV !== 'production';
}
