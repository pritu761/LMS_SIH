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
