// Optional Sentry integration point. If @sentry/nextjs is installed, its
// real types take precedence — DELETE this shim then. Without the package,
// reportError() in lib/errors.ts degrades to structured logging only.
declare module '@sentry/nextjs' {
  export function captureException(error: unknown, context?: { extra?: Record<string, unknown> }): string;
}
