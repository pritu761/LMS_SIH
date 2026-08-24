'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Award,
  Star,
  BookOpen,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Sliders,
} from 'lucide-react';
import { CourseMatchResponse, TrainerMatchResult } from '@/services/competencyService';
import { initialCourses } from '@/lib/mockData';

export function CompetencyRadarCard() {
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourses[0].id);
  const [matchData, setMatchData] = useState<CourseMatchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMatches = async (courseId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMatchData(data.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(selectedCourseId);
  }, [selectedCourseId]);

  return (
    <div className="space-y-8">
      {/* Algorithm Header & Formula Explainer Card */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow ambient background aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                Automated Allocation Intelligence
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">Weighted Matrix v2.4</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Brain className="h-7 w-7 text-indigo-400" />
              <span>Competency Mapping & Faculty Allocation</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Algorithmic matching system that pairs optimal trainers with course curricula using a strictly weighted 55/30/15 pedagogical formula.
            </p>
          </div>

          {/* Target Course Selector Dropdown */}
          <div className="space-y-1.5 shrink-0">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Target Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xl"
            >
              {initialCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}: {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 55 / 30 / 15 Formula Explainer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
          <div className="rounded-2xl bg-slate-950/70 border border-indigo-500/20 p-4 space-y-1.5 transition-all hover:border-indigo-500/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Sliders className="h-3.5 w-3.5" /> 1. Skill Overlap
              </span>
              <span className="text-xs font-black text-indigo-300">55% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Weighted match ratio between required course competencies and trainer verified levels.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-amber-500/20 p-4 space-y-1.5 transition-all hover:border-amber-500/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Star className="h-3.5 w-3.5" /> 2. Historical Rating
              </span>
              <span className="text-xs font-black text-amber-300">30% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Average 5-star trainee review scores normalized across historical cohorts.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950/70 border border-cyan-500/20 p-4 space-y-1.5 transition-all hover:border-cyan-500/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> 3. Courses Delivered
              </span>
              <span className="text-xs font-black text-cyan-300">15% Weight</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Delivery volume benchmarked against a 10-course master threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Ranked Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>Ranked Faculty Compatibility Results</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {matchData?.evaluatedTrainersCount || 0} Faculty Evaluated
          </span>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400 animate-pulse">
            Computing weighted competency compatibility vectors...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matchData?.matches.map((trainer: TrainerMatchResult) => {
              const isRankOne = trainer.rank === 1;

              return (
                <div
                  key={trainer.trainerId}
                  className={`rounded-3xl border p-6 backdrop-blur-2xl transition-all space-y-5 relative overflow-hidden group hover:-translate-y-1 shadow-xl ${
                    isRankOne
                      ? 'border-indigo-500/60 bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-slate-950 shadow-indigo-500/15 ring-1 ring-indigo-500/30'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  {/* Podium Rank Medal Top Banner */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={trainer.avatarUrl}
                          alt={trainer.trainerName}
                          className="h-14 w-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <div
                          className={`absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-black text-white shadow-md border border-slate-900 ${
                            trainer.rank === 1
                              ? 'bg-amber-500 ring-2 ring-amber-400/40'
                              : trainer.rank === 2
                              ? 'bg-slate-400 ring-2 ring-slate-300/40'
                              : 'bg-amber-700 ring-2 ring-amber-600/40'
                          }`}
                        >
                          #{trainer.rank}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-base group-hover:text-indigo-300 transition-colors">
                          {trainer.trainerName}
                        </h4>
                        <p className="text-xs text-indigo-300 font-medium">{trainer.headline}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{trainer.organization}</p>
                      </div>
                    </div>

                    {/* Overall Compatibility Score Display */}
                    <div className="text-right">
                      <div className="text-3xl font-black text-white tracking-tight">
                        {trainer.overallScore}%
                      </div>
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border mt-0.5 ${
                          trainer.recommendationTier === 'HIGHLY_RECOMMENDED'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : trainer.recommendationTier === 'QUALIFIED'
                            ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {trainer.recommendationTier.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Component Breakdown Bars */}
                  <div className="space-y-2.5 rounded-2xl bg-slate-950/70 border border-slate-800 p-4">
                    {/* Skill Overlap */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Skill Overlap (55% Max)</span>
                        <span className="font-bold text-indigo-300">
                          {trainer.components.skillOverlapWeighted} / 55 pts ({trainer.metrics.rawSkillOverlapPercentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-700"
                          style={{ width: `${(trainer.components.skillOverlapWeighted / 55) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Historical Rating */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Rating Index (30% Max)</span>
                        <span className="font-bold text-amber-300">
                          {trainer.components.historicalRatingWeighted} / 30 pts ({trainer.metrics.rawHistoricalRating} ★)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                          style={{ width: `${(trainer.components.historicalRatingWeighted / 30) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Courses Delivered */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Delivery Volume (15% Max)</span>
                        <span className="font-bold text-cyan-300">
                          {trainer.components.coursesDeliveredWeighted} / 15 pts ({trainer.metrics.rawCoursesDelivered} Delivered)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-700"
                          style={{ width: `${(trainer.components.coursesDeliveredWeighted / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Competency Skill Badges */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Competency Match Matrix
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {trainer.competencyBreakdown.map((cb) => {
                        let badgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
                        if (cb.status === 'EXCEEDS') badgeClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
                        if (cb.status === 'MATCHES') badgeClass = 'bg-indigo-950/60 text-indigo-300 border-indigo-500/30';
                        if (cb.status === 'DEFICIENT') badgeClass = 'bg-amber-950/60 text-amber-300 border-amber-500/30';
                        if (cb.status === 'MISSING') badgeClass = 'bg-rose-950/60 text-rose-300 border-rose-500/30';

                        return (
                          <span
                            key={cb.competencyId}
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border ${badgeClass}`}
                          >
                            {cb.competencyName}: Lvl {cb.trainerProficiency}/{cb.courseRequiredProficiency} ({cb.status})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
