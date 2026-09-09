'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Award, ChevronLeft, ChevronRight, GraduationCap, Loader2, Pause, Play, X } from 'lucide-react';
import type { CaseQuestion, TrainingCase } from '@/services/radarTypes';

interface CasesApiResponse {
  success: boolean;
  data?: { cases: TrainingCase[] };
  error?: { message: string };
}

interface AnswerRecord {
  atStep: number;
  picked: number;
  correct: boolean;
}

function answeredStepList(answeredSteps: Set<number>): string {
  const arr: number[] = [];
  answeredSteps.forEach((s) => arr.push(s));
  return arr
    .sort((a, b) => a - b)
    .map((s) => `T${s + 1}`)
    .join(', ');
}

/**
 * Case-based training mode (Phase 2.3C, login required): historical severe
 * weather replay with timeline playback, guided MCQ popups at key
 * timesteps (instant explanation + score) and persisted best scores mapped
 * to the RAD-NOWCAST interpretation competency.
 */
export function CaseTrainingPanel({ onStep }: { onStep: (step: number, total: number) => void }) {
  const [cases, setCases] = useState<TrainingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState('');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [quiz, setQuiz] = useState<{ questions: CaseQuestion[]; qi: number } | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [best, setBest] = useState<{ score: number; total: number } | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    fetch('/api/radar/cases')
      .then(async (res) => {
        const body = (await res.json()) as CasesApiResponse;
        if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load cases.');
        setCases(body.data.cases);
        if (body.data.cases.length > 0) setCaseId(body.data.cases[0].id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Could not load cases.'))
      .finally(() => setLoading(false));
  }, []);

  const active = useMemo(() => cases.find((c) => c.id === caseId) ?? null, [cases, caseId]);
  const totalQuestions = active?.questions.length ?? 0;
  const score = answers.filter((a) => a.correct).length;

  const resetCase = useCallback((id: string) => {
    setCaseId(id);
    setStep(0);
    onStep(0, cases.find((c) => c.id === id)?.timesteps.length ?? 1);
    setPlaying(false);
    setQuiz(null);
    setPicked(null);
    setRevealed(false);
    setAnswers([]);
    setFinished(false);
    setBest(null);
  }, [cases, onStep]);

  const openQuizForStep = useCallback(
    (s: number) => {
      if (!active) return;
      const qs = active.questions.filter((q) => q.atStep === s);
      if (qs.length === 0) return;
      setPlaying(false);
      setQuiz({ questions: qs, qi: 0 });
      setPicked(null);
      setRevealed(false);
    },
    [active]
  );

  const goStep = useCallback(
    (s: number) => {
      if (!active) return;
      const clamped = Math.max(0, Math.min(active.timesteps.length - 1, s));
      setStep(clamped);
      onStep(clamped, active.timesteps.length);
      setFinished(false);
      openQuizForStep(clamped);
    },
    [active, onStep, openQuizForStep]
  );

  useEffect(() => {
    if (!playing || !active) return;
    timer.current = window.setInterval(() => {
      setStep((prev) => {
        if (prev >= active.timesteps.length - 1) {
          setPlaying(false);
          return prev;
        }
        const next = prev + 1;
        onStep(next, active.timesteps.length);
        const qs = active.questions.filter((q) => q.atStep === next);
        if (qs.length > 0) {
          setPlaying(false);
          setQuiz({ questions: qs, qi: 0 });
          setPicked(null);
          setRevealed(false);
        }
        return next;
      });
    }, 2800);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [playing, active, onStep]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, []);

  const submitQuiz = () => {
    if (!quiz || picked === null) return;
    const q = quiz.questions[quiz.qi];
    const correct = picked === q.answer;
    setAnswers((a) => [...a, { atStep: q.atStep, picked, correct }]);
    setRevealed(true);
  };

  const nextQuiz = () => {
    if (!quiz) return;
    if (quiz.qi + 1 < quiz.questions.length) {
      setQuiz({ questions: quiz.questions, qi: quiz.qi + 1 });
      setPicked(null);
      setRevealed(false);
    } else {
      setQuiz(null);
      setPicked(null);
      setRevealed(false);
    }
  };

  const finishCase = async () => {
    if (!active || totalQuestions === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/radar/cases/${active.id}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score, total: totalQuestions, answers }),
      });
      const body = (await res.json()) as { success: boolean; data?: { bestScore: number; bestTotal: number }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not save attempt.');
      setBest({ score: body.data.bestScore, total: body.data.bestTotal });
      setFinished(true);
      setCases((list) => list.map((c) => (c.id === active.id ? { ...c, bestScore: body.data?.bestScore ?? null, attempts: c.attempts + 1 } : c)));
    } catch {
      setFinished(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div aria-busy="true" aria-label="Loading training cases" className="space-y-2">
        <div className="h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
      </div>
    );
  }
  if (error) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm font-semibold text-slate-500" role="alert">
        {error}
      </p>
    );
  }
  if (!active) {
    return <p className="rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">No published training cases yet.</p>;
  }

  const current = active.timesteps[step];
  const answeredSteps = new Set(answers.map((a) => a.atStep));

  return (
    <div className="space-y-4">
      <label htmlFor="case-pick" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Historical case
      </label>
      <select
        id="case-pick"
        value={caseId}
        onChange={(e) => resetCase(e.target.value)}
        className="-mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
      >
        {cases.map((c) => (
          <option key={c.id} value={c.id}>
            {c.title}{c.bestScore !== null ? ` — best ${c.bestScore}/${c.bestTotal}` : ''}
          </option>
        ))}
      </select>

      <div className="rounded-2xl border border-[#c59b48]/40 bg-[#c59b48]/10 p-4 dark:bg-[#c59b48]/5">
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#9a7224] dark:text-[#dfb76c]">
          {active.code} • {active.phenomenon ?? 'severe weather'} • maps to {active.competencyTag ?? 'RAD-NOWCAST'}
        </p>
        <h3 className="font-display mt-1 text-base font-extrabold text-[#0b1e36] dark:text-white">{active.title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{active.description}</p>
      </div>

      {/* Timeline playback */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goStep(step - 1)}
            disabled={step === 0}
            aria-label="Previous timestep"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#c59b48] disabled:opacity-40 dark:border-white/15"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause replay' : 'Play replay'}
            aria-pressed={playing}
            className="rounded-lg bg-[#0b1e36] p-2 text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
          >
            {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => goStep(step + 1)}
            disabled={step >= active.timesteps.length - 1}
            aria-label="Next timestep"
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-[#c59b48] disabled:opacity-40 dark:border-white/15"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <p className="ml-1 font-mono text-xs font-bold text-slate-500" aria-live="polite">
            T{step + 1}/{active.timesteps.length}
          </p>
          <p className="ml-auto font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]" aria-live="polite">
            Score {score}/{totalQuestions}
          </p>
        </div>
        <div className="mt-3 flex gap-1" role="list" aria-label="Case timesteps">
          {active.timesteps.map((t, i) => (
            <button
              key={t.t}
              type="button"
              role="listitem"
              onClick={() => goStep(i)}
              aria-label={`Go to ${t.label}`}
              aria-current={i === step ? 'true' : undefined}
              title={t.label}
              className={`h-2.5 flex-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${i === step ? 'bg-[#c59b48]' : i < step ? 'bg-[#0b1e36]/60 dark:bg-white/40' : 'bg-slate-200 dark:bg-white/10'}`}
            />
          ))}
        </div>
        {current && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3 dark:bg-black/20">
            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-100">{current.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{current.note}</p>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {step >= active.timesteps.length - 1 ? (
            <button
              type="button"
              onClick={finishCase}
              disabled={submitting || totalQuestions === 0 || answers.length < totalQuestions}
              title={answers.length < totalQuestions ? `Answer all ${totalQuestions} guided questions first (${answers.length} done)` : 'Save this replay as a scored attempt'}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : `Finish case (${answers.length}/${totalQuestions} answered)`}
            </button>
          ) : (
            <p className="text-xs text-slate-500">Step through the replay — guided questions pause the timeline.</p>
          )}
          {(finished || best || active.bestScore !== null) && (
            <p className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36]/5 px-3 py-2 font-mono text-xs font-black text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]" aria-live="polite">
              <Award className="h-3.5 w-3.5 text-[#c59b48]" aria-hidden="true" />
              {finished && best ? `This run ${score}/${totalQuestions} • ` : ''}Best {best?.score ?? active.bestScore}/{best?.total ?? active.bestTotal}
            </p>
          )}
        </div>
        {answeredSteps.size > 0 && (
          <p className="mt-2 font-mono text-[11px] text-slate-500">Answered at steps: {answeredStepList(answeredSteps)}</p>
        )}
      </div>

      {/* Guided question modal */}
      {quiz && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="case-q-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <p className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#9a7224] dark:text-[#dfb76c]">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Guided question {quiz.qi + 1}/{quiz.questions.length} • T{(quiz.questions[quiz.qi].atStep ?? 0) + 1}
            </p>
            <h3 id="case-q-title" className="font-display mt-2 text-base font-extrabold leading-snug text-[#0b1e36] dark:text-white">
              {quiz.questions[quiz.qi].prompt}
            </h3>
            <div className="mt-3 space-y-2" role="radiogroup" aria-label="Answer options">
              {quiz.questions[quiz.qi].options.map((o, i) => {
                const correct = quiz.questions[quiz.qi].answer;
                return (
                  <label
                    key={i}
                    className={`flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus-within:ring-2 focus-within:ring-[#c59b48] ${
                      revealed && i === correct
                        ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                        : revealed && picked === i
                          ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10'
                          : 'border-slate-200 hover:border-[#c59b48]/70 dark:border-white/10'
                    }`}
                  >
                    <input
                      type="radio"
                      name="case-q"
                      checked={picked === i}
                      disabled={revealed}
                      onChange={() => setPicked(i)}
                      className="mt-1 accent-[#0b1e36] dark:accent-[#c59b48]"
                    />
                    <span className="text-slate-700 dark:text-slate-200">{o}</span>
                  </label>
                );
              })}
            </div>
            {revealed ? (
              <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-black/20">
                <p className={`font-extrabold ${picked === quiz.questions[quiz.qi].answer ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`} aria-live="polite">
                  {picked === quiz.questions[quiz.qi].answer ? 'Correct (+1).' : `Not quite — correct: ${quiz.questions[quiz.qi].options[quiz.questions[quiz.qi].answer]}.`}
                </p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">{quiz.questions[quiz.qi].explanation}</p>
                <button
                  type="button"
                  onClick={nextQuiz}
                  className="mt-3 rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
                >
                  {quiz.qi + 1 < quiz.questions.length ? 'Next question' : 'Resume replay'}
                </button>
              </div>
            ) : (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuiz(null);
                    setPicked(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300"
                >
                  Skip for now
                </button>
                <button
                  type="button"
                  onClick={submitQuiz}
                  disabled={picked === null}
                  className="rounded-xl bg-[#c59b48] px-5 py-2.5 text-sm font-extrabold text-[#0b1e36] hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1e36] disabled:opacity-50"
                >
                  Submit answer
                </button>
              </div>
            )}
            <button type="button" onClick={() => { setQuiz(null); setPicked(null); setRevealed(false); }} aria-label="Close question" className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Login gate shown to guests (training mode requires an account). */
export function TrainingLoginGate() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-center dark:border-white/15">
      <GraduationCap className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
      <h3 className="font-display mt-2 text-base font-extrabold text-[#0b1e36] dark:text-white">Case training needs an account</h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
        Replay Phailin, the 2023 Delhi squall and the 2022 Mumbai rains with guided quizzes — scores are tracked per case.
      </p>
      <Link
        href="/auth/login?next=/radar"
        className="mt-3 inline-block rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]"
      >
        Log in to train
      </Link>
    </div>
  );
}
