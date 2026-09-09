import { z } from 'zod';

// ==========================================
// AUTHENTICATION SCHEMAS
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['TRAINEE', 'TRAINER']),
  organization: z.string().optional(),
  department: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
});

// ==========================================
// PROFILE SCHEMA
// ==========================================

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  headline: z.string().optional(),
  bio: z.string().optional(),
  organization: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  qualifications: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
      field: z.string(),
    })
  ).optional(),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      startYear: z.string(),
      endYear: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  competencies: z.array(
    z.object({
      competencyId: z.string(),
      proficiencyLevel: z.number().min(1).max(5),
    })
  ).optional(),
});

// ==========================================
// ASSESSMENT & SUBMISSION SCHEMAS
// ==========================================

export const questionSchema = z.object({
  questionText: z.string().min(5, 'Question text must be at least 5 characters'),
  questionType: z.enum(['SINGLE_CHOICE', 'MULTI_CHOICE']).default('SINGLE_CHOICE'),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string().min(1, 'Option text cannot be empty'),
    })
  ).min(2, 'At least 2 options are required'),
  correctOption: z.union([z.string(), z.array(z.string())]),
  weight: z.number().positive().default(1.0),
  explanation: z.string().optional(),
  sortOrder: z.number().int().default(1),
});

export const assessmentCreateSchema = z.object({
  courseId: z.string().uuid(),
  title: z.string().min(3, 'Assessment title required'),
  description: z.string().optional(),
  timeLimitMinutes: z.number().int().min(1).max(180).default(30),
  passingScorePercentage: z.number().min(1).max(100).default(70.0),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  submissionDeadline: z.string().datetime().optional().nullable(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const submissionAnswerSchema = z.object({
  answers: z.record(z.union([z.string(), z.array(z.string())])),
  timeSpentSeconds: z.number().int().nonnegative(),
});

// ==========================================
// USER GOVERNANCE & ADMIN SCHEMAS
// ==========================================

export const userStatusUpdateSchema = z.object({
  userId: z.string(),
  status: z.enum(['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']),
  role: z.enum(['TRAINEE', 'TRAINER', 'ADMIN']).optional(),
});

export const feedbackSchema = z.object({
  courseId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, 'Review comment must be at least 3 characters'),
});

// ==========================================
// PUBLIC CATALOG SCHEMAS (Phase 1.1 — no PII)
// ==========================================

/** Track codes are uppercase alphanumeric (e.g. IMTC, FTC, DRSTC, MODULAR). */
export const trackCodeParamSchema = z
  .string()
  .trim()
  .min(2, 'Track code is too short')
  .max(16, 'Track code is too long')
  .regex(/^[A-Za-z0-9-]+$/, 'Track code may only contain letters, numbers and hyphens')
  .transform((v) => v.toUpperCase());

export const catalogSearchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .min(1, 'Search query must not be empty')
    .max(100, 'Search query must be 100 characters or fewer'),
});

export const durationBucketSchema = z.enum(['SHORT', 'STANDARD', 'EXTENDED']);

export const catalogFilterSchema = z.object({
  tracks: z.array(z.string().trim().min(1).max(16)).max(20).optional().default([]),
  levels: z.array(z.enum(['FOUNDATION', 'ADVANCED'])).max(2).optional().default([]),
  domains: z.array(z.string().trim().min(1).max(32)).max(20).optional().default([]),
  durations: z.array(durationBucketSchema).max(3).optional().default([]),
});

export type CatalogFilterInput = z.infer<typeof catalogFilterSchema>;

// ==========================================
// TRAINEE DASHBOARD SCHEMAS (Phase 1.3)
// ==========================================

/** Lesson codes are uppercase alphanumeric with hyphens (e.g. DRSTC-M01-L01). */
export const lessonCodeParamSchema = z
  .string()
  .trim()
  .min(3, 'Lesson code is too short')
  .max(32, 'Lesson code is too long')
  .regex(/^[A-Za-z0-9-]+$/, 'Lesson code may only contain letters, numbers and hyphens')
  .transform((v) => v.toUpperCase());

/** Upsert lesson progress: resume position, completion, bookmark + note. */
export const lessonProgressSchema = z.object({
  lessonCode: lessonCodeParamSchema,
  completed: z.boolean().optional(),
  bookmark: z.boolean().optional(),
  note: z.string().max(2000, 'Note must be 2000 characters or fewer').nullable().optional(),
  positionSeconds: z.number().int().min(0).max(86400).optional(),
});

export type LessonProgressInput = z.infer<typeof lessonProgressSchema>;

/** ICS export window (ISO datetimes, defaults: now → +90 days). */
export const scheduleExportSchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

// ==========================================
// TRAINER DASHBOARD SCHEMAS (Phase 1.4)
// ==========================================

