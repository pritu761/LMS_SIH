'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FileCheck,
  GraduationCap,
  Loader2,
  MapPin,
  Search,
  SearchX,
  TableProperties,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useDebouncedValue } from '@/components/catalog/useDebouncedValue';

export const OPEN_PALETTE_EVENT = 'open-command-palette';

interface PaletteHit {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  meta?: string;
}

interface PaletteGroup {
  type: string;
  label: string;
  items: PaletteHit[];
}

interface SearchApiResponse {
  success: boolean;
  data?: { groups: PaletteGroup[]; total: number };
  error?: { message: string };
}

const GROUP_ICON: Record<string, typeof BookOpen> = {
  modules: BookOpen,
  competencies: Target,
  trainers: GraduationCap,
  stations: MapPin,
  assessments: FileCheck,
  reports: TableProperties,
  users: Users,
};

/**
 * Global command palette (Phase 3.2): Cmd+K / Ctrl+K (or the navbar search
 * button, which dispatches OPEN_PALETTE_EVENT) on every page for signed-in
 * users. Debounced 300ms search across RBAC-gated groups, arrow-key
 * navigation, Enter to deep-link, Esc to close.
 */
export function CommandPalette() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query.trim(), 300);
  const [groups, setGroups] = useState<PaletteGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
            if (!r.ok) setOpen(false);
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
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setGroups([]);
    setError(null);
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!authed) return;
        setOpen((v) => !v);
      }
    };
    const onOpenEvent = () => {
      if (authed) setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpenEvent);
    };
  }, [authed]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setGroups([]);
      setError(null);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open ]);

  useEffect(() => {
    if (!open || debounced.length < 2) {
      setGroups([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: controller.signal })
      .then(async (res) => {
        const body = (await res.json()) as SearchApiResponse;
        if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Search failed.');
        if (!controller.signal.aborted) {
          setGroups(body.data.groups);
          setActive(0);
        }
      })
      .catch((e: unknown) => {
        if (!controller.signal.aborted) setError(e instanceof Error && e.name !== 'AbortError' ? e.message : 'Search failed.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [debounced, open]);

  const flat = useMemo(() => {
    const out: Array<PaletteHit & { group: string }> = [];
    for (const g of groups) for (const item of g.items) out.push({ ...item, group: g.label });
    return out;
  }, [groups]);

  useEffect(() => {
    if (active >= flat.length) setActive(0);
  }, [flat.length, active]);

  const go = useCallback(
    (index: number) => {
      const hit = flat[index];
      if (!hit) return;
      close();
      router.push(hit.url);
    },
    [flat, close, router]
  );

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (flat.length === 0 ? 0 : (a + 1) % flat.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (flat.length === 0 ? 0 : (a - 1 + flat.length) % flat.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!authed) return null;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 p-4 pt-[12vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-[#0b1e36] dark:ring-1 dark:ring-white/15">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 dark:border-white/10">
              <Search className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
              <label htmlFor="global-search-input" className="sr-only">Search modules, people, stations and more</label>
              <input
                id="global-search-input"
                ref={inputRef}
                role="combobox"
                aria-expanded="true"
                aria-controls="global-search-list"
                aria-activedescendant={flat.length > 0 ? `gs-opt-${active}` : undefined}
                aria-autocomplete="list"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search modules, competencies, trainers, stations, exams…"
                autoComplete="off"
                className="w-full bg-transparent py-3.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
              />
              {loading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#c59b48]" aria-label="Searching" />
              ) : (
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close search"
                  className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <div ref={listRef} id="global-search-list" role="listbox" aria-label="Search results" className="max-h-[50vh] overflow-y-auto p-2">
              {error && (
                <p className="px-3 py-6 text-center text-sm font-semibold text-slate-500" role="alert">{error}</p>
              )}
              {!error && debounced.length >= 2 && !loading && flat.length === 0 && (
                <p className="flex items-center justify-center gap-2 px-3 py-6 text-center text-sm text-slate-500">
                  <SearchX className="h-4 w-4" aria-hidden="true" />
                  No results for “{debounced}” in your scope.
                </p>
              )}
              {!error && debounced.length < 2 && (
                <p className="px-3 py-6 text-center text-xs text-slate-500">
                  Type at least 2 characters. Results are scoped to your role and deep-link on Enter.
                </p>
              )}
              {groups.map((g) => {
                const Icon = GROUP_ICON[g.type] ?? Search;
                let base = 0;
                for (const prev of groups) {
                  if (prev === g) break;
                  base += prev.items.length;
                }
                return (
                  <div key={g.type} role="group" aria-label={g.label}>
                    <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {g.label}
                    </p>
                    {g.items.map((item, i) => {
                      const idx = base + i;
                      const isActive = idx === active;
                      return (
                        <div
                          key={item.id}
                          id={`gs-opt-${idx}`}
                          data-idx={idx}
                          role="option"
                          aria-selected={isActive}
                          onMouseMove={() => setActive(idx)}
                          onClick={() => go(idx)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${isActive ? 'bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36]' : ''}`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? '' : 'text-[#c59b48]'}`} aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold">{item.title}</span>
                            <span className={`block truncate text-xs ${isActive ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'}`}>{item.subtitle}</span>
                          </span>
                          {item.meta && (
                            <span className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold ${isActive ? 'bg-white/20' : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'}`}>
                              {item.meta}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-2 font-mono text-[10px] text-slate-500 dark:border-white/10">
              <span><kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">↑↓</kbd> navigate</span>
              <span><kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">↵</kbd> open</span>
              <span><kbd className="rounded bg-slate-100 px-1 dark:bg-white/10">esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
