import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireTrainerSession } from '@/lib/api-helpers';
import { createBankQuestion } from '@/services/trainerService';
import { parseCsv } from '@/lib/csv';
import { bloomsSchema, difficultySchema, questionCsvRowSchema, questionTypeSchema } from '@/lib/validations';
import { z } from 'zod';

const EXPECTED_HEADER = ['text', 'type', 'option1', 'option2', 'option3', 'option4', 'correct', 'difficulty', 'blooms', 'competency', 'wmoref', 'explanation', 'weight'];

function normHeader(h: string): string {
  return h.trim().toLowerCase().replace(/^wmo_ref$/, 'wmoref');
}

/**
 * POST /api/trainer/questions/import (multipart: bankId field + file field)
 *
 * Bulk-import validated questions into a bank. Returns per-row errors
 * without aborting the batch: { created, failed, errors: [{ row, message }] }.
 * Limits: 500 rows, 2 MB file.
 */
export async function POST(request: NextRequest) {
  try {
    await requireTrainerSession();
    const form = await request.formData();
    const bankId = form.get('bankId');
    const file = form.get('file');
    if (typeof bankId !== 'string' || !bankId) throw new ApiError(400, 'INVALID_BODY', 'bankId field is required.');
    if (!(file instanceof File)) throw new ApiError(400, 'INVALID_BODY', 'CSV file field is required.');
    if (file.size > 2 * 1024 * 1024) throw new ApiError(400, 'FILE_TOO_LARGE', 'CSV must be 2 MB or smaller.');

    const text = await file.text();
    let rows: string[][];
    try {
      rows = parseCsv(text);
    } catch {
      throw new ApiError(400, 'CSV_PARSE_ERROR', 'CSV could not be parsed (check quoting).');
    }
    if (rows.length < 2) throw new ApiError(400, 'CSV_EMPTY', 'CSV has no data rows.');
    if (rows.length > 501) throw new ApiError(400, 'CSV_TOO_MANY_ROWS', 'CSV is limited to 500 data rows.');
    const header = rows[0].map(normHeader);
    const missing = EXPECTED_HEADER.filter((h) => !header.includes(h));
    if (missing.length > 0) throw new ApiError(400, 'CSV_BAD_HEADER', `Missing columns: ${missing.join(', ')}. Download the template.`);
    const idx = (name: string) => header.indexOf(name);

    let created = 0;
    const errors: Array<{ row: number; message: string }> = [];
    for (let r = 1; r < rows.length; r++) {
      const cells = rows[r];
      const get = (name: string) => (cells[idx(name)] ?? '').trim();
      try {
        const typeRaw = get('type').toUpperCase().replace(/-/g, '_');
        const typeParsed = questionTypeSchema.safeParse(typeRaw);
        if (!typeParsed.success) throw new Error(`Unknown type "${get('type')}".`);
        const type = typeParsed.data;
        const options = [get('option1'), get('option2'), get('option3'), get('option4')]
          .map((t, i) => ({ id: `opt_${i + 1}`, text: t }))
          .filter((o) => o.text.length > 0);
        const correctRaw = get('correct');
        let correct: string | string[];
        if (type === 'SHORT_ANSWER') {
          correct = 'opt_1';
        } else if (type === 'MULTI_CHOICE') {
          correct = correctRaw.split(/[;|,]/).map((s) => s.trim()).filter(Boolean).map((n) => `opt_${n}`);
          if (correct.length === 0) throw new Error('Multi-choice needs correct option numbers (e.g. "1;3").');
        } else {
          if (!correctRaw) throw new Error('Correct option number is required.');
          correct = `opt_${correctRaw}`;
        }
        const weight = get('weight') ? Number(get('weight')) : 1;
        const candidate = {
          text: get('text'),
          type,
          options: type === 'SHORT_ANSWER' && options.length === 0 ? [{ id: 'opt_1', text: 'Free-text answer (trainer graded)' }] : options,
          correct,
          weight: Number.isFinite(weight) && weight > 0 ? weight : 1,
          explanation: get('explanation') || undefined,
          competencyTag: get('competency') || undefined,
          difficulty: difficultySchema.safeParse(get('difficulty').toUpperCase()).success
            ? (get('difficulty').toUpperCase() as z.infer<typeof difficultySchema>)
            : undefined,
          bloomsLevel: bloomsSchema.safeParse(get('blooms').toUpperCase()).success
            ? (get('blooms').toUpperCase() as z.infer<typeof bloomsSchema>)
            : undefined,
          wmoRef: get('wmoref') || undefined,
        };
        const validated = questionCsvRowSchema.safeParse(candidate);
        if (!validated.success) throw new Error(validated.error.issues[0]?.message ?? 'Row failed validation.');
        await createBankQuestion({ bankId, ...validated.data });
        created += 1;
      } catch (e) {
        errors.push({ row: r + 1, message: e instanceof Error ? e.message : 'Row failed validation.' });
      }
    }
    return apiOk({ created, failed: errors.length, errors: errors.slice(0, 50) });
  } catch (err) {
    return apiFail(err, 'IMPORT_UNAVAILABLE');
  }
}
