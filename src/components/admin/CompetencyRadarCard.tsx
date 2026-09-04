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

  // Custom Algorithm Weights for Live Sensitivity Simulation
  const [skillWeight, setSkillWeight] = useState(55);
  const [ratingWeight, setRatingWeight] = useState(30);
  const [volumeWeight, setVolumeWeight] = useState(15);
  const [isCustomWeights, setIsCustomWeights] = useState(false);

  const resetWeights = () => {
    setSkillWeight(55);
    setRatingWeight(30);
    setVolumeWeight(15);
    setIsCustomWeights(false);
  };

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

  // Recalculate match results when custom weights are applied
  const displayedMatches = React.useMemo(() => {
    if (!matchData?.matches) return [];
    
    const totalWeight = skillWeight + ratingWeight + volumeWeight || 100;
    const wSkill = skillWeight / totalWeight;
    const wRating = ratingWeight / totalWeight;
    const wVolume = volumeWeight / totalWeight;

    const recalculated = matchData.matches.map((res) => {
      const skillScore = res.components.skillOverlapScore;
      const ratingScore = res.components.historicalRatingScore;
      const volumeScore = res.components.coursesDeliveredScore;

      const skillWeighted = skillScore * wSkill;
      const ratingWeighted = ratingScore * wRating;
      const volumeWeighted = volumeScore * wVolume;

      const overallScore = Math.round((skillWeighted + ratingWeighted + volumeWeighted) * 10) / 10;

      let recommendationTier: TrainerMatchResult['recommendationTier'] = 'UNSUITABLE';
      if (overallScore >= 85.0) recommendationTier = 'HIGHLY_RECOMMENDED';
      else if (overallScore >= 70.0) recommendationTier = 'QUALIFIED';
      else if (overallScore >= 50.0) recommendationTier = 'NEEDS_UPSKILLING';

      return {
        ...res,
        overallScore,
        components: {
          ...res.components,
          skillOverlapWeighted: Math.round(skillWeighted * 10) / 10,
          historicalRatingWeighted: Math.round(ratingWeighted * 10) / 10,
          coursesDeliveredWeighted: Math.round(volumeWeighted * 10) / 10,
        },
        recommendationTier,
      };
    });

    recalculated.sort((a, b) => b.overallScore - a.overallScore);
    recalculated.forEach((r, i) => {
      r.rank = i + 1;
    });

    return recalculated;
  }, [matchData, skillWeight, ratingWeight, volumeWeight]);

  return (
    <div className="space-y-6">
      {/* Top Hub Level Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0e121e]/90 border border-slate-200 dark:border-white/10 backdrop-blur-xl overflow-x-auto shadow-sm dark:shadow-xl">
        <button
          onClick={() => setActiveTab('ALLOCATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'ALLOCATION'
              ? 'bg-[#0b1e36] dark:bg-[#122c4d] text-[#dfb76c] border border-[#c59b48]/50 shadow-lg shadow-[#0b1e36]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="h-4 w-4 text-[#c59b48]" />
          <span>55/30/15 Course-to-Trainer Allocation</span>
        </button>

        <button
          onClick={() => setActiveTab('GAP_ANALYSIS')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap relative ${
            activeTab === 'GAP_ANALYSIS'
              ? 'bg-[#0b1e36] dark:bg-[#122c4d] text-[#dfb76c] border border-[#c59b48]/50 shadow-lg shadow-[#0b1e36]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
          }`}
        >
          <Brain className="h-4 w-4 text-[#c59b48]" />
          <span>Trainee Competency Gap Analyzer</span>
          <span className="rounded-full bg-[#c59b48]/20 text-[#dfb76c] text-[9px] px-1.5 py-0.2 border border-[#c59b48]/30 font-black">
            CORE
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DISCOVERY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'DISCOVERY'
              ? 'bg-[#0b1e36] dark:bg-[#122c4d] text-[#dfb76c] border border-[#c59b48]/50 shadow-lg shadow-[#0b1e36]/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
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
          <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-50/70 dark:from-indigo-950/50 via-white dark:via-slate-900/80 to-white dark:to-slate-950 p-6 sm:p-8 backdrop-blur-2xl shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                    Automated Allocation Intelligence
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">Mission Mausam Weighted Matrix v2.4</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
                  <Brain className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                  <span>Competency Mapping & Faculty Allocation</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  Algorithmic matching system pairing accredited IMD/MoES trainers with curriculum modules using a strictly weighted 55/30/15 formula.
                </p>
              </div>

              {/* Target Course Selector Dropdown */}
              <div className="space-y-1.5 shrink-0">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Target IMD Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-md"
                >
                  {initialCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}: {c.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Interactive Weight Sliders Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Interactive Algorithm Weight Tuning & Sensitivity Simulator</span>
                </span>
                {isCustomWeights && (
                  <button
                    onClick={resetWeights}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Reset to Official 55/30/15 Standard
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white dark:bg-slate-950/70 border border-indigo-500/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5" /> 1. Skill Overlap
                    </span>
                    <span className="text-xs font-black text-indigo-700 dark:text-indigo-300 font-mono">{skillWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={80}
                    value={skillWeight}
                    onChange={(e) => {
                      setSkillWeight(parseInt(e.target.value));
                      setIsCustomWeights(true);
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Direct syllabus & verified competency match ratio.</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-950/70 border border-amber-500/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5" /> 2. Historical Rating
                    </span>
                    <span className="text-xs font-black text-amber-700 dark:text-amber-300 font-mono">{ratingWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    value={ratingWeight}
                    onChange={(e) => {
                      setRatingWeight(parseInt(e.target.value));
                      setIsCustomWeights(true);
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Normalized 5-star trainee qualitative evaluations.</p>
                </div>

                <div className="rounded-2xl bg-white dark:bg-slate-950/70 border border-cyan-500/20 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> 3. Courses Delivered
                    </span>
                    <span className="text-xs font-black text-cyan-700 dark:text-cyan-300 font-mono">{volumeWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={40}
                    value={volumeWeight}
                    onChange={(e) => {
                      setVolumeWeight(parseInt(e.target.value));
                      setIsCustomWeights(true);
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Track record against 10-course master threshold.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Results Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                <span>Ranked Faculty Compatibility Results</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {displayedMatches.length} Faculty Evaluated {isCustomWeights && '• Custom Weights Active'}
              </span>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center text-xs text-slate-500 dark:text-slate-400 animate-pulse">
                Computing weighted competency compatibility vectors...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {displayedMatches.map((res) => {
                  let tierColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
                  if (res.recommendationTier === 'QUALIFIED') {
                    tierColor = 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30';
                  } else if (res.recommendationTier === 'NEEDS_UPSKILLING') {
                    tierColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
                  }

                  return (
                    <div
                      key={res.trainerId}
                      className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-300 space-y-4 shadow-sm dark:shadow-none"
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
                            <span className="absolute -top-1.5 -left-1.5 h-6 w-6 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-900 dark:text-white flex items-center justify-center font-mono shadow-sm">
                              #{res.rank}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{res.trainerName}</h4>
                              <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase border ${tierColor}`}>
                                {res.recommendationTier.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">{res.headline}</p>
                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{res.organization}</p>
                          </div>
                        </div>

                        {/* Overall Score Box */}
                        <div className="flex items-center gap-4 self-end sm:self-auto bg-slate-50 dark:bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold block">
                              Compatibility Index
                            </span>
                            <span className="text-xl font-black text-slate-900 dark:text-white">{res.overallScore}%</span>
                          </div>
                          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
                          <div className="text-left text-[10px] space-y-0.5 text-slate-600 dark:text-slate-400 font-mono">
                            <div>Skill: <span className="text-indigo-600 dark:text-indigo-300 font-bold">{res.components.skillOverlapWeighted.toFixed(1)}/{skillWeight}</span></div>
                            <div>Rating: <span className="text-amber-600 dark:text-amber-300 font-bold">{res.components.historicalRatingWeighted.toFixed(1)}/{ratingWeight}</span></div>
                            <div>Volume: <span className="text-cyan-600 dark:text-cyan-300 font-bold">{res.components.coursesDeliveredWeighted.toFixed(1)}/{volumeWeight}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Skill Breakdown */}
                      <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 p-4 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                          Curriculum Competency Match Breakdown
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {res.competencyBreakdown.map((b) => (
                            <div
                              key={b.competencyId}
                              className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 p-2.5 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-slate-200 truncate">{b.competencyName}</span>
                                <span
                                  className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded ${
                                    b.status === 'EXCEEDS'
                                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                      : b.status === 'MATCHES'
                                      ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300'
                                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                <span>Req: Lvl {b.courseRequiredProficiency}</span>
                                <span className="text-indigo-600 dark:text-indigo-300 font-bold">Trainer: Lvl {b.trainerProficiency}</span>
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