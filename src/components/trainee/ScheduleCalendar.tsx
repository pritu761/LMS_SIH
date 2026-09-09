'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Download, MapPin } from 'lucide-react';
import type { ScheduleItem, ScheduleKind } from '@/services/traineeTypes';

const KIND_STYLE: Record<ScheduleKind, { chip: string; dot: string; label: string }> = {
  LIVE_SESSION: {
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
    dot: 'bg-sky-500',
    label: 'Live session',
  },
  EXAM_WINDOW: {
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    dot: 'bg-rose-500',
    label: 'Exam window',
  },
  ASSIGNMENT_DEADLINE: {
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    dot: 'bg-amber-500',
    label: 'Deadline',
  },
  WORKSHOP: {
    chip: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
    dot: 'bg-teal-500',
    label: 'Workshop',
  },
  PERSONAL: {
    chip: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    dot: 'bg-violet-500',
    label: 'Personal',
  },
};

function dayKeyUTC(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

/**
 * Upcoming schedule (Section D): month grid over the caller's cohort live
 * sessions, exam windows, assignment deadlines and personal events, with a
 * day agenda and one-click .ics export (served by the export API).
 */
export function ScheduleCalendar({ items }: { items: ScheduleItem[] }) {
  const now = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const [selected, setSelected] = useState<string>(() => dayKeyUTC(now));

  const byDay = useMemo(() => {
    const map = new Map<string, ScheduleItem[]>();
    for (const item of items) {
      const key = dayKeyUTC(new Date(item.startsAt));
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return map;
  }, [items]);

  const cells = useMemo(() => {
    const year = cursor.getUTCFullYear();
    const month = cursor.getUTCMonth();
    const first = new Date(Date.UTC(year, month, 1));
    // Monday-first grid.
    const lead = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const out: Array<{ key: string; day: number; inMonth: boolean }> = [];
    for (let i = 0; i < lead; i++) {
      const d = new Date(Date.UTC(year, month, 1 - lead + i));
      out.push({ key: `o-${dayKeyUTC(d)}-${i}`, day: d.getUTCDate(), inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) out.push({ key: `m-${year}-${month}-${d}`, day: d, inMonth: true });
    while (out.length % 7 !== 0) {
      const idx = out.length;
      const d = new Date(Date.UTC(year, month + 1, idx - lead - daysInMonth + 1));
      out.push({ key: `t-${dayKeyUTC(d)}-${idx}`, day: d.getUTCDate(), inMonth: false });
    }
    return out;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const selectedItems = byDay.get(selected) ?? [];
  const todayKey = dayKeyUTC(now);

  const shift = (delta: number) =>
    setCursor((c) => new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + delta, 1)));

  return (
    <section aria-labelledby="schedule-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
          <CalendarDays className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <h2 id="schedule-heading" className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
            Upcoming schedule
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live sessions • exam windows • deadlines</p>
        </span>
        <a
          href="/api/trainee/calendar/export"
          download="capacityconnect-schedule.ics"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#c59b48]/50 bg-[#c59b48]/10 px-3.5 py-2 text-xs font-extrabold text-[#7a5a1c] transition-colors hover:bg-[#c59b48]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-[#dfb76c]"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Export .ics
        </a>
      </header>
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shift(-1)}
              aria-label="Previous month"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="font-display text-sm font-extrabold text-[#0b1e36] dark:text-white" aria-live="polite">
              {monthLabel}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCursor(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
                  setSelected(todayKey);
                }}
                className="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => shift(1)}
                aria-label="Next month"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-500" aria-hidden="true">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={`${d}-${i}`} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1" role="grid" aria-label={`${monthLabel} calendar`}>
            {cells.map((c) => {
              const key = c.inMonth
                ? `${cursor.getUTCFullYear()}-${cursor.getUTCMonth()}-${c.day}`
                : c.key;
              const dayItems = byDay.get(key) ?? [];
              const isToday = key === todayKey;
              const isSelected = key === selected;
              return (
                <button
                  key={c.key}
                  type="button"
                  disabled={!c.inMonth}
                  onClick={() => setSelected(key)}
                  aria-pressed={isSelected}
                  aria-label={`${c.day} ${monthLabel}${dayItems.length > 0 ? `, ${dayItems.length} events` : ''}`}
                  className={`flex min-h-[52px] flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                    !c.inMonth
                      ? 'cursor-default text-slate-300 dark:text-slate-600'
                      : isSelected
                        ? 'bg-[#0b1e36] font-bold text-white dark:bg-[#c59b48] dark:text-[#0b1e36]'
                        : 'font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isToday && !isSelected ? 'bg-[#c59b48]/25 font-black text-[#7a5a1c] dark:text-[#dfb76c]' : ''}`}>
                    {c.day}
                  </span>
                  <span className="flex items-center gap-0.5" aria-hidden="true">
                    {dayItems.slice(0, 3).map((it) => (
                      <span key={it.id} className={`h-1.5 w-1.5 rounded-full ${KIND_STYLE[it.kind].dot}`} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400" aria-label="Event legend">
            {Object.values(KIND_STYLE).map((k) => (
              <span key={k.label} className="inline-flex items-center gap-1">
                <span className={`h-2 w-2 rounded-full ${k.dot}`} aria-hidden="true" />
                {k.label}
              </span>
            ))}
          </div>
        </div>
        <div aria-live="polite" aria-label="Selected day agenda" className="border-t border-slate-100 bg-slate-50/60 p-4 sm:p-5 lg:border-l lg:border-t-0 dark:border-white/10 dark:bg-black/20">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {selectedItems.length > 0 ? `${selectedItems.length} event${selectedItems.length === 1 ? '' : 's'}` : 'No events this day'}
          </h3>
          {selectedItems.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Nothing scheduled. Pick a highlighted day to see sessions, exam windows and deadlines.
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {selectedItems.map((it) => (
                <li key={it.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${KIND_STYLE[it.kind].chip}`}>
                      {KIND_STYLE[it.kind].label}
                    </span>
                    {it.cohortCode && (
                      <span className="font-mono text-[11px] font-bold text-[#9a7224] dark:text-[#dfb76c]">{it.cohortCode}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-bold text-slate-800 dark:text-slate-100">{it.title}</p>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {formatDay(it.startsAt)} • {formatTime(it.startsAt)}
                    {it.endsAt ? ` – ${formatTime(it.endsAt)} IST` : ' IST'}
                  </p>
                  {it.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <MapPin className="h-3 w-3" aria-hidden="true" />
                      {it.location}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
