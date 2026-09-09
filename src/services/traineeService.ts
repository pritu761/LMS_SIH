import prisma from '@/lib/prisma';
import { sanitizeOptional } from '@/lib/sanitize';
import type {
  LessonDetailView,
  ModuleStatus,
  PlayerModule,
  PracticeQuestion,
  ResumeTarget,
  ScheduleItem,
  TraineeCertificateView,
  TraineeCompetencyPoint,
  TraineeTracksPayload,
  TraineeTrackView,
} from './traineeTypes';

// ============================================================================
// Trainee dashboard data access (Phase 1.3). Every query is scoped to the
// caller's own userId — there is no userId parameter anywhere, so IDOR /
// cross-role exposure is structurally impossible.
// ============================================================================

export const COMPETENCY_DOMAINS = ['RAD-NOWCAST', 'NWP', 'HPC', 'DISASTER-OPS', 'SYNOPTIC', 'COMMS'] as const;
const DEFAULT_REQUIRED: Record<string, number> = {
  'RAD-NOWCAST': 80,
  NWP: 85,
  HPC: 80,
  'DISASTER-OPS': 75,
  SYNOPTIC: 85,
  COMMS: 70,
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
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

function toCorrect(value: unknown): string | string[] {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return '';
}

/** Competency radar points (0–100) with gap %; defaults for fresh trainees. */
export async function getCompetencyProfile(userId: string): Promise<TraineeCompetencyPoint[]> {
  const rows = await prisma.competencyScore.findMany({ where: { userId } });
  const byDomain = new Map(rows.map((r) => [r.domain, r]));
  return COMPETENCY_DOMAINS.map((domain) => {
    const row = byDomain.get(domain);
    const score = row ? Math.round(row.score) : 0;
    const requiredScore = row ? Math.round(row.requiredScore) : (DEFAULT_REQUIRED[domain] ?? 80);
    return { domain, score, requiredScore, gap: Math.max(0, requiredScore - score) };
  });
}

interface ModuleRow {
  id: string;
  code: string;
  title: string;
  description: string;
  outcomes: unknown;
  wmoTags: unknown;
  durationHours: number;
  sortOrder: number;
  lessonIds: string[];
  prereqIds: Set<string>;
  assessmentIds: string[];
}

/** Module completion map for status derivation. */
async function getCompletionData(userId: string, moduleIds: string[]) {
  const [progress, certs, submissions, attempts] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId, lesson: { moduleId: { in: moduleIds } } },
      select: { lessonId: true, completed: true, lesson: { select: { moduleId: true } } },
    }),
    prisma.certificate.findMany({
      where: { userId, moduleId: { in: moduleIds }, status: 'VALID' },
      select: { moduleId: true },
    }),
    prisma.assessmentSubmission.findMany({
      where: {
        userId,
        assessment: { moduleId: { in: moduleIds } },
        status: { in: ['SUBMITTED', 'GRADED', 'EXPIRED'] },
      },
      orderBy: { submittedAt: 'desc' },
      select: { passed: true, assessment: { select: { moduleId: true } } },
    }),
    prisma.examAttempt.findMany({
      where: { userId, assessment: { moduleId: { in: moduleIds } }, status: 'GRADED' },
      select: {
        percentage: true,
        assessment: { select: { moduleId: true, passingScorePercentage: true } },
      },
    }),
  ]);
  const completedLessons = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
  const startedModules = new Set(progress.map((p) => p.lesson.moduleId));
  const certified = new Set(certs.map((c) => c.moduleId).filter((m): m is string => m !== null));
  const failedModules = new Set<string>();
  for (const s of submissions) {
    const mid = s.assessment.moduleId;
    if (mid && !s.passed) failedModules.add(mid);
  }
  for (const a of attempts) {
    const mid = a.assessment.moduleId;
    if (mid && (a.percentage ?? 100) < a.assessment.passingScorePercentage) failedModules.add(mid);
  }
  return { completedLessons, startedModules, certified, failedModules };
}

