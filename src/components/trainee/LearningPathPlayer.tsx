'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  History,
  Layers,
  Loader2,
  Lock,
  NotebookPen,
  PlayCircle,
  TriangleAlert,
  WifiOff,
} from 'lucide-react';
import { Markdown } from '@/components/catalog/Markdown';
import type {
  LessonDetailView,
  PracticeQuestion,
  ResumeTarget,
  TraineeTrackView,
} from '@/services/traineeTypes';
import { MODULE_STATUS_LABEL } from '@/services/traineeTypes';

interface LessonApiResponse {
  success: boolean;
  data?: { lesson: LessonDetailView };
  error?: { code: string; message: string };
}

interface ProgressApiResponse {
  success: boolean;
  data?: { lessonCode: string; completed: boolean; bookmarked: boolean; note: string | null; trackPercent: number };
  error?: { code: string; message: string };
}

interface Selection {
  moduleCode: string;
  lessonCode: string;
}

interface LearningPathPlayerProps {
  tracks: TraineeTrackView[];
  cohortTrackCode: string | null;
  resume: ResumeTarget | null;
  initialTrackCode?: string;
  initialModuleCode?: string;
  initialLessonCode?: string;
}

function findLesson(tracks: TraineeTrackView[], trackCode: string, lessonCode: string): Selection | null {
  const track = tracks.find((t) => t.code === trackCode);
  if (!track) return null;
  for (const m of track.modules) {
    if (m.lessons.some((l) => l.code === lessonCode)) return { moduleCode: m.code, lessonCode };
  }
  return null;
}

function firstAvailable(tracks: TraineeTrackView[], trackCode: string): Selection | null {
  const track = tracks.find((t) => t.code === trackCode);
  if (!track) return null;
  for (const m of track.modules) {
    const lesson = m.lessons.find((l) => !l.locked && l.code);
    if (lesson?.code) return { moduleCode: m.code, lessonCode: lesson.code };
  }
  return null;
}

function youtubeEmbed(url: string): string | null {
  const m = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/) ?? url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

// --- Offline support (PWA): Cache API snapshots + progress outbox ---------
const LESSON_CACHE = 'cc-lessons';
const OUTBOX_KEY = 'cc-progress-outbox';

interface OutboxEntry {
  lessonCode: string;
  completed?: boolean;
  bookmark?: boolean;
  note?: string | null;
  ts: number;
}

function lessonSnapshotKey(code: string): string {
  return `lesson-snapshot:${code}`;
}

function readOutbox(): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as OutboxEntry[]).slice(-100) : [];
  } catch {
    return [];
  }
}

function enqueueOutbox(entry: Omit<OutboxEntry, 'ts'>): void {
  try {
    // Collapse to one pending entry per lesson (latest intent wins).
    const rest = readOutbox().filter((e) => e.lessonCode !== entry.lessonCode);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify([...rest, { ...entry, ts: Date.now() }].slice(-100)));
  } catch {
    /* storage full/private mode — progress retry happens on next online save */
  }
}

