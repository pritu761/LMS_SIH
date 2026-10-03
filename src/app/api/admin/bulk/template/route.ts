import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFail, requireAdminSession } from '@/lib/api-helpers';
import { BULK_COLUMNS, type BulkKind } from '@/services/adminService';
import { toCsv } from '@/lib/csv';
import { bulkTypeSchema } from '@/lib/validations';

/**
 * GET /api/admin/bulk/template?type= — ADMIN only. Downloadable CSV
 * template with exact headers plus one annotated example row per type:
 * OFFICER_ROSTER | STATION_DATA | BATCH_ASSIGNMENT.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const parsed = bulkTypeSchema.safeParse(searchParams.get('type') ?? '');
    if (!parsed.success) throw new ApiError(400, 'INVALID_TYPE', 'type must be OFFICER_ROSTER, STATION_DATA or BATCH_ASSIGNMENT.');
    const type: BulkKind = parsed.data;
    const examples: Record<BulkKind, string[]> = {
      OFFICER_ROSTER: ['neha.kulkarni@imd.gov.in', 'Neha Kulkarni', 'TRAINEE', 'Scientist-B', 'PUN', 'IMD-SCB-2026-0301', '+91 98220 00001'],
      STATION_DATA: ['PUN', '87', '29', 'DISASTER-OPS'],
      BATCH_ASSIGNMENT: ['neha.kulkarni@imd.gov.in', 'DRSTC-04'],
    };
    const csv = toCsv(BULK_COLUMNS[type].map((c) => c), [examples[type]]);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type.toLowerCase()}-template.csv"`,
      },
    });
  } catch (err) {
    return apiFail(err, 'TEMPLATE_UNAVAILABLE');
  }
}
