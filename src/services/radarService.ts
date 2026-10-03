import prisma from '@/lib/prisma';
import { notifyUser } from '@/lib/notify';
import { sanitizeText } from '@/lib/sanitize';
import { ALL_38_DOPPLER_NODES } from '@/lib/radarNetworkData';
import { MOCK_RADAR_HOTSPOTS } from '@/lib/mockRadarData';
import { accessibleCohortIds } from './trainerService';
import type {
  OpsStation,
  SharedStudy,
  StormTrack,
  TrainingCase,
  AnnotationShape,
} from './radarTypes';

// ============================================================================
// Radar ops data access (Phase 2.3): public stations/alerts surface only
// non-sensitive metadata; case training and annotations are authenticated
// and scoped (trainees see shared studies in their own cohorts; trainers
// annotate within their allocations).
// ============================================================================

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

export function getOpsStations(): OpsStation[] {
  return ALL_38_DOPPLER_NODES.map((n) => ({
    id: n.id,
    code: n.code,
    name: n.name,
    city: n.city,
    state: n.state,
    lat: n.lat,
    lng: n.lng,
    band: n.band,
    maxRangeKm: n.maxRangeKm,
    reflectivityDbz: typeof n.reflectivityDbz === 'number' ? n.reflectivityDbz : null,
    status: n.status,
  }));
}

/** Storm tracks double as the synthetic product-model cells. */
export function getStormTracks(): StormTrack[] {
  return MOCK_RADAR_HOTSPOTS.map((h) => ({
    id: h.id,
    name: h.name,
    lat: h.lat,
    lon: h.lon,
    radiusKm: h.radiusKm,
    peakDbz: h.peakDbz,
    velocityKmh: h.velocityKmH,
    headingDeg: h.headingDeg,
    precipitationType: h.precipitationType,
  }));
}

interface CaseStepRaw {
  t?: unknown;
  label?: unknown;
  note?: unknown;
  tileUrl?: unknown;
  reflectivityNote?: unknown;
}
interface CaseQRaw {
  atStep?: unknown;
  prompt?: unknown;
  options?: unknown;
  answer?: unknown;
  explanation?: unknown;
}

function toSteps(value: unknown): TrainingCase['timesteps'] {
  if (!Array.isArray(value)) return [];
  return (value as CaseStepRaw[]).map((s, i) => ({
    t: typeof s.t === 'number' ? s.t : i,
    label: typeof s.label === 'string' ? s.label : `Step ${i + 1}`,
    note: typeof s.note === 'string' ? s.note : typeof s.reflectivityNote === 'string' ? s.reflectivityNote : '',
  }));
}

function toQuestions(value: unknown): TrainingCase['questions'] {
  if (!Array.isArray(value)) return [];
  const out: TrainingCase['questions'] = [];
  for (const q of value as CaseQRaw[]) {
    if (typeof q.prompt !== 'string' || !Array.isArray(q.options) || typeof q.answer !== 'number') continue;
    out.push({
      atStep: typeof q.atStep === 'number' ? q.atStep : 0,
      prompt: q.prompt,
      options: (q.options as unknown[]).filter((o): o is string => typeof o === 'string'),
      answer: q.answer,
      explanation: typeof q.explanation === 'string' ? q.explanation : '',
    });
  }
  return out;
}

/** Published training cases with the trainee's best scores attached. */
export async function getTrainingCases(userId: string): Promise<TrainingCase[]> {
  const cases = await prisma.radarCase.findMany({ where: { isPublished: true }, orderBy: { code: 'asc' } });
  const attempts = await prisma.radarCaseAttempt.findMany({ where: { userId } });
  const byCase = new Map<string, { best: number; total: number; count: number }>();
  for (const a of attempts) {
    const cur = byCase.get(a.caseId);
    if (!cur || a.score > cur.best) byCase.set(a.caseId, { best: a.score, total: a.total, count: (cur?.count ?? 0) + 1 });
    else byCase.set(a.caseId, { ...cur, count: cur.count + 1 });
  }
  return cases.map((c) => {
    const best = byCase.get(c.id);
    return {
      id: c.id,
      code: c.code,
      title: c.title,
      description: c.description,
      phenomenon: c.phenomenon,
      competencyTag: c.competencyTag,
      timesteps: toSteps(c.timesteps),
      questions: toQuestions(c.questions),
      bestScore: best?.best ?? null,
      bestTotal: best?.total ?? null,
      attempts: best?.count ?? 0,
    };
  });
}

