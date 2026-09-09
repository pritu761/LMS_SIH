import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { createModule, listAuthoringModules } from '@/services/trainerService';
import { moduleCreateSchema } from '@/lib/validations';

/**
 * GET /api/trainer/modules — module picker options for the authoring
 * studio (code, title, track, lesson count).
 *
 * POST /api/trainer/modules — create a new (unpublished) module under a
 * track. Code is auto-assigned (TRACK-Mnn) to keep the DAG namespace clean.
 */
export async function GET() {
  try {
    await requireTrainerSession();
    const modules = await listAuthoringModules();
    return apiOk({ modules });
  } catch (err) {
    return apiFail(err, 'MODULES_UNAVAILABLE');
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
    const parsed = moduleCreateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Module payload is invalid.');
    }
    const module = await createModule(parsed.data);
    return apiOk({ module }, { status: 201 });
  } catch (err) {
    return apiFail(err, 'MODULE_UNAVAILABLE');
  }
}
