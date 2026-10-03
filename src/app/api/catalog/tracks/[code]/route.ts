import { NextRequest, NextResponse } from 'next/server';
import { getCatalogTrack, CatalogServiceError } from '@/services/catalogService';
import { trackCodeParamSchema } from '@/lib/validations';

export const revalidate = 3600; // Match the /catalog page ISR window.

/**
 * GET /api/catalog/tracks/[code]
 *
 * Public track detail — no authentication required, no PII returned.
 * Returns the full published module outline (descriptions, learning
 * outcomes, WMO tags, lesson titles) plus a pointer to the track's free
 * preview lesson. Lesson *content* is excluded (see the preview route/page).
 *
 * @openapi
 * params: code — track code, e.g. DRSTC (case-insensitive)
 * responses:
 *   200: { success: true, data: { track: CatalogTrackDetail } }
 *   400: { success: false, error: { code: INVALID_TRACK_CODE, message } }
 *   404: { success: false, error: { code: TRACK_NOT_FOUND, message } }
 *   500: { success: false, error: { code, message } }
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code: rawCode } = await params;
    const parsed = trackCodeParamSchema.safeParse(rawCode);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_TRACK_CODE', message: 'Track code is invalid.' } },
        { status: 400 }
      );
    }
    const track = await getCatalogTrack(parsed.data);
    if (!track) {
      return NextResponse.json(
        { success: false, error: { code: 'TRACK_NOT_FOUND', message: `No published track found for code "${parsed.data}".` } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { track } });
  } catch (err) {
    const code = err instanceof CatalogServiceError ? err.code : 'CATALOG_UNAVAILABLE';
    const message = err instanceof Error ? err.message : 'Catalog is temporarily unavailable.';
    return NextResponse.json({ success: false, error: { code, message } }, { status: 500 });
  }
}
