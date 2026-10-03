import { redirect } from 'next/navigation';
import { BellRing } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NotificationsCenter } from '@/components/notifications/NotificationsCenter';

export const metadata = { title: 'Notifications' };

/**
 * GET /notifications — authenticated notification center (own data):
 * filterable feed with mark-read controls. Live updates arrive via the
 * bell's SSE stream; this page polls every 30s as backup.
 */
export default async function NotificationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/notifications');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const [items, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.notification.count({ where: { userId: session.userId, read: false } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Notifications</h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} • exam windows, packs, decisions
          </p>
        </div>
      </header>
      <div className="mt-5">
        <NotificationsCenter
          initial={items.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, link: n.link, read: n.read, createdAt: n.createdAt.toISOString() }))}
          initialUnread={unreadCount}
        />
      </div>
    </div>
  );
}
