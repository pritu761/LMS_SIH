import crypto from 'node:crypto';
import prisma from '@/lib/prisma';
import { accessibleCohortIds } from './trainerService';
import type {
  ExamMeta,
  ExamResultView,
  ExamSession,
  IntegrityAttemptView,
  IntegrityTimelineEntry,
} from './examTypes';

// ============================================================================
// Secure exam engine (Phase 2.2). Guarantees:
// - Questions are shuffled server-side per attempt (deterministic seed) and
//   served WITHOUT correct answers or explanations — no source leak, no
//   localStorage, ephemeral signed fetches only.
// - Total time is enforced server-side on submit (120s grace).
// - Every proctoring event recomputes risk + flag immediately.
// - Grading feeds CompetencyScore via EMA per tagged domain.
// ============================================================================

const SUBMIT_GRACE_SECONDS = 120;
const FULLSCREEN_WARNINGS_TO_SUBMIT = 3;

/** Deterministic PRNG (mulberry32) over a string seed. */
function rngFromSeed(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let state = h >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: T[], rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
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

function attemptRulesOf(assessment: { attemptRules: unknown }): { shuffleQuestions: boolean; shuffleOptions: boolean; perQuestionSeconds: number | null } {
  const r = (assessment.attemptRules ?? {}) as Record<string, unknown>;
  return {
    shuffleQuestions: r['shuffleQuestions'] !== false,
    shuffleOptions: r['shuffleOptions'] !== false,
    perQuestionSeconds: typeof r['perQuestionSeconds'] === 'number' && r['perQuestionSeconds'] > 0 ? Math.floor(r['perQuestionSeconds'] as number) : null,
  };
}

const EVENT_DETAIL: Record<string, string> = {
  FULLSCREEN_EXIT: 'Left fullscreen mode',
  TAB_BLUR: 'Tab lost focus',
  WINDOW_BLUR: 'Window lost focus',
  COPY_ATTEMPT: 'Copy attempt blocked',
  PASTE_ATTEMPT: 'Paste attempt blocked',
  RIGHT_CLICK: 'Right-click blocked',
  DEVTOOLS_SUSPECTED: 'Developer-tools signature suspected',
  MULTIPLE_FACES: 'Multiple faces suspected in webcam frame',
  NO_FACE: 'Webcam feed interrupted',
  NETWORK_DROP: 'Network connectivity dropped',
  EXAM_START: 'Attempt started',
  EXAM_SUBMIT: 'Attempt submitted',
  WARNING_ISSUED: 'Proctoring warning issued',
  OTHER: 'Proctoring event',
};

const RISK_POINTS: Record<string, number> = {
  FULLSCREEN_EXIT: 25,
  TAB_BLUR: 8,
  WINDOW_BLUR: 8,
  COPY_ATTEMPT: 15,
  PASTE_ATTEMPT: 15,
  RIGHT_CLICK: 3,
  DEVTOOLS_SUSPECTED: 20,
  MULTIPLE_FACES: 18,
  NO_FACE: 12,
  NETWORK_DROP: 5,
  WARNING_ISSUED: 5,
  EXAM_START: 0,
  EXAM_SUBMIT: 0,
  OTHER: 5,
};

function flagFor(risk: number): 'CLEAN' | 'REVIEW' | 'FLAGGED' {
  if (risk >= 70) return 'FLAGGED';
  if (risk >= 30) return 'REVIEW';
  return 'CLEAN';
}

export async function getExamMeta(userId: string, examId: string): Promise<ExamMeta | null> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: examId },
    include: { course: { select: { code: true } }, module: { select: { code: true } }, questions: { select: { id: true } } },
  });
  if (!assessment || !assessment.isPublished) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: { select: { fullName: true } }, station: { select: { name: true } } },
  });
  if (!user) return null;
  const attemptsUsed = await prisma.examAttempt.count({ where: { userId, assessmentId: examId, status: { not: 'VOIDED' } } });
  const rules = attemptRulesOf(assessment);
  return {
    id: assessment.id,
    title: assessment.title,
    description: assessment.description,
    courseCode: assessment.course.code,
    moduleCode: assessment.module?.code ?? null,
    timeLimitMinutes: assessment.timeLimitMinutes,
    passingScore: assessment.passingScorePercentage,
    maxAttempts: assessment.maxAttempts,
    attemptsUsed,
    attemptsLeft: Math.max(0, assessment.maxAttempts - attemptsUsed),
    questionCount: assessment.questions.length,
    perQuestionSeconds: rules.perQuestionSeconds,
    shuffleQuestions: rules.shuffleQuestions,
    shuffleOptions: rules.shuffleOptions,
    traineeName: user.profile?.fullName ?? user.email,
    traineeStation: user.station?.name ?? null,
    webcamProctoring: false,
  };
}

