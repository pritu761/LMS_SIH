import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { getAudit } from '@/services/adminService';
import { toCsv } from '@/lib/csv';
import { auditFilterSchema } from '@/lib/validations';

/**
 * GET /api/admin/audit — ADMIN only. Append-only trail (no write methods
 * exist on purpose): filter by action, actor (email/name), entity type and
 * date range; paginated JSON or full CSV export (capped at 5000 rows).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const parsed = auditFilterSchema.safeParse({
      action: searchParams.get('action') ?? undefined,
      actor: searchParams.get('actor') ?? undefined,
      entityType: searchParams.get('entityType') ?? undefined,
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      format: searchParams.get('format') ?? undefined,
    });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', parsed.error.issues[0]?.message ?? 'Audit filters are invalid.');
    }
    const f = parsed.data;
    if (f.format === 'csv') {
      const data = await getAudit(
        {
          action: f.action,
          actor: f.actor,
          entityType: f.entityType,
          from: f.from ? new Date(f.from) : undefined,
          to: f.to ? new Date(f.to) : undefined,
        },
        1,
        5000
      );
      const csv = toCsv(
        ['timestamp', 'actor', 'actor_role', 'action', 'entity_type', 'entity_id', 'ip', 'diff'],
        data.entries.map((e) => [e.createdAt, e.actorName, e.actorRole ?? '', e.action, e.entityType, e.entityId ?? '', e.ipAddress ?? '', JSON.stringify(e.diff ?? {})])
      );
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="audit-log.csv"',
        },
      });
    }
    const data = await getAudit(
      {
        action: f.action,
        actor: f.actor,
        entityType: f.entityType,
        from: f.from ? new Date(f.from) : undefined,
        to: f.to ? new Date(f.to) : undefined,
      },
      f.page,
      f.limit
    );
    return apiOk(data);
  } catch (err) {
    return apiFail(err, 'AUDIT_UNAVAILABLE');
  }
}
