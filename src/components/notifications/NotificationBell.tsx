'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell, BellRing, CheckCheck, Settings2 } from 'lucide-react';

interface FeedItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_DOT: Record<string, string> = {
  REGISTRATION_APPROVED: 'bg-emerald-500',
  REGISTRATION_REJECTED: 'bg-rose-500',
  COHORT_ASSIGNED: 'bg-sky-500',
  EXAM_OPENED: 'bg-rose-500',
  DEADLINE_REMINDER: 'bg-amber-500',
  CERTIFICATE_ISSUED: 'bg-[#c59b48]',
  REMEDIATION_RECEIVED: 'bg-violet-500',
  RADAR_CASE_SHARED: 'bg-cyan-500',
  SLA_BREACH: 'bg-red-600',
};

function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/**
 * Notification bell (Phase 3.3): unread badge fed by a live SSE stream
 * (EventSource, auto-reconnect with ?since=) plus a 30s polling fallback.
 * Dropdown offers recent items, per-item + mark-all read, and links to the
 * full center and preferences. Rendered for signed-in users only.
 */
export function NotificationBell() {
  const [authed, setAuthed] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [open, setOpen] = useState(false);
  const sinceRef = useRef<string>(new Date(0).toISOString());
  const seenRef = useRef<Set<string>>(new Set());
  const esRef = useRef<EventSource | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=8');
      const body = (await res.json()) as { success: boolean; data?: { notifications: FeedItem[]; unreadCount: number } };
      if (res.ok && body.success && body.data) {
        setItems(body.data.notifications);
        setUnread(body.data.unreadCount);
        const latest = body.data.notifications[0]?.createdAt;
        if (latest && latest > sinceRef.current) sinceRef.current = latest;
        seenRef.current = new Set(body.data.notifications.map((n) => n.id));
      }
    } catch {
      /* badge keeps last known state */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me')
      .then(async (r) => {
        if (!cancelled) setAuthed(r.ok);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    const onAuth = () => {
      fetch('/api/auth/me')
        .then(async (r) => {
          if (!cancelled) {
            setAuthed(r.ok);
            if (!r.ok) {
              setOpen(false);
              setUnread(0);
              setItems([]);
            } else refresh();
          }
        })
        .catch(() => {
          if (!cancelled) setAuthed(false);
        });
    };
    window.addEventListener('auth-change', onAuth);
    return () => {
      cancelled = true;
      window.removeEventListener('auth-change', onAuth);
    };
  }, [refresh]);

  // Live stream with reconnect; 30s poller as backup.
  useEffect(() => {
    if (!authed) return;
    refresh();
    let stopped = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    const connect = () => {
      if (stopped) return;
      try {
        esRef.current?.close();
        const es = new EventSource(`/api/notifications/stream?since=${encodeURIComponent(sinceRef.current)}`);
        esRef.current = es;
        es.addEventListener('notification', (ev) => {
          try {
            const n = JSON.parse((ev as MessageEvent).data) as FeedItem;
            sinceRef.current = n.createdAt > sinceRef.current ? n.createdAt : sinceRef.current;
            // Dedupe: reconnect catch-up replays recent rows; never inflate.
            if (seenRef.current.has(n.id)) return;
            seenRef.current.add(n.id);
            if (seenRef.current.size > 200) {
              seenRef.current = new Set(Array.from(seenRef.current).slice(-100));
            }
            setItems((list) => [n, ...list].slice(0, 20));
            setUnread((u) => u + 1);
          } catch {
            /* malformed push — next poll heals */
          }
        });
        es.addEventListener('badge', (ev) => {
          try {
            const b = JSON.parse((ev as MessageEvent).data) as { unreadCount: number };
            if (typeof b.unreadCount === 'number') setUnread(b.unreadCount);
          } catch {
            /* ignore */
          }
        });
        es.onerror = () => {
          es.close();
          if (!stopped) retryTimer = setTimeout(connect, 8000);
        };
      } catch {
        if (!stopped) retryTimer = setTimeout(connect, 8000);
      }
    };
    connect();
    const poller = setInterval(refresh, 30000);
    return () => {
      stopped = true;
      if (retryTimer) clearTimeout(retryTimer);
      clearInterval(poller);
      esRef.current?.close();
      esRef.current = null;
    };
  }, [authed, refresh]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const markRead = async (ids: string[]) => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      const body = (await res.json()) as { success: boolean; data?: { unreadCount: number } };
      if (body.success && body.data) {
        setUnread(body.data.unreadCount);
        setItems((list) => list.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
      }
    } catch {
      /* retry on next open */
    }
  };

  const markAll = async () => {
    try {
      const res = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      const body = (await res.json()) as { success: boolean; data?: { unreadCount: number } };
      if (body.success && body.data) {
        setUnread(body.data.unreadCount);
        setItems((list) => list.map((n) => ({ ...n, read: true })));
      }
    } catch {
      /* ignore */
    }
  };

  if (!authed) return null;

  return (
    <div className="relative shrink-0" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        title="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-[#c59b48] hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      >
        {unread > 0 ? <BellRing className="h-3.5 w-3.5 text-[#c59b48]" aria-hidden="true" /> : <Bell className="h-3.5 w-3.5" aria-hidden="true" />}
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 font-mono text-[9px] font-black text-white" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-[80] w-[330px] max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/15 dark:bg-[#0b1e36]">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-white/10">
            <h2 className="font-display min-w-0 flex-1 text-sm font-extrabold text-[#0b1e36] dark:text-white">Notifications</h2>
            <button
              type="button"
              onClick={markAll}
              disabled={unread === 0}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-extrabold text-slate-500 hover:bg-slate-100 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-40 dark:text-slate-400 dark:hover:bg-white/10"
            >
              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Mark all read
            </button>
            <Link
              href="/notifications/preferences"
              onClick={() => setOpen(false)}
              aria-label="Notification preferences"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
            >
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
          <ul className="max-h-[380px] divide-y divide-slate-100 overflow-y-auto dark:divide-white/10">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-xs text-slate-500">All caught up — new exam windows, packs and decisions land here.</li>
            )}
            {items.map((n) => (
              <li key={n.id}>
                <div className={`flex gap-2.5 px-4 py-3 ${n.read ? '' : 'bg-[#c59b48]/5 dark:bg-[#c59b48]/10'}`}>
                  <span aria-hidden="true" className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_DOT[n.type] ?? 'bg-slate-400'}`} />
                  <span className="min-w-0 flex-1">
                    <Link
                      href={n.link ?? '/notifications'}
                      onClick={() => {
                        if (!n.read) markRead([n.id]);
                        setOpen(false);
                      }}
                      className="block truncate text-[13px] font-extrabold text-slate-800 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-100"
                    >
                      {n.title}
                    </Link>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-slate-500 dark:text-slate-400">{n.body}</span>
                    <span className="mt-1 block font-mono text-[10px] text-slate-500">
                      {n.type.replace(/_/g, ' ')} • {timeAgo(n.createdAt)} ago
                    </span>
                  </span>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => markRead([n.id])}
                      aria-label={`Mark "${n.title}" as read`}
                      className="h-fit shrink-0 rounded-lg px-2 py-1 text-[10px] font-extrabold text-slate-500 hover:bg-slate-100 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
                    >
                      ✓
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-extrabold text-[#9a7224] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c59b48] dark:border-white/10 dark:text-[#dfb76c] dark:hover:bg-white/5"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