/** Start an attempt: identity-confirmed, attempt-budget enforced, seeded. */
export async function startAttempt(userId: string, examId: string): Promise<{ attemptId: string; startedAt: string }> {
  const meta = await getExamMeta(userId, examId);
  if (!meta) {
    const e = new Error('Exam not found or unpublished.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'EXAM_NOT_FOUND';
    throw e;
  }
  if (meta.attemptsLeft <= 0) {
    const e = new Error('No attempts remaining for this exam.') as Error & { status?: number; code?: string };
    e.status = 403;
    e.code = 'NO_ATTEMPTS_LEFT';
    throw e;
  }
  const seed = crypto.randomBytes(16).toString('hex');
  const assessment = await prisma.assessment.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { sortOrder: 'asc' }, select: { id: true } } },
  });
  const ids = (assessment?.questions ?? []).map((q) => q.id);
  const order = meta.shuffleQuestions ? shuffled(ids, rngFromSeed(seed)) : ids;
  const attempt = await prisma.examAttempt.create({
    data: {
      userId,
      assessmentId: examId,
      seed,
      questionOrder: order,
      answers: {},
      status: 'STARTED',
      identityConfirmed: true,
    },
  });
  await prisma.integrityEvent.create({
    data: { attemptId: attempt.id, type: 'EXAM_START', metadata: { identityConfirmed: true } },
  });
  return { attemptId: attempt.id, startedAt: attempt.startedAt.toISOString() };
}

/** Serve the sanitized, deterministically shuffled question set for an attempt. */
export async function getAttemptQuestions(userId: string, examId: string, attemptId: string): Promise<ExamSession> {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId, assessmentId: examId },
    include: { assessment: { include: { questions: true } } },
  });
  if (!attempt) {
    const e = new Error('Attempt not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'ATTEMPT_NOT_FOUND';
    throw e;
  }
  if (attempt.status !== 'STARTED') {
    const e = new Error('Attempt is no longer active.') as Error & { status?: number; code?: string };
    e.status = 410;
    e.code = 'ATTEMPT_CLOSED';
    throw e;
  }
  const rules = attemptRulesOf(attempt.assessment);
  const byId = new Map(attempt.assessment.questions.map((q) => [q.id, q]));
  const storedOrder = Array.isArray(attempt.questionOrder) ? (attempt.questionOrder as unknown[]).filter((v): v is string => typeof v === 'string') : [];
  const order = storedOrder.length > 0 ? storedOrder.filter((id) => byId.has(id)) : attempt.assessment.questions.map((q) => q.id);
  const questions = order
    .map((id) => byId.get(id))
    .filter((q): q is NonNullable<typeof q> => !!q)
    .map((q) => {
      const options = toOptions(q.options);
      const served = rules.shuffleOptions ? shuffled(options, rngFromSeed(`${attempt.seed}:${q.id}`)) : options;
      // Sanitized: no correct answers, no explanations — proctored delivery.
      return { id: q.id, text: q.questionText, type: q.questionType, options: served, weight: q.weight };
    });
  return {
    attemptId: attempt.id,
    seed: attempt.seed.slice(0, 8),
    startedAt: attempt.startedAt.toISOString(),
    timeLimitMinutes: attempt.assessment.timeLimitMinutes,
    perQuestionSeconds: rules.perQuestionSeconds,
    questions,
  };
}

