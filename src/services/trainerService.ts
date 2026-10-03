import prisma from '@/lib/prisma';
import { notifyUser } from '@/lib/notify';
import { sanitizeOptional, sanitizeText } from '@/lib/sanitize';
import { indexLesson } from '@/lib/rag/index';
import { COMPETENCY_DOMAINS } from './traineeService';
import type {
  AssignedCohort,
  AuthoringLessonDetail,
  AuthoringLessonRow,
  AuthoringModuleOption,
  BankQuestionView,
  CohortDetailView,
  CohortMemberView,
  LessonBlock,
  QuestionBankView,
  TrainerAnalytics,
  TrainerNoteView,
} from './trainerTypes';

// ============================================================================
// Trainer dashboard data access (Phase 1.4). Scoping rule: TRAINER callers
// only ever see cohorts they are allocated to (via TrainerCohort); ADMIN
// callers get governance-wide read access. Trainee rows are limited to
// cohort members — never whole-user-table scans.
// ============================================================================

export const GAP_RISK_THRESHOLD = 40;
export const INACTIVE_RISK_DAYS = 7;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Cohort IDs the trainer may access, or null for governance-wide (admin). */
export async function accessibleCohortIds(trainerId: string, isAdmin: boolean): Promise<Set<string> | null> {
  if (isAdmin) return null;
  const rows = await prisma.trainerCohort.findMany({ where: { trainerId }, select: { cohortId: true } });
  return new Set(rows.map((r) => r.cohortId));
}

function assertCohortAccess(ids: Set<string> | null, cohortId: string): void {
  if (ids !== null && !ids.has(cohortId)) {
    const e = new Error('Cohort is not allocated to you.') as Error & { status?: number; code?: string };
    e.status = 403;
    e.code = 'COHORT_FORBIDDEN';
    throw e;
  }
}

/** Mean gap % per member → cohort average. Members without scores are skipped. */
async function cohortAvgGap(cohortId: string): Promise<{ avgGap: number; traineeCount: number }> {
  const members = await prisma.cohortMember.findMany({ where: { cohortId }, select: { userId: true } });
  if (members.length === 0) return { avgGap: 0, traineeCount: 0 };
  const scores = await prisma.competencyScore.findMany({
    where: { userId: { in: members.map((m) => m.userId) } },
    select: { userId: true, score: true, requiredScore: true },
  });
  const byUser = new Map<string, { gap: number; n: number }>();
  for (const s of scores) {
    if (s.requiredScore <= 0) continue;
    const gap = Math.max(0, ((s.requiredScore - s.score) / s.requiredScore) * 100);
    const cur = byUser.get(s.userId) ?? { gap: 0, n: 0 };
    cur.gap += gap;
    cur.n += 1;
    byUser.set(s.userId, cur);
  }
  const means: number[] = [];
  byUser.forEach((v) => {
    if (v.n > 0) means.push(v.gap / v.n);
  });
  const avgGap = means.length === 0 ? 0 : Math.round(means.reduce((a, b) => a + b, 0) / means.length);
  return { avgGap, traineeCount: members.length };
}

export async function getAssignedCohorts(trainerId: string, isAdmin: boolean): Promise<AssignedCohort[]> {
  const allocations = isAdmin
    ? []
    : await prisma.trainerCohort.findMany({ where: { trainerId }, select: { cohortId: true, matchScore: true } });
  const allocMap = new Map(allocations.map((a) => [a.cohortId, a.matchScore]));
  const allocIds: string[] = [];
  allocMap.forEach((_score, cohortId) => {
    allocIds.push(cohortId);
  });
  const cohorts = await prisma.cohort.findMany({
    where: isAdmin ? {} : { id: { in: allocIds } },
    orderBy: { startDate: 'desc' },
    include: { station: { select: { name: true } }, track: { select: { code: true } } },
  });
  const out: AssignedCohort[] = [];
  for (const c of cohorts) {
    const stats = await cohortAvgGap(c.id);
    out.push({
      id: c.id,
      code: c.code,
      name: c.name,
      station: c.station?.name ?? null,
      trackCode: c.track?.code ?? null,
      traineeCount: stats.traineeCount,
      avgGap: stats.avgGap,
      startDate: c.startDate.toISOString(),
      endDate: c.endDate ? c.endDate.toISOString() : null,
      status: c.status,
      matchScore: allocMap.get(c.id) ?? null,
      scope: isAdmin && !allocMap.has(c.id) ? 'OVERSIGHT' : 'ALLOCATED',
    });
  }
  return out;
}

