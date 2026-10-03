import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ApiError, apiFail, apiOk, requireAssistantSession } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

const readSchema = z
  .object({
    ids: z.array(z.string().uuid()).max(100).optional(),
    all: z.boolean().optional(),
  })
  .refine((v) => (v.ids && v.ids.length > 0) || v.all === true, {
    message: 'Provide ids[] or { all: true }.',
  });

/**
 * POST /api/notifications/read — authenticated (own rows only).
 * { ids: [...] } marks selected as read; { all: true } clears the badge.
 * Returns the fresh unread count for instant badge sync.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAssistantSession();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new ApiError(400, 'INVALID_BODY', 'Request body must be valid JSON.');
    }
    const parsed = readSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(400, 'INVALID_BODY', parsed.error.issues[0]?.message ?? 'Read payload is invalid.');
    }
    const now = new Date();
    if (parsed.data.all) {
      await prisma.notification.updateMany({ where: { userId: session.userId, read: false }, data: { read: true, readAt: now } });
    } else {
      await prisma.notification.updateMany({
        where: { userId: session.userId, id: { in: parsed.data.ids ?? [] } },
        data: { read: true, readAt: now },
      });
    }
    const unreadCount = await prisma.notification.count({ where: { userId: session.userId, read: false } });
    return apiOk({ unreadCount });
  } catch (err) {
    return apiFail(err, 'READ_UNAVAILABLE');
  }
}
