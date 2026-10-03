// ============================================================================
// Trainee dashboard shared types (Phase 1.3).
//
// CLIENT-SAFE: no Node-only imports. Imported by both the Prisma-backed
// traineeService (server) and 'use client' dashboard widgets.
// ============================================================================

export type ModuleStatus = 'completed' | 'in-progress' | 'locked' | 'failed' | 'available';

export interface TraineeCompetencyPoint {
  domain: string;
  score: number;
  requiredScore: number;
  gap: number;
}

export interface PlayerLessonMeta {
  code: string;
  title: string;
  contentType: string;
  sortOrder: number;
  isPreviewFree: boolean;
  completed: boolean;
  bookmarked: boolean;
  locked: boolean;
}

export interface PlayerModule {
  code: string;
  title: string;
  description: string;
  status: ModuleStatus;
  outcomes: string[];
  wmoTags: string[];
  durationHours: number;
  sortOrder: number;
  prerequisiteCodes: string[];
  completedLessons: number;
  totalLessons: number;
  lessons: PlayerLessonMeta[];
}

export interface TraineeTrackView {
  code: string;
  name: string;
  level: string;
  domains: string[];
  estimatedDurationHrs: number;
  certificationBadge: string | null;
  isCohortTrack: boolean;
  percentComplete: number;
  completedLessons: number;
  totalLessons: number;
  modules: PlayerModule[];
}

export interface PracticeQuestion {
  id: string;
  text: string;
  type: string;
  options: Array<{ id: string; text: string }>;
  /** Correct option id(s). Only ever served for explicitly non-proctored practice. */
  correct: string | string[];
  explanation: string | null;
}

export interface LessonResourceView {
  id: string;
  name: string;
  url: string;
  kind: string;
  size?: string;
}

export interface LessonDetailView {
  code: string;
  title: string;
  content: string;
  contentType: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  resources: LessonResourceView[];
  wmoTags: string[];
  moduleCode: string;
  moduleTitle: string;
  trackCode: string;
  trackName: string;
  locked: boolean;
  lockReason: string | null;
  completed: boolean;
  bookmarked: boolean;
  note: string | null;
  checkpoint: PracticeQuestion[];
}

export type ScheduleKind = 'LIVE_SESSION' | 'EXAM_WINDOW' | 'ASSIGNMENT_DEADLINE' | 'WORKSHOP' | 'PERSONAL';

export interface ScheduleItem {
  id: string;
  title: string;
  kind: ScheduleKind;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  cohortCode: string | null;
}

export interface TraineeCertificateView {
  id: string;
  moduleTitle: string;
  trackCode: string | null;
  issuedAt: string;
  verificationId: string;
  status: string;
  score: number | null;
  grade: string | null;
}

export interface ResumeTarget {
  trackCode: string;
  moduleCode: string;
  lessonCode: string;
  lessonTitle: string;
}

export interface TraineeTracksPayload {
  tracks: TraineeTrackView[];
  cohortTrackCode: string | null;
  resume: ResumeTarget | null;
}

export const MODULE_STATUS_LABEL: Record<ModuleStatus, string> = {
  completed: 'Completed',
  'in-progress': 'In progress',
  locked: 'Locked',
  failed: 'Needs retry',
  available: 'Available',
};
