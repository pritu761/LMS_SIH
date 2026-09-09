import prisma from '@/lib/prisma';
import { notifyUser, recentlyNotified } from '@/lib/notify';

// ============================================================================
// Deadline sweep (Phase 3.3): exam windows opening within 24h and assignment
// deadlines at 24h / 2h horizons → EXAM_OPENED / DEADLINE_REMINDER per
// cohort member. Idempotent via recent-title dedupe (safe to run on any
// cadence; Vercel Cron runs it daily on Hobby).
// Triggered by POST /api/cron/deadlines (Vercel Cron, daily).
// ============================================================================

export interface SweepResult {
  examOpened: number;
  reminders24: number;
  reminders2: number;
  scannedSessions: number;
}

function fmtDate(d: Date): string {
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export async function runDeadlineSweep(now = new Date()): Promise<SweepResult> {
  const horizon24 = new Date(now.getTime() + 24 * 3600 * 1000);
  const horizon2 = new Date(now.getTime() + 2 * 3600 * 1000);
  const sessions = await prisma.cohortSession.findMany({
    where: {
      startsAt: { gt: now, lte: horizon24 },
      type: { in: ['EXAM_WINDOW', 'ASSIGNMENT_DEADLINE'] },
      cohort: { status: { in: ['ACTIVE', 'PLANNED'] } },
    },
    include: { cohort: { include: { members: { select: { userId: true } } } } },
  });
  let examOpened = 0;
  let reminders24 = 0;
  let reminders2 = 0;
  for (const s of sessions) {
    const in2h = s.startsAt <= horizon2;
    for (const m of s.cohort.members) {
      if (s.type === 'EXAM_WINDOW') {
        const title = `Exam window opening: ${s.title}`;
        if (await recentlyNotified(m.userId, 'EXAM_OPENED', title, 7 * 24)) continue;
        await notifyUser({
          userId: m.userId,
          type: 'EXAM_OPENED',
          title,
          body: `${s.cohort.code}: ${s.title} opens ${fmtDate(s.startsAt)}. Complete identity + system checks before starting.`,
          link: '/trainee',
          email: { subject: `Exam window opening: ${s.title}`, text: `${s.cohort.code}: ${s.title} opens ${fmtDate(s.startsAt)}.` },
        });
        examOpened += 1;
      } else {
        const label = in2h ? '2 hours' : '24 hours';
        const title = `Deadline ${in2h ? '2h' : '24h'}: ${s.title}`;
        if (await recentlyNotified(m.userId, 'DEADLINE_REMINDER', title, 30)) continue;
        await notifyUser({
          userId: m.userId,
          type: 'DEADLINE_REMINDER',
          title,
          body: `${s.cohort.code}: ${s.title} is due ${fmtDate(s.startsAt)} (${label} left).`,
          link: '/trainee',
          email: { subject: `Reminder: ${s.title} due in ${label}`, text: `${s.cohort.code}: ${s.title} is due ${fmtDate(s.startsAt)}.` },
        });
        if (in2h) reminders2 += 1;
        else reminders24 += 1;
      }
    }
  }
  return { examOpened, reminders24, reminders2, scannedSessions: sessions.length };
}