export async function submitCaseAttempt(
  userId: string,
  caseId: string,
  score: number,
  total: number,
  answers: unknown
): Promise<{ bestScore: number; bestTotal: number; attempts: number }> {
  const c = await prisma.radarCase.findFirst({ where: { id: caseId, isPublished: true } });
  if (!c) {
    const e = new Error('Training case not found.') as Error & { status?: number; code?: string };
    e.status = 404;
    e.code = 'CASE_NOT_FOUND';
    throw e;
  }
  if (!Number.isInteger(score) || !Number.isInteger(total) || score < 0 || total <= 0 || score > total) {
    const e = new Error('Score must satisfy 0 ≤ score ≤ total.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'BAD_SCORE';
    throw e;
  }
  await prisma.radarCaseAttempt.create({
    data: { userId, caseId, score, total, answers: Array.isArray(answers) ? (answers as object) : [] },
  });
  const mine = await prisma.radarCaseAttempt.findMany({ where: { userId, caseId }, orderBy: { score: 'desc' } });
  const best = mine[0];
  return { bestScore: best.score, bestTotal: best.total, attempts: mine.length };
}

interface AnnotationInput {
  caseId?: string | null;
  cohortId: string;
  frameT: number;
  drawing: { shapes: unknown };
  note: string;
}

function toShapes(value: unknown): AnnotationShape[] {
  const root = (value ?? {}) as { shapes?: unknown };
  if (!Array.isArray(root.shapes)) return [];
  const out: AnnotationShape[] = [];
  for (const s of root.shapes as Array<Record<string, unknown>>) {
    if (typeof s !== 'object' || s === null) continue;
    if (!['free', 'rect', 'circle', 'arrow'].includes(String(s['tool']))) continue;
    const points = Array.isArray(s['points'])
      ? (s['points'] as unknown[]).filter(
          (p): p is { x: number; y: number } =>
            typeof p === 'object' && p !== null && typeof (p as Record<string, unknown>)['x'] === 'number' && typeof (p as Record<string, unknown>)['y'] === 'number'
        )
      : [];
    if (points.length === 0) continue;
    out.push({
      tool: String(s['tool']) as AnnotationShape['tool'],
      points: points.slice(0, 500).map((p) => ({ x: Math.max(0, Math.min(1, p.x)), y: Math.max(0, Math.min(1, p.y)) })),
      color: typeof s['color'] === 'string' ? (s['color'] as string).slice(0, 16) : '#c59b48',
      width: typeof s['width'] === 'number' ? Math.max(1, Math.min(12, s['width'])) : 3,
    });
  }
  return out.slice(0, 200);
}

/** Trainer shares an annotated frame to one of their cohorts. */
export async function shareAnnotation(trainerId: string, input: AnnotationInput): Promise<{ id: string }> {
  const ids = await accessibleCohortIds(trainerId, false);
  if (ids !== null && !ids.has(input.cohortId)) {
    const e = new Error('Cohort is not allocated to you.') as Error & { status?: number; code?: string };
    e.status = 403;
    e.code = 'COHORT_FORBIDDEN';
    throw e;
  }
  let caseId = input.caseId ?? null;
  if (!caseId) {
    const fallback = await prisma.radarCase.findFirst({ where: { isPublished: true }, orderBy: { code: 'asc' }, select: { id: true } });
    caseId = fallback?.id ?? null;
  }
  if (!caseId) {
    const e = new Error('No published training case to attach.') as Error & { status?: number; code?: string };
    e.status = 400;
    e.code = 'NO_CASE';
    throw e;
  }
  const created = await prisma.radarAnnotation.create({
    data: {
      caseId,
      authorId: trainerId,
      cohortId: input.cohortId,
      frameT: Math.max(0, Math.floor(input.frameT)),
      drawing: JSON.parse(JSON.stringify({ shapes: toShapes(input.drawing) })) as object,
      note: sanitizeText(input.note.trim()),
      shared: true,
    },
  });
  // Fan-out: notify every cohort member with a deep link to the dashboard card.
  const members = await prisma.cohortMember.findMany({ where: { cohortId: input.cohortId }, select: { userId: true } });
  const radarCase = await prisma.radarCase.findUnique({ where: { id: caseId }, select: { title: true } });
  for (const m of members) {
    await notifyUser({
      userId: m.userId,
      type: 'RADAR_CASE_SHARED',
      title: `Radar case study: ${radarCase?.title ?? 'annotated frame'}`,
      body: sanitizeText(input.note.trim(), 280),
      link: '/trainee#radar-studies',
    });
  }
  return { id: created.id };
}

export async function getTrainerAnnotations(trainerId: string, cohortId?: string): Promise<SharedStudy[]> {
  const rows = await prisma.radarAnnotation.findMany({
    where: { authorId: trainerId, ...(cohortId ? { cohortId } : {}) },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      radarCase: { select: { code: true, title: true } },
      author: { include: { profile: { select: { fullName: true } } } },
      cohort: { select: { code: true } },
    },
  });
  return rows.map((r) =>
    mapStudy({
      id: r.id,
      frameT: r.frameT,
      note: r.note,
      drawing: r.drawing,
      createdAt: r.createdAt,
      radarCase: r.radarCase,
      author: r.author,
      cohortId: r.cohortId,
      cohort: r.cohort,
    })
  );
}

interface StudyRow {
  id: string;
  frameT: number;
  note: string;
  drawing: unknown;
  createdAt: Date;
  radarCase: { code: string; title: string };
  author: { profile: { fullName: string } | null; email: string };
  cohortId: string | null;
  cohort: { code: string } | null;
}

function mapStudy(r: StudyRow): SharedStudy {
  return {
    id: r.id,
    caseCode: r.radarCase.code,
    caseTitle: r.radarCase.title,
    authorName: r.author.profile?.fullName ?? r.author.email,
    cohortCode: r.cohort?.code ?? null,
    frameT: r.frameT,
    note: r.note,
    drawing: { shapes: toShapes(r.drawing) },
    createdAt: r.createdAt.toISOString(),
  };
}

/** Studies shared with the trainee's cohorts (dashboard card feed). */
export async function getSharedStudies(userId: string): Promise<SharedStudy[]> {
  const memberships = await prisma.cohortMember.findMany({ where: { userId }, select: { cohortId: true } });
  if (memberships.length === 0) return [];
  const rows = await prisma.radarAnnotation.findMany({
    where: { shared: true, cohortId: { in: memberships.map((m) => m.cohortId) } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      radarCase: { select: { code: true, title: true } },
      author: { include: { profile: { select: { fullName: true } } } },
      cohort: { select: { code: true } },
    },
  });
  return rows.map((r) =>
    mapStudy({
      id: r.id,
      frameT: r.frameT,
      note: r.note,
      drawing: r.drawing,
      createdAt: r.createdAt,
      radarCase: r.radarCase,
      author: r.author,
      cohortId: r.cohortId,
      cohort: r.cohort,
    })
  );
}
