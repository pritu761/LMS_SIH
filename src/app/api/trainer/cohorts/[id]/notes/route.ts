import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { createNote, listNotes } from '@/services/trainerService';
import { trainerNoteSchema, uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/trainer/cohorts/[id]/notes?traineeId=
 *
 * Trainer-only inline notes (the caller's own notes). RBAC: notes are
 * scoped to the author's cohorts — a trainer can neither list nor write
 * notes for trainees outside their allocations.
 *
 * POST body: { traineeId, note, cohortId? } — trainee must belong to one of
 * the caller's cohorts.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Cohort id is invalid.');
    const { searchParams } = new URL(request.url);
    const traineeRaw = searchParams.get('traineeId');
    let traineeId: string | null = null;
    if (traineeRaw) {
      const t = uuidParamSchema.safeParse(traineeRaw);
      if (!t.success) throw new ApiError(400, 'INVALID_TRAINEE', 'traineeId is invalid.');
      traineeId = t.data;
    }
    const notes = await listNotes(session.userId, idParsed.data, traineeId);
    return apiOk({ notes });
  } catch (err) {
    return apiFail(err, 'NOTES_UNAVAILABLE');
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireTrainerSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = trainerNoteSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Note payload is invalid.');
    }
    const note = await createNote(session.userId, parsed.data.cohortId ?? null, parsed.data.traineeId, parsed.data.note);
    return apiOk({ note }, { status: 201 });
  } catch (err) {
    return apiFail(err, 'NOTE_UNAVAILABLE');
  }
}
