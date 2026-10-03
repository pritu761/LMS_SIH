import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { createLesson, listAuthoringLessons } from '@/services/trainerService';
import { lessonCreateSchema } from '@/lib/validations';

/**
 * GET /api/trainer/lessons?module=
 * Lesson authoring inbox (latest 200): code, title, status, version,
 * module/track, updated time. Any authenticated trainer may author.
 *
 * POST /api/trainer/lessons — create a DRAFT lesson (v1) under a module.
 * Body: { moduleCode, title, blocks[], wmoTags[], contentType, ... }.
 */
export async function GET() {
  try {
    await requireTrainerSession();
    const lessons = await listAuthoringLessons();
    return apiOk({ lessons });
  } catch (err) {
    return apiFail(err, 'LESSONS_UNAVAILABLE');
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
    const parsed = lessonCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Lesson payload is invalid.');
    }
    const { moduleCode, ...input } = parsed.data;
    const lesson = await createLesson(session.userId, moduleCode, input);
    return apiOk({ lesson }, { status: 201 });
  } catch (err) {
    return apiFail(err, 'LESSON_UNAVAILABLE');
  }
}
