import prisma from '@/lib/prisma';
import type {
  CatalogFreeLesson,
  CatalogLevel,
  CatalogLessonMeta,
  CatalogModule,
  CatalogSearchHit,
  CatalogTrackDetail,
  CatalogTrackSummary,
} from './catalogTypes';

// Re-export shared (client-safe) types so server code can import from one place.
export type {
  CatalogFreeLesson,
  CatalogLevel,
  CatalogLessonMeta,
  CatalogModule,
  CatalogSearchHit,
  CatalogTrackDetail,
  CatalogTrackSummary,
} from './catalogTypes';
export { DURATION_BUCKETS, bucketForDuration } from './catalogTypes';
export type { DurationBucketId } from './catalogTypes';

// ============================================================================
// Catalog service — PUBLIC curriculum data access (Phase 1.1).
//
// Everything returned here is curriculum metadata (tracks / modules / lessons).
// No user tables are touched, so responses contain no PII and the routes
// built on top of this service are safe to expose without authentication.
// ============================================================================

export class CatalogServiceError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'CatalogServiceError';
    this.code = code;
  }
}

/** Safely coerce a Prisma Json value into a string array (never throws). */
function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === 'string');
}

/** Coerce a Prisma Json value into lesson resource records (never throws). */
function toResourceArray(value: unknown): CatalogFreeLesson['resources'] {
  if (!Array.isArray(value)) return [];
  const out: CatalogFreeLesson['resources'] = [];
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

function toCatalogLevel(value: string): CatalogLevel {
  return value === 'ADVANCED' ? 'ADVANCED' : 'FOUNDATION';
}

/**
 * Fetch all published training tracks with aggregate card metadata.
 * Ordered by displayOrder. Only published tracks/modules/lessons are returned.
 */
export async function getCatalogTracks(): Promise<CatalogTrackSummary[]> {
  try {
    const tracks = await prisma.trainingTrack.findMany({
      where: { isPublished: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        modules: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' }, select: { isPreviewFree: true, code: true } },
            prerequisites: { select: { prerequisiteId: true } },
          },
        },
      },
    });
    return tracks.map((t) => {
      const lessonCount = t.modules.reduce((n, m) => n + m.lessons.length, 0);
      const prerequisiteCount = t.modules.reduce((n, m) => n + m.prerequisites.length, 0);
      const freeLesson = t.modules.flatMap((m) => m.lessons).find((l) => l.isPreviewFree && l.code);
      return {
        code: t.code,
        name: t.name,
        description: t.description,
        level: toCatalogLevel(t.level),
        domains: toStringArray(t.domains),
        estimatedDurationHrs: t.estimatedDurationHrs,
        certificationBadge: t.certificationBadge,
        moduleCount: t.modules.length,
        lessonCount,
        prerequisiteCount,
        hasFreePreview: Boolean(freeLesson),
        freePreviewLessonCode: freeLesson?.code ?? null,
      };
    });
  } catch (err) {
    throw new CatalogServiceError('CATALOG_UNAVAILABLE', err instanceof Error ? err.message : 'Failed to load catalog tracks.');
  }
}

/**
 * Fetch one published track with its full module/lesson outline.
 * Returns null when the code does not match a published track.
 * Lesson *content* is intentionally excluded here (see getFreePreviewLesson).
 */
export async function getCatalogTrack(rawCode: string): Promise<CatalogTrackDetail | null> {
  const code = rawCode.trim().toUpperCase();
  try {
    const t = await prisma.trainingTrack.findFirst({
      where: { code, isPublished: true },
      include: {
        modules: {
          where: { isPublished: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' } },
            prerequisites: { include: { prerequisite: { select: { code: true } } } },
          },
        },
      },
    });
    if (!t) return null;
    const modules: CatalogModule[] = t.modules.map((m) => ({
      code: m.code,
      title: m.title,
      description: m.description,
      outcomes: toStringArray(m.outcomes),
      wmoTags: toStringArray(m.wmoTags),
      level: toCatalogLevel(m.level),
      durationHours: m.durationHours,
      sortOrder: m.sortOrder,
      prerequisiteCodes: m.prerequisites.map((p) => p.prerequisite.code),
      lessons: m.lessons.map((l) => ({
        code: l.code ?? '',
        title: l.title,
        contentType: l.contentType,
        isPreviewFree: l.isPreviewFree,
        sortOrder: l.sortOrder,
        wmoTags: toStringArray(l.wmoTags),
      })),
    }));
    const lessonCount = modules.reduce((n, m) => n + m.lessons.length, 0);
    const prerequisiteCount = modules.reduce((n, m) => n + m.prerequisiteCodes.length, 0);
    const freeLesson = modules.flatMap((m) => m.lessons).find((l) => l.isPreviewFree && l.code);
    return {
      code: t.code,
      name: t.name,
      description: t.description,
      level: toCatalogLevel(t.level),
      domains: toStringArray(t.domains),
      estimatedDurationHrs: t.estimatedDurationHrs,
      certificationBadge: t.certificationBadge,
      moduleCount: modules.length,
      lessonCount,
      prerequisiteCount,
      hasFreePreview: Boolean(freeLesson),
      freePreviewLessonCode: freeLesson?.code ?? null,
      modules,
    };
  } catch (err) {
    throw new CatalogServiceError('CATALOG_UNAVAILABLE', err instanceof Error ? err.message : 'Failed to load track detail.');
  }
}

