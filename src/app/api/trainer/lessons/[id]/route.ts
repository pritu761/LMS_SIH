import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getLessonForEdit, updateLesson, type LessonAction } from '@/services/trainerService';
import { lessonUpdateSchema, uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/trainer/lessons/[id] — full lesson for the studio: content,
 * blocks, resources, WMO tags, flags and version history.
 *
 * PUT /api/trainer/lessons/[id] — { ..., action: draft|publish|archive|rollback,
 * rollbackVersion? }. Every publish snapshots a new immutable version;
 * rollback restores an old version's content as a NEW version (history is
 * append-only — nothing is ever overwritten).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireTrainerSession();
    const { id: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Lesson id is invalid.');
    const lesson = await getLessonForEdit(parsed.data);
    if (!lesson) throw new ApiError(404, 'LESSON_NOT_FOUND', 'Lesson not found.');
    return apiOk({ lesson });
  } catch (err) {
    return apiFail(err, 'LESSON_UNAVAILABLE');
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Lesson id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = lessonUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Lesson payload is invalid.');
    }
    const { action, rollbackVersion, ...input } = parsed.data;
    const lesson = await updateLesson(session.userId, idParsed.data, input, action as LessonAction, rollbackVersion);
    return apiOk({ lesson });
  } catch (err) {
    return apiFail(err, 'LESSON_UNAVAILABLE');
  }
}
