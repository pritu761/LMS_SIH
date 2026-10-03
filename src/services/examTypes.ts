// ============================================================================
// Proctored exam shared types (Phase 2.2). CLIENT-SAFE: no Node-only imports.
// Correct answers NEVER leave the server except inside explicitly
// non-proctored practice payloads (the trainee player) — nothing here
// carries them.
// ============================================================================

export interface ExamMeta {
  id: string;
  title: string;
  description: string | null;
  courseCode: string;
  moduleCode: string | null;
  timeLimitMinutes: number;
  passingScore: number;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsLeft: number;
  questionCount: number;
  perQuestionSeconds: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  traineeName: string;
  traineeStation: string | null;
  webcamProctoring: boolean;
}

export interface ServedOption {
  id: string;
  text: string;
}

export interface ServedQuestion {
  id: string;
  text: string;
  type: string;
  options: ServedOption[];
  weight: number;
}

export interface ExamSession {
  attemptId: string;
  seed: string;
  startedAt: string;
  timeLimitMinutes: number;
  perQuestionSeconds: number | null;
  questions: ServedQuestion[];
}

export interface IntegrityTimelineEntry {
  id: string;
  type: string;
  timestamp: string;
  detail: string;
}

export interface ExamResultView {
  attemptId: string;
  status: string;
  verdict: string;
  integrityFlag: string;
  riskScore: number;
  score: number | null;
  percentage: number | null;
  maxScore: number;
  passed: boolean | null;
  needsGrading: boolean;
  correctCount: number;
  objectiveCount: number;
  submittedAt: string | null;
  timeSpentSeconds: number;
  competencyDelta: Array<{ domain: string; before: number; after: number }>;
  timeline: IntegrityTimelineEntry[];
}

export interface IntegrityAttemptView {
  attemptId: string;
  traineeName: string;
  traineeEmail: string;
  cohortCode: string | null;
  assessmentTitle: string;
  startedAt: string;
  submittedAt: string | null;
  status: string;
  verdict: string;
  integrityFlag: string;
  riskScore: number;
  eventCount: number;
  percentage: number | null;
  timeline: IntegrityTimelineEntry[];
}

export type IntegrityEventKind =
  | 'FULLSCREEN_EXIT'
  | 'TAB_BLUR'
  | 'WINDOW_BLUR'
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'RIGHT_CLICK'
  | 'DEVTOOLS_SUSPECTED'
  | 'MULTIPLE_FACES'
  | 'NO_FACE'
  | 'NETWORK_DROP'
  | 'EXAM_START'
  | 'EXAM_SUBMIT'
  | 'WARNING_ISSUED'
  | 'OTHER';
