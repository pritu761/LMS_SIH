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
  Compass,
  Users,
} from 'lucide-react';
import { CourseMatchResponse, TrainerMatchResult } from '@/services/competencyService';
import { initialCourses } from '@/lib/mockData';
import { CompetencyGapAnalyzer } from './CompetencyGapAnalyzer';
import { TrainerDiscoveryDirectory } from './TrainerDiscoveryDirectory';

export function CompetencyRadarCard() {
  const [activeTab, setActiveTab] = useState<'ALLOCATION' | 'GAP_ANALYSIS' | 'DISCOVERY'>('ALLOCATION');
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
    if (activeTab === 'ALLOCATION') {
      fetchMatches(selectedCourseId);
    }
  }, [selectedCourseId, activeTab]);

  return (
    <div className="space-y-6">
      {/* Top Hub Level Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0e121e]/90 border border-white/10 backdrop-blur-xl overflow-x-auto shadow-xl">
        <button
          onClick={() => setActiveTab('ALLOCATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ALLOCATION'
              ? 'bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] text-white shadow-lg shadow-[#e0234e]/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>55/30/15 Course-to-Trainer Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('GAP_ANALYSIS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
            activeTab === 'GAP_ANALYSIS'
              ? 'bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] text-white shadow-lg shadow-[#e0234e]/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Brain className="h-4 w-4 text-[#ff4d6d]" />
          <span>Trainee Competency Gap Analyzer</span>
          <span className="rounded-full bg-[#e0234e]/20 text-[#ff758c] text-[9px] px-1.5 py-0.2 border border-[#e0234e]/30 font-black">
            CORE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DISCOVERY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'DISCOVERY'
              ? 'bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] text-white shadow-lg shadow-[#e0234e]/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-4 w-4 text-emerald-400" />
          <span>Faculty Discovery Directory</span>
        </button>
      </div>

      {/* Tab 2: Trainee Competency Gap Analyzer */}
      {activeTab === 'GAP_ANALYSIS' && <CompetencyGapAnalyzer />}

      {/* Tab 3: Faculty Discovery Directory */}
      {activeTab === 'DISCOVERY' && <TrainerDiscoveryDirectory />}

      {/* Tab 1: Course Allocation Engine (55/30/15) */}
      {activeTab === 'ALLOCATION' && (
        <div className="space-y-8 animate-fade-in-up">
          {/* Algorithm Header & Formula Explainer Card */}
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Automated Allocation Intelligence
                  </span>
                  <span className="text-xs text-slate-400 font-medium font-mono">Mission Mausam Weighted Matrix v2.4</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Brain className="h-7 w-7 text-indigo-400" />
                  <span>Competency Mapping & Faculty Allocation</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Algorithmic matching system pairing accredited IMD/MoES trainers with curriculum modules using a strictly weighted 55/30/15 pedagogical formula.
                </p>
              </div>

              {/* Target Course Selector Dropdown */}
              <div className="space-y-1.5 shrink-0">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Select Target IMD Course
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
                  Weighted match ratio between required course competencies (NWP, Radar, Satellite) and verified trainer proficiencies.
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
                  Average 5-star trainee review scores normalized across historical IMD training batches.
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
              <div className="grid grid-cols-1 gap-4">
                {matchData?.matches.map((res) => {
                  let tierColor = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
                  if (res.recommendationTier === 'QUALIFIED') {
                    tierColor = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
                  } else if (res.recommendationTier === 'NEEDS_UPSKILLING') {
                    tierColor = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
                  }

                  return (
                    <div
                      key={res.trainerId}
                      className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-300 space-y-4"
                    >
                      {/* Top Info Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="relative">
                            <img
                              src={res.avatarUrl}
                              alt={res.trainerName}
                              className="h-12 w-12 rounded-2xl object-cover border border-indigo-500/30"
                            />
                            <span className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full bg-slate-950 border border-slate-700 text-[10px] font-black text-white flex items-center justify-center font-mono">
                              #{res.rank}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{res.trainerName}</h4>
                              <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase border ${tierColor}`}>
                                {res.recommendationTier.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{res.headline}</p>
                            <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{res.organization}</p>
                          </div>
                        </div>

                        {/* Overall Score Circle/Box */}
                        <div className="flex items-center gap-4 self-end sm:self-auto bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800">
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                              Compatibility Index
                            </span>
                            <span className="text-xl font-black text-white">{res.overallScore}%</span>
                          </div>
                          <div className="h-8 w-[1px] bg-slate-800" />
                          <div className="text-left text-[10px] space-y-0.5 text-slate-400 font-mono">
                            <div>Skill: <span className="text-indigo-300 font-bold">{res.components.skillOverlapWeighted.toFixed(1)}/55</span></div>
                            <div>Rating: <span className="text-amber-300 font-bold">{res.components.historicalRatingWeighted.toFixed(1)}/30</span></div>
                            <div>Volume: <span className="text-cyan-300 font-bold">{res.components.coursesDeliveredWeighted.toFixed(1)}/15</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Skill Breakdown */}
                      <div className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Curriculum Competency Match Breakdown
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {res.competencyBreakdown.map((b) => (
                            <div
                              key={b.competencyId}
                              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200 truncate">{b.competencyName}</span>
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                    b.status === 'EXCEEDS'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : b.status === 'MATCHES'
                                      ? 'bg-cyan-500/20 text-cyan-300'
                                      : 'bg-rose-500/20 text-rose-300'
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                <span>Req: Lvl {b.courseRequiredProficiency}</span>
                                <span className="text-indigo-300 font-bold">Trainer: Lvl {b.trainerProficiency}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
