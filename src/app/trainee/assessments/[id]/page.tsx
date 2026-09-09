'use client';

import React, { useState, useEffect, use } from 'react';
import { initialAssessments } from '@/lib/mockData';
import { sanitizeAssessmentForTrainee, SanitizedQuizResponse } from '@/services/assessmentService';
import { QuizEngine } from '@/components/assessment/QuizEngine';
import { Sidebar } from '@/components/layout/Sidebar';
import { Clock, ShieldAlert, Award, ChevronLeft, FileWarning } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quizData, setQuizData] = useState<SanitizedQuizResponse | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFoundExam, setNotFoundExam] = useState(false);

  useEffect(() => {
    // Fetch sanitized quiz from API endpoint or fallback to service
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/assessments/${id}/quiz`);
        if (res.ok) {
          const data = await res.json();
          if (data.quiz) {
            setQuizData(data.quiz);
          } else {
            setNotFoundExam(true);
          }
        } else if (res.status === 404) {
          setNotFoundExam(true);
        } else {
          // Fallback to local mock data (API error, not missing exam)
          const assess = initialAssessments.find((a) => a.id === id || a.courseId === id);
          if (assess) setQuizData(sanitizeAssessmentForTrainee(assess));
          else setNotFoundExam(true);
        }
      } catch (err) {
        const assess = initialAssessments.find((a) => a.id === id || a.courseId === id);
        if (assess) setQuizData(sanitizeAssessmentForTrainee(assess));
        else setNotFoundExam(true);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar role="TRAINEE" />
        <main className="flex-1 min-w-0 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 space-y-4 max-w-3xl mx-auto">
            <div className="h-14 w-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 dark:bg-slate-800/60 rounded" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (notFoundExam || !quizData) {
    return (
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar role="TRAINEE" />
        <main className="flex-1 min-w-0 flex items-center justify-center">
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center space-y-3 max-w-md">
            <FileWarning className="h-10 w-10 mx-auto text-slate-300 dark:text-slate-600" />
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Assessment not found</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No exam exists with ID “{id}”. It may have been unpublished — pick a certification exam from your dashboard instead.
            </p>
            <Link
              href="/trainee"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 px-4 py-2 text-xs font-bold text-white transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const sourceAssessment = initialAssessments.find((a) => a.id === quizData.assessmentId);
  const maxAttempts = sourceAssessment?.maxAttempts ?? 3;

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0">
        <Link
          href={quizData.courseId ? `/trainee/courses/${quizData.courseId}` : '/trainee'}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0b1e36] dark:text-slate-400 dark:hover:text-white transition-colors mb-4"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to Course</span>
        </Link>
        {!hasStarted ? (
          /* Pre-Exam Briefing & Instructions Card */
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-6 flex-wrap">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                <Award className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.08em] border border-indigo-500/20">
                  Timed Proctored Exam
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 leading-tight">
                  {quizData.title}
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-prose">
              {quizData.description}
            </p>

            {/* Exam Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm dark:shadow-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">
                  Duration
                </span>
                <div className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {quizData.timeLimitMinutes} min
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm dark:shadow-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">
                  Total Questions
                </span>
                <div className="text-xl font-display font-extrabold text-indigo-700 dark:text-indigo-400 mt-1 tabular-nums">
                  {quizData.totalQuestions} MCQs
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center shadow-sm dark:shadow-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">
                  Max Score
                </span>
                <div className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-1 tabular-nums">
                  {quizData.maxScore} pts
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center col-span-2 sm:col-span-1 shadow-sm dark:shadow-none">
                <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">
                  Passing Score
                </span>
                <div className="text-xl font-display font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
                  {quizData.passingScorePercentage}%
                </div>
              </div>
            </div>

            {/* Proctored Rules List */}
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-[13px] text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none">
              <h2 className="font-display font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>Examination Rules</span>
              </h2>
              <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 leading-relaxed">
                <li>Your answers are auto-saved continuously during the session.</li>
                <li>When the timer expires, your answers are finalized and graded automatically (45s grace for submission).</li>
                <li>No negative marking — unanswered or incorrect questions score zero; partial credit is not awarded.</li>
                <li>You have up to <strong className="text-slate-900 dark:text-white">{maxAttempts} attempts</strong> — your best passing score counts.</li>
                <li>Passing issues a verifiable digital certificate immediately.</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-200 dark:border-slate-800 flex-wrap">
              <Link
                href={quizData.courseId ? `/trainee/courses/${quizData.courseId}` : '/trainee'}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm dark:shadow-none"
              >
                Back to Course
              </Link>

              <button
                onClick={() => setHasStarted(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Start Assessment
              </button>
            </div>
          </div>
        ) : (
          <QuizEngine quiz={quizData} />
        )}
      </main>
    </div>
  );
}