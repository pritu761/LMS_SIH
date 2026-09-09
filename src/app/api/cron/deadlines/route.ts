import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { runDeadlineSweep } from '@/services/notifyService';

/**
 * POST /api/cron/deadlines — scheduled sweep (Vercel Cron, hourly).
 * Exam windows opening within 24h → EXAM_OPENED; assignment deadlines at
 * 24h/2h → DEADLINE_REMINDER. Idempotent via recent-title dedupe.
 *
 * Auth: CRON_SECRET bearer when configured (production); otherwise an
 * ADMIN session (local/manual runs). Set CRON_SECRET in env + vercel.json
 * crons (hourly).
 */
export async function POST(request: NextRequest) {
  const configured = process.env.CRON_SECRET;
  if (configured) {
    const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? request.headers.get('x-cron-secret') ?? '';
    if (given !== configured) {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN_CRON', message: 'Invalid cron secret.' } }, { status: 403 });
    }
  } else {
    // No secret configured (local/dev): require an admin session instead.
    const session = await getCurrentUser().catch(() => null);
    if (!session || session.role !== 'ADMIN' || session.status === 'PENDING') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN_CRON', message: 'Admin session or CRON_SECRET required.' } }, { status: 403 });
    }
  }
  try {
    const result = await runDeadlineSweep();
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: { code: 'SWEEP_FAILED', message: err instanceof Error ? err.message : 'Sweep failed.' } },
      { status: 500 }
    );
  }
}
