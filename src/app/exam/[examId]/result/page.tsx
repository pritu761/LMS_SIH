import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, Award, CheckCircle2, Clock3, ShieldAlert, ShieldCheck, Timer } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { getAttemptResult } from '@/services/examService';

export const metadata = { title: 'Exam Result', robots: { index: false, follow: false } };

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
}

/**
 * GET /exam/[examId]/result?attempt= — post-exam confirmation (owner only):
 * attempt ID, immediate objective score, pass state, competency deltas and
 * the trainee-visible integrity timeline.
 */
export default async function ExamResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ examId: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'TRAINEE' && session.role !== 'ADMIN') redirect('/');

  await params;
  const sp = await searchParams;
  if (!sp.attempt) redirect('/trainee');
  let result = null;
  try {
    result = await getAttemptResult(session.userId, sp.attempt);
  } catch {
    result = null;
  }
  if (!result) redirect('/trainee');

  const passed = result.passed;
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="h-2 w-full bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#0b1e36]" aria-hidden="true" />
        <div className="p-8 sm:p-10">
          <span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${passed === false ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-600'} dark:bg-white/10`} aria-hidden="true">
            {passed === false ? <AlertTriangle className="h-7 w-7" /> : <CheckCircle2 className="h-7 w-7" />}
          </span>
          <h1 className="font-display mt-3 text-2xl font-black text-[#0b1e36] dark:text-white">Attempt submitted</h1>
          <p className="mt-1 font-mono text-xs text-slate-500">Attempt ID: {result.attemptId}</p>

          <div className="mx-auto mt-6 grid max-w-lg grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-white/5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Score</p>
              <p className="font-display text-2xl font-black text-[#0b1e36] dark:text-white">
                {result.percentage === null ? '—' : `${result.percentage}%`}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-white/5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Correct</p>
              <p className="font-display text-2xl font-black text-[#0b1e36] dark:text-white">
                {result.correctCount}/{result.objectiveCount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-2 py-3 dark:bg-white/5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Result</p>
              <p className={`font-display text-lg font-black ${passed === true ? 'text-emerald-600' : passed === false ? 'text-rose-600' : 'text-amber-600'}`}>
                {passed === true ? 'PASSED' : passed === false ? 'NOT PASSED' : 'PENDING REVIEW'}
              </p>
            </div>
          </div>

          {result.needsGrading && (
            <p className="mx-auto mt-4 max-w-lg rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              Includes trainer-graded answers — the objective portion above is final; your trainer completes the rest.
            </p>
          )}
          {result.competencyDelta.length > 0 && (
            <div className="mx-auto mt-4 max-w-lg rounded-2xl border border-[#c59b48]/40 bg-[#c59b48]/10 p-4 text-left">
              <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#7a5a1c] dark:text-[#dfb76c]">
                <Award className="h-3.5 w-3.5" aria-hidden="true" />
                Competency radar updated
              </h2>
              <ul className="mt-2 space-y-1">
                {result.competencyDelta.map((d) => (
                  <li key={d.domain} className="flex justify-between font-mono text-xs font-bold text-slate-700 dark:text-slate-200">
                    <span>{d.domain}</span>
                    <span>{d.before} → {d.after}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mx-auto mt-6 max-w-lg text-left">
            <h2 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {result.integrityFlag === 'CLEAN' ? <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" /> : <ShieldAlert className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />}
              Integrity timeline — {result.timeline.length} event(s) • risk {result.riskScore} • {result.integrityFlag}
            </h2>
            {result.timeline.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Your exam had 0 integrity events. Clean attempt.</p>
            ) : (
              <ol className="mt-2 space-y-1.5">
                {result.timeline.map((e) => (
                  <li key={e.id} className="flex items-baseline gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-white/5">
                    <Clock3 className="h-3 w-3 shrink-0 translate-y-0.5 text-slate-500" aria-hidden="true" />
                    <span className="font-bold text-slate-700 dark:text-slate-200">{e.detail}</span>
                    <span className="ml-auto shrink-0 font-mono text-slate-500">{formatDateTime(e.timestamp)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/trainee"
              className="inline-flex items-center justify-center rounded-xl bg-[#0b1e36] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
            >
              Back to dashboard
            </Link>
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-extrabold text-slate-600 hover:border-[#c59b48] dark:border-white/15 dark:text-slate-300"
            >
              <Timer className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Keep learning
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
