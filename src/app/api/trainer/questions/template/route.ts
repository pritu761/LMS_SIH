import { NextResponse } from 'next/server';
import { apiFail, requireTrainerSession } from '@/lib/api-helpers';
import { toCsv } from '@/lib/csv';

/**
 * GET /api/trainer/questions/template — downloadable CSV template for bulk
 * question import (correct headers + one worked example row).
 *
 * Columns: text | type | option1..option4 | correct | difficulty |
 * blooms | competency | wmoRef | explanation | weight
 * - type: SINGLE_CHOICE | MULTI_CHOICE | TRUE_FALSE | SHORT_ANSWER
 * - correct: option number(s) 1-based ("2" or "1;3"); blank for SHORT_ANSWER
 * - difficulty: EASY | MEDIUM | HARD; blooms: REMEMBER..CREATE
 */
export async function GET() {
  try {
    await requireTrainerSession();
    const header = ['text', 'type', 'option1', 'option2', 'option3', 'option4', 'correct', 'difficulty', 'blooms', 'competency', 'wmoRef', 'explanation', 'weight'];
    const example = [
      'A ZDR column extending 2 km above the freezing level most directly indicates:',
      'SINGLE_CHOICE',
      'An intense updraft lofting supercooled drops',
      'Bright-band contamination',
      'Anomalous propagation',
      'Hail attenuation',
      '1',
      'MEDIUM',
      'APPLY',
      'RAD-NOWCAST',
      'WMO-1205-III.3',
      'ZDR columns mark supercooled liquid lofted by the updraft.',
      '1',
    ];
    const csv = toCsv(header, [example]);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="question-import-template.csv"',
      },
    });
  } catch (err) {
    return apiFail(err, 'TEMPLATE_UNAVAILABLE');
  }
}