function deriveStatus(
  moduleId: string,
  lessonIds: string[],
  prereqIds: Set<string>,
  completedByModule: Map<string, boolean>,
  data: { completedLessons: Set<string>; startedModules: Set<string>; certified: Set<string>; failedModules: Set<string> }
): ModuleStatus {
  const doneCount = lessonIds.filter((id) => data.completedLessons.has(id)).length;
  const complete = data.certified.has(moduleId) || (lessonIds.length > 0 && doneCount === lessonIds.length);
  if (complete) return 'completed';
  let blocked = false;
  prereqIds.forEach((pre) => {
    if (!completedByModule.get(pre)) blocked = true;
  });
  if (blocked) return 'locked';
  if (data.failedModules.has(moduleId)) return 'failed';
  if (data.startedModules.has(moduleId) || doneCount > 0) return 'in-progress';
  return 'available';
}

/**
 * All published tracks with per-module/user status, progress and resume info.
 * Completed flags are resolved iteratively so chained prerequisites unlock
 * correctly within a single pass (topological order = sortOrder).
 */
export async function getTraineeTracks(userId: string): Promise<TraineeTracksPayload> {
  const membership = await prisma.cohortMember.findFirst({
    where: { userId, cohort: { status: 'ACTIVE' } },
    orderBy: { joinedAt: 'asc' },
    include: { cohort: { select: { trackId: true } } },
  });
  const cohortTrackId = membership?.cohort.trackId ?? null;

  const tracks = await prisma.trainingTrack.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      modules: {
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: { where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' } },
          prerequisites: { select: { prerequisiteId: true } },
          assessments: { where: { isPublished: true }, select: { id: true } },
        },
      },
    },
  });

  const allModuleIds = tracks.flatMap((t) => t.modules.map((m) => m.id));
  const [completion, progressRows] = await Promise.all([
    getCompletionData(userId, allModuleIds),
    prisma.lessonProgress.findMany({
      where: { userId },
      select: { lessonId: true, completed: true, bookmark: true },
    }),
  ]);
  const progressMap = new Map(progressRows.map((p) => [p.lessonId, p]));

  const finalized: TraineeTrackView[] = tracks.map((t) => {
    const rows: ModuleRow[] = t.modules.map((m) => ({
      id: m.id,
      code: m.code,
      title: m.title,
      description: m.description,
      outcomes: m.outcomes,
      wmoTags: m.wmoTags,
      durationHours: m.durationHours,
      sortOrder: m.sortOrder,
      lessonIds: m.lessons.map((l) => l.id),
      prereqIds: new Set(m.prerequisites.map((p) => p.prerequisiteId)),
      assessmentIds: m.assessments.map((a) => a.id),
    }));
    // Pass 1: completion flags in topological (sortOrder) order.
    const completedByModule = new Map<string, boolean>();
    for (const m of rows) {
      const doneCount = m.lessonIds.filter((id) => completion.completedLessons.has(id)).length;
      completedByModule.set(
        m.id,
        completion.certified.has(m.id) || (m.lessonIds.length > 0 && doneCount === m.lessonIds.length)
      );
    }
    // Pass 2: statuses + lessons.
    const modules: PlayerModule[] = rows.map((m, mi) => {
      const status = deriveStatus(m.id, m.lessonIds, m.prereqIds, completedByModule, completion);
      const locked = status === 'locked';
      const doneCount = m.lessonIds.filter((id) => completion.completedLessons.has(id)).length;
      return {
        code: m.code,
        title: m.title,
        description: m.description,
        status,
        outcomes: toStringArray(m.outcomes),
        wmoTags: toStringArray(m.wmoTags),
        durationHours: m.durationHours,
        sortOrder: m.sortOrder,
        prerequisiteCodes: rows.filter((r) => m.prereqIds.has(r.id)).map((r) => r.code),
        completedLessons: doneCount,
        totalLessons: m.lessonIds.length,
        lessons: t.modules[mi].lessons.map((l) => ({
          code: l.code ?? '',
          title: l.title,
          contentType: l.contentType,
          sortOrder: l.sortOrder,
          isPreviewFree: l.isPreviewFree,
          completed: progressMap.get(l.id)?.completed ?? false,
          bookmarked: progressMap.get(l.id)?.bookmark ?? false,
          locked: locked && !l.isPreviewFree,
        })),
      };
    });
    const totalLessons = modules.reduce((n, m) => n + m.totalLessons, 0);
    const completedLessons = modules.reduce((n, m) => n + m.completedLessons, 0);
    return {
      code: t.code,
      name: t.name,
      level: t.level,
      domains: toStringArray(t.domains),
      estimatedDurationHrs: t.estimatedDurationHrs,
      certificationBadge: t.certificationBadge,
      isCohortTrack: cohortTrackId === t.id,
      percentComplete: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
      completedLessons,
      totalLessons,
      modules,
    };
  });

  // Resume: latest touched incomplete lesson, else first uncompleted in cohort track.
  let resume: ResumeTarget | null = null;
  const latest = await prisma.lessonProgress.findFirst({
    where: { userId, completed: false },
    orderBy: { updatedAt: 'desc' },
    include: { lesson: { include: { module: { include: { track: { select: { code: true } } } } } } },
  });
  if (latest?.lesson.code) {
    resume = {
      trackCode: latest.lesson.module.track.code,
      moduleCode: latest.lesson.module.code,
      lessonCode: latest.lesson.code,
      lessonTitle: latest.lesson.title,
    };
  } else {
    outer: for (const ft of finalized) {
      if (cohortTrackId && !ft.isCohortTrack) continue;
      for (const m of ft.modules) {
        const next = m.lessons.find((l) => !l.completed && !l.locked && l.code);
        if (next?.code) {
          resume = { trackCode: ft.code, moduleCode: m.code, lessonCode: next.code, lessonTitle: next.title };
          break outer;
        }
      }
      if (cohortTrackId) break;
    }
  }

  const cohortTrackCode = cohortTrackId ? (tracks.find((t) => t.id === cohortTrackId)?.code ?? null) : null;
  return { tracks: finalized, cohortTrackCode, resume };
}

