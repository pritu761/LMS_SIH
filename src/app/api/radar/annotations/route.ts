import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { getTrainerAnnotations, shareAnnotation } from '@/services/radarService';
import { annotationCreateSchema } from '@/lib/validations';

/**
 * GET /api/radar/annotations?cohortId= — TRAINER/ADMIN. The caller's shared
 * annotated frames (optionally filtered to one allocated cohort).
 *
 * POST /api/radar/annotations — TRAINER/ADMIN (trainers scoped to
 * allocations). "Share to Cohort": persists the annotated frame + trainer
 * note and fans out RADAR_CASE_SHARED notifications to every cohort
 * member (surfaced as Radar Case Study cards in trainee dashboards).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireTrainerSession();
    const { searchParams } = new URL(request.url);
    const cohortId = searchParams.get('cohortId') ?? undefined;
    const annotations = await getTrainerAnnotations(session.userId, cohortId);
    return apiOk({ annotations, count: annotations.length });
  } catch (err) {
    return apiFail(err, 'ANNOTATIONS_UNAVAILABLE');
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
    const parsed = annotationCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Annotation payload is invalid.');
    }
    const result = await shareAnnotation(session.userId, {
      caseId: parsed.data.caseId ?? null,
      cohortId: parsed.data.cohortId,
      frameT: parsed.data.frameT,
      drawing: { shapes: parsed.data.drawing.shapes },
      note: parsed.data.note,
    });
    return apiOk(result, { status: 201 });
  } catch (err) {
    return apiFail(err, 'ANNOTATION_UNAVAILABLE');
  }
}