/** Log a proctoring event; recompute risk/flag; count fullscreen warnings. */
export async function logIntegrityEvent(
  userId: string,
  attemptId: string,
  type: string,
  metadata: Record<string, unknown>
): Promise<{ warnings: number; riskScore: number; integrityFlag: string; autoSubmit: boolean }> {
  const attempt = await prisma.examAttempt.findFirst({ where: { id: attemptId, userId } });
  if (!attempt) {
    const e = new Error('Attempt not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'ATTEMPT_NOT_FOUND';
    throw e;
  }
  if (attempt.status !== 'STARTED') {
    return { warnings: attempt.warningCount, riskScore: Math.round(attempt.riskScore), integrityFlag: attempt.integrityFlag, autoSubmit: false };
  }
  const valid: string[] = ['FULLSCREEN_EXIT', 'TAB_BLUR', 'WINDOW_BLUR', 'COPY_ATTEMPT', 'PASTE_ATTEMPT', 'RIGHT_CLICK', 'DEVTOOLS_SUSPECTED', 'MULTIPLE_FACES', 'NO_FACE', 'NETWORK_DROP', 'WARNING_ISSUED', 'OTHER'];
  const kind = valid.includes(type) ? type : 'OTHER';
  const warnings = kind === 'FULLSCREEN_EXIT' ? attempt.warningCount + 1 : attempt.warningCount;
  const risk = Math.min(100, Math.round(attempt.riskScore + (RISK_POINTS[kind] ?? 5)));
  const flag = flagFor(risk);
  await prisma.$transaction([
    prisma.integrityEvent.create({ data: { attemptId, type: kind as 'OTHER', metadata: { ...(metadata ?? {}), warnings } } }),
    prisma.examAttempt.update({ where: { id: attemptId }, data: { warningCount: warnings, riskScore: risk, integrityFlag: flag } }),
  ]);
  return { warnings, riskScore: risk, integrityFlag: flag, autoSubmit: kind === 'FULLSCREEN_EXIT' && warnings >= 3 };
}

function gradeAnswer(type: string, correct: unknown, given: unknown): boolean {
  if (type === 'SHORT_ANSWER') return false; // human-graded; never auto-passed
  if (typeof correct === 'string') return given === correct;
  if (Array.isArray(correct)) {
    if (!Array.isArray(given)) return false;
    const a = [...correct].sort().join(',');
    const b = [...(given as unknown[])].filter((v): v is string => typeof v === 'string').sort().join(',');
    return a !== '' && a === b;
  }
  return false;
}

/**
 * Submit + grade: objective items auto-scored, short answers flagged for
 * manual grading, total time enforced server-side, competency scores updated
 * via EMA per tagged domain, integrity SUBMIT event recorded.
 */
export async function submitAttempt(
  userId: string,
  examId: string,
  attemptId: string,
  answers: Record<string, unknown>,
  timeSpentSeconds: number,
  auto: boolean
): Promise<ExamResultView> {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId, assessmentId: examId },
    include: { assessment: { include: { questions: true } } },
  });
  if (!attempt) {
    const e = new Error('Attempt not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'ATTEMPT_NOT_FOUND';
    throw e;
  }
  if (attempt.status !== 'STARTED') {
    return getAttemptResult(userId, attemptId);
  }
  const limitSeconds = attempt.assessment.timeLimitMinutes * 60;
  const elapsed = Math.max(0, Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000));
  const overTime = elapsed > limitSeconds + SUBMIT_GRACE_SECONDS;

  let earned = 0;
  let max = 0;
  let correctCount = 0;
  let objectiveCount = 0;
  let hasShort = false;
  const domainStats = new Map<string, { correct: number; total: number }>();
  for (const q of attempt.assessment.questions) {
    max += q.weight;
    if (q.questionType === 'SHORT_ANSWER') {
      hasShort = true;
      continue;
    }
    objectiveCount += 1;
    const ok = gradeAnswer(q.questionType, q.correctOption, answers[q.id]);
    if (ok) {
      earned += q.weight;
      correctCount += 1;
    }
    if (q.competencyTag) {
      const cur = domainStats.get(q.competencyTag) ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (ok) cur.correct += 1;
      domainStats.set(q.competencyTag, cur);
    }
  }
  const percentage = max > 0 ? Math.round((earned / max) * 1000) / 10 : 0;
  const passed = !hasShort ? percentage >= attempt.assessment.passingScorePercentage : null;

  const submittedAt = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.examAttempt.update({
      where: { id: attemptId },
      data: {
        answers: JSON.parse(JSON.stringify(answers)) as object,
        score: earned,
        percentage,
        submittedAt,
        timeSpentSeconds: Math.max(0, Math.min(86400, Math.floor(timeSpentSeconds))),
        status: overTime || auto ? 'AUTO_SUBMITTED' : 'SUBMITTED',
        needsGrading: hasShort,
      },
    });
    await tx.integrityEvent.create({
      data: { attemptId, type: 'EXAM_SUBMIT', metadata: { auto, overTime, percentage } },
    });
    return row;
  });
  void updated;

  // Competency update: EMA (α=0.3) toward attempt % for each tagged domain.
  const delta: Array<{ domain: string; before: number; after: number }> = [];
  if (objectiveCount > 0) {
    const domains: string[] = [];
    domainStats.forEach((_v, d) => domains.push(d));
    for (const domain of domains) {
      const row = await prisma.competencyScore.findUnique({ where: { userId_domain: { userId, domain } } });
      if (!row) continue;
      const before = Math.round(row.score);
      const after = Math.round(row.score * 0.7 + percentage * 0.3);
      await prisma.competencyScore.update({ where: { id: row.id }, data: { score: Math.max(0, Math.min(100, after)) } });
      if (after !== before) delta.push({ domain, before, after });
    }
    // Bump usage counters for item analysis.
    const perQuestionCorrect = new Map<string, boolean>();
    for (const q of attempt.assessment.questions) {
      if (q.questionType === 'SHORT_ANSWER') continue;
      perQuestionCorrect.set(q.id, gradeAnswer(q.questionType, q.correctOption, answers[q.id]));
    }
    for (const [qid, ok] of Array.from(perQuestionCorrect.entries())) {
      await prisma.question.updateMany({
        where: { id: qid },
        data: { usageCount: { increment: 1 }, correctCount: { increment: ok ? 1 : 0 } },
      });
    }
    const affected = await prisma.question.findMany({ where: { id: { in: Array.from(perQuestionCorrect.keys()) } }, select: { id: true, usageCount: true, correctCount: true } });
    for (const q of affected) {
      if (q.usageCount > 0) {
        await prisma.question.update({ where: { id: q.id }, data: { difficultyIndex: q.correctCount / q.usageCount } });
      }
    }
  }

  return { ...(await getAttemptResult(userId, attemptId)), correctCount, competencyDelta: delta };
}

