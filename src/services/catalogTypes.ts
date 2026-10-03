// ============================================================================
// Catalog shared types + constants (Phase 1.1).
//
// CLIENT-SAFE: this module must never import Node-only code (Prisma, fs,
// network). It is imported by both the server-side catalogService and the
// 'use client' CatalogExplorer — keeping it dependency-free is what keeps
// Prisma out of the browser bundle.
// ============================================================================

export type CatalogLevel = 'FOUNDATION' | 'ADVANCED';

export interface CatalogLessonMeta {
  code: string;
  title: string;
  contentType: string;
  isPreviewFree: boolean;
  sortOrder: number;
  wmoTags: string[];
}

export interface CatalogModule {
  code: string;
  title: string;
  description: string;
  outcomes: string[];
  wmoTags: string[];
  level: CatalogLevel;
  durationHours: number;
  sortOrder: number;
  /** Codes of prerequisite modules (DAG edges pointing INTO this module). */
  prerequisiteCodes: string[];
  lessons: CatalogLessonMeta[];
}

export interface CatalogTrackSummary {
  code: string;
  name: string;
  description: string;
  level: CatalogLevel;
  domains: string[];
  estimatedDurationHrs: number;
  certificationBadge: string | null;
  moduleCount: number;
  lessonCount: number;
  /** Number of prerequisite links (DAG edges) between modules in this track. */
  prerequisiteCount: number;
  hasFreePreview: boolean;
  freePreviewLessonCode: string | null;
}

export interface CatalogTrackDetail extends CatalogTrackSummary {
  modules: CatalogModule[];
}

export interface CatalogFreeLesson {
  trackCode: string;
  trackName: string;
  moduleCode: string;
  moduleTitle: string;
  lessonCode: string;
  lessonTitle: string;
  content: string;
  contentType: string;
  videoUrl: string | null;
  wmoTags: string[];
  resources: Array<{ id: string; name: string; url: string; kind: string; size?: string }>;
}

export interface CatalogSearchHit {
  trackCode: string;
  trackName: string;
  /** Why this track matched: human-readable match reasons for the UI. */
  matchedIn: string[];
  matchedModuleCodes: string[];
  matchedLessonCodes: string[];
}

/** Duration facet buckets (hours) shared by the UI and the search API docs. */
export const DURATION_BUCKETS = [
  { id: 'SHORT', label: 'Short (< 100 h)', min: 0, max: 99.999 },
  { id: 'STANDARD', label: 'Standard (100–250 h)', min: 100, max: 250 },
  { id: 'EXTENDED', label: 'Extended (> 250 h)', min: 250.0001, max: Number.POSITIVE_INFINITY },
] as const;

export type DurationBucketId = (typeof DURATION_BUCKETS)[number]['id'];

export function bucketForDuration(hours: number): DurationBucketId {
  const found = DURATION_BUCKETS.find((b) => hours >= b.min && hours <= b.max);
  return found ? found.id : 'STANDARD';
}
