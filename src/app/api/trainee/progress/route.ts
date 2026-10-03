import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiError, apiFail, apiOk, requireTraineeSession } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { updateLessonProgress } from '@/services/traineeService';
import { lessonProgressSchema } from '@/lib/validations';

/**
 * PUT /api/trainee/progress
 *
 * Authenticated (TRAINEE or ADMIN, own data only). Upserts the caller's
 * lesson progress: completion flag, resume position, bookmark and personal
 * note. Body: { lessonCode, completed?, bookmark?, note?, positionSeconds? }.
 * Returns the updated row plus the refreshed track completion percent.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { lessonCode, completed, bookmarked, note, trackPercent } }
 *   400/404: { success: false, error: { code, message } }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireTraineeSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = lessonProgressSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Progress payload is invalid.');
    }
    const updated = await updateLessonProgress(session.userId, parsed.data);
    if (!updated) throw new ApiError(404, 'LESSON_NOT_FOUND', 'No published lesson matches this code.');
    return apiOk(updated);
  } catch (err) {
    return apiFail(err, 'PROGRESS_UNAVAILABLE');
  }
}

const legacyProgressSchema = z.object({
  courseId: z.string().trim().min(1, 'courseId is required').max(64),
  materialId: z.string().trim().min(1, 'materialId is required').max(64),
});

/**
 * POST /api/trainee/progress (legacy contract, preserved for the existing
 * CoursePlayer on /trainee/courses/[id]).
 *
 * Previously mutated in-memory mock data; now persists against the real
 * Enrollment table. Body: { courseId (id | code | slug), materialId }.
 * Toggles are idempotent: sending an already-completed material keeps it
 * completed (the legacy player only ever marks complete). Response keeps
 * the historical { success, enrollment } shape.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireTraineeSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = legacyProgressSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Progress payload is invalid.');
    }
    const { courseId, materialId } = parsed.data;
    const course = await prisma.course.findFirst({
      where: { OR: [{ id: courseId }, { code: courseId }, { slug: courseId }] },
      include: { materials: { select: { id: true } } },
    });
    if (!course) throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found.');
    if (!course.materials.some((m) => m.id === materialId)) {
      throw new ApiError(404, 'MATERIAL_NOT_FOUND', 'Material not found in this course.');
    }

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: session.userId, courseId: course.id } },
      update: {},
      create: { userId: session.userId, courseId: course.id, status: 'ACTIVE', progressPercentage: 0 },
    });
    const completed = Array.isArray(enrollment.completedMaterialIds)
      ? (enrollment.completedMaterialIds as unknown[]).filter((v): v is string => typeof v === 'string')
      : [];
    if (!completed.includes(materialId)) completed.push(materialId);
    const progressPercentage = Math.min(Math.round((completed.length / Math.max(1, course.materials.length)) * 1000) / 10, 100);
    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedMaterialIds: completed,
        progressPercentage,
        currentMaterialId: materialId,
        lastAccessedAt: new Date(),
        ...(progressPercentage >= 100 && !enrollment.completedAt
          ? { status: 'COMPLETED', completedAt: new Date() }
          : {}),
      },
    });
    return apiOk({ enrollment: updated });
  } catch (err) {
    return apiFail(err, 'PROGRESS_UNAVAILABLE');
  }
}
