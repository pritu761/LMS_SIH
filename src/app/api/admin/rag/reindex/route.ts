import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAdminSession } from '@/lib/api-helpers';
import { buildIndex } from '@/lib/rag/index';
import { logAudit } from '@/services/adminService';

/**
 * POST /api/admin/rag/reindex — ADMIN only. Full knowledge-base rebuild:
 * published lessons, competency rubrics, station briefs and the versioned
 * static corpus (FAQs/policies) → chunked + embedded Document rows,
 * keyed by (source, section) so re-runs replace stale chunks. Also runs
 * automatically (best-effort) on lesson publish/update.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const started = Date.now();
    const result = await buildIndex();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    await logAudit({
      actorId: session.userId,
      actorRole: 'ADMIN',
      action: 'RAG_REINDEXED',
      entityType: 'Document',
      entityId: null,
      ip,
      diff: {},
      metadata: { ...result, ms: Date.now() - started },
    });
    return apiOk({ ...result, ms: Date.now() - started });
  } catch (err) {
    return apiFail(err, 'REINDEX_UNAVAILABLE');
  }
}
