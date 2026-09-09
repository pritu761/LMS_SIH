import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { bankQuestions, createBankQuestion } from '@/services/trainerService';
import { questionCreateSchema, questionFilterSchema } from '@/lib/validations';

/**
 * GET /api/trainer/questions?bankId=&competency=&difficulty=&blooms=&q=
 * Filter/search the question bank (competency tag, difficulty, Bloom's
 * level, usage-backed text search). Item-analysis indices ride along per row.
 *
 * POST /api/trainer/questions — create a bank question (validated: option
 * integrity, correct-answer mapping, WMO/difficulty metadata).
 */
export async function GET(request: NextRequest) {
  try {
    await requireTrainerSession();
    const { searchParams } = new URL(request.url);
    const parsed = questionFilterSchema.safeParse({
      bankId: searchParams.get('bankId') ?? undefined,
      competency: searchParams.get('competency') ?? undefined,
      difficulty: searchParams.get('difficulty') ?? undefined,
      blooms: searchParams.get('blooms') ?? undefined,
      q: searchParams.get('q') ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', parsed.error.issues[0]?.message ?? 'Filter parameters are invalid.');
    }
    const questions = await bankQuestions(parsed.data);
    return apiOk({ questions, count: questions.length });
  } catch (err) {
    return apiFail(err, 'QUESTIONS_UNAVAILABLE');
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireTrainerSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = questionCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Question payload is invalid.');
    }
    const question = await createBankQuestion(parsed.data);
    return apiOk({ question }, { status: 201 });
  } catch (err) {
    return apiFail(err, 'QUESTION_UNAVAILABLE');
  }
}