/** Inline non-proctored knowledge check with instant feedback. */
function PracticeCheckpoint({ questions }: { questions: PracticeQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setAnswers({});
    setRevealed({});
  }, [questions]);

  if (questions.length === 0) return null;

  const checkMulti = (q: PracticeQuestion) => {
    const correct = Array.isArray(q.correct) ? [...q.correct].sort().join(',') : q.correct;
    const given = answers[q.id];
    const norm = Array.isArray(given) ? [...given].sort().join(',') : (given ?? '');
    return norm === correct && norm !== '';
  };

  return (
    <div className="mt-8 rounded-2xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-500/30 dark:bg-sky-500/5">
      <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-300">
        Knowledge check — practice only, not graded
      </h3>
      <ol className="mt-4 space-y-5">
        {questions.map((q, qi) => {
          const isMulti = q.type === 'MULTI_CHOICE';
          const isText = q.options.length <= 1;
          const done = revealed[q.id] === true;
          const singleCorrect = !isMulti && !isText && answers[q.id] === q.correct;
          const multiCorrect = isMulti && checkMulti(q);
          return (
            <li key={q.id} className="rounded-xl bg-white p-4 shadow-sm dark:bg-black/20">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                <span className="mr-2 font-mono text-xs text-sky-600 dark:text-sky-400">Q{qi + 1}</span>
                {q.text}
              </p>
              {!isText && (
                <div className="mt-3 space-y-2" role="group" aria-label={`Options for question ${qi + 1}`}>
                  {q.options.map((o) => {
                    const picked = isMulti
                      ? Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(o.id)
                      : answers[q.id] === o.id;
                    const isRight = Array.isArray(q.correct) ? q.correct.includes(o.id) : q.correct === o.id;
                    return (
                      <label
                        key={o.id}
                        className={`flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors focus-within:ring-2 focus-within:ring-sky-500 ${
                          done && isRight
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                            : done && picked
                              ? 'border-rose-300 bg-rose-50 dark:border-rose-500/40 dark:bg-rose-500/10'
                              : 'border-slate-200 hover:border-sky-300 dark:border-white/10'
                        }`}
                      >
                        <input
                          type={isMulti ? 'checkbox' : 'radio'}
                          name={`q-${q.id}`}
                          checked={picked}
                          disabled={done}
                          onChange={() => {
                            if (isMulti) {
                              const cur = Array.isArray(answers[q.id]) ? [...(answers[q.id] as string[])] : [];
                              setAnswers((a) => ({
                                ...a,
                                [q.id]: cur.includes(o.id) ? cur.filter((x) => x !== o.id) : [...cur, o.id],
                              }));
                            } else {
                              setAnswers((a) => ({ ...a, [q.id]: o.id }));
                              setRevealed((r) => ({ ...r, [q.id]: true }));
                            }
                          }}
                          className="mt-1 accent-sky-600"
                        />
                        <span className="text-slate-700 dark:text-slate-200">{o.text}</span>
                      </label>
                    );
                  })}
                </div>
              )}
              {isText && !done && (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}
                  className="mt-3 rounded-lg border border-sky-300 px-3 py-1.5 text-xs font-bold text-sky-700 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:text-sky-300"
                >
                  I have drafted my answer — reveal guidance
                </button>
              )}
              {isMulti && !done && (
                <button
                  type="button"
                  onClick={() => setRevealed((r) => ({ ...r, [q.id]: true }))}
                  className="mt-3 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Check answer
                </button>
              )}
              {done && (
                <p
                  className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                    isText || singleCorrect || multiCorrect
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                  }`}
                  aria-live="polite"
                >
                  {isText ? 'Model guidance: ' : singleCorrect || multiCorrect ? 'Correct. ' : 'Not quite. '}
                  {q.explanation ?? 'Review the lesson material above and try again.'}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * Learning-path player (Section B): track tabs, collapsible module outline,
 * lesson viewer (Markdown / video / PDF / resources), resume pointer,
 * completion + bookmarks + personal notes, and inline practice checkpoints.
 */
export function LearningPathPlayer({
  tracks,
  cohortTrackCode,
  resume,
  initialTrackCode,
  initialModuleCode,
  initialLessonCode,
}: LearningPathPlayerProps) {
  const router = useRouter();
  const defaultTrack = cohortTrackCode ?? tracks[0]?.code ?? '';

  const [trackCode, setTrackCode] = useState(() =>
    initialTrackCode && tracks.some((t) => t.code === initialTrackCode) ? initialTrackCode : defaultTrack
  );
  const track = useMemo(() => tracks.find((t) => t.code === trackCode) ?? tracks[0], [tracks, trackCode]);

  const [selection, setSelection] = useState<Selection | null>(() => {
    if (initialTrackCode && initialLessonCode) {
      const found = findLesson(tracks, initialTrackCode, initialLessonCode);
      if (found) return found;
    }
    if (initialTrackCode && initialModuleCode) {
      const t = tracks.find((x) => x.code === initialTrackCode);
      const m = t?.modules.find((x) => x.code === initialModuleCode);
      const first = m?.lessons.find((l) => !l.locked && l.code);
      if (m && first?.code) return { moduleCode: m.code, lessonCode: first.code };
    }
    if (resume) {
      const found = findLesson(tracks, resume.trackCode, resume.lessonCode);
      if (found) return found;
    }
    return firstAvailable(tracks, initialTrackCode ?? defaultTrack);
  });

  const [detail, setDetail] = useState<LessonDetailView | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, { completed: boolean; bookmarked: boolean }>>(() => {
    const map: Record<string, { completed: boolean; bookmarked: boolean }> = {};
    for (const t of tracks) for (const m of t.modules) for (const l of m.lessons) map[l.code] = { completed: l.completed, bookmarked: l.bookmarked };
    return map;
  });
  const [trackPercent, setTrackPercent] = useState(track?.percentComplete ?? 0);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineCopy, setOfflineCopy] = useState(false);
  const [savedOffline, setSavedOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  // Online/offline tracking + outbox flush on reconnect.
  useEffect(() => {
    const update = () => setIsOnline(navigator.onLine);
    update();
    const flush = async () => {
      update();
      if (!navigator.onLine) return;
      const queue = readOutbox();
      if (queue.length === 0) {
        setPendingSync(0);
        return;
      }
      let remaining = queue.length;
      for (const entry of queue) {
        try {
          const res = await fetch('/api/trainee/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lessonCode: entry.lessonCode, completed: entry.completed, bookmark: entry.bookmark, note: entry.note ?? null }),
          });
          if (res.ok) {
            try {
              localStorage.setItem(OUTBOX_KEY, JSON.stringify(readOutbox().filter((e) => e.lessonCode !== entry.lessonCode || e.ts !== entry.ts)));
            } catch {
              /* ignore */
            }
            remaining -= 1;
          }
        } catch {
          break; // still offline — retry on next reconnect
        }
      }
      setPendingSync(remaining);
    };
    flush();
    window.addEventListener('online', flush);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', flush);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Saved-offline indicator for the selected lesson.
  useEffect(() => {
    setSavedOffline(false);
    if (!selection || !('caches' in window)) return;
    caches
      .open(LESSON_CACHE)
      .then((cache) => cache.match(lessonSnapshotKey(selection.lessonCode)))
      .then((hit) => setSavedOffline(!!hit))
      .catch(() => {});
  }, [selection]);

  const downloadLesson = useCallback(async () => {
    if (!selection || !('caches' in window)) return;
    try {
      // Snapshot the shareable content only — personal notes never leave the server.
      const res = await fetch(`/api/trainee/lessons/${selection.lessonCode}`);
      const body = (await res.json()) as LessonApiResponse;
      if (!res.ok || !body.success || !body.data) return;
      const { note: _note, ...shareable } = body.data.lesson;
      void _note;
      const cache = await caches.open(LESSON_CACHE);
      await cache.put(
        lessonSnapshotKey(selection.lessonCode),
        new Response(JSON.stringify({ ...shareable, note: null }), { headers: { 'Content-Type': 'application/json' } })
      );
      setSavedOffline(true);
    } catch {
      /* offline mid-download — try again when connected */
    }
  }, [selection]);

  // Keep percent in sync when switching tracks.
  useEffect(() => {
    setTrackPercent(track?.percentComplete ?? 0);
  }, [track]);

  // Fetch lesson content on selection (network first, offline snapshot fallback).
  useEffect(() => {
    if (!selection) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError(null);
    setNoteSaved(false);
    setOfflineCopy(false);
    fetch(`/api/trainee/lessons/${selection.lessonCode}`, { signal: controller.signal })
      .then(async (res) => {
        const body = (await res.json()) as LessonApiResponse;
        if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load lesson.');
        if (!controller.signal.aborted) {
          setDetail(body.data.lesson);
          setNoteDraft(body.data.lesson.note ?? '');
        }
      })
      .catch(async (e: unknown) => {
        if (controller.signal.aborted) return;
        // Offline? Try the downloaded snapshot (note stripped at save time).
        try {
          if ('caches' in window) {
            const cache = await caches.open(LESSON_CACHE);
            const hit = await cache.match(lessonSnapshotKey(selection.lessonCode));
            if (hit) {
              const snap = (await hit.json()) as LessonDetailView;
              setDetail({ ...snap, note: null });
              setNoteDraft('');
              setOfflineCopy(true);
              return;
            }
          }
        } catch {
          /* fall through to error */
        }
        setDetailError(e instanceof Error ? e.message : 'Could not load lesson.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selection]);

  const putProgress = useCallback(async (payload: { completed?: boolean; bookmark?: boolean; note?: string | null }) => {
    if (!selection) return null;
    setSaving(true);
    try {
      const res = await fetch('/api/trainee/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonCode: selection.lessonCode, ...payload }),
      });
      const body = (await res.json()) as ProgressApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not save progress.');
      setProgressMap((m) => ({
        ...m,
        [selection.lessonCode]: { completed: body.data?.completed ?? false, bookmarked: body.data?.bookmarked ?? false },
      }));
      if (typeof body.data.trackPercent === 'number') setTrackPercent(body.data.trackPercent);
      return body.data;
    } catch (e) {
      // Offline (or failed) → queue in the outbox; Background-sync style
      // flush happens on reconnect (see effect below). Optimistic UI:
      if (payload.completed !== undefined || payload.bookmark !== undefined) {
        setProgressMap((m) => {
          const cur = m[selection.lessonCode] ?? { completed: false, bookmarked: false };
          return {
            ...m,
            [selection.lessonCode]: {
              completed: payload.completed ?? cur.completed,
              bookmarked: payload.bookmark ?? cur.bookmarked,
            },
          };
        });
      }
      enqueueOutbox({ lessonCode: selection.lessonCode, ...payload });
      setDetailError(null);
      return null;
    } finally {
      setSaving(false);
    }
  }, [selection]);

  const select = useCallback(
    (moduleCode: string, lessonCode: string) => {
      setSelection({ moduleCode, lessonCode });
      setOutlineOpen(false);
      router.replace(`/trainee?module=${moduleCode}&lesson=${lessonCode}#learning-path`, { scroll: false });
    },
    [router]
  );

  const switchTrack = useCallback(
    (code: string) => {
      setTrackCode(code);
      const target = code === resume?.trackCode ? findLesson(tracks, code, resume.lessonCode) : null;
      setSelection(target ?? firstAvailable(tracks, code));
      router.replace('/trainee#learning-path', { scroll: false });
    },
    [router, tracks, resume]
  );

  const goResume = useCallback(() => {
    if (!resume) return;
    if (resume.trackCode !== trackCode) setTrackCode(resume.trackCode);
    setSelection({ moduleCode: resume.moduleCode, lessonCode: resume.lessonCode });
    router.replace(`/trainee?module=${resume.moduleCode}&lesson=${resume.lessonCode}#learning-path`, { scroll: false });
  }, [resume, trackCode, router]);

  if (!track) return null;
  const selectedModule = track.modules.find((m) => m.code === selection?.moduleCode) ?? null;
  const selectedMeta = selectedModule?.lessons.find((l) => l.code === selection?.lessonCode) ?? null;
  const selectionLocked = selectedMeta?.locked === true;
  const lockPrereqs = selectedModule && selectionLocked ? selectedModule.prerequisiteCodes : [];
  const embed = detail?.videoUrl ? youtubeEmbed(detail.videoUrl) : null;

  return (
    <section aria-labelledby="player-heading" id="learning-path" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <h2 id="player-heading" className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
              Learning path player
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {track.completedLessons}/{track.totalLessons} lessons • {trackPercent}% complete
            </p>
          </span>
          {resume && (
            <button
              type="button"
              onClick={goResume}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#c59b48]/50 bg-[#c59b48]/10 px-3.5 py-2 text-xs font-extrabold text-[#7a5a1c] transition-colors hover:bg-[#c59b48]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-[#dfb76c]"
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              Resume: {resume.lessonTitle.length > 28 ? `${resume.lessonTitle.slice(0, 28)}…` : resume.lessonTitle}
            </button>
          )}
          {(!isOnline || pendingSync > 0) && (
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3.5 py-2 font-mono text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" role="status">
              <WifiOff className="h-3.5 w-3.5" aria-hidden="true" />
              {!isOnline ? 'Offline — progress queues for sync' : `${pendingSync} update(s) syncing…`}
            </span>
          )}
        </div>
        <div
          role="progressbar"
          aria-label={`${track.code} completion`}
          aria-valuenow={trackPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
        >
          <div className="h-full rounded-full bg-gradient-to-r from-[#0b1e36] to-[#c59b48] dark:from-[#c59b48] dark:to-[#dfb76c]" style={{ width: `${trackPercent}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Select track">
          {tracks.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => switchTrack(t.code)}
              aria-pressed={t.code === trackCode}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                t.code === trackCode
                  ? 'bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300'
              }`}
            >
              {t.code}
              {t.code === cohortTrackCode && ' ★'}
            </button>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Outline sidebar */}
        <div className="border-b border-slate-100 lg:border-b-0 lg:border-r dark:border-white/10">
          <button
            type="button"
            onClick={() => setOutlineOpen((v) => !v)}
            aria-expanded={outlineOpen}
            className="flex w-full items-center justify-between px-5 py-3 text-sm font-bold text-[#0b1e36] lg:hidden dark:text-white"
          >
            Module outline
            <ChevronDown className={`h-4 w-4 transition-transform ${outlineOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          <nav aria-label="Module outline" className={`${outlineOpen ? 'block' : 'hidden'} max-h-[520px] overflow-y-auto p-3 lg:block`}>
            {track.modules.map((m) => (
              <details key={m.code} open={m.code === selection?.moduleCode} className="group rounded-xl">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-200 dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="mr-1.5 font-mono text-[11px] text-[#9a7224] dark:text-[#dfb76c]">{m.code}</span>
                    {m.title}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                      m.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : m.status === 'in-progress'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300'
                          : m.status === 'locked'
                            ? 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                            : m.status === 'failed'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                    }`}
                  >
                    {MODULE_STATUS_LABEL[m.status]}
                  </span>
                </summary>
                <ol className="mb-1 ml-5 space-y-0.5 border-l border-slate-200 pl-2 dark:border-white/10">
                  {m.lessons.map((l) => {
                    const st = progressMap[l.code];
                    const active = selection?.lessonCode === l.code;
                    return (
                      <li key={l.code}>
                        <button
                          type="button"
                          onClick={() => !l.locked && l.code && select(m.code, l.code)}
                          disabled={l.locked}
                          aria-current={active ? 'true' : undefined}
                          title={l.locked ? `Locked — complete ${m.prerequisiteCodes.join(', ')} first` : l.title}
                          className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                            active
                              ? 'bg-[#0b1e36] font-bold text-white dark:bg-[#c59b48] dark:text-[#0b1e36]'
                              : l.locked
                                ? 'cursor-not-allowed text-slate-500 dark:text-slate-500'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                          }`}
                        >
                          {l.locked ? (
                            <Lock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          ) : st?.completed ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />
                          ) : (
                            <PlayCircle className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          {st?.bookmarked && <Bookmark className="h-3.5 w-3.5 shrink-0 text-[#c59b48]" aria-label="Bookmarked" />}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </details>
            ))}
          </nav>
        </div>

        {/* Viewer */}
        <article aria-live="polite" aria-label="Lesson viewer" className="min-w-0 p-5 sm:p-7">
          {detailLoading && (
            <div aria-busy="true" aria-label="Loading lesson" className="space-y-3">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100 dark:bg-white/5" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100 dark:bg-white/5" />
              <div className="h-48 w-full animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            </div>
          )}
          {!detailLoading && detailError && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-white/15">
              <TriangleAlert className="h-8 w-8 text-amber-500" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{detailError}</p>
            </div>
          )}
          {!detailLoading && !detailError && selectionLocked && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5">
              <Lock className="h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              <h3 className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">Lesson locked</h3>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {selectedMeta?.title} unlocks after prerequisite module{lockPrereqs.length === 1 ? '' : 's'}{' '}
                <strong className="font-mono">{lockPrereqs.join(', ')}</strong> {lockPrereqs.length === 1 ? 'is' : 'are'}{' '}
                complete.
              </p>
            </div>
          )}
          {!detailLoading && !detailError && !selectionLocked && detail && (
            <div>
              <p className="font-mono text-xs font-bold tracking-wider text-[#9a7224] dark:text-[#dfb76c]">
                {detail.moduleCode} • {detail.trackCode}
              </p>
              <h3 className="font-display mt-1 text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">
                {detail.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={downloadLesson}
                  disabled={savedOffline}
                  title={savedOffline ? 'Saved on this device for offline reading' : 'Download this lesson for offline reading'}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-extrabold text-slate-600 transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-70 dark:border-white/15 dark:text-slate-300"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  {savedOffline ? 'Saved offline' : 'Save offline'}
                </button>
                {offlineCopy && (
                  <span className="rounded-lg bg-sky-100 px-2.5 py-1 font-mono text-[11px] font-bold text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                    Offline copy — reconnect to sync progress
                  </span>
                )}
              </div>
              {detail.wmoTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {detail.wmoTags.map((w) => (
                    <span key={w} className="rounded-md border border-[#c59b48]/40 bg-[#c59b48]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#7a5a1c] dark:text-[#dfb76c]">
                      {w}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <Markdown content={detail.content} />
              </div>

              {(embed ?? detail.videoUrl) && (
                <div className="mt-6">
                  {embed ? (
                    <iframe
                      src={embed}
                      title={`${detail.title} video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10"
                    />
                  ) : (
                    <video src={detail.videoUrl ?? ''} controls preload="metadata" className="w-full rounded-2xl border border-slate-200 dark:border-white/10" />
                  )}
                </div>
              )}
              {detail.pdfUrl && (
                <div className="mt-6">
                  <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Attached document
                  </h4>
                  <iframe src={detail.pdfUrl} title={`${detail.title} PDF`} className="mt-2 h-[480px] w-full rounded-2xl border border-slate-200 dark:border-white/10" />
                </div>
              )}

              {detail.resources.length > 0 && (
                <div className="mt-6">
                  <h4 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Download className="h-3.5 w-3.5" aria-hidden="true" /> Downloadable resources
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {detail.resources.map((r) => (
                      <li key={r.id}>
                        <a
                          href={r.url}
                          download
                          className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/10"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-[#c59b48]" aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate font-bold text-slate-700 dark:text-slate-200">{r.name}</span>
                          <span className="shrink-0 font-mono text-[11px] text-slate-500">
                            {r.kind}{r.size ? ` • ${r.size}` : ''}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <PracticeCheckpoint questions={detail.checkpoint} />

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-slate-100 pt-5 dark:border-white/10">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => putProgress({ completed: !detail.completed })?.then((d) => d && setDetail({ ...detail, completed: d.completed }))}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-60 ${
                    detail.completed
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300'
                      : 'bg-[#0b1e36] text-white hover:bg-[#122c4d] dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]'
                  }`}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  {detail.completed ? 'Completed — undo' : 'Mark complete'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => putProgress({ bookmark: !detail.bookmarked })?.then((d) => d && setDetail({ ...detail, bookmarked: d.bookmarked }))}
                  aria-pressed={detail.bookmarked}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-60 dark:border-white/15 dark:text-slate-300"
                >
                  {detail.bookmarked ? <BookmarkCheck className="h-4 w-4 text-[#c59b48]" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
                  {detail.bookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>

              {/* Personal note */}
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
                <label htmlFor="lesson-note" className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <NotebookPen className="h-3.5 w-3.5" aria-hidden="true" /> Personal note
                </label>
                <textarea
                  id="lesson-note"
                  value={noteDraft}
                  onChange={(e) => {
                    setNoteDraft(e.target.value);
                    setNoteSaved(false);
                  }}
                  rows={3}
                  maxLength={2000}
                  placeholder="Private note — only you can see this…"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/10 dark:bg-black/20 dark:text-slate-100"
                />
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => putProgress({ note: noteDraft || null })?.then((d) => d && (setDetail({ ...detail, note: d.note }), setNoteSaved(true)))}
                    className="rounded-lg bg-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-60 dark:bg-white/10 dark:text-slate-200"
                  >
                    Save note
                  </button>
                  {noteSaved && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400" aria-live="polite">
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
