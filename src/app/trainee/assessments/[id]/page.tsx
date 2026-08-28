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
      <div className="flex-1 flex items-center justify-center p-12 text-slate-500 dark:text-slate-400 text-xs">
        Loading sanitized assessment package...
      </div>
    );
  }

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0">
        {!hasStarted ? (
          /* Pre-Exam Briefing & Instructions Card */
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
              <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider border border-indigo-500/20">
                  Timed Proctored Exam
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                  {quizData.title}
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {quizData.description}
            </p>

            {/* Exam Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Duration
                </span>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {quizData.timeLimitMinutes} Mins
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Questions
                </span>
                <div className="text-xl font-bold text-indigo-400 mt-1">
                  {quizData.totalQuestions} MCQs
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 p-4 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Passing Score
                </span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {quizData.passingScorePercentage}%
                </div>
              </div>
            </div>

            {/* Proctored Rules List */}
            <div className="rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <span>Standard Examination Protocols</span>
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <li>Auto-save state is preserved continuously throughout the session.</li>
                <li>When the timer expires, all submitted answers will be automatically finalized and graded.</li>
                <li>Passing will immediately issue a verifiable digital credential and elevate your competency index.</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <Link
                href="/trainee"
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-700"
              >
                Back to Dashboard
              </Link>

              <button
                onClick={() => setHasStarted(true)}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Start Assessment Clock Now
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