export async function getCohortDetail(trainerId: string, isAdmin: boolean, cohortId: string): Promise<CohortDetailView> {
  const ids = await accessibleCohortIds(trainerId, isAdmin);
  assertCohortAccess(ids, cohortId);
  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { station: { select: { name: true } }, track: { select: { code: true } } },
  });
  if (!cohort) {
    const e = new Error('Cohort not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'COHORT_NOT_FOUND';
    throw e;
  }

  const [members, sessions, attendance, scores, users] = await Promise.all([
    prisma.cohortMember.findMany({ where: { cohortId }, orderBy: { joinedAt: 'asc' } }),
    prisma.cohortSession.findMany({ where: { cohortId }, orderBy: { startsAt: 'asc' } }),
    prisma.attendance.findMany({ where: { session: { cohortId } } }),
    prisma.competencyScore.findMany({ where: { userId: { in: (await prisma.cohortMember.findMany({ where: { cohortId }, select: { userId: true } })).map((m) => m.userId) } } }),
    prisma.user.findMany({
      where: { cohortMemberships: { some: { cohortId } } },
      include: { profile: { select: { fullName: true } }, station: { select: { name: true } } },
    }),
  ]);

  const userById = new Map(users.map((u) => [u.id, u]));
  const scoresByUser = new Map<string, typeof scores>();
  for (const s of scores) {
    const arr = scoresByUser.get(s.userId) ?? [];
    arr.push(s);
    scoresByUser.set(s.userId, arr);
  }
  const attBySession = new Map<string, Map<string, string>>();
  for (const a of attendance) {
    let m = attBySession.get(a.sessionId);
    if (!m) {
      m = new Map();
      attBySession.set(a.sessionId, m);
    }
    m.set(a.userId, a.status);
  }
  const attByUser = new Map<string, { earned: number; marked: number }>();
  for (const a of attendance) {
    const cur = attByUser.get(a.userId) ?? { earned: 0, marked: 0 };
    cur.marked += 1;
    if (a.status === 'PRESENT' || a.status === 'EXCUSED') cur.earned += 1;
    else if (a.status === 'LATE') cur.earned += 0.5;
    attByUser.set(a.userId, cur);
  }

  const now = Date.now();
  const memberViews: CohortMemberView[] = members.map((m) => {
    const u = userById.get(m.userId);
    const name = u?.profile?.fullName ?? u?.email ?? 'Unknown trainee';
    const rows = (scoresByUser.get(m.userId) ?? []).map((s) => ({
      domain: s.domain,
      score: Math.round(s.score),
      required: Math.round(s.requiredScore),
      gap: s.requiredScore > 0 ? Math.round((Math.max(0, s.requiredScore - s.score) / s.requiredScore) * 100) : 0,
    }));
    for (const d of COMPETENCY_DOMAINS) {
      if (!rows.some((r) => r.domain === d)) rows.push({ domain: d, score: 0, required: 80, gap: 100 });
    }
    rows.sort((a, b) => b.gap - a.gap);
    const overall = Math.round(rows.reduce((n, r) => n + r.score, 0) / Math.max(1, rows.length));
    const worst = rows[0];
    const att = attByUser.get(m.userId);
    const attendancePct = att && att.marked > 0 ? Math.round((att.earned / att.marked) * 100) : Math.round(m.attendancePct);
    const lastActive = u?.lastActiveAt ?? m.lastActiveAt;
    const inactiveDays = lastActive ? Math.floor((now - lastActive.getTime()) / 86400000) : null;
    const riskReasons: string[] = [];
    if (worst && worst.gap > GAP_RISK_THRESHOLD) riskReasons.push(`Gap ${worst.gap}% in ${worst.domain}`);
    if (inactiveDays !== null && inactiveDays > INACTIVE_RISK_DAYS) riskReasons.push(`Inactive ${inactiveDays} days`);
    return {
      userId: m.userId,
      name,
      initials: initialsOf(name),
      station: u?.station?.name ?? null,
      scores: rows,
      overallReadiness: overall,
      worstGap: worst ? worst.gap : 0,
      attendancePct,
      lastActiveAt: lastActive ? lastActive.toISOString() : null,
      inactiveDays,
      riskFlag: riskReasons.length > 0,
      riskReasons,
    };
  });

  const matrix: Record<string, Record<string, string>> = {};
  for (const s of sessions) {
    const rec: Record<string, string> = {};
    const m = attBySession.get(s.id);
    if (m) m.forEach((status, userId) => {
      rec[userId] = status;
    });
    matrix[s.id] = rec;
  }

  const stats = await cohortAvgGap(cohortId);
  const alloc = isAdmin
    ? await prisma.trainerCohort.findFirst({ where: { cohortId }, select: { matchScore: true } })
    : await prisma.trainerCohort.findFirst({ where: { cohortId, trainerId }, select: { matchScore: true } });

  return {
    cohort: {
      id: cohort.id,
      code: cohort.code,
      name: cohort.name,
      station: cohort.station?.name ?? null,
      trackCode: cohort.track?.code ?? null,
      traineeCount: members.length,
      avgGap: stats.avgGap,
      startDate: cohort.startDate.toISOString(),
      endDate: cohort.endDate ? cohort.endDate.toISOString() : null,
      status: cohort.status,
      matchScore: alloc?.matchScore ?? null,
      scope: 'ALLOCATED',
    },
    members: memberViews,
    sessions: sessions.map((s) => ({
      id: s.id,
      title: s.title,
      type: s.type,
      startsAt: s.startsAt.toISOString(),
      endsAt: s.endsAt ? s.endsAt.toISOString() : null,
      location: s.location,
      markedCount: attBySession.get(s.id)?.size ?? 0,
      memberCount: members.length,
    })),
    attendance: matrix,
  };
}

