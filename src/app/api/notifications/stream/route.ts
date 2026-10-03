import { NextRequest } from 'next/server';
import { requireAssistantSession } from '@/lib/api-helpers';
import prisma from '@/lib/prisma';

// ============================================================================
// Live notification stream (Phase 3.3, in-app push). Server-Sent Events are
// used instead of raw WebSockets: same push UX, but serverless-compatible
// (no sticky connections). The client reconnects with ?since=; a 30s
// poller backs it up if streaming is unavailable. Idle windows close after
// ~50s; heartbeats keep proxies from buffering.
// ============================================================================

const WINDOW_MS = 50000;
const POLL_MS = 5000;
const HEARTBEAT_MS = 20000;

export async function GET(request: NextRequest) {
  const session = await requireAssistantSession().catch(() => null);
  if (!session) {
    return new Response(JSON.stringify({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get('since');
  let cursor = sinceParam ? new Date(sinceParam) : new Date(0);
  if (Number.isNaN(cursor.getTime())) cursor = new Date(0);
  const userId = session.userId;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          /* client gone */
        }
      };
      let closed = false;
      const close = () => {
        if (!closed) {
          closed = true;
          clearInterval(poller);
          clearInterval(heartbeat);
          try {
            controller.close();
          } catch {
            /* already closed */
          }
        }
      };
      const poller = setInterval(async () => {
        try {
          const rows = await prisma.notification.findMany({
            where: { userId, createdAt: { gt: cursor } },
            orderBy: { createdAt: 'asc' },
            take: 20,
          });
          for (const n of rows) {
            cursor = n.createdAt > cursor ? n.createdAt : cursor;
            send('notification', {
              id: n.id,
              type: n.type,
              title: n.title,
              body: n.body,
              link: n.link,
              createdAt: n.createdAt.toISOString(),
            });
          }
          const unreadCount = await prisma.notification.count({ where: { userId, read: false } });
          send('badge', { unreadCount, at: new Date().toISOString() });
        } catch {
          close();
        }
      }, POLL_MS);
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          close();
        }
      }, HEARTBEAT_MS);
      request.signal.addEventListener('abort', close);
      setTimeout(close, WINDOW_MS);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
