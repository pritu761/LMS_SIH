import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { getLessonDetail } from '@/services/traineeService';
import { lessonCodeParamSchema } from '@/lib/validations';

/**
 * GET /api/trainee/lessons/[code]
 *
 * Authenticated (TRAINEE or ADMIN, own data only). Serves one published
 * lesson with content, resources, the caller's progress/bookmark/note and a
 * non-proctored practice checkpoint. Lessons in locked modules return 403
 * (free preview lessons are exempt). Practice answers are included
 * deliberately — this endpoint is never used for proctored delivery.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { lesson } }
 *   400/403/404: { success: false, error: { code, message } }
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const session = await requireTraineeSession();
    const { code: raw } = await params;
    const parsed = lessonCodeParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_LESSON_CODE', 'Lesson code is invalid.');
    const lesson = await getLessonDetail(session.userId, parsed.data);
    if (!lesson) throw new ApiError(404, 'LESSON_NOT_FOUND', 'No published lesson matches this code.');
    if (lesson.locked) {
      throw new ApiError(403, 'LESSON_LOCKED', lesson.lockReason ?? 'Complete the prerequisite modules first.');
    }
    return apiOk({ lesson });
  } catch (err) {
    return apiFail(err, 'LESSON_UNAVAILABLE');
  }
}
