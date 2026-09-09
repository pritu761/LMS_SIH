import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/security/csp-report — public, auth-free by design (browsers
 * file reports without session context). Accepts CSP violation reports up
 * to 4 KB and writes a structured log line for SIEM ingestion. No storage,
 * no reflection — never returns request content.
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const body = raw.slice(0, 4096);
    let report: unknown = null;
    try {
      report = JSON.parse(body);
    } catch {
      report = { unparseable: true };
    }
    const rec = (report ?? {}) as Record<string, unknown>;
    const inner = (rec['csp-report'] ?? rec) as Record<string, unknown>;
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        event: 'csp-violation',
        documentUri: typeof inner['document-uri'] === 'string' ? (inner['document-uri'] as string).slice(0, 200) : undefined,
        violatedDirective: typeof inner['violated-directive'] === 'string' ? inner['violated-directive'] : undefined,
        blockedUri: typeof inner['blocked-uri'] === 'string' ? (inner['blocked-uri'] as string).slice(0, 200) : undefined,
      })
    );
  } catch {
    /* logging must never fail the report */
  }
  return new NextResponse(null, { status: 204 });
}
