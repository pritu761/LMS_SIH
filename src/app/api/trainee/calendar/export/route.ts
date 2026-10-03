import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFail, requireTraineeSession } from '@/lib/api-helpers';
import { getSchedule } from '@/services/traineeService';
import { buildIcsCalendar } from '@/lib/ics';
import { scheduleExportSchema } from '@/lib/validations';

/**
 * GET /api/trainee/calendar/export?from=&to=
 *
 * Authenticated (TRAINEE or ADMIN, own data only). Exports the caller's
 * cohort live sessions, exam windows, assignment deadlines and personal
 * events as an RFC 5545 .ics file (UTC). Defaults: now → +90 days.
 *
 * @openapi
 * responses:
 *   200: text/calendar attachment (capacityconnect-schedule.ics)
 *   400/401/403: { success: false, error: { code, message } }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireTraineeSession();
    const { searchParams } = new URL(request.url);
    const parsed = scheduleExportSchema.safeParse({
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_RANGE', 'from/to must be ISO datetimes.');
    }
    const now = new Date();
    const from = parsed.data.from ? new Date(parsed.data.from) : now;
    const to = parsed.data.to ? new Date(parsed.data.to) : new Date(now.getTime() + 90 * 24 * 3600 * 1000);
    if (to <= from) throw new ApiError(400, 'INVALID_RANGE', 'Export end must be after export start.');

    const items = await getSchedule(session.userId, from, to);
    const ics = buildIcsCalendar(
      items.map((i) => ({
        uid: i.id,
        title: i.title,
        description: i.cohortCode ? `Cohort ${i.cohortCode} • ${i.kind}` : i.kind,
        location: i.location,
        start: new Date(i.startsAt),
        end: i.endsAt ? new Date(i.endsAt) : null,
      }))
    );
    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="capacityconnect-schedule.ics"',
        'X-Trainee-Events': String(items.length),
      },
    });
  } catch (err) {
    return apiFail(err, 'EXPORT_UNAVAILABLE');
  }
}
