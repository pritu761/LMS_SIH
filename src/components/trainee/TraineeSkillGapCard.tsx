'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Brain,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Target,
  Zap,
  BookOpen,
} from 'lucide-react';
import { analyzeTraineeCompetencyGap, TraineeGapAnalysisResponse } from '@/services/competencyService';
import { initialUsers, initialCadres } from '@/lib/mockData';

interface Props {
  userId?: string;
}

export function TraineeSkillGapCard({ userId }: Props) {
  const defaultTrainee = initialUsers.find((u) => u.role === 'TRAINEE') || initialUsers[4];
  const targetUserId = userId || defaultTrainee.id;

  const [analysis, setAnalysis] = useState<TraineeGapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCadre, setSelectedCadre] = useState(defaultTrainee.cadreTrack || 'DRSTC');

  const fetchGapData = async (uid: string, cadre: string) => {
    setLoading(true);
    try {
      const data = await analyzeTraineeCompetencyGap(uid, cadre);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapData(targetUserId, selectedCadre);
  }, [targetUserId, selectedCadre]);

  if (loading || !analysis) {
    return (
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-8 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
        Analyzing your personal meteorological competency gaps...
      </div>
    );
  }

  const deficientSkills = analysis.gaps.filter((g) => g.status === 'DEFICIENT' || g.status === 'MISSING');

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-[#c59b48]/30 bg-white dark:bg-gradient-to-br dark:from-[#0b1e36]/90 dark:via-[#102744] dark:to-[#081526] p-6 sm:p-8 backdrop-blur-xl shadow-sm dark:shadow-elevation-2 space-y-6 relative overflow-hidden">
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48]/60 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c59b48]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-[#c59b48]/15 px-2.5 py-0.5 text-[10px] font-black text-[#9a7224] dark:text-[#dfb76c] border border-[#c59b48]/30 uppercase tracking-wider">
              CADRE BENCHMARK TRACKING
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-300 font-mono">Mission Mausam Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#c59b48]" />
            <span>Personal Competency Gap & Cadre Progression</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Track your verified skills against <span className="text-[#9a7224] dark:text-[#dfb76c] font-semibold">{analysis.cadreBenchmarkName}</span> requirements.
          </p>
        </div>

        {/* Cadre Selector */}
        <div className="shrink-0 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cadre Track
          </label>
          <select
            value={selectedCadre}
            onChange={(e) => setSelectedCadre(e.target.value as any)}
            className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white focus:border-[#c59b48] focus:outline-none shadow-sm dark:shadow-md"
          >
            {initialCadres.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Cadre Readiness Score</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{analysis.readinessScore}% Ready</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Identified Skill Deficits</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {deficientSkills.length} Deficiencies
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/60 p-3.5 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Cadre Promotion Status</span>
            <span className="text-base font-black text-amber-700 dark:text-amber-300">
              {deficientSkills.length === 0 ? 'Eligible' : 'In Training'}
            </span>
          </div>
        </div>
      </div>

      {/* Identified Skill Deficits & Recommended Courses */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-[#c59b48]" />
          <span>Recommended Gap-Closing Modules</span>
        </h3>

        {deficientSkills.length === 0 ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 text-center">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>All cadre benchmark competencies are satisfied. Zero skill deficits detected!</span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deficientSkills.slice(0, 2).map((item) => (
              <div
                key={item.competencyId}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/70 p-4 space-y-3 hover:border-[#c59b48]/60 transition-all shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-[#c59b48]/10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#9a7224] dark:text-[#dfb76c] font-bold">{item.code}</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.competencyName}</h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">Deficit: {item.gapDelta} Lvl</span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                      Lvl {item.currentProficiency} → Target {item.benchmarkProficiency}
                    </span>
                  </div>
                </div>

                {item.recommendedCourse && item.recommendedTrainer && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate max-w-[240px]">
                      <span className="text-slate-900 dark:text-white font-semibold">{item.recommendedCourse.code}</span>
                      <span className="text-slate-500 dark:text-slate-400 block text-[10px] truncate">
                        Faculty: {item.recommendedTrainer.name}
                      </span>
                    </div>

                    <Link
                      href={`/trainee/courses/${item.recommendedCourse.id}`}
                      className="flex items-center gap-1 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#0b1e36]/30 transition-all hover:scale-105 shrink-0"
                    >
                      <span>Enroll</span>
                      <ChevronRight className="h-3 w-3 text-[#c59b48]" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}