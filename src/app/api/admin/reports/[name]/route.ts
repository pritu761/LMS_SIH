import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { buildReport } from '@/services/adminService';
import { toCsv } from '@/lib/csv';
import { buildReportPdf } from '@/lib/report-pdf';
import { reportNameSchema, reportQuerySchema } from '@/lib/validations';

/**
 * GET /api/admin/reports/[name]?from=&to=&format= — ADMIN only. Six
 * pre-built governance reports generated on demand:
 * readiness-station | readiness-cadre | readiness-domain |
 * certification-rate | trainer-effectiveness | gap-trend.
 * format=json (preview) | csv (download) | pdf (download, paginated table).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    await requireAdminSession();
    const { name: raw } = await params;
    const nameParsed = reportNameSchema.safeParse(raw);
    if (!nameParsed.success) throw new ApiError(404, 'REPORT_NOT_FOUND', 'Unknown report. See /api/admin/reports for the catalogue.');
    const { searchParams } = new URL(request.url);
    const qParsed = reportQuerySchema.safeParse({
      from: searchParams.get('from') ?? undefined,
      to: searchParams.get('to') ?? undefined,
      format: searchParams.get('format') ?? undefined,
    });
    if (!qParsed.success) {
      throw new ApiError(400, 'INVALID_FILTER', qParsed.error.issues[0]?.message ?? 'Report parameters are invalid.');
    }
    const table = await buildReport(
      nameParsed.data,
      qParsed.data.from ? new Date(qParsed.data.from) : undefined,
      qParsed.data.to ? new Date(qParsed.data.to) : undefined
    );
    if (qParsed.data.format === 'csv') {
      return new NextResponse(toCsv(table.columns, table.rows), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${nameParsed.data}.csv"`,
        },
      });
    }
    if (qParsed.data.format === 'pdf') {
      const pdf = await buildReportPdf({ title: table.title, columns: table.columns, rows: table.rows, note: table.note, generatedAt: table.generatedAt });
      const body = new Uint8Array(pdf);
      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${nameParsed.data}.pdf"`,
        },
      });
    }
    return apiOk({ report: table });
  } catch (err) {
    return apiFail(err, 'REPORT_UNAVAILABLE');
  }
}
