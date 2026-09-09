'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  NotebookPen,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type {
  AuthoringLessonRow,
  CohortDetailView,
  CohortMemberView,
  TrainerNoteView,
} from '@/services/trainerTypes';

type AttStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface NotesApiResponse {
  success: boolean;
  data?: { notes: TrainerNoteView[] };
  error?: { message: string };
}

const ATT_OPTIONS: Array<{ value: AttStatus; label: string; active: string }> = [
  { value: 'PRESENT', label: 'P', active: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'LATE', label: 'L', active: 'bg-amber-500 text-white border-amber-500' },
  { value: 'ABSENT', label: 'A', active: 'bg-rose-600 text-white border-rose-600' },
  { value: 'EXCUSED', label: 'E', active: 'bg-sky-600 text-white border-sky-600' },
];

function lastActiveLabel(m: CohortMemberView): string {
  if (!m.lastActiveAt) return 'never';
  if (m.inactiveDays === null) return 'unknown';
  if (m.inactiveDays <= 0) return 'today';
  if (m.inactiveDays === 1) return 'yesterday';
  return `${m.inactiveDays}d ago`;
}

/**
 * Cohort workspace (Section A detail): member table with live risk flags,
 * per-session attendance toggles, trainer-only notes and the remediation
 * pack sender (micro-lesson picker + trainee multi-select).
 */