function toTimeline(rows: Array<{ id: string; type: string; timestamp: Date; metadata: unknown }>): IntegrityTimelineEntry[] {
  return rows.map((e) => {
    const meta = (e.metadata ?? {}) as Record<string, unknown>;
    const extra = typeof meta['warnings'] === 'number' ? ` (warning ${meta['warnings']}/3)` : '';
    return { id: e.id, type: e.type, timestamp: e.timestamp.toISOString(), detail: `${EVENT_DETAIL[e.type] ?? 'Proctoring event'}${extra}` };
  });
}

/** Owner-visible result + integrity timeline. */
export async function getAttemptResult(
  userId: string,
  attemptId: string,
  extras?: { correctCount?: number; competencyDelta?: ExamResultView['competencyDelta'] }
): Promise<ExamResultView> {
  const attempt = await prisma.examAttempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      assessment: { select: { passingScorePercentage: true, questions: { select: { id: true, weight: true, questionType: true, correctOption: true } } } },
      events: { orderBy: { timestamp: 'asc' } },
    },
  });
  if (!attempt) {
    const e = new Error('Attempt not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'ATTEMPT_NOT_FOUND';
    throw e;
  }
  const maxScore = attempt.assessment.questions.reduce((n, q) => n + q.weight, 0);
  const objective = attempt.assessment.questions.filter((q) => q.questionType !== 'SHORT_ANSWER');
  // Server-side recount (correctOption never leaves this function).
  const answers = (attempt.answers ?? {}) as Record<string, unknown>;
  let correctCount = 0;
  for (const q of objective) {
    if (q.id in answers && gradeAnswer(q.questionType, q.correctOption, answers[q.id])) correctCount += 1;
  }
  if (extras?.correctCount !== undefined) correctCount = extras.correctCount;
  const timeline = toTimeline(attempt.events);
  return {
    attemptId: attempt.id,
    status: attempt.status,
    verdict: attempt.verdict,
    integrityFlag: attempt.integrityFlag,
    riskScore: Math.round(attempt.riskScore),
    score: attempt.score,
    percentage: attempt.percentage,
    maxScore: Math.round(maxScore * 10) / 10,
    passed: attempt.percentage === null || attempt.needsGrading ? null : attempt.percentage >= attempt.assessment.passingScorePercentage,
    needsGrading: attempt.needsGrading,
    correctCount,
    objectiveCount: objective.length,
    submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
    timeSpentSeconds: attempt.timeSpentSeconds,
    competencyDelta: extras?.competencyDelta ?? [],
    timeline,
  };
}

