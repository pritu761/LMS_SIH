import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { createBulkJob, validateBulkRows, type BulkKind } from '@/services/adminService';
import { parseCsv } from '@/lib/csv';
import { enforceRateLimit, rateLimitConfig } from '@/lib/rate-limit';
import { bulkTypeSchema } from '@/lib/validations';

/**
 * POST /api/admin/bulk/validate (multipart: type + file) — ADMIN only.
 *
 * Step 1 of the two-step import: parses and row-validates the CSV (header
 * check, formats, duplicates, foreign keys), stages the valid rows on a
 * QUEUED BulkImportJob and returns the preview with row-level errors.
 * Nothing is imported yet — the UI confirms via .../confirm. Limits:
 * 2000 rows, 5 MB.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    // Abuse control: 3 bulk validations / hour per admin (each fans out to
    // hundreds of row validations + a staged job row).
    const cfg = rateLimitConfig();
    enforceRateLimit(`bulk:${session.userId}`, cfg.bulkJobs, cfg.bulkWindowMs, 'BULK_RATE_LIMITED');
    const form = await request.formData();
    const typeRaw = form.get('type');
    const file = form.get('file');
    const fileNameRaw = form.get('fileName');
    const typeParsed = bulkTypeSchema.safeParse(typeof typeRaw === 'string' ? typeRaw : '');
    if (!typeParsed.success) throw new ApiError(400, 'INVALID_TYPE', 'type must be OFFICER_ROSTER, STATION_DATA or BATCH_ASSIGNMENT.');
    if (!(file instanceof File)) throw new ApiError(400, 'INVALID_BODY', 'CSV file field is required.');
    if (file.size > 5 * 1024 * 1024) throw new ApiError(400, 'FILE_TOO_LARGE', 'CSV must be 5 MB or smaller.');
    const type: BulkKind = typeParsed.data;

    let rows: string[][];
    try {
      rows = parseCsv(await file.text());
    } catch {
      throw new ApiError(400, 'CSV_PARSE_ERROR', 'CSV could not be parsed (check quoting).');
    }
    if (rows.length < 2) throw new ApiError(400, 'CSV_EMPTY', 'CSV has no data rows.');
    if (rows.length > 2001) throw new ApiError(400, 'CSV_TOO_MANY_ROWS', 'CSV is limited to 2000 data rows.');

    const preview = await validateBulkRows(type, rows);
    const fileName = typeof fileNameRaw === 'string' && fileNameRaw ? fileNameRaw.slice(0, 255) : file.name.slice(0, 255);
    const staged = await createBulkJob(session.userId, type, fileName, preview);
    return apiOk(staged);
  } catch (err) {
    return apiFail(err, 'VALIDATION_UNAVAILABLE');
  }
}