export async function setAttendance(
  trainerId: string,
  isAdmin: boolean,
  cohortId: string,
  sessionId: string,
  records: Array<{ userId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' }>
): Promise<{ matrix: Record<string, string>; attendancePct: Record<string, number> }> {
  const ids = await accessibleCohortIds(trainerId, isAdmin);
  assertCohortAccess(ids, cohortId);
  const session = await prisma.cohortSession.findFirst({ where: { id: sessionId, cohortId } });
  if (!session) {
    const e = new Error('Session not found in this cohort.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'SESSION_NOT_FOUND';
    throw e;
  }
  const memberIds = new Set((await prisma.cohortMember.findMany({ where: { cohortId }, select: { userId: true } })).map((m) => m.userId));
  for (const r of records) {
    if (!memberIds.has(r.userId)) {
      const e = new Error(`Trainee is not a member of this cohort.`) as Error & { status?: number; code?: string };
      e.status = 400;
      e.code = 'NOT_A_MEMBER';
      throw e;
    }
    await prisma.attendance.upsert({
      where: { sessionId_userId: { sessionId, userId: r.userId } },
      update: { status: r.status, markedById: trainerId },
      create: { sessionId, userId: r.userId, status: r.status, markedById: trainerId },
    });
  }
  // Recompute attendance % per touched member across all cohort sessions.
  const pct: Record<string, number> = {};
  const matrix: Record<string, string> = {};
  for (const r of records) {
    const all = await prisma.attendance.findMany({ where: { userId: r.userId, session: { cohortId } } });
    let earned = 0;
    for (const a of all) {
      if (a.status === 'PRESENT' || a.status === 'EXCUSED') earned += 1;
      else if (a.status === 'LATE') earned += 0.5;
    }
    const value = all.length === 0 ? 0 : Math.round((earned / all.length) * 100);
    pct[r.userId] = value;
    matrix[r.userId] = r.status;
    await prisma.cohortMember.update({
      where: { cohortId_userId: { cohortId, userId: r.userId } },
      data: { attendancePct: value },
    });
  }
  return { matrix, attendancePct: pct };
}

export async function listNotes(trainerId: string, cohortId: string | null, traineeId: string | null): Promise<TrainerNoteView[]> {
  const ids = await accessibleCohortIds(trainerId, false);
  const where: { trainerId: string; cohortId?: string; traineeId?: string } = { trainerId };
  if (cohortId) {
    if (ids !== null && !ids.has(cohortId)) assertCohortAccess(ids, cohortId);
    where.cohortId = cohortId;
  }
  if (traineeId) where.traineeId = traineeId;
  const rows = await prisma.trainerNote.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: { trainee: { include: { profile: { select: { fullName: true } } } } },
  });
  return rows.map((n) => ({
    id: n.id,
    traineeId: n.traineeId,
    traineeName: n.trainee.profile?.fullName ?? n.trainee.email,
    cohortId: n.cohortId,
    note: n.note,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));
}

export async function createNote(trainerId: string, cohortId: string | null, traineeId: string, note: string): Promise<TrainerNoteView> {
  const ids = await accessibleCohortIds(trainerId, false);
  // Trainee must belong to an accessible cohort.
  const memberships = await prisma.cohortMember.findMany({ where: { userId: traineeId }, select: { cohortId: true } });
  const ok = memberships.some((m) => ids === null || ids.has(m.cohortId));
  if (!ok) {
    const e = new Error('Trainee is not in any of your cohorts.') as Error & { status?: number; code?: string };
    e.status = 403;
    e.code = 'NOTE_FORBIDDEN';
    throw e;
  }
  if (cohortId && ids !== null && !ids.has(cohortId)) assertCohortAccess(ids, cohortId);
  const created = await prisma.trainerNote.create({
    data: { trainerId, traineeId, cohortId, note: sanitizeText(note) },
    include: { trainee: { include: { profile: { select: { fullName: true } } } } },
  });
  return {
    id: created.id,
    traineeId: created.traineeId,
    traineeName: created.trainee.profile?.fullName ?? created.trainee.email,
    cohortId: created.cohortId,
    note: created.note,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
  };
}

export async function deleteNote(trainerId: string, noteId: string): Promise<void> {
  const existing = await prisma.trainerNote.findFirst({ where: { id: noteId, trainerId } });
  if (!existing) {
    const e = new Error('Note not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'NOTE_NOT_FOUND';
    throw e;
  }
  await prisma.trainerNote.delete({ where: { id: noteId } });
}

export interface RemediationInput {
  title: string;
  message?: string;
  lessonCodes: string[];
  traineeIds: string[];
}

/** Create pack + assignments + notifications atomically. */
export async function sendRemediationPack(
  trainerId: string,
  cohortId: string,
  input: RemediationInput
): Promise<{ packId: string; assigned: number; notified: number }> {
  const ids = await accessibleCohortIds(trainerId, false);
  assertCohortAccess(ids, cohortId);
  const memberIds = new Set((await prisma.cohortMember.findMany({ where: { cohortId }, select: { userId: true } })).map((m) => m.userId));
  for (const t of input.traineeIds) {
    if (!memberIds.has(t)) {
      const e = new Error('A selected trainee is not in this cohort.') as Error & { status?: number; code?: string };
      e.status = 400;
      e.code = 'NOT_A_MEMBER';
      throw e;
    }
  }
  const lessons = await prisma.lesson.findMany({
    where: { code: { in: input.lessonCodes }, status: 'PUBLISHED' },
    select: { code: true, title: true },
  });
  if (lessons.length !== input.lessonCodes.length) {
    const e = new Error('A selected lesson is not published.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'LESSON_NOT_PUBLISHED';
    throw e;
  }
  const lessonTitles = lessons.map((l) => l.title).join('; ');
  const cleanTitle = sanitizeText(input.title, 120);
  const cleanMessage = sanitizeOptional(input.message);
  const result = await prisma.$transaction(async (tx) => {
    const pack = await tx.remediationPack.create({
      data: {
        trainerId,
        cohortId,
        title: cleanTitle,
        message: cleanMessage,
        lessonIds: input.lessonCodes,
        status: 'SENT',
      },
    });
    for (const userId of input.traineeIds) {
      await tx.remediationAssignment.upsert({
        where: { packId_userId: { packId: pack.id, userId } },
        update: {},
        create: { packId: pack.id, userId },
      });
    }
    return pack.id;
  });
  for (const userId of input.traineeIds) {
    await notifyUser({
      userId,
      type: 'REMEDIATION_RECEIVED',
      title: `Remediation pack: ${cleanTitle}`,
      body: `${input.lessonCodes.length} micro-lesson(s) assigned: ${lessonTitles}. ${cleanMessage ?? ''}`.trim(),
      link: '/trainee',
    });
  }
  return { packId: result, assigned: input.traineeIds.length, notified: input.traineeIds.length };
}

// ---------------------------------------------------------------------------
// Course authoring
// ---------------------------------------------------------------------------

export function serializeBlocks(blocks: LessonBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.kind === 'text') {
      parts.push(b.markdown);
    } else if (b.kind === 'video') {
      parts.push(`[Video${b.caption ? `: ${b.caption}` : ''}](${b.url})`);
    } else if (b.kind === 'file') {
      parts.push(`[Download: ${b.name}](${b.url})`);
    } else if (b.kind === 'code') {
      parts.push(`\`\`\`${b.language}\n${b.code}\n\`\`\`${b.caption ? `\n*${b.caption}*` : ''}`);
    } else if (b.kind === 'quiz') {
      const lines = b.options.map((o) => {
        const mark = b.correctIds.includes(o.id) ? ' (correct)' : '';
        return `- ${o.text}${mark}`;
      });
      parts.push(`**Practice check:** ${b.prompt}\n${lines.join('\n')}${b.explanation ? `\n> ${b.explanation}` : ''}`);
    }
  }
  return parts.join('\n\n');
}

function toResourceList(value: unknown): AuthoringLessonDetail['resources'] {
  if (!Array.isArray(value)) return [];
  const out: AuthoringLessonDetail['resources'] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec['id'] !== 'string' || typeof rec['name'] !== 'string' || typeof rec['url'] !== 'string') continue;
    out.push({
      id: rec['id'],
      name: rec['name'],
      url: rec['url'],
      kind: typeof rec['kind'] === 'string' ? rec['kind'] : 'LINK',
      size: typeof rec['size'] === 'string' ? rec['size'] : undefined,
    });
  }
  return out;
}