export const uuidParamSchema = z.string().uuid('Identifier must be a valid UUID');

export const attendanceRecordSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
});

export const attendanceUpdateSchema = z.object({
  sessionId: z.string().uuid(),
  records: z.array(attendanceRecordSchema).min(1).max(200),
});

export const trainerNoteSchema = z.object({
  traineeId: z.string().uuid(),
  cohortId: z.string().uuid().optional(),
  note: z.string().trim().min(1, 'Note must not be empty').max(2000, 'Note must be 2000 characters or fewer'),
});

const lessonCodeSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[A-Za-z0-9-]+$/)
  .transform((v) => v.toUpperCase());

export const remediationPackSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  message: z.string().trim().max(2000).optional(),
  lessonCodes: z.array(lessonCodeSchema).min(1, 'Select at least one micro-lesson').max(20),
  traineeIds: z.array(z.string().uuid()).min(1, 'Select at least one trainee').max(200),
});

// --- Block-based lesson authoring ---

const blockId = z.string().trim().min(1).max(64);

const textBlockSchema = z.object({ id: blockId, kind: z.literal('text'), markdown: z.string().max(50000) });
const videoBlockSchema = z.object({
  id: blockId,
  kind: z.literal('video'),
  url: z.string().url('Video block needs a valid URL').max(2048),
  caption: z.string().max(300).optional(),
});
const fileBlockSchema = z.object({
  id: blockId,
  kind: z.literal('file'),
  url: z.string().min(1).max(2048),
  name: z.string().min(1).max(255),
  fileKind: z.string().min(1).max(16),
  size: z.string().max(32).optional(),
});
const quizBlockSchema = z.object({
  id: blockId,
  kind: z.literal('quiz'),
  prompt: z.string().trim().min(3, 'Quiz prompt is required').max(2000),
  questionType: z.enum(['SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE']).default('SINGLE_CHOICE'),
  options: z
    .array(z.object({ id: z.string().min(1).max(32), text: z.string().trim().min(1).max(1000) }))
    .min(2, 'Quiz needs at least 2 options')
    .max(8),
  correctIds: z.array(z.string().min(1)).min(1, 'Mark at least one correct option').max(8),
  explanation: z.string().max(2000).optional(),
});
const codeBlockSchema = z.object({
  id: blockId,
  kind: z.literal('code'),
  language: z.string().min(1).max(32).default('text'),
  code: z.string().max(20000),
  caption: z.string().max(300).optional(),
});

export const lessonBlockSchema = z.discriminatedUnion('kind', [
  textBlockSchema,
  videoBlockSchema,
  fileBlockSchema,
  quizBlockSchema,
  codeBlockSchema,
]);

export type LessonBlockInput = z.infer<typeof lessonBlockSchema>;

export const lessonUpsertSchema = z.object({
  title: z.string().trim().min(3, 'Lesson title is required').max(200),
  blocks: z.array(lessonBlockSchema).min(1, 'Add at least one content block').max(60),
  wmoTags: z.array(z.string().trim().min(1).max(32)).max(10).default([]),
  contentType: z.enum(['MARKDOWN', 'VIDEO', 'PDF', 'QUIZ', 'MIXED']).default('MIXED'),
  videoUrl: z.string().url().max(2048).nullable().optional(),
  pdfUrl: z.string().min(1).max(2048).nullable().optional(),
  resources: z
    .array(
      z.object({
        id: z.string().min(1).max(64),
        name: z.string().min(1).max(255),
        url: z.string().min(1).max(2048),
        kind: z.string().min(1).max(16),
        size: z.string().max(32).optional(),
      })
    )
    .max(20)
    .default([]),
  isPreviewFree: z.boolean().default(false),
  isOfflineAvailable: z.boolean().default(false),
});

export const lessonActionSchema = z.enum(['draft', 'publish', 'archive', 'rollback']);

export const lessonUpdateSchema = lessonUpsertSchema.extend({
  action: lessonActionSchema,
  rollbackVersion: z.number().int().positive().optional(),
});

export const lessonCreateSchema = lessonUpsertSchema.extend({
  moduleCode: z.string().trim().min(3).max(16),
});

export const moduleCreateSchema = z.object({
  trackCode: z.string().trim().min(2).max(16),
  title: z.string().trim().min(3, 'Module title is required').max(200),
  description: z.string().trim().min(10, 'Module description is required').max(5000),
  level: z.enum(['FOUNDATION', 'ADVANCED']).default('FOUNDATION'),
  durationHours: z.number().min(0.5).max(500).default(8),
});

// --- Question bank ---

export const questionTypeSchema = z.enum(['SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER']);
export const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export const bloomsSchema = z.enum(['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE']);

