'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2, ScrollText, Search } from 'lucide-react';
import { useDebouncedValue } from '@/components/catalog/useDebouncedValue';
import type { AuditEntry } from '@/services/adminTypes';

interface AuditApiResponse {
  success: boolean;
  data?: { entries: AuditEntry[]; total: number; page: number; limit: number; actions: string[]; entityTypes: string[] };
  error?: { message: string };
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
}

/**
 * Audit log explorer (Section B): read-only view over the append-only
 * trail with action / actor / entity / date-range filters, pagination and
 * CSV export of the current filter set.
 */
export function AuditExplorer() {
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [actor, setActor] = useState('');
  const debouncedActor = useDebouncedValue(actor.trim(), 300);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);

  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 25;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (action) params.set('action', action);
      if (entityType) params.set('entityType', entityType);
      if (debouncedActor) params.set('actor', debouncedActor);
      if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
      if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString());
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const body = (await res.json()) as AuditApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load audit log.');
      setEntries(body.data.entries);
      setTotal(body.data.total);
      setActions(body.data.actions);
      setEntityTypes(body.data.entityTypes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load audit log.');
    } finally {
      setLoading(false);
    }
  }, [action, entityType, debouncedActor, from, to, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to first page whenever filters change.
  useEffect(() => {
    setPage(1);
  }, [action, entityType, debouncedActor, from, to]);

  const csvHref = (() => {
    const params = new URLSearchParams({ format: 'csv' });
    if (action) params.set('action', action);
    if (entityType) params.set('entityType', entityType);
    if (debouncedActor) params.set('actor', debouncedActor);
    if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
    if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString());
    return `/api/admin/audit?${params.toString()}`;
  })();

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Action
          <select value={action} onChange={(e) => setAction(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Entity
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
            <option value="">All entities</option>
            {entityTypes.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </label>
        <span className="relative" role="search">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="audit-actor" className="sr-only">Filter by actor email or name</label>
          <input
            id="audit-actor"
            value={actor}
            onChange={(e) => setActor(e.target.value)}
            placeholder="Actor email / name…"
            className="rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-2.5 text-xs font-semibold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
          />
        </span>
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          From
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
        </label>
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          To
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
        </label>
        <a
          href={csvHref}
          download
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-[#c59b48]/50 bg-[#c59b48]/10 px-3.5 py-2 text-xs font-extrabold text-[#7a5a1c] hover:bg-[#c59b48]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-[#dfb76c]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export CSV
        </a>
      </div>

      <section aria-label="Audit entries" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        {loading ? (
          <div aria-busy="true" aria-label="Loading audit log" className="space-y-2 p-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <p className="p-5 text-sm font-semibold text-slate-500" role="alert">{error}</p>
        ) : entries.length === 0 ? (
          <p className="flex items-center gap-2 p-5 text-sm text-slate-500">
            <ScrollText className="h-4 w-4" aria-hidden="true" />
            No audit entries match these filters.
          </p>
        ) : (
          <>
            <ol className="divide-y divide-slate-100 dark:divide-white/10">
              {entries.map((e) => (
                <li key={e.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="shrink-0 font-mono text-[11px] font-bold text-slate-500">{formatTime(e.createdAt)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{e.actorName}</span>
                    {e.actorRole && (
                      <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-400">
                        {e.actorRole}
                      </span>
                    )}
                    <span className="rounded bg-[#0b1e36] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#dfb76c]">{e.action}</span>
                    <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {e.entityType}{e.entityId ? ` • ${e.entityId.slice(0, 8)}…` : ''}
                    </span>
                    {e.ipAddress && <span className="ml-auto font-mono text-[11px] text-slate-500">ip {e.ipAddress}</span>}
                  </div>
                  {e.diff !== null && typeof e.diff === 'object' && Object.keys(e.diff as Record<string, unknown>).length > 0 && (
                    <details className="group mt-1.5">
                      <summary className="cursor-pointer list-none text-[11px] font-bold text-[#9a7224] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-[#dfb76c] [&::-webkit-details-marker]:hidden">
                        View before/after diff
                      </summary>
                      <pre className="mt-1.5 max-h-40 overflow-auto rounded-xl bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
                        {JSON.stringify(e.diff, null, 2)}
                      </pre>
                    </details>
                  )}
                </li>
              ))}
            </ol>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 dark:border-white/10">
              <p className="text-xs font-bold text-slate-500" aria-live="polite">
                Page {page} of {pages} • {total} entries
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  aria-label="Previous page"
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#c59b48] disabled:opacity-40 dark:border-white/15"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages || loading}
                  aria-label="Next page"
                  className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#c59b48] disabled:opacity-40 dark:border-white/15"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {loading && <Loader2 className="sr-only" aria-hidden="true" />}
          </>
        )}
      </section>
      <p className="text-xs text-slate-500">Append-only: entries can be created by system actions but never edited or deleted through the portal.</p>
    </div>
  );
}