/** Single lesson with content, progress, lock state and practice checkpoint. */
export async function getLessonDetail(userId: string, rawCode: string): Promise<LessonDetailView | null> {
  const code = rawCode.trim().toUpperCase();
  const lesson = await prisma.lesson.findFirst({
    where: { code, status: 'PUBLISHED' },
    include: {
      module: {
        include: {
          track: { select: { code: true, name: true } },
          prerequisites: { select: { prerequisiteId: true } },
          assessments: {
            where: { isPublished: true },
            orderBy: { createdAt: 'asc' },
            take: 1,
            include: { questions: { orderBy: { sortOrder: 'asc' }, take: 3 } },
          },
        },
      },
    },
  });
  if (!lesson || !lesson.module) return null;

  const moduleIds = [lesson.moduleId, ...lesson.module.prerequisites.map((p) => p.prerequisiteId)];
  const completion = await getCompletionData(userId, moduleIds);

  // Prerequisite check (certified OR all lessons complete) for non-free lessons.
  let prereqsMet = true;
  let lockReason: string | null = null;
  if (!lesson.isPreviewFree && lesson.module.prerequisites.length > 0) {
    const preLessons = await prisma.lesson.findMany({
      where: { moduleId: { in: lesson.module.prerequisites.map((p) => p.prerequisiteId) }, status: 'PUBLISHED' },
      select: { id: true, moduleId: true },
    });
    const byModule = new Map<string, string[]>();
    for (const pl of preLessons) {
      const arr = byModule.get(pl.moduleId) ?? [];
      arr.push(pl.id);
      byModule.set(pl.moduleId, arr);
    }
    for (const p of lesson.module.prerequisites) {
      if (completion.certified.has(p.prerequisiteId)) continue;
      const ids = byModule.get(p.prerequisiteId) ?? [];
      const done = ids.filter((id) => completion.completedLessons.has(id)).length;
      if (ids.length === 0 || done < ids.length) {
        prereqsMet = false;
        break;
      }
    }
    if (!prereqsMet) {
      const preCodes = await prisma.trainingModule.findMany({
        where: { id: { in: lesson.module.prerequisites.map((p) => p.prerequisiteId) } },
        select: { code: true },
      });
      lockReason = `Complete prerequisite module${preCodes.length === 1 ? '' : 's'} ${preCodes.map((c) => c.code).join(', ')} first.`;
    }
  }

  const progress = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
  });

  const checkpoint: PracticeQuestion[] = (lesson.module.assessments[0]?.questions ?? []).map((q) => ({
    id: q.id,
    text: q.questionText,
    type: q.questionType,
    options: toOptions(q.options),
    correct: toCorrect(q.correctOption),
    explanation: q.explanation,
  }));

  const resources = toResourceView(lesson.resources);

  return {
    code: lesson.code ?? code,
    title: lesson.title,
    content: lesson.content,
    contentType: lesson.contentType,
    videoUrl: lesson.videoUrl,
    pdfUrl: lesson.pdfUrl,
    resources,
    wmoTags: toStringArray(lesson.wmoTags),
    moduleCode: lesson.module.code,
    moduleTitle: lesson.module.title,
    trackCode: lesson.module.track.code,
    trackName: lesson.module.track.name,
    locked: !prereqsMet,
    lockReason,
    completed: progress?.completed ?? false,
    bookmarked: progress?.bookmark ?? false,
    note: progress?.note ?? null,
    checkpoint,
  };
}

