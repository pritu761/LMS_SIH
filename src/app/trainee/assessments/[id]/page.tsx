'use client';

import React, { useState, useEffect, use } from 'react';
import { initialAssessments } from '@/lib/mockData';
import { sanitizeAssessmentForTrainee, SanitizedQuizResponse } from '@/services/assessmentService';
import { QuizEngine } from '@/components/assessment/QuizEngine';
import { Sidebar } from '@/components/layout/Sidebar';
import { Clock, ShieldAlert, Award } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quizData, setQuizData] = useState<SanitizedQuizResponse | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch sanitized quiz from API endpoint or fallback to service
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/assessments/${id}/quiz`);
        if (res.ok) {
          const data = await res.json();
          setQuizData(data.quiz);
        } else {
          // Fallback to local mock data
          const assess = initialAssessments.find((a) => a.id === id || a.courseId === id) || initialAssessments[0];
          setQuizData(sanitizeAssessmentForTrainee(assess));
        }
      } catch (err) {
        const assess = initialAssessments.find((a) => a.id === id || a.courseId === id) || initialAssessments[0];
        setQuizData(sanitizeAssessmentForTrainee(assess));
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  if (loading || !quizData) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-sm text-slate-600 dark:text-slate-400">
        Loading assessment...
      </div>
    );
  }

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0">
        {!hasStarted ? (
          /* Pre-Exam Briefing & Instructions Card */
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-10 backdrop-blur-xl shadow-xl space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.08em] border border-indigo-500/20">
                  Timed Proctored Exam
                </span>
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                  {quizData.title}
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-prose">
              {quizData.description}
            </p>

            {/* Exam Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                <li>When the timer expires, your answers are finalized and graded automatically.</li>
                <li>Passing issues a verifiable digital certificate immediately.</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/trainee"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm dark:shadow-none"
              >
                Back to Dashboard
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