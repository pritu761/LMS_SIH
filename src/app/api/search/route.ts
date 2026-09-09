import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAssistantSession } from '@/lib/api-helpers';
import { globalSearch, type SearchRole } from '@/services/searchService';
import { z } from 'zod';

const searchQuerySchema = z.object({
  q: z.string().trim().min(2, 'Type at least 2 characters.').max(100),
});

/**
 * GET /api/search?q= — authenticated (all approved roles). Debounced
 * global search across modules, competencies, trainers, stations,
 * assessments (+ reports and users for ADMIN only). Groups are RBAC-gated
 * before matching, so a role never receives forbidden rows; every hit is a
 * stable deep link valid for the caller's role.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAssistantSession();
    const { searchParams } = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({ q: searchParams.get('q') ?? '' });
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_QUERY', parsed.error.issues[0]?.message ?? 'Search query is invalid.');
    }
    const data = await globalSearch(session.role as SearchRole, parsed.data.q);
    return apiOk({ query: parsed.data.q, ...data });
  } catch (err) {
    return apiFail(err, 'SEARCH_UNAVAILABLE');
  }
}
