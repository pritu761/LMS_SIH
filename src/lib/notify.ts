import prisma from '@/lib/prisma';
import { sendMail } from './mailer';

// ============================================================================
// Central notification dispatcher (Phase 3.3). Every user-facing event
// flows through notifyUser: preference-gated email (best-effort, mirrored)
// + guaranteed in-app row (unless the user disabled that type in-app).
// Preference maps default to all-on when no row/keys exist.
// ============================================================================

export type NotifyType =
  | 'REGISTRATION_APPROVED'
  | 'REGISTRATION_REJECTED'
  | 'REGISTRATION_INFO_REQUESTED'
  | 'COHORT_ASSIGNED'
  | 'EXAM_OPENED'
  | 'DEADLINE_REMINDER'
  | 'CERTIFICATE_ISSUED'
  | 'CERTIFICATE_REVOKED'
  | 'REMEDIATION_RECEIVED'
  | 'RADAR_CASE_SHARED'
  | 'SLA_BREACH'
  | 'SYSTEM';

export interface NotifyInput {
  userId: string;
  type: NotifyType;
  title: string;
  body: string;
  link?: string | null;
  /** When present, an email is attempted (preference-gated). */
  email?: { subject: string; text: string };
}

export interface NotifyResult {
  stored: boolean;
  emailed: boolean;
}

function prefEnabled(map: unknown, type: string): boolean {
  if (typeof map !== 'object' || map === null) return true;
  const rec = map as Record<string, unknown>;
  if (!(type in rec)) return true;
  return rec[type] !== false;
}

export async function getUserPrefs(userId: string): Promise<{ email: Record<string, boolean>; inApp: Record<string, boolean> }> {
  const row = await prisma.notificationPreference.findUnique({ where: { userId } });
  const email: Record<string, boolean> = {};
  const inApp: Record<string, boolean> = {};
  if (row) {
    const e = (row.emailEnabled ?? {}) as Record<string, unknown>;
    const a = (row.inAppEnabled ?? {}) as Record<string, unknown>;
    for (const k of Object.keys(e)) email[k] = e[k] !== false;
    for (const k of Object.keys(a)) inApp[k] = a[k] !== false;
  }
  return { email, inApp };
}

/** Dispatch one notification (in-app row + optional gated email). */
export async function notifyUser(input: NotifyInput): Promise<NotifyResult> {
  const prefs = await getUserPrefs(input.userId);
  const inAppOn = prefs.inApp[input.type] !== false;
  const emailOn = prefs.email[input.type] !== false;
  let emailed = false;
  if (input.email && emailOn) {
    const to = await prisma.user.findUnique({ where: { id: input.userId }, select: { email: true } });
    if (to) {
      emailed = (await sendMail({ to: to.email, subject: input.email.subject, text: input.email.text })).sent;
    }
  }
  if (inAppOn) {
    await prisma.notification.create({
      data: { userId: input.userId, type: input.type, title: input.title, body: input.body, link: input.link ?? null },
    });
  }
  return { stored: inAppOn, emailed };
}

/** Dedupe guard: same type+title already sent to this user recently. */
export async function recentlyNotified(userId: string, type: NotifyType, title: string, withinHours: number): Promise<boolean> {
  const since = new Date(Date.now() - withinHours * 3600 * 1000);
  const count = await prisma.notification.count({
    where: { userId, type: type, title, createdAt: { gte: since } },
  });
  return count > 0;
}
