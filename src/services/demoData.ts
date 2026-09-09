import { z } from 'zod';
import traineeJson from '@/demo-data/demo-trainee.json';
import trainerJson from '@/demo-data/demo-trainer.json';
import adminJson from '@/demo-data/demo-admin.json';

// ============================================================================
// Demo data loader (Phase 1.2 — Demo Persona Mode).
//
// All demo pages are FULLY STATIC: they import local mock JSON files below,
// never touch Prisma, and therefore can return no real user data. Each file
// is validated with zod at import time so a malformed mock fails the build
// instead of rendering a broken dashboard.
// ============================================================================

const personaSchema = z.object({
  name: z.string(),
  initials: z.string(),
  role: z.enum(['TRAINEE', 'TRAINER', 'ADMIN']),
  headline: z.string(),
  station: z.string(),
});

const demoTraineeSchema = z.object({
  persona: personaSchema.extend({ track: z.string(), cohort: z.string() }),
  competency: z
    .array(z.object({ domain: z.string(), current: z.number().min(0).max(100), required: z.number().min(0).max(100) }))
    .min(1),
  moduleProgress: z.array(
    z.object({
      code: z.string(),
      title: z.string(),
      completedLessons: z.number().int().nonnegative(),
      totalLessons: z.number().int().positive(),
      percent: z.number().min(0).max(100),
      status: z.enum(['completed', 'in-progress', 'not-started']),
    })
  ),
  upcomingExam: z.object({
    title: z.string(),
    window: z.string(),
    durationMin: z.number().int().positive(),
    questions: z.number().int().positive(),
    passing: z.number().min(0).max(100),
    attemptsLeft: z.number().int().nonnegative(),
    mode: z.string(),
  }),
  recommendedNext: z.object({
    code: z.string(),
    title: z.string(),
    module: z.string(),
    reason: z.string(),
    estMin: z.number().int().positive(),
  }),
  certificate: z.object({
    title: z.string(),
    track: z.string(),
    issued: z.string(),
    score: z.number().min(0).max(100),
    grade: z.string(),
    verificationId: z.string(),
  }),
});

const demoTrainerSchema = z.object({
  persona: personaSchema.extend({ cohortsDelivered: z.number().int().nonnegative(), rating: z.number().min(0).max(5) }),
  cohorts: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      station: z.string(),
      trainees: z.number().int().nonnegative(),
      avgGap: z.number().min(0).max(100),
      start: z.string(),
      status: z.enum(['ACTIVE', 'COMPLETED', 'PLANNED']),
    })
  ),
  learners: z.array(
    z.object({
      name: z.string(),
      initials: z.string(),
      station: z.string(),
      overall: z.number().min(0).max(100),
      attendance: z.number().min(0).max(100),
      lastActive: z.string(),
      risk: z.boolean(),
      riskReason: z.string().nullable(),
      gaps: z.array(z.object({ domain: z.string(), gap: z.number().min(0).max(100) })).min(1),
    })
  ),
  questionBank: z.object({
    name: z.string(),
    total: z.number().int().nonnegative(),
    byDifficulty: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
    byDomain: z.array(z.object({ label: z.string(), count: z.number().int().nonnegative() })),
  }),
  sampleAssessment: z.object({
    title: z.string(),
    attempts: z.number().int().nonnegative(),
    avgScore: z.number().min(0).max(100),
    passRate: z.number().min(0).max(100),
    items: z
      .array(
        z.object({
          id: z.string(),
          topic: z.string(),
          competency: z.string(),
          difficulty: z.string(),
          difficultyIndex: z.number().min(0).max(1),
          discrimination: z.number().min(0).max(1),
          verdict: z.string(),
        })
      )
      .min(1),
  }),
});

const demoAdminSchema = z.object({
  persona: personaSchema,
  summary: z.object({
    nationalAvg: z.number().min(0).max(100),
    stationsAtRisk: z.number().int().nonnegative(),
    riskThreshold: z.number().min(0).max(100),
    certsThisMonth: z.number().int().nonnegative(),
  }),
  stations: z
    .array(
      z.object({
        code: z.string(),
        name: z.string(),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        readiness: z.number().min(0).max(100),
        cadre: z.number().int().nonnegative(),
        topGap: z.string(),
      })
    )
    .min(1),
  approvals: z.array(
    z.object({
      name: z.string(),
      initials: z.string(),
      email: z.string().email(),
      role: z.string(),
      station: z.string(),
      submitted: z.string(),
      slaHrs: z.number().nonnegative(),
      slaBreach: z.boolean(),
    })
  ),
  audit: z.array(
    z.object({ time: z.string(), actor: z.string(), role: z.string(), action: z.string(), entity: z.string() })
  ),
  bulkUpload: z.object({ disabled: z.boolean(), tooltip: z.string() }),
});

export type DemoTrainee = z.infer<typeof demoTraineeSchema>;
export type DemoTrainer = z.infer<typeof demoTrainerSchema>;
export type DemoAdmin = z.infer<typeof demoAdminSchema>;

/** Validate a mock JSON file at import time; fail fast with the file name. */
function loadDemo<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`[demo] ${file} failed validation: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const demoTrainee: DemoTrainee = loadDemo(demoTraineeSchema, traineeJson, 'demo-trainee.json');
export const demoTrainer: DemoTrainer = loadDemo(demoTrainerSchema, trainerJson, 'demo-trainer.json');
export const demoAdmin: DemoAdmin = loadDemo(demoAdminSchema, adminJson, 'demo-admin.json');