export function CohortDetailClient({
  cohortId,
  initial,
  lessons,
}: {
  cohortId: string;
  initial: CohortDetailView;
  lessons: AuthoringLessonRow[];
}) {
  const [detail, setDetail] = useState(initial);
  const [sessionId, setSessionId] = useState(initial.sessions[0]?.id ?? '');
  const [edits, setEdits] = useState<Record<string, AttStatus>>({});
  const [savingAtt, setSavingAtt] = useState(false);
  const [attMsg, setAttMsg] = useState<string | null>(null);

  const [noteTrainee, setNoteTrainee] = useState(initial.members[0]?.userId ?? '');
  const [notes, setNotes] = useState<TrainerNoteView[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteMsg, setNoteMsg] = useState<string | null>(null);

  const [remOpen, setRemOpen] = useState(false);
  const [remTrainees, setRemTrainees] = useState<string[]>(() => initial.members.filter((m) => m.riskFlag).map((m) => m.userId));
  const [remLessons, setRemLessons] = useState<string[]>([]);
  const [remTitle, setRemTitle] = useState('');
  const [remMessage, setRemMessage] = useState('');
  const [remLessonFilter, setRemLessonFilter] = useState('');
  const [remSending, setRemSending] = useState(false);
  const [remResult, setRemResult] = useState<string | null>(null);

  const session = detail.sessions.find((s) => s.id === sessionId) ?? null;

  const loadNotes = useCallback(async () => {
    if (!noteTrainee) return;
    setNotesLoading(true);
    try {
      const res = await fetch(`/api/trainer/cohorts/${cohortId}/notes?traineeId=${noteTrainee}`);
      const body = (await res.json()) as NotesApiResponse;
      if (body.success && body.data) setNotes(body.data.notes);
    } catch {
      /* notes stay as-is on network failure */
    } finally {
      setNotesLoading(false);
    }
  }, [cohortId, noteTrainee]);

  useEffect(() => {
    setEdits(detail.attendance[sessionId] ? { ...(detail.attendance[sessionId] as Record<string, AttStatus>) } : {});
    setAttMsg(null);
  }, [detail, sessionId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const atRisk = useMemo(() => detail.members.filter((m) => m.riskFlag), [detail.members]);

  const saveAttendance = async () => {
    if (!sessionId) return;
    setSavingAtt(true);
    setAttMsg(null);
    try {
      const records = Object.entries(edits).map(([userId, status]) => ({ userId, status }));
      const res = await fetch(`/api/trainer/cohorts/${cohortId}/attendance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, records }),
      });
      const body = (await res.json()) as { success: boolean; data?: { attendancePct: Record<string, number> }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not save attendance.');
      setDetail((d) => ({
        ...d,
        attendance: { ...d.attendance, [sessionId]: { ...edits } },
        members: d.members.map((m) =>
          body.data?.attendancePct[m.userId] !== undefined ? { ...m, attendancePct: body.data.attendancePct[m.userId] } : m
        ),
      }));
      setAttMsg(`Saved — ${records.length} record(s) updated.`);
    } catch (e) {
      setAttMsg(e instanceof Error ? e.message : 'Could not save attendance.');
    } finally {
      setSavingAtt(false);
    }
  };

  const addNote = async () => {
    if (!noteDraft.trim() || !noteTrainee) return;
    setNoteMsg(null);
    try {
      const res = await fetch(`/api/trainer/cohorts/${cohortId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traineeId: noteTrainee, cohortId, note: noteDraft.trim() }),
      });
      const body = (await res.json()) as { success: boolean; data?: { note: TrainerNoteView }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not save note.');
      setNotes((n) => [body.data?.note as TrainerNoteView, ...n]);
      setNoteDraft('');
      setNoteMsg('Note saved — visible only to trainers.');
    } catch (e) {
      setNoteMsg(e instanceof Error ? e.message : 'Could not save note.');
    }
  };

  const removeNote = async (id: string) => {
    try {
      const res = await fetch(`/api/trainer/notes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Could not delete note.');
      setNotes((n) => n.filter((x) => x.id !== id));
    } catch {
      /* silent: list refreshes on trainee switch */
    }
  };

  const sendRemediation = async () => {
    setRemSending(true);
    setRemResult(null);
    try {
      const res = await fetch(`/api/trainer/cohorts/${cohortId}/remediation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: remTitle.trim(), message: remMessage.trim() || undefined, lessonCodes: remLessons, traineeIds: remTrainees }),
      });
      const body = (await res.json()) as { success: boolean; data?: { assigned: number }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not send pack.');
      setRemResult(`Sent to ${body.data.assigned} trainee(s) — tasks + notifications created.`);
      setRemTitle('');
      setRemMessage('');
    } catch (e) {
      setRemResult(e instanceof Error ? e.message : 'Could not send pack.');
    } finally {
      setRemSending(false);
    }
  };

  const filteredLessons = lessons.filter((l) => {
    const q = remLessonFilter.trim().toLowerCase();
    if (!q) return true;
    return l.code?.toLowerCase().includes(q) || l.title.toLowerCase().includes(q);
  });
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <div className="space-y-5">
      <nav aria-label="Breadcrumb">
        <Link
          href="/trainer"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Faculty Hub
        </Link>
      </nav>

      <header className="flex flex-wrap items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
          <Users className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">
            {detail.cohort.code} — {detail.cohort.name}
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {detail.cohort.station ?? 'No station'} • {detail.members.length} trainees • avg gap {detail.cohort.avgGap}%
            {atRisk.length > 0 && <span className="font-bold text-rose-600"> • {atRisk.length} at risk</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setRemResult(null);
            setRemOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#c59b48] px-4 py-2.5 text-sm font-extrabold text-[#0b1e36] transition-colors hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1e36] focus-visible:ring-offset-2"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Send Remediation Pack
        </button>
      </header>

      {/* Members */}
      <section aria-label="Cohort members" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 dark:border-white/10">
                <th scope="col" className="px-5 py-2.5 font-extrabold">Trainee</th>
                <th scope="col" className="py-2.5 pr-3 font-extrabold">Readiness</th>
                <th scope="col" className="py-2.5 pr-3 text-right font-extrabold">Attend.</th>
                <th scope="col" className="py-2.5 pr-3 font-extrabold">Last active</th>
                <th scope="col" className="px-5 py-2.5 font-extrabold">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {detail.members.map((m) => (
                <tr key={m.userId} className="align-top transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0b1e36]/5 font-display text-xs font-black text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
                        {m.initials}
                      </span>
                      <span>
                        <span className="block font-bold text-slate-800 dark:text-slate-100">{m.name}</span>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">{m.station ?? 'No station'}</span>
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[11px] text-slate-500 dark:text-slate-400" title={m.scores.map((s) => `${s.domain} ${s.score}/${s.required}`).join(' • ')}>
                      Worst: <span className="font-mono font-bold">{m.scores[0]?.domain}</span> ({m.worstGap}% gap)
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <span className="font-mono text-sm font-black text-[#0b1e36] dark:text-white">{m.overallReadiness}</span>
                    <span className="block h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <span className="block h-full rounded-full bg-[#0b1e36] dark:bg-[#c59b48]" style={{ width: `${m.overallReadiness}%` }} />
                    </span>
                  </td>
                  <td className="py-3 pr-3 text-right font-mono font-bold text-slate-700 dark:text-slate-200">{m.attendancePct}%</td>
                  <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">{lastActiveLabel(m)}</td>
                  <td className="px-5 py-3">
                    {m.riskFlag ? (
                      <span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                          <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                          At risk
                        </span>
                        <span className="mt-1 block max-w-[220px] text-[11px] leading-snug text-slate-500 dark:text-slate-400">
                          {m.riskReasons.join(' • ')}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                        On track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Attendance */}
        <section aria-label="Session attendance" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
          <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Attendance per session</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label htmlFor="att-session" className="sr-only">Select session</label>
              <select
                id="att-session"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
              >
                {detail.sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.markedCount}/{s.memberCount} marked)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={saveAttendance}
                disabled={savingAtt || !sessionId}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-60 dark:bg-[#c59b48] dark:text-[#0b1e36]"
              >
                {savingAtt ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : null}
                Save attendance
              </button>
            </div>
            {attMsg && (
              <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400" aria-live="polite">{attMsg}</p>
            )}
          </header>
          <ul className="divide-y divide-slate-100 p-2 dark:divide-white/10">
            {detail.members.map((m) => {
              const cur = edits[m.userId] ?? 'PRESENT';
              return (
                <li key={m.userId} className="flex items-center gap-3 rounded-xl px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-700 dark:text-slate-200">{m.name}</span>
                  <span className="flex gap-1" role="group" aria-label={`Attendance for ${m.name}`}>
                    {ATT_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => setEdits((e) => ({ ...e, [m.userId]: o.value }))}
                        aria-pressed={cur === o.value}
                        title={`${o.value.charAt(0) + o.value.slice(1).toLowerCase()} — ${m.name}`}
                        className={`h-8 w-8 rounded-lg border text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                          cur === o.value ? o.active : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/15'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Notes */}
        <section aria-label="Trainer notes" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
          <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
              <NotebookPen className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
              Inline notes <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">(trainer-only)</span>
            </h2>
            <label htmlFor="note-trainee" className="sr-only">Select trainee for notes</label>
            <select
              id="note-trainee"
              value={noteTrainee}
              onChange={(e) => setNoteTrainee(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            >
              {detail.members.map((m) => (
                <option key={m.userId} value={m.userId}>{m.name}</option>
              ))}
            </select>
          </header>
          <div className="space-y-3 p-5">
            <div className="flex gap-2">
              <label htmlFor="note-draft" className="sr-only">New note</label>
              <input
                id="note-draft"
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addNote();
                }}
                placeholder="Add a private note… (Enter to save)"
                maxLength={2000}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={!noteDraft.trim()}
                className="shrink-0 rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
              >
                Save
              </button>
            </div>
            {noteMsg && <p className="text-xs font-bold text-slate-500 dark:text-slate-400" aria-live="polite">{noteMsg}</p>}
            {notesLoading ? (
              <p className="text-sm text-slate-500">Loading notes…</p>
            ) : notes.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
                No notes yet for this trainee. Notes are visible only to trainers.
              </p>
            ) : (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id} className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-white/5">
                    <span className="min-w-0 flex-1 text-slate-700 dark:text-slate-200">{n.note}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-500">
                      {new Date(n.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNote(n.id)}
                      aria-label="Delete note"
                      className="shrink-0 rounded-lg p-1 text-slate-500 hover:bg-rose-100 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      {/* Remediation modal */}
      {remOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="rem-title">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="rem-title" className="font-display text-lg font-black text-[#0b1e36] dark:text-white">
                  Send Remediation Pack
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {detail.cohort.code} • creates trainee tasks + notifications
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRemOpen(false)}
                aria-label="Close remediation dialog"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <label htmlFor="rem-title-input" className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pack title
            </label>
            <input
              id="rem-title-input"
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder="e.g. Radar nowcasting booster"
              maxLength={120}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            />

            <fieldset className="mt-4">
              <legend className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Trainees ({remTrainees.length} selected)
              </legend>
              <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {detail.members.map((m) => (
                  <label key={m.userId} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold hover:border-[#c59b48]/60 focus-within:ring-2 focus-within:ring-[#c59b48] dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={remTrainees.includes(m.userId)}
                      onChange={() => setRemTrainees((l) => toggleIn(l, m.userId))}
                      className="h-4 w-4 accent-[#c59b48]"
                    />
                    {m.name}
                    {m.riskFlag && <span className="ml-auto text-[10px] font-black uppercase text-rose-500">risk</span>}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mt-4">
              <legend className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Micro-lessons ({remLessons.length} selected)
              </legend>
              <label htmlFor="rem-lesson-filter" className="sr-only">Filter lessons</label>
              <input
                id="rem-lesson-filter"
                value={remLessonFilter}
                onChange={(e) => setRemLessonFilter(e.target.value)}
                placeholder="Filter published lessons…"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
              />
              <div className="mt-1.5 max-h-44 space-y-1.5 overflow-y-auto pr-1">
                {filteredLessons.slice(0, 40).map((l) => (
                  <label key={l.code ?? l.id} className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:border-[#c59b48]/60 focus-within:ring-2 focus-within:ring-[#c59b48] dark:border-white/10">
                    <input
                      type="checkbox"
                      checked={remLessons.includes(l.code ?? '')}
                      onChange={() => l.code && setRemLessons((x) => toggleIn(x, l.code as string))}
                      className="h-4 w-4 shrink-0 accent-[#c59b48]"
                    />
                    <span className="min-w-0">
                      <span className="mr-1.5 font-mono text-[11px] font-bold text-[#9a7224] dark:text-[#dfb76c]">{l.code}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{l.title}</span>
                    </span>
                  </label>
                ))}
                {filteredLessons.length === 0 && <p className="text-xs text-slate-500">No published lessons match.</p>}
              </div>
            </fieldset>

            <label htmlFor="rem-message" className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Message to trainees (optional)
            </label>
            <textarea
              id="rem-message"
              value={remMessage}
              onChange={(e) => setRemMessage(e.target.value)}
              rows={2}
              maxLength={2000}
              placeholder="Complete these before Friday's exam window…"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            />

            {remResult && (
              <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300" aria-live="polite">
                {remResult}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 dark:border-white/15 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={sendRemediation}
                disabled={remSending || !remTitle.trim() || remTrainees.length === 0 || remLessons.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
              >
                {remSending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                Send pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
