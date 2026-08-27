'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  User,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  Compass,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { initialUsers, initialCadres, initialCourses, MockUser, MockCadreBenchmark } from '@/lib/mockData';
import { analyzeTraineeCompetencyGap, TraineeGapAnalysisResponse, TraineeGapItem } from '@/services/competencyService';

interface Props {
  initialUserId?: string;
}

export function CompetencyGapAnalyzer({ initialUserId }: Props) {
  const trainees = initialUsers.filter((u) => u.role === 'TRAINEE');
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || trainees[0]?.id || 'user-trainee-1');
  const [selectedCadreCode, setSelectedCadreCode] = useState<string>('DRSTC');
  const [analysis, setAnalysis] = useState<TraineeGapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchGapAnalysis = async (userId: string, cadreCode: string) => {
    setLoading(true);
    try {
      const data = await analyzeTraineeCompetencyGap(userId, cadreCode);
      setAnalysis(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis(selectedUserId, selectedCadreCode);
  }, [selectedUserId, selectedCadreCode]);

  const handleAssignCourse = (courseCode: string, trainerName: string) => {
    setEnrolledCourses((prev) => [...prev, courseCode]);
    setToastMessage(`Assigned cohort track: ${courseCode} under ${trainerName} to trainee.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Generate SVG Radar points for Trainee Skills vs Cadre Benchmark
  const renderRadarChart = (gaps: TraineeGapItem[]) => {
    if (!gaps || gaps.length === 0) return null;

    const size = 320;
    const center = size / 2;
    const radius = 110;
    const totalPoints = gaps.length;

    // Helper to calculate coordinate
    const getCoordinates = (value: number, max: number, index: number) => {
      const angle = (Math.PI * 2 / totalPoints) * index - Math.PI / 2;
      const r = (value / max) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
      };
    };

    // Build polygon points for Verified (Current) and Benchmark
    const currentPoints = gaps.map((g, i) => getCoordinates(g.currentProficiency, 5, i));
    const benchmarkPoints = gaps.map((g, i) => getCoordinates(g.benchmarkProficiency, 5, i));

    const currentSvgPoints = currentPoints.map((p) => `${p.x},${p.y}`).join(' ');
    const benchmarkSvgPoints = benchmarkPoints.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="relative flex flex-col items-center justify-center p-2">
        <svg width={size} height={size} className="overflow-visible">
          {/* Circular grid webs (levels 1 to 5) */}
          {[1, 2, 3, 4, 5].map((lvl) => {
            const r = (lvl / 5) * radius;
            return (
              <circle
                key={lvl}
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke="currentColor"
                className="text-slate-800/80"
                strokeDasharray={lvl === 5 ? 'none' : '3 3'}
                strokeWidth="1"
              />
            );
          })}

          {/* Spokes */}
          {gaps.map((_, i) => {
            const spokeEnd = getCoordinates(5, 5, i);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={spokeEnd.x}
                y2={spokeEnd.y}
                stroke="currentColor"
                className="text-slate-800"
                strokeWidth="1"
              />
            );
          })}

          {/* Benchmark Polygon (Dashed Cyan/Indigo target outline) */}
          <polygon
            points={benchmarkSvgPoints}
            fill="rgba(56, 189, 248, 0.08)"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="transition-all duration-700"
          />

          {/* Trainee Current Polygon (Vibrant Indigo/Emerald solid fill) */}
          <polygon
            points={currentSvgPoints}
            fill="rgba(99, 102, 241, 0.35)"
            stroke="#818cf8"
            strokeWidth="2.5"
            className="transition-all duration-700 filter drop-shadow-md"
          />

          {/* Benchmark Points */}
          {benchmarkPoints.map((p, i) => (
            <circle
              key={`bench-${i}`}
              cx={p.x}
              cy={p.y}
              r="3.5"
              fill="#0ea5e9"
              className="transition-all duration-700"
            />
          ))}

          {/* Current Points with pulse on deficit */}
          {currentPoints.map((p, i) => {
            const isDeficit = gaps[i].status === 'DEFICIENT' || gaps[i].status === 'MISSING';
            return (
              <circle
                key={`curr-${i}`}
                cx={p.x}
                cy={p.y}
                r={isDeficit ? '5' : '4'}
                fill={isDeficit ? '#f43f5e' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="1.5"
                className="transition-all duration-700"
              />
            );
          })}

          {/* Axis Labels */}
          {gaps.map((g, i) => {
            const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
            const labelR = radius + 24;
            const x = center + labelR * Math.cos(angle);
            const y = center + labelR * Math.sin(angle);
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-slate-300 text-[9px] font-bold font-mono"
              >
                {g.code}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-2 text-[11px] font-bold">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <span className="h-3 w-3 rounded-full bg-indigo-500/60 border border-indigo-400" />
            <span>Current Verified</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="h-3 w-3 rounded-full border border-dashed border-cyan-400 bg-cyan-500/20" />
            <span>Target Cadre Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span>Deficit Gap</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fade-in-up shadow-glow-emerald">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Control Bar: Select Trainee & Target Cadre Benchmark */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-6 backdrop-blur-2xl shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                CORE DIFFERENTIATOR • IMD GAP INTELLIGENCE
              </span>
              <span className="text-xs text-slate-400 font-mono">Mission Mausam Protocol</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Brain className="h-6 w-6 text-indigo-400" />
              <span>Trainee Competency Gap Analysis & Upskilling Engine</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pinpoints exact skill deficiencies between verified officer proficiencies and IMD Cadre Benchmarks, automatically generating best-fit Course + Faculty matching to close gaps.
            </p>
          </div>

          {/* Selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Trainee Officer
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none shadow-lg"
              >
                {trainees.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.profile.fullName} ({t.cadreTrack || 'Trainee'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Target Cadre Benchmark
              </label>
              <select
                value={selectedCadreCode}
                onChange={(e) => setSelectedCadreCode(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500 focus:outline-none shadow-lg"
              >
                {initialCadres.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}: {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading || !analysis ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-12 text-center text-xs text-slate-400 animate-pulse">
          Evaluating meteorological competency matrix and computing cadre gap vectors...
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPI Header & Readiness Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Officer Card */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <img
                  src={
                    initialUsers.find((u) => u.id === analysis.userId)?.profile.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
                  }
                  alt={analysis.userName}
                  className="h-11 w-11 rounded-2xl object-cover border border-indigo-500/30"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{analysis.userName}</h4>
                  <p className="text-[11px] text-indigo-400 font-medium">{analysis.designation}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div>Benchmark: <span className="text-white font-bold">{analysis.cadreBenchmarkName}</span></div>
                <div>Cadre Duration: <span className="text-slate-300 font-mono">{analysis.cadreBenchmarkDuration}</span></div>
              </div>
            </div>

            {/* Readiness Index */}
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900/60 p-5 space-y-2 backdrop-blur-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                  Cadre Readiness Index
                </span>
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{analysis.readinessScore}%</span>
                <span className="text-[11px] text-slate-400">of cadre benchmark</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${analysis.readinessScore}%` }}
                />
              </div>
            </div>

            {/* Critical Deficits */}
            <div className="rounded-3xl border border-rose-500/30 bg-rose-950/15 p-5 space-y-2 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
                  Critical Skill Deficits
                </span>
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <div className="text-3xl font-black text-rose-300">{analysis.criticalGapsCount}</div>
              <p className="text-[11px] text-slate-400">
                {analysis.criticalGapsCount > 0
                  ? 'Blocks cadre certification until bridged.'
                  : 'All critical competencies satisfied!'}
              </p>
            </div>

            {/* Satisfied / Benchmark Exceeded */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-2 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  Verified Satisfied
                </span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-emerald-300">
                {analysis.satisfiedCount} / {analysis.totalCompetenciesEvaluated}
              </div>
              <p className="text-[11px] text-slate-400">
                Competencies matching or exceeding cadre target.
              </p>
            </div>
          </div>

          {/* Visual Radar & Detailed Matrix Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SVG Radar Chart */}
            <div className="lg:col-span-5 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="h-4 w-4 text-cyan-400" />
                  <span>Cadre Competency Radar Profile</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Geometric overlap between verified officer skills and cadre requirements.
                </p>
              </div>

              {renderRadarChart(analysis.gaps)}

              <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3 text-xs text-slate-300 leading-relaxed">
                <span className="text-indigo-400 font-bold">Recommendation:</span> {analysis.suggestedAction}
              </div>
            </div>

            {/* Right: Competency Deficit Matrix & 1-Click Upskilling Courses */}
            <div className="lg:col-span-7 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  <span>Competency Breakdown & Gap Closing Recommendations</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {analysis.gaps.length} Target Skills
                </span>
              </div>

              <div className="space-y-3">
                {analysis.gaps.map((item) => {
                  let statusBadge = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
                  if (item.status === 'MISSING' || item.status === 'DEFICIENT') {
                    statusBadge = item.importance === 'CRITICAL'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  }

                  const isAssigned = item.recommendedCourse && enrolledCourses.includes(item.recommendedCourse.code);

                  return (
                    <div
                      key={item.competencyId}
                      className={`rounded-2xl border p-4 transition-all duration-300 space-y-3 ${
                        item.status === 'DEFICIENT' || item.status === 'MISSING'
                          ? 'border-rose-500/25 bg-rose-950/10 hover:border-rose-500/40'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                    >
                      {/* Skill Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              {item.code}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${statusBadge}`}>
                              {item.status === 'DEFICIENT' ? `DEFICIT (${item.gapDelta} LVL)` : item.status}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {item.importance} PRIORITY
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1">{item.competencyName}</h4>
                        </div>

                        {/* Level comparison pill */}
                        <div className="flex items-center gap-3 shrink-0 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Current</span>
                            <span className="font-bold text-indigo-300">Level {item.currentProficiency}</span>
                          </div>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
                          <div>
                            <span className="text-[9px] text-slate-500 block uppercase font-bold">Target</span>
                            <span className="font-bold text-cyan-300">Level {item.benchmarkProficiency}</span>
                          </div>
                        </div>
                      </div>

                      {/* Gap Closing Recommender (If deficient or missing) */}
                      {(item.status === 'DEFICIENT' || item.status === 'MISSING') && item.recommendedCourse && item.recommendedTrainer && (
                        <div className="rounded-xl bg-slate-900/90 border border-indigo-500/20 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                              <Zap className="h-3 w-3 text-amber-400" /> Optimal Gap-Closing Course & Faculty
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">
                              {item.recommendedTrainer.matchScore}% Match Index
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="text-xs font-bold text-white">
                                {item.recommendedCourse.code}: {item.recommendedCourse.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                Lead Faculty: <span className="text-slate-200 font-semibold">{item.recommendedTrainer.name}</span> ({item.recommendedTrainer.rating} ★) • {item.recommendedCourse.durationHours}h
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAssignCourse(item.recommendedCourse!.code, item.recommendedTrainer!.name)}
                              disabled={isAssigned}
                              className={`shrink-0 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-md ${
                                isAssigned
                                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:scale-105 active:scale-95'
                              }`}
                            >
                              {isAssigned ? '✓ Cohort Assigned' : '1-Click Assign Track'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