const questionBase = z.object({
  text: z.string().trim().min(5, 'Question text must be at least 5 characters').max(5000),
  type: questionTypeSchema,
  options: z
    .array(z.object({ id: z.string().min(1).max(32), text: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(8),
  correct: z.union([z.string().min(1), z.array(z.string().min(1)).min(1).max(8)]),
  weight: z.number().positive().max(100).default(1),
  explanation: z.string().max(3000).optional(),
  competencyTag: z.string().trim().min(1).max(32).optional(),
  difficulty: difficultySchema.default('MEDIUM'),
  bloomsLevel: bloomsSchema.default('UNDERSTAND'),
  wmoRef: z.string().trim().max(200).optional(),
});

function refineQuestion<T extends z.ZodTypeAny>(schema: T) {
  // Validates only the fields present, so the same refinement serves both
  // full creates and partial updates (missing fields are simply skipped).
  return schema.superRefine((val, ctx) => {
    const v = val as { options?: Array<{ id: string }>; correct?: string | string[]; type?: string };
    const issue = (message: string) => ctx.addIssue({ code: z.ZodIssueCode.custom, message });
    if (v.type === 'SHORT_ANSWER') return;
    const ids = v.options !== undefined ? v.options.map((o) => o.id) : [];
    if (v.options !== undefined && v.options.length < 2) {
      issue('Choice questions need at least 2 options.');
    }
    if (v.type === 'TRUE_FALSE' && v.options !== undefined && v.options.length !== 2) {
      issue('True/False needs exactly 2 options.');
    }
    if (v.correct === undefined) return;
    if (typeof v.correct === 'string') {
      if (v.type === 'MULTI_CHOICE') {
        issue('Multi-choice needs an array of correct option ids.');
      } else if (v.options !== undefined && !ids.includes(v.correct)) {
        issue('Correct option must match one of the options.');
      }
    } else {
      if (v.type !== undefined && v.type !== 'MULTI_CHOICE') {
        issue('Only multi-choice takes multiple correct options.');
      }
      if (v.options !== undefined) {
        for (const c of v.correct) {
          if (!ids.includes(c)) {
            issue(`Correct option "${c}" matches no option.`);
            break;
          }
        }
      }
    }
  });
}

export const questionCreateSchema = refineQuestion(
  questionBase.extend({ bankId: z.string().uuid('bankId must be a valid UUID') })
);

export const questionUpdateSchema = refineQuestion(questionBase.partial());

export const questionFilterSchema = z.object({
  bankId: z.string().uuid().optional(),
  competency: z.string().trim().min(1).max(32).optional(),
  difficulty: difficultySchema.optional(),
  blooms: bloomsSchema.optional(),
  q: z.string().trim().max(100).optional(),
});

/** One CSV row for bulk question import (header mapping handled server-side). */
export const questionCsvRowSchema = refineQuestion(
  questionBase.omit({ options: true, correct: true }).extend({
    options: z
      .array(z.object({ id: z.string().min(1).max(32), text: z.string().trim().min(1).max(2000) }))
      .min(1)
      .max(8),
    correct: z.union([z.string().min(1), z.array(z.string().min(1)).min(1).max(8)]),
  })
);

export const analyticsQuerySchema = z.object({
  cohort: z.string().uuid().optional(),
});

// ==========================================
// ADMIN DASHBOARD SCHEMAS (Phase 1.5)
// ==========================================

export const reviewActionSchema = z.enum(['approve', 'reject', 'info']);

export const registrationReviewSchema = z.object({
  action: reviewActionSchema,
  /** Mandatory for reject; optional context for info requests. */
  reason: z.string().trim().max(2000).optional(),
  message: z.string().trim().max(2000).optional(),
  role: z.enum(['TRAINEE', 'TRAINER', 'ADMIN']).optional(),
});

export const auditFilterSchema = z.object({
  action: z.string().trim().max(64).optional(),
  actor: z.string().trim().max(120).optional(),
  entityType: z.string().trim().max(64).optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  format: z.enum(['json', 'csv']).default('json'),
});

export const bulkTypeSchema = z.enum(['OFFICER_ROSTER', 'STATION_DATA', 'BATCH_ASSIGNMENT']);

export const reportNameSchema = z.enum([
  'readiness-station',
  'readiness-cadre',
  'readiness-domain',
  'certification-rate',
  'trainer-effectiveness',
  'gap-trend',
]);

export const reportQuerySchema = z.object({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

export const certificateStatusSchema = z.object({
  status: z.enum(['VALID', 'REVOKED']),
  reason: z.string().trim().max(2000).optional(),
});

export const certificateFilterSchema = z.object({
  status: z.enum(['VALID', 'REVOKED', 'EXPIRED']).optional(),
  q: z.string().trim().max(100).optional(),
});

// ==========================================
// 55/30/15 MATCHER SCHEMAS (Phase 2.1)
// ==========================================

/** Each weight 10–70 and the three must total exactly 100. */
export const matcherWeightsSchema = z
  .object({
    skill: z.number().int().min(10, 'Minimum weight is 10').max(70, 'Maximum weight is 70'),
    rating: z.number().int().min(10, 'Minimum weight is 10').max(70, 'Maximum weight is 70'),
    experience: z.number().int().min(10, 'Minimum weight is 10').max(70, 'Maximum weight is 70'),
  })
  .superRefine((w, ctx) => {
    if (w.skill + w.rating + w.experience !== 100) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Weights must total 100%.' });
    }
  });

export type MatcherWeightsInput = z.infer<typeof matcherWeightsSchema>;

export const matcherConstraintsSchema = z.object({
  maxTrainees: z.number().int().min(1).max(500).default(25),
  avoidConsecutive: z.boolean().default(true),
  regionPref: z.string().trim().min(1).max(16).default('ANY'),
  excludeOnLeave: z.boolean().default(true),
});

export type MatcherConstraintsInput = z.infer<typeof matcherConstraintsSchema>;

export const matcherRunSchema = z.object({
  cohortId: z.string().uuid('cohortId must be a valid UUID'),
  weights: matcherWeightsSchema,
  constraints: matcherConstraintsSchema.default({ maxTrainees: 25, avoidConsecutive: true, regionPref: 'ANY', excludeOnLeave: true }),
  /** Required when weights fall outside the governance policy band. */
  pin: z.string().trim().min(1).max(64).optional(),
});

export const matcherOverrideSchema = z.object({
  cohortId: z.string().uuid(),
  recommendedTrainerId: z.string().uuid(),
  alternateTrainerId: z.string().uuid(),
  justification: z.string().trim().min(10, 'Justification must be at least 10 characters.').max(2000),
  weights: matcherWeightsSchema,
});

export const matcherBacktestSchema = z.object({
  cohortId: z.string().uuid(),
  weights: matcherWeightsSchema,
});

// ==========================================
// PROCTORED EXAM SCHEMAS (Phase 2.2)
// ==========================================

/** Identity must be explicitly confirmed — no silent attempt starts. */
export const examStartSchema = z.object({
  identityConfirmed: z.literal(true, { errorMap: () => ({ message: 'Identity confirmation is required to start.' }) }),
});

export const integrityEventSchema = z.object({
  type: z.enum([
    'FULLSCREEN_EXIT',
    'TAB_BLUR',
    'WINDOW_BLUR',
    'COPY_ATTEMPT',
    'PASTE_ATTEMPT',
    'RIGHT_CLICK',
    'DEVTOOLS_SUSPECTED',
    'MULTIPLE_FACES',
    'NO_FACE',
    'NETWORK_DROP',
    'WARNING_ISSUED',
    'OTHER',
  ]),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const examSubmitSchema = z.object({
  answers: z.record(z.union([z.string(), z.array(z.string())])).default({}),
  timeSpentSeconds: z.number().int().min(0).max(86400).default(0),
  auto: z.boolean().default(false),
});

export const integrityFilterSchema = z.object({
  cohortId: z.string().uuid().optional(),
  flag: z.enum(['CLEAN', 'REVIEW', 'FLAGGED']).optional(),
  verdict: z.enum(['PENDING', 'VALID', 'INVALID', 'ESCALATED']).optional(),
  q: z.string().trim().max(100).optional(),
});

export const verdictUpdateSchema = z.object({
  verdict: z.enum(['VALID', 'INVALID', 'ESCALATED']),
});

// ==========================================
// RADAR OPS SCHEMAS (Phase 2.3)
// ==========================================

export const caseAttemptSchema = z.object({
  score: z.number().int().min(0).max(1000),
  total: z.number().int().min(1).max(1000),
  answers: z
    .array(
      z.object({
        atStep: z.number().int().min(0).max(100),
        picked: z.number().int().min(0).max(10),
        correct: z.boolean(),
      })
    )
    .max(50)
    .default([]),
});

const annotationPointSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

export const annotationCreateSchema = z.object({
  caseId: z.string().uuid().nullable().optional(),
  cohortId: z.string().uuid('cohortId must be a valid UUID'),
  frameT: z.number().int().min(0).max(1000).default(0),
  drawing: z.object({
    shapes: z
      .array(
        z.object({
          tool: z.enum(['free', 'rect', 'circle', 'arrow']),
          points: z.array(annotationPointSchema).min(1).max(500),
          color: z.string().max(16).default('#c59b48'),
          width: z.number().min(1).max(12).default(3),
        })
      )
      .min(1, 'Draw at least one shape.')
      .max(200),
  }),
  note: z.string().trim().min(1, 'A trainer note is required.').max(2000),
});