/**
 * Fetch the single free preview lesson for a track (no login required).
 * Returns null when the track has no published free lesson.
 */
export async function getFreePreviewLesson(rawTrackCode: string): Promise<CatalogFreeLesson | null> {
  const trackCode = rawTrackCode.trim().toUpperCase();
  try {
    const lesson = await prisma.lesson.findFirst({
      where: { status: 'PUBLISHED', isPreviewFree: true, module: { track: { code: trackCode, isPublished: true }, isPublished: true } },
      orderBy: [{ module: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { module: { include: { track: { select: { code: true, name: true } } } } },
    });
    if (!lesson || !lesson.code) return null;
    return {
      trackCode: lesson.module.track.code,
      trackName: lesson.module.track.name,
      moduleCode: lesson.module.code,
      moduleTitle: lesson.module.title,
      lessonCode: lesson.code,
      lessonTitle: lesson.title,
      content: lesson.content,
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl,
      wmoTags: toStringArray(lesson.wmoTags),
      resources: toResourceArray(lesson.resources),
    };
  } catch (err) {
    throw new CatalogServiceError('CATALOG_UNAVAILABLE', err instanceof Error ? err.message : 'Failed to load preview lesson.');
  }
}

/**
 * Keyword search across tracks, modules, lessons, outcomes and WMO tags.
 * Implemented as a case-insensitive in-memory filter over the published
 * catalog (portable; promote to pg_trgm / tsvector once the catalog grows
 * beyond a few hundred lessons).
 */
export async function searchCatalogTracks(rawQuery: string): Promise<CatalogSearchHit[]> {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const tracks = await prisma.trainingTrack.findMany({
    where: { isPublished: true },
    orderBy: { displayOrder: 'asc' },
    include: {
      modules: {
        where: { isPublished: true },
        orderBy: { sortOrder: 'asc' },
        include: { lessons: { where: { status: 'PUBLISHED' }, orderBy: { sortOrder: 'asc' } } },
      },
    },
  });
  const hits: CatalogSearchHit[] = [];
  for (const t of tracks) {
    const matchedIn: string[] = [];
    const matchedModuleCodes: string[] = [];
    const matchedLessonCodes: string[] = [];
    const domains = toStringArray(t.domains);
    if (
      t.name.toLowerCase().includes(q) ||
      t.code.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      domains.some((d) => d.toLowerCase().includes(q))
    ) {
      matchedIn.push('track');
    }
    for (const m of t.modules) {
      const outcomes = toStringArray(m.outcomes);
      const wmoTags = toStringArray(m.wmoTags);
      if (
        m.title.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        outcomes.some((o) => o.toLowerCase().includes(q)) ||
        wmoTags.some((w) => w.toLowerCase().includes(q))
      ) {
        matchedIn.push('module');
        matchedModuleCodes.push(m.code);
      }
      for (const l of m.lessons) {
        const lwmo = toStringArray(l.wmoTags);
        if (
          l.title.toLowerCase().includes(q) ||
          (l.code ?? '').toLowerCase().includes(q) ||
          lwmo.some((w) => w.toLowerCase().includes(q))
        ) {
          matchedIn.push('lesson');
          if (l.code) matchedLessonCodes.push(l.code);
          if (!matchedModuleCodes.includes(m.code)) matchedModuleCodes.push(m.code);
        }
      }
    }
    if (matchedIn.length > 0) {
      hits.push({
        trackCode: t.code,
        trackName: t.name,
        matchedIn: Array.from(new Set(matchedIn)),
        matchedModuleCodes,
        matchedLessonCodes,
      });
    }
  }
  return hits;
}
