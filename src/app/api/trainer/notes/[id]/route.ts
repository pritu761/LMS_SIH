import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { deleteNote } from '@/services/trainerService';
import { uuidParamSchema } from '@/lib/validations';

/**
 * DELETE /api/trainer/notes/[id] — delete the caller's own trainer note.
 * Notes by other trainers are invisible and undeletable (404 either way).
 */
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Note id is invalid.');
    await deleteNote(session.userId, parsed.data);
    return apiOk({ deleted: true });
  } catch (err) {
    return apiFail(err, 'NOTE_UNAVAILABLE');
  }
}
