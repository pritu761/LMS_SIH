import { NextRequest } from 'next/server';
import { ApiError, apiFail, apiOk, requireAssistantSession } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

/**
 * GET /api/notifications?unread=&limit= — authenticated (own data only).
 * Newest-first feed plus the unread badge count. Types are preference-
 * filtered client-side display only; all rows remain queryable here.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAssistantSession();
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === '1' || searchParams.get('unread') === 'true';
    const rawLimit = Number(searchParams.get('limit') ?? 20);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(100, Math.floor(rawLimit))) : 20;
    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.userId, ...(unreadOnly ? { read: false } : {}) },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: session.userId, read: false } }),
    ]);
    return apiOk({
      notifications: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (err) {
    return apiFail(err, 'NOTIFICATIONS_UNAVAILABLE');
  }
}
