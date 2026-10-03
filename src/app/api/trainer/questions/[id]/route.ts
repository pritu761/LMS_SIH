import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { deleteBankQuestion, updateBankQuestion } from '@/services/trainerService';
import { questionUpdateSchema, uuidParamSchema } from '@/lib/validations';

/**
 * PUT /api/trainer/questions/[id] — edit a bank question (partial patch,
 * same integrity validation as create). Editing never resets accumulated
 * usage/item-analysis counters.
 *
 * DELETE /api/trainer/questions/[id] — blocked with 409 once the question
 * has recorded attempts; non-owners get 403 (admins exempt).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireTrainerSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Question id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = questionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Question payload is invalid.');
    }
    const question = await updateBankQuestion(idParsed.data, parsed.data);
    return apiOk({ question });
  } catch (err) {
    return apiFail(err, 'QUESTION_UNAVAILABLE');
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Question id is invalid.');
    await deleteBankQuestion(session.userId, session.role === 'ADMIN', parsed.data);
    return apiOk({ deleted: true });
  } catch (err) {
    return apiFail(err, 'QUESTION_UNAVAILABLE');
  }
}