function toResourceView(value: unknown): LessonDetailView['resources'] {
  if (!Array.isArray(value)) return [];
  const out: LessonDetailView['resources'] = [];
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

/** Upsert lesson progress (resume position, completion, bookmark, note). */
export async function updateLessonProgress(
  userId: string,
  input: { lessonCode: string; completed?: boolean; bookmark?: boolean; note?: string | null; positionSeconds?: number }
) {
  const lesson = await prisma.lesson.findFirst({
    where: { code: input.lessonCode.toUpperCase(), status: 'PUBLISHED' },
    select: { id: true, code: true, title: true, module: { select: { code: true, track: { select: { code: true } } } } },
  });
  if (!lesson) return null;
  const data: { completed?: boolean; completedAt?: Date | null; bookmark?: boolean; note?: string | null; lastPositionSeconds?: number } = {};
  if (typeof input.completed === 'boolean') {
    data.completed = input.completed;
    data.completedAt = input.completed ? new Date() : null;
  }
  if (typeof input.bookmark === 'boolean') data.bookmark = input.bookmark;
  if (input.note !== undefined) data.note = sanitizeOptional(input.note);
  if (typeof input.positionSeconds === 'number') data.lastPositionSeconds = input.positionSeconds;
  const row = await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId: lesson.id } },
    update: data,
    create: { userId, lessonId: lesson.id, ...data },
  });

  // Fresh track percent for the progress bar.
  const track = await prisma.trainingTrack.findUnique({
    where: { code: lesson.module.track.code },
    include: { modules: { where: { isPublished: true }, include: { lessons: { where: { status: 'PUBLISHED' }, select: { id: true } } } } },
  });
  const ids = track?.modules.flatMap((m) => m.lessons.map((l) => l.id)) ?? [];
  const done = ids.length === 0 ? 0 : await prisma.lessonProgress.count({ where: { userId, lessonId: { in: ids }, completed: true } });
  return {
    lessonCode: lesson.code ?? input.lessonCode.toUpperCase(),
    completed: row.completed,
    bookmarked: row.bookmark,
    note: row.note,
    trackPercent: ids.length === 0 ? 0 : Math.round((done / ids.length) * 100),
  };
}

