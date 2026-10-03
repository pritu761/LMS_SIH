'use client';

import { useEffect, useMemo, useState } from 'react';
import { ListFilter, Loader2, Search, SearchX, X } from 'lucide-react';
import { TrackCard } from './TrackCard';
import { useDebouncedValue } from './useDebouncedValue';
import {
  DURATION_BUCKETS,
  bucketForDuration,
  type CatalogLevel,
  type CatalogSearchHit,
  type CatalogTrackSummary,
  type DurationBucketId,
} from '@/services/catalogTypes';

interface SearchApiResponse {
  success: boolean;
  data?: { query: string; count: number; hits: CatalogSearchHit[] };
  error?: { code: string; message: string };
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function localTrackMatch(track: CatalogTrackSummary, q: string): boolean {
  const hay = [track.name, track.code, track.description, ...track.domains].join(' ').toLowerCase();
  return hay.includes(q);
}

function matchNoteFor(track: CatalogTrackSummary, q: string, hit: CatalogSearchHit | undefined): string | null {
  if (!q) return null;
  if (hit) {
    const parts: string[] = [];
    if (hit.matchedIn.includes('track')) parts.push('track overview');
    if (hit.matchedModuleCodes.length > 0)
      parts.push(`${hit.matchedModuleCodes.length} module${hit.matchedModuleCodes.length === 1 ? '' : 's'}`);
    if (hit.matchedLessonCodes.length > 0)
      parts.push(`${hit.matchedLessonCodes.length} lesson${hit.matchedLessonCodes.length === 1 ? '' : 's'}`);
    return `Keyword match in: ${parts.join(' · ')}`;
  }
  if (localTrackMatch(track, q)) return 'Matches track title, description or domain';
  return null;
}

interface CatalogExplorerProps {
  tracks: CatalogTrackSummary[];
}

/**
 * Interactive catalog explorer: debounced (300 ms) keyword search across
 * track / module / lesson / competency keywords plus faceted sidebar
 * filters (Track | Level | Domain | Duration). Fully client-side over the
 * ISR-fetched dataset, enriched by the DB-backed /api/catalog/search
 * endpoint for module/lesson-level match context.
 */
export function CatalogExplorer({ tracks }: CatalogExplorerProps) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim().toLowerCase(), 300);
  const [hits, setHits] = useState<Record<string, CatalogSearchHit>>({});
  const [searchPending, setSearchPending] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selTracks, setSelTracks] = useState<string[]>([]);
  const [selLevels, setSelLevels] = useState<CatalogLevel[]>([]);
  const [selDomains, setSelDomains] = useState<string[]>([]);
  const [selDurations, setSelDurations] = useState<DurationBucketId[]>([]);

  // DB-backed keyword search (debounced): resolves module/lesson/WMO matches.
  useEffect(() => {
    if (!debouncedQuery) {
      setHits({});
      setSearchPending(false);
      return;
    }
    const controller = new AbortController();
    setSearchPending(true);
    fetch(`/api/catalog/search?q=${encodeURIComponent(debouncedQuery)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
        const body = (await res.json()) as SearchApiResponse;
        if (!body.success || !body.data) throw new Error(body.error?.message ?? 'Search failed.');
        const map: Record<string, CatalogSearchHit> = {};
        for (const h of body.data.hits) map[h.trackCode] = h;
        if (!controller.signal.aborted) setHits(map);
      })
      .catch(() => {
        // Silent fallback: local track-level matching still applies.
        if (!controller.signal.aborted) setHits({});
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearchPending(false);
      });
    return () => controller.abort();
  }, [debouncedQuery]);

  const domainCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tracks) for (const d of t.domains) counts.set(d, (counts.get(d) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [tracks]);

  const durationCounts = useMemo(() => {
    const counts: Record<DurationBucketId, number> = { SHORT: 0, STANDARD: 0, EXTENDED: 0 };
    for (const t of tracks) counts[bucketForDuration(t.estimatedDurationHrs)] += 1;
    return counts;
  }, [tracks]);

  const visible = useMemo(() => {
    return tracks.filter((t) => {
      if (selTracks.length > 0 && !selTracks.includes(t.code)) return false;
      if (selLevels.length > 0 && !selLevels.includes(t.level)) return false;
      if (selDomains.length > 0 && !selDomains.some((d) => t.domains.includes(d))) return false;
      if (selDurations.length > 0 && !selDurations.includes(bucketForDuration(t.estimatedDurationHrs))) return false;
      if (debouncedQuery && !localTrackMatch(t, debouncedQuery) && !hits[t.code]) return false;
      return true;
    });
  }, [tracks, selTracks, selLevels, selDomains, selDurations, debouncedQuery, hits]);

  const activeFilterCount = selTracks.length + selLevels.length + selDomains.length + selDurations.length;

  const clearAll = () => {
    setQuery('');
    setSelTracks([]);
    setSelLevels([]);
    setSelDomains([]);
    setSelDurations([]);
  };

  const filters = (
    <div className="space-y-6">
      <fieldset>
        <legend className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Track
        </legend>
        <ul className="mt-2 space-y-1.5">
          {tracks.map((t) => (
            <li key={t.code}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-within:ring-2 focus-within:ring-[#c59b48] dark:text-slate-200 dark:hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={selTracks.includes(t.code)}
                  onChange={() => setSelTracks((prev) => toggle(prev, t.code))}
                  className="h-4 w-4 shrink-0 accent-[#c59b48]"
                />
                <span className="font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]">{t.code}</span>
                <span className="line-clamp-1">{t.name}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Level
        </legend>
        <ul className="mt-2 space-y-1.5">
          {(['FOUNDATION', 'ADVANCED'] as const).map((level) => (
            <li key={level}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-within:ring-2 focus-within:ring-[#c59b48] dark:text-slate-200 dark:hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={selLevels.includes(level)}
                  onChange={() => setSelLevels((prev) => toggle(prev, level))}
                  className="h-4 w-4 shrink-0 accent-[#c59b48]"
                />
                {level === 'FOUNDATION' ? 'Foundation' : 'Advanced'}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Domain
        </legend>
        <ul className="mt-2 space-y-1.5">
          {domainCounts.map(([domain, count]) => (
            <li key={domain}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-within:ring-2 focus-within:ring-[#c59b48] dark:text-slate-200 dark:hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={selDomains.includes(domain)}
                  onChange={() => setSelDomains((prev) => toggle(prev, domain))}
                  className="h-4 w-4 shrink-0 accent-[#c59b48]"
                />
                <span className="font-mono text-xs">{domain}</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                  {count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <fieldset>
        <legend className="font-display text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Duration
        </legend>
        <ul className="mt-2 space-y-1.5">
          {DURATION_BUCKETS.map((b) => (
            <li key={b.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 focus-within:ring-2 focus-within:ring-[#c59b48] dark:text-slate-200 dark:hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={selDurations.includes(b.id)}
                  onChange={() => setSelDurations((prev) => toggle(prev, b.id))}
                  className="h-4 w-4 shrink-0 accent-[#c59b48]"
                />
                {b.label}
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                  {durationCounts[b.id]}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300 dark:hover:text-rose-400"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          Clear all filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div>
      {/* Search bar */}
      <div className="relative mx-auto max-w-2xl" role="search">
        <label htmlFor="catalog-search" className="sr-only">
          Search tracks, modules and competencies
        </label>
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks, modules, competencies — e.g. “dual-pol”, “CFL”, “WMO-1205”…"
          autoComplete="off"
          className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm transition-all placeholder:text-slate-400 focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
        />
        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2">
          {searchPending && <Loader2 className="h-4 w-4 animate-spin text-[#c59b48]" aria-label="Searching curriculum" />}
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10 dark:hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[264px_minmax(0,1fr)]">
        {/* Sidebar (desktop) */}
        <aside aria-label="Catalog filters" className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-extrabold uppercase tracking-wider text-[#0b1e36] dark:text-white">
              <ListFilter className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
              Filters
            </h2>
            {filters}
          </div>
        </aside>

        {/* Results */}
        <section aria-label="Training tracks">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters-mobile"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[#0b1e36] shadow-sm transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] lg:hidden dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <ListFilter className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
              Filters
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-[#c59b48] px-2 py-0.5 text-[11px] font-extrabold text-[#0b1e36]">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <p aria-live="polite" className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Showing {visible.length} of {tracks.length} tracks
              {debouncedQuery && (
                <>
                  {' '}
                  for <span className="font-mono text-[#0b1e36] dark:text-[#dfb76c]">“{debouncedQuery}”</span>
                </>
              )}
            </p>
          </div>

          {filtersOpen && (
            <div
              id="catalog-filters-mobile"
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:hidden dark:border-white/10 dark:bg-[#0b1e36]/60"
            >
              {filters}
            </div>
          )}

          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/5">
              <SearchX className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              <h2 className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">No tracks match your search</h2>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Try a different keyword (e.g. “radar”, “monsoon”, “HPC”) or clear the active filters.
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-2 rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] focus-visible:ring-offset-2 dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
              >
                Clear search & filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {visible.map((t) => (
                <TrackCard key={t.code} track={t} matchNote={matchNoteFor(t, debouncedQuery, hits[t.code])} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
