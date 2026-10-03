import { NextResponse } from 'next/server';
import { getCatalogTracks, CatalogServiceError } from '@/services/catalogService';

export const revalidate = 3600; // Match the /catalog page ISR window.

/**
 * GET /api/catalog/tracks
 *
 * Public curriculum catalog — no authentication required, no PII returned.
 * Lists all published training tracks (IMTC, FTC, DRSTC, MODULAR) with
 * aggregate card metadata: domains, module/lesson counts, estimated
 * duration, certification badge and prerequisite-link count.
 *
 * @openapi
 * responses:
 *   200: { success: true, data: { tracks: CatalogTrackSummary[], facets: { levels, domains } } }
 *   500: { success: false, error: { code, message } }
 */
export async function GET() {
  try {
    const tracks = await getCatalogTracks();
    const levels = Array.from(new Set(tracks.map((t) => t.level)));
    const domains = Array.from(new Set(tracks.flatMap((t) => t.domains))).sort();
    return NextResponse.json({ success: true, data: { tracks, facets: { levels, domains } } });
  } catch (err) {
    const code = err instanceof CatalogServiceError ? err.code : 'CATALOG_UNAVAILABLE';
    const message = err instanceof Error ? err.message : 'Catalog is temporarily unavailable.';
    return NextResponse.json({ success: false, error: { code, message } }, { status: 500 });
  }
}