/** Cohort sessions + personal events in a window, unified for the calendar. */
export async function getSchedule(userId: string, from: Date, to: Date): Promise<ScheduleItem[]> {
  const [sessions, events] = await Promise.all([
    prisma.cohortSession.findMany({
      where: {
        startsAt: { gte: from, lte: to },
        cohort: { members: { some: { userId } }, status: { in: ['ACTIVE', 'PLANNED'] } },
      },
      orderBy: { startsAt: 'asc' },
      include: { cohort: { select: { code: true } } },
    }),
    prisma.calendarEvent.findMany({
      where: { userId, startsAt: { gte: from, lte: to } },
      orderBy: { startsAt: 'asc' },
    }),
  ]);
  const items: ScheduleItem[] = sessions.map((s) => ({
    id: `session-${s.id}`,
    title: s.title,
    kind: s.type,
    startsAt: s.startsAt.toISOString(),
    endsAt: s.endsAt ? s.endsAt.toISOString() : null,
    location: s.location,
    cohortCode: s.cohort.code,
  }));
  for (const e of events) {
    if (items.some((i) => i.title === e.title && i.startsAt === e.startsAt.toISOString())) continue;
    items.push({
      id: `event-${e.id}`,
      title: e.title,
      kind: 'PERSONAL',
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt ? e.endsAt.toISOString() : null,
      location: e.location,
      cohortCode: null,
    });
  }
  return items.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** Earned certificates (newest first) with score/grade from issue metadata. */
export async function getCertificates(userId: string): Promise<TraineeCertificateView[]> {
  const rows = await prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    include: { module: { select: { title: true, track: { select: { code: true } } } } },
  });
  return rows.map((c) => {
    const meta = (c.metadata ?? {}) as Record<string, unknown>;
    return {
      id: c.id,
      moduleTitle: c.module?.title ?? c.title,
      trackCode: c.module?.track.code ?? (typeof meta['trackCode'] === 'string' ? meta['trackCode'] : null),
      issuedAt: c.issuedAt.toISOString(),
      verificationId: c.verificationId,
      status: c.status,
      score: typeof meta['score'] === 'number' ? meta['score'] : null,
      grade: typeof meta['grade'] === 'string' ? meta['grade'] : null,
    };
  });
}

export interface CertificatePdfRecord {
  traineeName: string;
  moduleTitle: string;
  trackCode: string | null;
  issuedAt: Date;
  verificationId: string;
  status: string;
  score: number | null;
  grade: string | null;
}

/** Owned certificate + holder name for PDF generation (ownership enforced). */
export async function getCertificateForPdf(userId: string, id: string): Promise<CertificatePdfRecord | null> {
  const c = await prisma.certificate.findFirst({
    where: { id, userId },
    include: {
      user: { include: { profile: { select: { fullName: true } } } },
      module: { select: { title: true, track: { select: { code: true } } } },
    },
  });
  if (!c) return null;
  const meta = (c.metadata ?? {}) as Record<string, unknown>;
  return {
    traineeName: c.user.profile?.fullName ?? c.user.email,
    moduleTitle: c.module?.title ?? c.title,
    trackCode: c.module?.track.code ?? (typeof meta['trackCode'] === 'string' ? meta['trackCode'] : null),
    issuedAt: c.issuedAt,
    verificationId: c.verificationId,
    status: c.status,
    score: typeof meta['score'] === 'number' ? meta['score'] : null,
    grade: typeof meta['grade'] === 'string' ? meta['grade'] : null,
  };
}

export interface VerificationRecord {
  holderName: string;
  moduleTitle: string;
  trackCode: string | null;
  issuedAt: string;
  verificationId: string;
  status: string;
}

/** Public verification lookup by verification ID (no login; PII minimal by design). */
export async function getVerificationRecord(verificationId: string): Promise<VerificationRecord | null> {
  const c = await prisma.certificate.findUnique({
    where: { verificationId },
    include: {
      user: { include: { profile: { select: { fullName: true } } } },
      module: { select: { title: true, track: { select: { code: true } } } },
    },
  });
  if (!c) return null;
  const meta = (c.metadata ?? {}) as Record<string, unknown>;
  return {
    holderName: c.user.profile?.fullName ?? 'IMD Officer',
    moduleTitle: c.module?.title ?? c.title,
    trackCode: c.module?.track.code ?? (typeof meta['trackCode'] === 'string' ? meta['trackCode'] : null),
    issuedAt: c.issuedAt.toISOString(),
    verificationId: c.verificationId,
    status: c.status,
  };
}
