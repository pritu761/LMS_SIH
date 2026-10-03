/**
 * Error reporting hook (Phase 3.4C). Structured console logging always;
 * forwards to Sentry when SENTRY_DSN (server) or NEXT_PUBLIC_SENTRY_DSN
 * (client) is configured. Without a DSN this is a documented no-op sink —
 * set the env var to enable real error monitoring.
 */

export interface ReportContext {
  traceId?: string;
  userId?: string;
  role?: string;
  path?: string;
  extra?: Record<string, unknown>;
}

function dsn(): string | null {
  if (typeof window === 'undefined') return process.env.SENTRY_DSN?.trim() || null;
  return (process.env.NEXT_PUBLIC_SENTRY_DSN ?? '').trim() || null;
}

export function reportError(err: unknown, context: ReportContext = {}): void {
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack?.split('\n').slice(0, 5).join('\n') : undefined;
  const payload = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    stack,
    ...context,
  };
  // Structured log line (captured by Vercel/host log drains).
  console.error(JSON.stringify(payload));

  // Optional Sentry forwarding (lazy import so the SDK is never required
  // without a DSN). Install @sentry/nextjs to activate.
  const key = dsn();
  if (!key) return;
  void (async () => {
    try {
      const mod = (await import('@sentry/nextjs').catch(() => null)) as {
        captureException?: (e: unknown, ctx?: { extra?: Record<string, unknown> }) => void;
      } | null;
      mod?.captureException?.(err instanceof Error ? err : new Error(message), { extra: context as Record<string, unknown> });
    } catch {
      /* reporting must never break the request */
    }
  })();
}
