// ============================================================================
// Trainer dashboard shared types (Phase 1.4).
//
// CLIENT-SAFE: no Node-only imports. Shared by the Prisma-backed
// trainerService (server) and 'use client' trainer widgets.
// ============================================================================

export interface AssignedCohort {
  id: string;
  code: string;
  name: string;
  station: string | null;
  trackCode: string | null;
  traineeCount: number;
  avgGap: number;
  startDate: string;
  endDate: string | null;
  status: string;
  matchScore: number | null;
  scope: 'ALLOCATED' | 'OVERSIGHT';
}

export interface MemberScore {
  domain: string;
  score: number;
  required: number;
  gap: number;
}

export interface CohortMemberView {
  userId: string;
  name: string;
  initials: string;
  station: string | null;
  scores: MemberScore[];
  overallReadiness: number;
  worstGap: number;
  attendancePct: number;
  lastActiveAt: string | null;
  inactiveDays: number | null;
  riskFlag: boolean;
  riskReasons: string[];
}

export interface CohortSessionView {
  id: string;
  title: string;
  type: string;
  startsAt: string;
  endsAt: string | null;
  location: string | null;
  markedCount: number;
  memberCount: number;
}

export interface CohortDetailView {
  cohort: AssignedCohort;
  members: CohortMemberView[];
  sessions: CohortSessionView[];
  attendance: Record<string, Record<string, string>>;
}

export interface TrainerNoteView {
  id: string;
  traineeId: string;
  traineeName: string;
  cohortId: string | null;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export type LessonBlockKind = 'text' | 'video' | 'file' | 'quiz' | 'code';

export interface LessonBlockBase {
  id: string;
  kind: LessonBlockKind;
}

export interface TextBlock extends LessonBlockBase {
  kind: 'text';
  markdown: string;
}

export interface VideoBlock extends LessonBlockBase {
  kind: 'video';
  url: string;
  caption?: string;
}

export interface FileBlock extends LessonBlockBase {
  kind: 'file';
  url: string;
  name: string;
  fileKind: string;
  size?: string;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizBlock extends LessonBlockBase {
  kind: 'quiz';
  prompt: string;
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE';
  options: QuizOption[];
  correctIds: string[];
  explanation?: string;
}

export interface CodeBlock extends LessonBlockBase {
  kind: 'code';
  language: string;
  code: string;
  caption?: string;
}

export type LessonBlock = TextBlock | VideoBlock | FileBlock | QuizBlock | CodeBlock;

export const BLOCK_LABEL: Record<LessonBlockKind, string> = {
  text: 'Text',
  video: 'Video',
  file: 'File upload',
  quiz: 'Inline quiz',
  code: 'Code (read-only)',
};

export interface AuthoringLessonRow {
  id: string;
  code: string | null;
  title: string;
  status: string;
  version: number;
  moduleCode: string;
  trackCode: string;
  updatedAt: string;
  hasBlocks: boolean;
}

export interface AuthoringLessonDetail extends AuthoringLessonRow {
  content: string;
  contentType: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  resources: Array<{ id: string; name: string; url: string; kind: string; size?: string }>;
  wmoTags: string[];
  isPreviewFree: boolean;
  isOfflineAvailable: boolean;
  sortOrder: number;
  blocks: LessonBlock[];
  versions: Array<{ version: number; content: string; changelog: string | null; createdAt: string; authorName: string | null }>;
}

export interface AuthoringModuleOption {
  code: string;
  title: string;
  trackCode: string;
  lessonCount: number;
}

export interface QuestionBankView {
  id: string;
  name: string;
  description: string | null;
  total: number;
  mine: boolean;
}

export interface BankQuestionView {
  id: string;
  bankId: string | null;
  text: string;
  type: string;
  options: QuizOption[];
  /** Correct answer(s) — included because trainers author and review them. */
  correct: string | string[];
  weight: number;
  explanation: string | null;
  competencyTag: string | null;
  difficulty: string;
  bloomsLevel: string;
  wmoRef: string | null;
  usageCount: number;
  difficultyIndex: number | null;
  discriminationIndex: number | null;
}

export interface AnalyticsMasteryPoint {
  week: string;
  avgScore: number | null;
  attempts: number;
  lessonsCompleted: number;
}

export interface AnalyticsDomain {
  domain: string;
  avg: number;
  required: number;
  members: number;
}

export interface AnalyticsTimeOnTask {
  module: string;
  minutes: number;
  lessons: number;
}

export interface AnalyticsBin {
  bin: string;
  count: number;
}

export interface AnalyticsHard {
  id: string;
  topic: string;
  competency: string | null;
  difficultyIndex: number;
  discrimination: number | null;
  attempts: number;
}

export interface TrainerAnalytics {
  cohortCode: string | null;
  members: number;
  masteryCurve: AnalyticsMasteryPoint[];
  domainDist: AnalyticsDomain[];
  timeOnTask: AnalyticsTimeOnTask[];
  histogram: AnalyticsBin[];
  hardest: AnalyticsHard[];
}
