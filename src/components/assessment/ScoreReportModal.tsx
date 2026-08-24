'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Download,
  Filter,
  Check,
  X,
  Share2,
} from 'lucide-react';
import { AssessmentGradingResult } from '@/services/assessmentService';
import { ConfettiEffect } from '@/components/shared/ConfettiEffect';

interface ScoreReportModalProps {
  result: AssessmentGradingResult;
  assessmentTitle: string;
  onRetake: () => void;
}

export function ScoreReportModal({
  result,
  assessmentTitle,
  onRetake,
}: ScoreReportModalProps) {
  const isPassed = result.passed;
  const [filterType, setFilterType] = useState<'ALL' | 'CORRECT' | 'INCORRECT'>('ALL');

  const filteredQuestions = result.questionBreakdown.filter((q) => {
    if (filterType === 'CORRECT') return q.isCorrect;
    if (filterType === 'INCORRECT') return !q.isCorrect;
    return true;
  });

  const correctCount = result.questionBreakdown.filter((q) => q.isCorrect).length;
  const totalCount = result.questionBreakdown.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
      {isPassed && <ConfettiEffect />}

      <div className="relative my-8 w-full max-w-3xl rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
        
        {/* Glow ambient background aura */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full blur-3xl pointer-events-none opacity-40 ${
            isPassed ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Pass/Fail Header Banner */}
        <div className="text-center space-y-4 relative">
          <div
            className={`mx-auto h-24 w-24 rounded-3xl flex items-center justify-center border shadow-2xl transition-all animate-float-slow ${
              isPassed
                ? 'bg-gradient-to-tr from-emerald-600/30 to-emerald-400/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/30 ring-4 ring-emerald-500/10'
                : 'bg-gradient-to-tr from-rose-600/30 to-rose-400/10 border-rose-500/40 text-rose-400 shadow-rose-500/30 ring-4 ring-rose-500/10'
            }`}
          >
            {isPassed ? <Award className="h-12 w-12" /> : <XCircle className="h-12 w-12" />}
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider border shadow-sm mb-2 backdrop-blur-md">
              <span
                className={`h-2 w-2 rounded-full ${
                  isPassed ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'
                }`}
              />
              <span
                className={isPassed ? 'text-emerald-300' : 'text-rose-300'}
              >
                {isPassed ? 'OFFICIAL CERTIFICATION ISSUED' : 'MINIMUM CUTOFF NOT REACHED'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {isPassed ? 'Congratulations, You Passed!' : 'Assessment Completed'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
              {assessmentTitle}
            </p>
          </div>
        </div>

        {/* Score & Metrics Showcase Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Score Percentage
            </span>
            <div
              className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isPassed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {result.percentage}%
            </div>
            <span className="text-[10px] text-slate-400">
              {result.score} / {result.maxScore} points
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Passing Threshold
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 tracking-tight">
              {result.passingScorePercentage}%
            </div>
            <span className="text-[10px] text-slate-400">Required minimum</span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Time Taken
            </span>
            <div className="text-2xl sm:text-3xl font-black text-cyan-400 tracking-tight">
              {Math.floor(result.timeSpentSeconds / 60)}m {result.timeSpentSeconds % 60}s
            </div>
            <span className="text-[10px] text-slate-400">
              Limit: {result.timeLimitMinutes} mins
            </span>
          </div>

          <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-center space-y-1 shadow-md">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Accuracy
            </span>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 tracking-tight">
              {correctCount}/{totalCount}
            </div>
            <span className="text-[10px] text-slate-400">Correct answers</span>
          </div>
        </div>

        {/* Certificate Callout (If passed) */}
        {isPassed && (
          <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Digital Verified Credential Generated</div>
                <div className="text-[10px] text-slate-400">Credential ID: CERT-{result.submissionId.slice(-6).toUpperCase()} • Signed on Ledger</div>
              </div>
            </div>
            <button
              onClick={() => alert(`Certificate verified and stamped for user: ${result.submissionId}`)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition-all whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Certificate</span>
            </button>
          </div>
        )}

        {/* Question Review Section with Filter Pills */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Pedagogical Review & Faculty Explanations</span>
            </h3>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setFilterType('ALL')}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                All ({result.questionBreakdown.length})
              </button>
              <button
                onClick={() => setFilterType('CORRECT')}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                  filterType === 'CORRECT'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                onClick={() => setFilterType('INCORRECT')}
                className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all ${
                  filterType === 'INCORRECT'
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Incorrect ({totalCount - correctCount})
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {filteredQuestions.map((q, idx) => (
              <div
                key={q.questionId}
                className={`rounded-2xl border p-4 transition-all ${
                  q.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-950/15'
                    : 'border-rose-500/30 bg-rose-950/15'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                      Q{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        q.isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {q.isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Correct (+{q.weight} pts)
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" /> Incorrect (0 / {q.weight} pts)
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-slate-200 mt-2">
                  {q.questionText}
                </p>

                {/* Explanation Box */}
                <div className="mt-3 rounded-xl bg-slate-950/70 border border-slate-800 p-3 text-xs text-slate-300 space-y-1">
                  <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Faculty Rationale</span>
                  </span>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={onRetake}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Retake Assessment</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Link
              href="/trainee/courses"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              <span>Explore Catalog</span>
            </Link>

            <Link
              href="/trainee"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>Return to Learning Hub</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
