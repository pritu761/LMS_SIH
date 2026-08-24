// Capacity Connect - Timed Assessment & Auto-Grading Service
// Secure quiz sanitization, deadline validation, and weighted auto-grading

import { initialAssessments, MockAssessment } from '@/lib/mockData';

export interface SanitizedQuestion {
  id: string;
  questionText: string;
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
  options: Array<{ id: string; text: string }>;
  weight: number;
  sortOrder: number;
  // NOTE: correctOption and explanation are strictly stripped out for security
}

export interface SanitizedQuizResponse {
  assessmentId: string;
  courseId: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  passingScorePercentage: number;
  totalQuestions: number;
  maxScore: number;
  questions: SanitizedQuestion[];
  serverStartTime: string;
  serverDeadlineTime: string;
}

export interface QuestionGradingReview {
  questionId: string;
  questionText: string;
  selectedOption: string | string[];
  correctOption: string | string[];
  isCorrect: boolean;
  weight: number;
  earnedScore: number;
  explanation: string;
}

export interface AssessmentGradingResult {
  submissionId: string;
  assessmentId: string;
  courseId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScorePercentage: number;
  timeSpentSeconds: number;
  timeLimitMinutes: number;
  isLate: boolean;
  submittedAt: string;
  questionBreakdown: QuestionGradingReview[];
}

/**
 * Strips correct answer keys and explanations to prevent client-side inspection tampering
 */
export function sanitizeAssessmentForTrainee(assessment: MockAssessment): SanitizedQuizResponse {
  const serverStartTime = new Date();
  const serverDeadlineTime = new Date(serverStartTime.getTime() + assessment.timeLimitMinutes * 60 * 1000);

  let maxScore = 0;
  const sanitizedQuestions: SanitizedQuestion[] = assessment.questions.map((q) => {
    maxScore += q.weight;
    return {
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: [...q.options], // Shuffled or sorted
      weight: q.weight,
      sortOrder: q.sortOrder,
    };
  });

  return {
    assessmentId: assessment.id,
    courseId: assessment.courseId,
    title: assessment.title,
    description: assessment.description,
    timeLimitMinutes: assessment.timeLimitMinutes,
    passingScorePercentage: assessment.passingScorePercentage,
    totalQuestions: sanitizedQuestions.length,
    maxScore,
    questions: sanitizedQuestions,
    serverStartTime: serverStartTime.toISOString(),
    serverDeadlineTime: serverDeadlineTime.toISOString(),
  };
}

/**
 * Automated grading engine that strictly verifies answers, weights, time limits, and deadlines
 */
export function gradeAssessmentSubmission(
  assessment: MockAssessment,
  submittedAnswers: Record<string, string | string[]>,
  timeSpentSeconds: number,
  userId: string
): AssessmentGradingResult {
  let earnedScore = 0;
  let maxScore = 0;

  const gracePeriodSeconds = 45; // 45-second network transmission buffer
  const maxAllowedSeconds = assessment.timeLimitMinutes * 60 + gracePeriodSeconds;
  const isLate = timeSpentSeconds > maxAllowedSeconds;

  const questionBreakdown: QuestionGradingReview[] = assessment.questions.map((q) => {
    maxScore += q.weight;
    const userAnswer = submittedAnswers[q.id];

    let isCorrect = false;

    if (q.questionType === 'SINGLE_CHOICE') {
      isCorrect = Boolean(userAnswer && userAnswer === q.correctOption);
    } else if (q.questionType === 'MULTI_CHOICE') {
      if (Array.isArray(userAnswer) && Array.isArray(q.correctOption)) {
        const sortedUser = [...userAnswer].sort();
        const sortedCorrect = [...q.correctOption].sort();
        isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
      }
    }

    const questionScore = isCorrect ? q.weight : 0;
    earnedScore += questionScore;

    return {
      questionId: q.id,
      questionText: q.questionText,
      selectedOption: userAnswer || 'Unanswered',
      correctOption: q.correctOption,
      isCorrect,
      weight: q.weight,
      earnedScore: questionScore,
      explanation: q.explanation || 'No explanation provided.',
    };
  });

  const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 1000) / 10 : 0;
  const passed = percentage >= assessment.passingScorePercentage;

  return {
    submissionId: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assessmentId: assessment.id,
    courseId: assessment.courseId,
    userId,
    score: earnedScore,
    maxScore,
    percentage,
    passed,
    passingScorePercentage: assessment.passingScorePercentage,
    timeSpentSeconds,
    timeLimitMinutes: assessment.timeLimitMinutes,
    isLate,
    submittedAt: new Date().toISOString(),
    questionBreakdown,
  };
}