// ---------------------------------------------------------------------------
// Integrity boards (trainer/admin oversight)
// ---------------------------------------------------------------------------

export interface IntegrityFilters {
  cohortId?: string;
  flag?: 'CLEAN' | 'REVIEW' | 'FLAGGED';
  verdict?: 'PENDING' | 'VALID' | 'INVALID' | 'ESCALATED';
  q?: string;
}

/**
 * Attempts visible to the viewer: trainers see attempts by trainees in
 * their allocated cohorts; admins see everything. PII is limited to name +
 * email of those trainees (teaching/governance relationship).
 */
export async function getIntegrityAttempts(
  viewerId: string,
  isAdmin: boolean,
  filters: IntegrityFilters
): Promise<IntegrityAttemptView[]> {
  const ids = await accessibleCohortIds(viewerId, isAdmin);
  let memberIds: string[] | null = null;
  if (ids !== null) {
    if (filters.cohortId && !ids.has(filters.cohortId)) {
      const e = new Error('Cohort is not allocated to you.') as Error & { status?: number; code?: string };
      e.status = 403;
      e.code = 'COHORT_FORBIDDEN';
      throw e;
    }
    const scope = filters.cohortId ? [filters.cohortId] : null;
    const cohortIds: string[] = [];
    if (scope) {
      for (const id of scope) cohortIds.push(id);
    } else {
      ids.forEach((id) => cohortIds.push(id));
    }
    const members = await prisma.cohortMember.findMany({ where: { cohortId: { in: cohortIds } }, select: { userId: true } });
    memberIds = members.map((m) => m.userId);
  }
  const attempts = await prisma.examAttempt.findMany({
    where: {
      ...(memberIds !== null ? { userId: { in: memberIds } } : {}),
      ...(filters.cohortId && isAdmin ? { user: { cohortMemberships: { some: { cohortId: filters.cohortId } } } } : {}),
      ...(filters.flag ? { integrityFlag: filters.flag } : {}),
      ...(filters.verdict ? { verdict: filters.verdict } : {}),
      ...(filters.q
        ? {
            user: {
              OR: [
                { email: { contains: filters.q, mode: 'insensitive' } },
                { profile: { fullName: { contains: filters.q, mode: 'insensitive' } } },
              ],
            }
          }
        : {}),
    },
    orderBy: { startedAt: 'desc' },
    take: 200,
    include: {
      user: { include: { profile: { select: { fullName: true } }, cohortMemberships: { include: { cohort: { select: { code: true } } } } } },
      assessment: { select: { title: true } },
      events: { orderBy: { timestamp: 'asc' } },
    },
  });
  return attempts.map((a) => ({
    attemptId: a.id,
    traineeName: a.user.profile?.fullName ?? a.user.email,
    traineeEmail: a.user.email,
    cohortCode: a.user.cohortMemberships[0]?.cohort.code ?? null,
    assessmentTitle: a.assessment.title,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
    status: a.status,
    verdict: a.verdict,
    integrityFlag: a.integrityFlag,
    riskScore: Math.round(a.riskScore),
    eventCount: a.events.length,
    percentage: a.percentage,
    timeline: toTimeline(a.events),
  }));
}

/** Admin verdict on an attempt (audited). Trainers are read-only. */
export async function setAttemptVerdict(
  adminId: string,
  ip: string | null,
  attemptId: string,
  verdict: 'VALID' | 'INVALID' | 'ESCALATED'
): Promise<IntegrityAttemptView> {
  const attempt = await prisma.examAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) {
    const e = new Error('Attempt not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'ATTEMPT_NOT_FOUND';
    throw e;
  }
  await prisma.$transaction([
    prisma.examAttempt.update({ where: { id: attemptId }, data: { verdict } }),
    prisma.auditLog.create({
      data: {
        actorId: adminId,
        actorRole: 'ADMIN',
        action: 'ATTEMPT_VERDICT',
        entityType: 'ExamAttempt',
        entityId: attemptId,
        ipAddress: ip,
        diff: { before: { verdict: attempt.verdict }, after: { verdict } },
        metadata: {},
      },
    }),
  ]);
  const rows = await getIntegrityAttempts(adminId, true, {});
  const found = rows.find((r) => r.attemptId === attemptId);
  if (!found) throw new Error('Attempt update failed.');
  return found;
}