function toBlocks(value: unknown): LessonBlock[] {
  if (!Array.isArray(value)) return [];
  const out: LessonBlock[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec['id'] !== 'string' || typeof rec['kind'] !== 'string') continue;
    const id = rec['id'] as string;
    if (rec['kind'] === 'text' && typeof rec['markdown'] === 'string') out.push({ id, kind: 'text', markdown: rec['markdown'] as string });
    else if (rec['kind'] === 'video' && typeof rec['url'] === 'string')
      out.push({ id, kind: 'video', url: rec['url'] as string, caption: typeof rec['caption'] === 'string' ? (rec['caption'] as string) : undefined });
    else if (rec['kind'] === 'file' && typeof rec['url'] === 'string' && typeof rec['name'] === 'string')
      out.push({
        id,
        kind: 'file',
        url: rec['url'] as string,
        name: rec['name'] as string,
        fileKind: typeof rec['fileKind'] === 'string' ? (rec['fileKind'] as string) : 'LINK',
        size: typeof rec['size'] === 'string' ? (rec['size'] as string) : undefined,
      });
    else if (rec['kind'] === 'quiz' && typeof rec['prompt'] === 'string' && Array.isArray(rec['options']) && Array.isArray(rec['correctIds']))
      out.push({
        id,
        kind: 'quiz',
        prompt: rec['prompt'] as string,
        questionType: rec['questionType'] === 'MULTI_CHOICE' || rec['questionType'] === 'TRUE_FALSE' ? rec['questionType'] : 'SINGLE_CHOICE',
        options: (rec['options'] as unknown[]).filter((o): o is { id: string; text: string } => typeof o === 'object' && o !== null && typeof (o as Record<string, unknown>)['id'] === 'string' && typeof (o as Record<string, unknown>)['text'] === 'string') as { id: string; text: string }[],
        correctIds: (rec['correctIds'] as unknown[]).filter((c): c is string => typeof c === 'string'),
        explanation: typeof rec['explanation'] === 'string' ? (rec['explanation'] as string) : undefined,
      });
    else if (rec['kind'] === 'code' && typeof rec['code'] === 'string')
      out.push({ id, kind: 'code', language: typeof rec['language'] === 'string' ? (rec['language'] as string) : 'text', code: rec['code'] as string, caption: typeof rec['caption'] === 'string' ? (rec['caption'] as string) : undefined });
  }
  return out;
}

export async function listAuthoringLessons(): Promise<AuthoringLessonRow[]> {
  const rows = await prisma.lesson.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 200,
    include: { module: { select: { code: true, track: { select: { code: true } } } } },
  });
  return rows.map((l) => ({
    id: l.id,
    code: l.code,
    title: l.title,
    status: l.status,
    version: l.version,
    moduleCode: l.module.code,
    trackCode: l.module.track.code,
    updatedAt: l.updatedAt.toISOString(),
    hasBlocks: Array.isArray(l.blocks) && l.blocks.length > 0,
  }));
}

export async function getLessonForEdit(id: string): Promise<AuthoringLessonDetail | null> {
  const l = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: { select: { code: true, track: { select: { code: true } } } },
      versions: { orderBy: { version: 'desc' }, include: { createdBy: { include: { profile: { select: { fullName: true } } } } } },
    },
  });
  if (!l) return null;
  return {
    id: l.id,
    code: l.code,
    title: l.title,
    status: l.status,
    version: l.version,
    moduleCode: l.module.code,
    trackCode: l.module.track.code,
    updatedAt: l.updatedAt.toISOString(),
    hasBlocks: Array.isArray(l.blocks) && l.blocks.length > 0,
    content: l.content,
    contentType: l.contentType,
    videoUrl: l.videoUrl,
    pdfUrl: l.pdfUrl,
    resources: toResourceList(l.resources),
    wmoTags: toStringArray(l.wmoTags),
    isPreviewFree: l.isPreviewFree,
    isOfflineAvailable: l.isOfflineAvailable,
    sortOrder: l.sortOrder,
    blocks: toBlocks(l.blocks),
    versions: l.versions.map((v) => ({
      version: v.version,
      content: v.content,
      changelog: v.changelog,
      createdAt: v.createdAt.toISOString(),
      authorName: v.createdBy?.profile?.fullName ?? null,
    })),
  };
}

