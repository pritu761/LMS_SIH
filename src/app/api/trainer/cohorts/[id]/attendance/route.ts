import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { setAttendance } from '@/services/trainerService';
import { attendanceUpdateSchema, uuidParamSchema } from '@/lib/validations';

/**
 * PUT /api/trainer/cohorts/[id]/attendance
 *
 * Mark attendance for one session: { sessionId, records: [{ userId,
 * status: PRESENT|ABSENT|LATE|EXCUSED }] }. Verifies the session belongs to
 * the cohort and every trainee is a member; recomputes member attendance %.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { matrix, attendancePct } }
 *   400/403/404: { success: false, error: { code, message } }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireTrainerSession();
    const { id: raw } = await params;
    const idParsed = uuidParamSchema.safeParse(raw);
    if (!idParsed.success) throw new ApiError(400, 'INVALID_ID', 'Cohort id is invalid.');
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = attendanceUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Attendance payload is invalid.');
    }
    const result = await setAttendance(session.userId, session.role === 'ADMIN', idParsed.data, parsed.data.sessionId, parsed.data.records);
    return apiOk(result);
  } catch (err) {
    return apiFail(err, 'ATTENDANCE_UNAVAILABLE');
  }
}
