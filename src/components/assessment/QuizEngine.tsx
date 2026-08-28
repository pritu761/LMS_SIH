'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Timer,
  CheckCircle,
  Circle,
  AlertTriangle,
  Send,
  Flag,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { SanitizedQuizResponse } from '@/services/assessmentService';
import { ScoreReportModal } from './ScoreReportModal';

interface QuizEngineProps {
  quiz: SanitizedQuizResponse;
}

export function QuizEngine({ quiz }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(quiz.timeLimitMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [gradingResult, setGradingResult] = useState<any>(null);
  const [startTime] = useState<number>(Date.now());

  const currentQuestion = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;

  const submitQuiz = useCallback(async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/assessments/${quiz.assessmentId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpentSeconds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGradingResult(data.result);
      } else {
        alert('Submission failed. Please check your network connection.');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting assessment.');
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, quiz.assessmentId, startTime]);

  // Real-time Countdown Timer effect
  useEffect(() => {
    if (gradingResult) return;

    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitQuiz(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gradingResult, submitQuiz]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const isTimeCritical = timeLeftSeconds < 180; // Under 3 minutes

  const handleRetake = () => {
    setAnswers({});
    setFlaggedIds([]);
    setCurrentIdx(0);
    setTimeLeftSeconds(quiz.timeLimitMinutes * 60);
    setGradingResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Fixed Exam Banner & Live Countdown Clock */}
      <div className="sticky top-16 z-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-400 border border-indigo-500/20">
              EXAM PROCTORED
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Passing threshold: {quiz.passingScorePercentage}%
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {quiz.title}
          </h1>
        </div>

        {/* Live Timer & Submit button */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-mono font-bold border transition-colors ${isTimeCritical
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
                : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200'
              }`}
          >
            <Timer className={`h-4 w-4 ${isTimeCritical ? 'text-rose-400' : 'text-indigo-400'}`} />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Finish & Grade</span>
          </button>
        </div>
      </div>

      {/* Main Exam Room Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* Left Column: Active Question Workspace */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">

            {/* Question Header & Flag Toggle */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-600/20 px-3 py-1 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                  Question {currentIdx + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Weight: {currentQuestion.weight} Points
                </span>
              </div>

              <button
                onClick={() => toggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${flaggedIds.includes(currentQuestion.id)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-white dark:bg-slate-950/40 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:text-white'
                  }`}
              >
                <Flag className="h-3.5 w-3.5" />
                <span>{flaggedIds.includes(currentQuestion.id) ? 'Flagged for Review' : 'Flag for Review'}</span>
              </button>
            </div>

            {/* Question Prompt */}
            <div className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.questionText}
            </div>

            {/* Options List */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((opt, optIdx) => {
                const isSelected = answers[currentQuestion.id] === opt.id;
                const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                    className={`rounded-2xl border p-4 sm:p-4.5 cursor-pointer transition-all flex items-start gap-4 ${isSelected
                        ? 'border-indigo-500/80 bg-indigo-950/40 shadow-lg shadow-indigo-500/15'
                        : 'border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-950/50 hover:bg-white dark:bg-slate-900 hover:border-slate-200 dark:border-slate-700'
                      }`}
                  >
                    <div
                      className={`h-7 w-7 shrink-0 rounded-xl font-mono text-xs font-bold flex items-center justify-center border transition-all ${isSelected
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/40'
                          : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                    >
                      {letter}
                    </div>

                    <div className="flex-1 text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-200 pt-0.5">
                      {opt.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setCurrentIdx((prev) => Math.max(prev - 1, 0))}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Previous Question</span>
              </button>

              <button
                onClick={() => setCurrentIdx((prev) => Math.min(prev + 1, totalQuestions - 1))}
                disabled={currentIdx === totalQuestions - 1}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md shadow-indigo-600/30"
              >
                <span>Next Question</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette & Live Status */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Question Navigator</h2>
              <span className="text-xs font-semibold text-indigo-400">
                {answeredCount} of {totalQuestions} answered
              </span>
            </div>

            {/* Matrix Palette */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = Boolean(answers[q.id]);
                const isCurrent = idx === currentIdx;
                const isFlagged = flaggedIds.includes(q.id);

                let bgClass = 'bg-white dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800';
                if (isAnswered) bgClass = 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-bold';
                if (isCurrent) bgClass = 'ring-2 ring-indigo-400 bg-indigo-600 text-white font-black';
                if (isFlagged && !isCurrent) bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`h-9 w-full rounded-xl border text-xs flex items-center justify-center transition-all hover:scale-105 ${bgClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="space-y-1.5 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span>Flagged for review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Final Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Final Submission</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                You have answered <span className="font-bold text-slate-900 dark:text-white">{answeredCount}</span> out of{' '}
                <span className="font-bold text-slate-900 dark:text-white">{totalQuestions}</span> questions.
                {answeredCount < totalQuestions && (
                  <span className="text-amber-400 block mt-1">
                    ⚠️ You still have {totalQuestions - answeredCount} unanswered questions.
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-700"
              >
                Back to Exam
              </button>

              <button
                onClick={submitQuiz}
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Grading Answers...' : 'Submit & Receive Score'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instant Auto-Grading Score Report Modal */}
      {gradingResult && (
        <ScoreReportModal
          result={gradingResult}
          assessmentTitle={quiz.title}
          onRetake={handleRetake}
        />
      )}
    </div>
  );
}