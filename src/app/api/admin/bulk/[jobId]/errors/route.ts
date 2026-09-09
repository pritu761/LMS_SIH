import { NextRequest, NextResponse } from 'next/server';
import { ApiError, apiFail, requireAdminSession } from '@/lib/api-helpers';
import { prisma } from '@/lib/prisma';
import { uuidParamSchema } from '@/lib/validations';

/**
 * GET /api/admin/bulk/[jobId]/errors — ADMIN only. Downloads the failed
 * rows of a processed job as an error CSV (row, field, message).
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ jobId: string }> }) {
  try {
    await requireAdminSession();
    const { jobId: raw } = await params;
    const parsed = uuidParamSchema.safeParse(raw);
    if (!parsed.success) throw new ApiError(400, 'INVALID_ID', 'Job id is invalid.');
    const job = await prisma.bulkImportJob.findUnique({ where: { id: parsed.data } });
    if (!job) throw new ApiError(404, 'JOB_NOT_FOUND', 'Bulk job not found.');
    if (!job.errorCsv) throw new ApiError(404, 'NO_ERRORS', 'This job has no failed rows to download.');
    return new NextResponse(job.errorCsv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="bulk-errors-${job.type.toLowerCase()}.csv"`,
      },
    });
  } catch (err) {
    return apiFail(err, 'ERRORS_UNAVAILABLE');
  }
}
