'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing, CheckCheck, Settings2 } from 'lucide-react';

interface FeedItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/**
 * Full notification center: filterable feed (all/unread), per-item and
 * mark-all read, and a shortcut to email/in-app preferences.
 */
export function NotificationsCenter({ initial, initialUnread }: { initial: FeedItem[]; initialUnread: number }) {
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(initialUnread);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [working, setWorking] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=50');
      const body = (await res.json()) as { success: boolean; data?: { notifications: FeedItem[]; unreadCount: number } };
      if (body.success && body.data) {
        setItems(body.data.notifications);
        setUnread(body.data.unreadCount);
      }
    } catch {
      /* keep stale list */
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 30000);
    window.dispatchEvent(new Event('notifications-read'));
    return () => clearInterval(t);
  }, [refresh]);

  const markRead = async (ids: string[]) => {
    setWorking(true);
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      await refresh();
      window.dispatchEvent(new Event('notifications-read'));
    } finally {
      setWorking(false);
    }
  };

  const markAll = async () => {
    setWorking(true);
    try {
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      await refresh();
      window.dispatchEvent(new Event('notifications-read'));
    } finally {
      setWorking(false);
    }
  };

  const visible = filter === 'unread' ? items.filter((n) => !n.read) : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 text-xs font-extrabold dark:border-white/10 dark:bg-[#0b1e36]/60" role="group" aria-label="Filter notifications">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`rounded-lg px-3.5 py-1.5 capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${filter === f ? 'bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36]' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {f}{f === 'unread' ? ` (${unread})` : ''}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <Link
          href="/notifications/preferences"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
        >
          <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
          Preferences
        </Link>
        <button
          type="button"
          onClick={markAll}
          disabled={working || unread === 0}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
        >
          <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Mark all read
        </button>
      </div>

      {visible.length === 0 ? (
        <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500 dark:border-white/15">
          <BellRing className="h-4 w-4" aria-hidden="true" />
          {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {visible.map((n) => (
            <li key={n.id} className={`flex gap-3 rounded-2xl border p-4 ${n.read ? 'border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1e36]/60' : 'border-[#c59b48]/50 bg-[#c59b48]/5 dark:bg-[#c59b48]/10'}`}>
              <span className="min-w-0 flex-1">
                {n.link ? (
                  <Link
                    href={n.link}
                    onClick={() => {
                      if (!n.read) markRead([n.id]);
                    }}
                    className="block font-bold text-slate-800 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-100"
                  >
                    {n.title}
                  </Link>
                ) : (
                  <span className="block font-bold text-slate-800 dark:text-slate-100">{n.title}</span>
                )}
                <span className="mt-0.5 block text-sm leading-relaxed text-slate-600 dark:text-slate-300">{n.body}</span>
                <span className="mt-1.5 block font-mono text-[11px] text-slate-500">
                  {n.type.replace(/_/g, ' ')} • {formatWhen(n.createdAt)}
                </span>
              </span>
              {!n.read && (
                <button
                  type="button"
                  onClick={() => markRead([n.id])}
                  disabled={working}
                  className="h-fit shrink-0 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-extrabold text-slate-500 hover:border-[#c59b48] hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:border-white/15 dark:text-slate-400"
                >
                  Mark read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
