/**
 * Next.js instrumentation hook (Phase 3.4C): runs once on server boot.
 * Registers the observability baseline (structured boot line) and is the
 * integration point for OpenTelemetry/Sentry SDK init when configured.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        event: 'server-boot',
        service: 'capacity-connect',
        env: process.env.NODE_ENV ?? 'development',
        sentry: Boolean(process.env.SENTRY_DSN),
      })
    );
  }
}