export interface LessonUpsertInput {
  title: string;
  blocks: LessonBlock[];
  wmoTags: string[];
  contentType: 'MARKDOWN' | 'VIDEO' | 'PDF' | 'QUIZ' | 'MIXED';
  videoUrl?: string | null;
  pdfUrl?: string | null;
  resources?: Array<{ id: string; name: string; url: string; kind: string; size?: string }>;
  isPreviewFree?: boolean;
  isOfflineAvailable?: boolean;
}

export async function createLesson(trainerId: string, moduleCode: string, input: LessonUpsertInput): Promise<AuthoringLessonDetail> {
  const mod = await prisma.trainingModule.findUnique({
    where: { code: moduleCode.toUpperCase() },
    include: { lessons: { select: { sortOrder: true, code: true } } },
  });
  if (!mod) {
    const e = new Error('Module not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'MODULE_NOT_FOUND';
    throw e;
  }
  const sortOrder = mod.lessons.reduce((n, l) => Math.max(n, l.sortOrder), 0) + 1;
  let code = `${mod.code}-L${String(sortOrder).padStart(2, '0')}`;
  const taken = new Set(mod.lessons.map((l) => l.code));
  let n = sortOrder;
  while (taken.has(code)) {
    n += 1;
    code = `${mod.code}-L${String(n).padStart(2, '0')}`;
  }
  const content = serializeBlocks(input.blocks);
  const created = await prisma.lesson.create({
    data: {
      code,
      moduleId: mod.id,
      title: input.title,
      content: content || '# Untitled lesson',
      contentType: input.contentType,
      videoUrl: input.videoUrl ?? null,
      pdfUrl: input.pdfUrl ?? null,
      resources: input.resources ?? [],
      status: 'DRAFT',
      isPreviewFree: input.isPreviewFree ?? false,
      isOfflineAvailable: input.isOfflineAvailable ?? false,
      sortOrder,
      wmoTags: input.wmoTags,
      blocks: JSON.parse(JSON.stringify(input.blocks)) as object,
      versions: { create: { version: 1, content: content || '# Untitled lesson', changelog: 'Draft created', createdById: trainerId } },
    },
  });
  const detail = await getLessonForEdit(created.id);
  if (!detail) throw new Error('Lesson creation failed.');
  void indexLesson(created.id);
  return detail;
}

export type LessonAction = 'draft' | 'publish' | 'archive' | 'rollback';
export async function updateLesson(
  trainerId: string,
  id: string,
  input: LessonUpsertInput,
  action: LessonAction,
  rollbackVersion?: number
): Promise<AuthoringLessonDetail> {
  const existing = await prisma.lesson.findUnique({ where: { id } });
  if (!existing) {
    const e = new Error('Lesson not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'LESSON_NOT_FOUND';
    throw e;
  }
  const content = serializeBlocks(input.blocks);
  const blocksJson = JSON.parse(JSON.stringify(input.blocks)) as object;

  if (action === 'archive') {
    await prisma.lesson.update({ where: { id }, data: { status: 'ARCHIVED' } });
    const detail = await getLessonForEdit(id);
    if (!detail) throw new Error('Lesson update failed.');
    void indexLesson(id);
    return detail;
  }

  if (action === 'rollback') {
    if (!rollbackVersion) {
      const e = new Error('rollbackVersion is required.') as Error & { status?: number; code?: string };
      e.status = 400;
      e.code = 'VERSION_REQUIRED';
      throw e;
    }
    const snap = await prisma.lessonVersion.findUnique({ where: { lessonId_version: { lessonId: id, version: rollbackVersion } } });
    if (!snap) {
      const e = new Error('Version not found.') as Error & { status?: number; code?: string };
      e.status = 404;
      e.code = 'VERSION_NOT_FOUND';
      throw e;
    }
    // Restore content; blocks collapse to a single text block (versions
    // predate granular block snapshots — documented in the studio UI).
    const restoredBlocks: LessonBlock[] = [{ id: `blk-rollback-v${snap.version}`, kind: 'text', markdown: snap.content }];
    const nextVersion = existing.version + 1;
    await prisma.$transaction([
      prisma.lessonVersion.create({
        data: { lessonId: id, version: nextVersion, content: snap.content, changelog: `Rollback to v${snap.version}`, createdById: trainerId },
      }),
      prisma.lesson.update({
        where: { id },
        data: { content: snap.content, blocks: JSON.parse(JSON.stringify(restoredBlocks)) as object, version: nextVersion },
      }),
    ]);
    const detail = await getLessonForEdit(id);
    if (!detail) throw new Error('Lesson update failed.');
    void indexLesson(id);
    return detail;
  }

  const base = {
    title: input.title,
    content: content || existing.content,
    contentType: input.contentType,
    videoUrl: input.videoUrl ?? null,
    pdfUrl: input.pdfUrl ?? null,
    resources: input.resources ?? [],
    wmoTags: input.wmoTags,
    isPreviewFree: input.isPreviewFree ?? false,
    isOfflineAvailable: input.isOfflineAvailable ?? false,
    blocks: blocksJson,
  };
  if (action === 'publish') {
    const nextVersion = existing.version + 1;
    await prisma.$transaction([
      prisma.lessonVersion.create({
        data: { lessonId: id, version: nextVersion, content: base.content, changelog: `Published v${nextVersion}`, createdById: trainerId },
      }),
      prisma.lesson.update({
        where: { id },
        data: { ...base, version: nextVersion, status: 'PUBLISHED', publishedAt: new Date() },
      }),
    ]);
  } else {
    await prisma.lesson.update({ where: { id }, data: { ...base, status: 'DRAFT' } });
  }
  const detail = await getLessonForEdit(id);
  if (!detail) throw new Error('Lesson update failed.');
  void indexLesson(id);
  return detail;
}

export async function listAuthoringModules(): Promise<AuthoringModuleOption[]> {
  const mods = await prisma.trainingModule.findMany({
    orderBy: [{ track: { code: 'asc' } }, { sortOrder: 'asc' }],
    include: { track: { select: { code: true } }, lessons: { select: { id: true } } },
  });
  return mods.map((m) => ({ code: m.code, title: m.title, trackCode: m.track.code, lessonCount: m.lessons.length }));
}

export async function createModule(input: {
  trackCode: string;
  title: string;
  description: string;
  level: 'FOUNDATION' | 'ADVANCED';
  durationHours: number;
}): Promise<{ code: string; title: string }> {
  const track = await prisma.trainingTrack.findUnique({
    where: { code: input.trackCode.toUpperCase() },
    include: { modules: { select: { code: true, sortOrder: true } } },
  });
  if (!track) {
    const e = new Error('Track not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'TRACK_NOT_FOUND';
    throw e;
  }
  const sortOrder = track.modules.reduce((n, m) => Math.max(n, m.sortOrder), 0) + 1;
  let code = `${track.code}-M${String(sortOrder).padStart(2, '0')}`;
  const taken = new Set(track.modules.map((m) => m.code));
  let n = sortOrder;
  while (taken.has(code)) {
    n += 1;
    code = `${track.code}-M${String(n).padStart(2, '0')}`;
  }
  const created = await prisma.trainingModule.create({
    data: {
      code,
      trackId: track.id,
      title: input.title,
      description: input.description,
      outcomes: [],
      wmoTags: [],
      level: input.level,
      durationHours: input.durationHours,
      sortOrder,
      isPublished: false,
    },
  });
  return { code: created.code, title: created.title };
}

export async function getWmoTagSuggestions(): Promise<{ wmoTags: string[]; domains: string[] }> {
  const comps = await prisma.competency.findMany({ select: { wmoCode: true, domainCode: true } });
  const wmo = new Set<string>();
  const domains = new Set<string>();
  for (const c of comps) {
    if (c.wmoCode) wmo.add(c.wmoCode);
    if (c.domainCode) domains.add(c.domainCode);
  }
  const wmoTags: string[] = [];
  wmo.forEach((w) => wmoTags.push(w));
  const domainList: string[] = [];
  domains.forEach((d) => domainList.push(d));
  return { wmoTags: wmoTags.sort(), domains: domainList.sort() };
}

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

export async function listBanks(trainerId: string): Promise<QuestionBankView[]> {
  const banks = await prisma.questionBank.findMany({ orderBy: { createdAt: 'asc' } });
  const out: QuestionBankView[] = [];
  for (const b of banks) {
    const total = await prisma.question.count({ where: { bankId: b.id } });
    out.push({ id: b.id, name: b.name, description: b.description, total, mine: b.ownerId === trainerId });
  }
  return out;
}

export interface QuestionFilters {
  bankId?: string;
  competency?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  blooms?: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
  q?: string;
}

export async function bankQuestions(filters: QuestionFilters): Promise<BankQuestionView[]> {
  const rows = await prisma.question.findMany({
    where: {
      bankId: filters.bankId ?? undefined,
      competencyTag: filters.competency ?? undefined,
      difficulty: filters.difficulty ?? undefined,
      bloomsLevel: filters.blooms ?? undefined,
      ...(filters.q ? { questionText: { contains: filters.q, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 300,
  });
  return rows.map((q) => ({
    id: q.id,
    bankId: q.bankId,
    text: q.questionText,
    type: q.questionType,
    options: toOptions(q.options),
    correct: toCorrectAnswer(q.correctOption),
    weight: q.weight,
    explanation: q.explanation,
    competencyTag: q.competencyTag,
    difficulty: q.difficulty,
    bloomsLevel: q.bloomsLevel,
    wmoRef: q.wmoRef,
    usageCount: q.usageCount,
    difficultyIndex: q.difficultyIndex,
    discriminationIndex: q.discriminationIndex,
  }));
}

function toCorrectAnswer(value: unknown): string | string[] {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return '';
}

function toOptions(value: unknown): Array<{ id: string; text: string }> {
  if (!Array.isArray(value)) return [];
  const out: Array<{ id: string; text: string }> = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null) continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec['id'] === 'string' && typeof rec['text'] === 'string') out.push({ id: rec['id'], text: rec['text'] });
  }
  return out;
}

export interface QuestionInput {
  bankId: string;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  options: Array<{ id: string; text: string }>;
  correct: string | string[];
  weight: number;
  explanation?: string;
  competencyTag?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  bloomsLevel: 'REMEMBER' | 'UNDERSTAND' | 'APPLY' | 'ANALYZE' | 'EVALUATE' | 'CREATE';
  wmoRef?: string;
}

export async function createBankQuestion(input: QuestionInput): Promise<BankQuestionView> {
  const bank = await prisma.questionBank.findUnique({ where: { id: input.bankId } });
  if (!bank) {
    const e = new Error('Question bank not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'BANK_NOT_FOUND';
    throw e;
  }
  const maxSort = await prisma.question.findFirst({ where: { bankId: input.bankId }, orderBy: { sortOrder: 'desc' }, select: { sortOrder: true } });
  const created = await prisma.question.create({
    data: {
      bankId: input.bankId,
      questionText: input.text,
      questionType: input.type,
      options: JSON.parse(JSON.stringify(input.options)) as object,
      correctOption: Array.isArray(input.correct) ? input.correct : input.correct,
      weight: input.weight,
      explanation: input.explanation ?? null,
      sortOrder: (maxSort?.sortOrder ?? 0) + 1,
      competencyTag: input.competencyTag ?? null,
      difficulty: input.difficulty,
      bloomsLevel: input.bloomsLevel,
      wmoRef: input.wmoRef ?? null,
    },
  });
  const rows = await bankQuestions({ bankId: input.bankId });
  const found = rows.find((r) => r.id === created.id);
  if (!found) throw new Error('Question creation failed.');
  return found;
}

export async function updateBankQuestion(id: string, input: Partial<QuestionInput>): Promise<BankQuestionView> {
  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing || !existing.bankId) {
    const e = new Error('Bank question not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'QUESTION_NOT_FOUND';
    throw e;
  }
  await prisma.question.update({
    where: { id },
    data: {
      ...(input.text !== undefined ? { questionText: input.text } : {}),
      ...(input.type !== undefined ? { questionType: input.type } : {}),
      ...(input.options !== undefined ? { options: JSON.parse(JSON.stringify(input.options)) as object } : {}),
      ...(input.correct !== undefined ? { correctOption: Array.isArray(input.correct) ? input.correct : input.correct } : {}),
      ...(input.weight !== undefined ? { weight: input.weight } : {}),
      ...(input.explanation !== undefined ? { explanation: input.explanation || null } : {}),
      ...(input.competencyTag !== undefined ? { competencyTag: input.competencyTag || null } : {}),
      ...(input.difficulty !== undefined ? { difficulty: input.difficulty } : {}),
      ...(input.bloomsLevel !== undefined ? { bloomsLevel: input.bloomsLevel } : {}),
      ...(input.wmoRef !== undefined ? { wmoRef: input.wmoRef || null } : {}),
    },
  });
  const rows = await bankQuestions({ bankId: existing.bankId });
  const found = rows.find((r) => r.id === id);
  if (!found) throw new Error('Question update failed.');
  return found;
}

export async function deleteBankQuestion(trainerId: string, isAdmin: boolean, id: string): Promise<void> {
  const existing = await prisma.question.findUnique({
    where: { id },
    include: { bank: { select: { ownerId: true } } },
  });
  if (!existing || !existing.bankId) {
    const e = new Error('Bank question not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'QUESTION_NOT_FOUND';
    throw e;
  }
  if (existing.usageCount > 0) {
    const e = new Error(`Cannot delete: used in ${existing.usageCount} attempt(s). Edit instead.`) as Error & { status?: number; code?: string };
    e.status = 409;
    e.code = 'QUESTION_IN_USE';
    throw e;
  }
  if (!isAdmin && existing.bank?.ownerId !== trainerId) {
    const e = new Error('Only the bank owner (or an admin) may delete questions.') as Error & { status?: number; code?: string };
    e.status = 403;
    e.code = 'DELETE_FORBIDDEN';
    throw e;
  }
  await prisma.question.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// Trainer analytics
// ---------------------------------------------------------------------------

function weekKey(d: Date): string {
  const copy = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (copy.getUTCDay() + 6) % 7;
  copy.setUTCDate(copy.getUTCDate() - day);
  return copy.toISOString().slice(0, 10);
}

export async function getTrainerAnalytics(trainerId: string, isAdmin: boolean, cohortId: string | null): Promise<TrainerAnalytics> {
  const ids = await accessibleCohortIds(trainerId, isAdmin);
  let scopeIds: string[];
  if (cohortId) {
    if (ids !== null && !ids.has(cohortId)) {
      const e = new Error('Cohort is not allocated to you.') as Error & { status?: number; code?: string };
      e.status = 403;
      e.code = 'COHORT_FORBIDDEN';
      throw e;
    }
    scopeIds = [cohortId];
  } else if (ids === null) {
    scopeIds = (await prisma.cohort.findMany({ select: { id: true } })).map((c) => c.id);
  } else {
    scopeIds = [];
    ids.forEach((id) => scopeIds.push(id));
  }
  const memberRows = await prisma.cohortMember.findMany({ where: { cohortId: { in: scopeIds } }, select: { userId: true, cohortId: true } });
  const seenMembers = new Set<string>();
  const memberIds: string[] = [];
  for (const m of memberRows) {
    if (!seenMembers.has(m.userId)) {
      seenMembers.add(m.userId);
      memberIds.push(m.userId);
    }
  }
  const cohort = cohortId ? await prisma.cohort.findUnique({ where: { id: cohortId }, select: { code: true } }) : null;

  if (memberIds.length === 0) {
    return { cohortCode: cohort?.code ?? null, members: 0, masteryCurve: [], domainDist: [], timeOnTask: [], histogram: [], hardest: [] };
  }

  const [submissions, attempts, completions, scores, questions] = await Promise.all([
    prisma.assessmentSubmission.findMany({
      where: { userId: { in: memberIds }, status: { in: ['SUBMITTED', 'GRADED'] } },
      select: { percentage: true, submittedAt: true, timeSpentSeconds: true, assessment: { select: { module: { select: { code: true } } } } },
    }),
    prisma.examAttempt.findMany({
      where: { userId: { in: memberIds }, status: 'GRADED', percentage: { not: null } },
      select: { percentage: true, submittedAt: true, timeSpentSeconds: true, assessment: { select: { passingScorePercentage: true, module: { select: { code: true } } } } },
    }),
    prisma.lessonProgress.findMany({
      where: { userId: { in: memberIds }, completed: true, completedAt: { not: null } },
      select: { completedAt: true, lesson: { select: { module: { select: { code: true, title: true } } } } },
    }),
    prisma.competencyScore.findMany({ where: { userId: { in: memberIds } } }),
    prisma.question.findMany({
      where: { OR: [{ bankId: { not: null } }, { assessment: { module: { track: { cohorts: { some: { id: { in: scopeIds } } } } } } }] },
      select: { id: true, questionText: true, competencyTag: true, usageCount: true, difficultyIndex: true, discriminationIndex: true },
    }),
  ]);

  // Mastery curve: last 12 week buckets.
  const buckets = new Map<string, { scores: number[]; attempts: number; lessons: number }>();
  const weekBuckets: string[] = [];
  const monday = new Date();
  monday.setUTCHours(0, 0, 0, 0);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  for (let i = 11; i >= 0; i--) {
    const d = new Date(monday);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const key = d.toISOString().slice(0, 10);
    weekBuckets.push(key);
    buckets.set(key, { scores: [], attempts: 0, lessons: 0 });
  }
  const bucketFor = (d: Date | null): string | null => {
    if (!d) return null;
    const key = weekKey(d);
    return buckets.has(key) ? key : null;
  };
  for (const s of submissions) {
    const k = bucketFor(s.submittedAt);
    if (!k) continue;
    const b = buckets.get(k);
    if (b) {
      b.scores.push(s.percentage);
      b.attempts += 1;
    }
  }
  for (const a of attempts) {
    const k = bucketFor(a.submittedAt);
    if (!k || a.percentage === null) continue;
    const b = buckets.get(k);
    if (b) {
      b.scores.push(a.percentage);
      b.attempts += 1;
    }
  }
  for (const c of completions) {
    const k = bucketFor(c.completedAt);
    if (!k) continue;
    const b = buckets.get(k);
    if (b) b.lessons += 1;
  }
  const masteryCurve = weekBuckets.map((w) => {
    const b = buckets.get(w);
    const avg = b && b.scores.length > 0 ? Math.round((b.scores.reduce((x, y) => x + y, 0) / b.scores.length) * 10) / 10 : null;
    return { week: w.slice(5), avgScore: avg, attempts: b?.attempts ?? 0, lessonsCompleted: b?.lessons ?? 0 };
  });

  // Domain distribution: mean current vs mean required per domain.
  const byDomain = new Map<string, { sum: number; req: number; n: number; members: Set<string> }>();
  for (const s of scores) {
    const cur = byDomain.get(s.domain) ?? { sum: 0, req: 0, n: 0, members: new Set<string>() };
    cur.sum += s.score;
    cur.req += s.requiredScore;
    cur.n += 1;
    cur.members.add(s.userId);
    byDomain.set(s.domain, cur);
  }
  const domainDist: Array<{ domain: string; avg: number; required: number; members: number }> = [];
  byDomain.forEach((v, domain) => {
    domainDist.push({
      domain,
      avg: Math.round((v.sum / Math.max(1, v.n)) * 10) / 10,
      required: Math.round((v.req / Math.max(1, v.n)) * 10) / 10,
      members: v.members.size,
    });
  });

  // Time on task per module (minutes from attempts + completed lessons).
  const minutes = new Map<string, number>();
  const lessonCount = new Map<string, number>();
  const addMinutes = (code: string | null | undefined, secs: number) => {
    if (!code) return;
    minutes.set(code, (minutes.get(code) ?? 0) + secs / 60);
  };
  for (const s of submissions) addMinutes(s.assessment.module?.code, s.timeSpentSeconds);
  for (const a of attempts) addMinutes(a.assessment.module?.code, a.timeSpentSeconds);
  for (const c of completions) {
    const code = c.lesson.module?.code;
    if (code) lessonCount.set(code, (lessonCount.get(code) ?? 0) + 1);
  }
  const moduleCodes: string[] = [];
  const seenCodes = new Set<string>();
  const collectCodes = (m: Map<string, number>) => {
    m.forEach((_v, code) => {
      if (!seenCodes.has(code)) {
        seenCodes.add(code);
        moduleCodes.push(code);
      }
    });
  };
  collectCodes(minutes);
  collectCodes(lessonCount);
  const timeOnTask = moduleCodes
    .map((module) => ({ module, minutes: Math.round((minutes.get(module) ?? 0) * 10) / 10, lessons: lessonCount.get(module) ?? 0 }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 12);

  // Score histogram (10 bins).
  const bins = new Array<number>(10).fill(0);
  const push = (p: number) => {
    bins[Math.min(9, Math.max(0, Math.floor(p / 10)))] += 1;
  };
  for (const s of submissions) push(s.percentage);
  for (const a of attempts) if (a.percentage !== null) push(a.percentage);
  const histogram = bins.map((count, i) => ({ bin: `${i * 10}–${i * 10 + 9}`, count }));

  // Hardest 5 (need a minimum attempt base to be meaningful).
  const hardest = questions
    .filter((q) => q.usageCount >= 3 && q.difficultyIndex !== null)
    .sort((a, b) => (a.difficultyIndex ?? 1) - (b.difficultyIndex ?? 1))
    .slice(0, 5)
    .map((q) => ({
      id: q.id,
      topic: q.questionText.length > 90 ? `${q.questionText.slice(0, 90)}…` : q.questionText,
      competency: q.competencyTag,
      difficultyIndex: Math.round((q.difficultyIndex ?? 0) * 100) / 100,
      discrimination: q.discriminationIndex === null ? null : Math.round(q.discriminationIndex * 100) / 100,
      attempts: q.usageCount,
    }));

  return { cohortCode: cohort?.code ?? null, members: memberIds.length, masteryCurve, domainDist, timeOnTask, histogram, hardest };
}
