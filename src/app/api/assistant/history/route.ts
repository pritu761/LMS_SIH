import { apiFail, apiOk, requireAssistantSession } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

/**
 * GET /api/assistant/history?limit= — authenticated (own data). The
 * caller's recent assistant turns with cited sources (audit-visible
 * conversation log). The floating panel keeps its own local state; this
 * endpoint serves review and future cross-device resume.
 */
export async function GET(request: Request) {
  try {
    const session = await requireAssistantSession();
    const { searchParams } = new URL(request.url);
    const rawLimit = Number(searchParams.get('limit') ?? 20);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(50, Math.floor(rawLimit))) : 20;
    const rows = await prisma.chatMessage.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return apiOk({
      messages: rows.reverse().map((m) => ({
        id: m.id,
        role: m.role === 'ASSISTANT' ? 'assistant' : 'user',
        content: m.content,
        sources: Array.isArray(m.sources) ? m.sources : [],
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    return apiFail(err, 'HISTORY_UNAVAILABLE');
  }
}
