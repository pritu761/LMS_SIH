import { NextRequest, NextResponse } from 'next/server';
import { searchCatalogTracks, CatalogServiceError } from '@/services/catalogService';
import { catalogSearchQuerySchema } from '@/lib/validations';

export const revalidate = 3600; // Match the /catalog page ISR window.

/**
 * GET /api/catalog/search?q=...
 *
 * Public keyword search over the published curriculum — no authentication
 * required, no PII returned. Matches track names/codes/descriptions,
 * module titles/descriptions/outcomes, lesson titles and WMO competency
 * tags. The /catalog UI filters its ISR-fetched dataset client-side for
 * instant results; this endpoint serves programmatic use and the Phase 3
 * global (Cmd+K) search.
 *
 * @openapi
 * query: q — 1–100 characters
 * responses:
 *   200: { success: true, data: { query, count, hits: CatalogSearchHit[] } }
 *   400: { success: false, error: { code: INVALID_QUERY, message } }
 *   500: { success: false, error: { code, message } }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = catalogSearchQuerySchema.safeParse({ q: searchParams.get('q') ?? '' });
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'INVALID_QUERY', message: parsed.error.issues[0]?.message ?? 'Search query is invalid.' },
        },
        { status: 400 }
      );
    }
    const hits = await searchCatalogTracks(parsed.data.q);
    return NextResponse.json({ success: true, data: { query: parsed.data.q.trim(), count: hits.length, hits } });
  } catch (err) {
    const code = err instanceof CatalogServiceError ? err.code : 'CATALOG_UNAVAILABLE';
    const message = err instanceof Error ? err.message : 'Search is temporarily unavailable.';
    return NextResponse.json({ success: false, error: { code, message } }, { status: 500 });
  }
}
