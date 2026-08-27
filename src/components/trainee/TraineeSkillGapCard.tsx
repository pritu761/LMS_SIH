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
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-400 animate-pulse">
        Analyzing your personal meteorological competency gaps...
      </div>
    );
  }

  const deficientSkills = analysis.gaps.filter((g) => g.status === 'DEFICIENT' || g.status === 'MISSING');

  return (
    <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-950/30 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-elevation-2 space-y-6 relative overflow-hidden">
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
              CADRE BENCHMARK TRACKING
            </span>
            <span className="text-xs text-slate-400 font-mono">Mission Mausam Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            <span>Personal Competency Gap & Cadre Progression</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Track your verified skills against <span className="text-indigo-300 font-semibold">{analysis.cadreBenchmarkName}</span> requirements.
          </p>
        </div>

        {/* Cadre Selector */}
        <div className="shrink-0 space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cadre Track
          </label>
          <select
            value={selectedCadre}
            onChange={(e) => setSelectedCadre(e.target.value as any)}
            className="rounded-2xl border border-slate-700 bg-slate-950 px-3.5 py-1.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none shadow-md"
          >
            {initialCadres.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}: {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Readiness Bar & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Readiness Bar */}
        <div className="sm:col-span-2 rounded-2xl bg-slate-950/70 border border-slate-800 p-4 space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Target className="h-4 w-4 text-cyan-400" />
              Cadre Readiness Score
            </span>
            <span className="text-base font-black text-cyan-400">{analysis.readinessScore}%</span>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${analysis.readinessScore}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium">
            <span>{analysis.satisfiedCount} Competencies Satisfied</span>
            <span className="text-rose-400 font-bold">{deficientSkills.length} Skill Deficits Identified</span>
          </div>
        </div>

        {/* Action Recommendation */}
        <div className="rounded-2xl bg-indigo-950/30 border border-indigo-500/20 p-4 flex flex-col justify-between space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Action Required
          </span>
          <p className="text-xs text-slate-200 leading-snug">
            {analysis.criticalGapsCount > 0
              ? `${analysis.criticalGapsCount} critical competency deficit(s) need completion for Cadre Promotion.`
              : 'All mandatory cadre competencies are met!'}
          </p>
        </div>
      </div>

      {/* Identified Skill Deficits & Recommended Courses */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>Recommended Gap-Closing Modules</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {deficientSkills.slice(0, 2).map((item) => (
            <div
              key={item.competencyId}
              className="rounded-2xl border border-rose-500/30 bg-slate-950/70 p-4 space-y-3 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">{item.code}</span>
                  <h4 className="text-xs font-bold text-white">{item.competencyName}</h4>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-rose-400 font-bold block">Deficit: {item.gapDelta} Lvl</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    Lvl {item.currentProficiency} → Target {item.benchmarkProficiency}
                  </span>
                </div>
              </div>

              {item.recommendedCourse && item.recommendedTrainer && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-300 truncate max-w-[240px]">
                    <span className="text-white font-semibold">{item.recommendedCourse.code}</span>
                    <span className="text-slate-400 block text-[10px] truncate">
                      Faculty: {item.recommendedTrainer.name}
                    </span>
                  </div>

                  <Link
                    href={`/trainee/courses/${item.recommendedCourse.id}`}
                    className="flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all hover:scale-105 shrink-0"
                  >
                    <span>Enroll</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
