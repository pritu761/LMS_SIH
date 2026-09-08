'use client';

import React, { useMemo, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatsCard } from '@/components/shared/StatsCard';
import {
  BarChart3,
  Users,
  Award,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  Search,
} from 'lucide-react';

export default function CohortAnalyticsPage() {
  const traineesRoster = [
    {
      id: 'trainee-1',
      name: 'Aarav Patel',
      email: 'aarav.patel@imd.gov.in',
      department: 'Numerical Weather Prediction Division, Mausam Bhavan',
      cadre: 'DRSTC Inductee',
      progress: 50,
      status: 'IN_PROGRESS',
      score: '--',
      passed: null,
      lastActive: '10 mins ago',
    },
    {
      id: 'trainee-2',
      name: 'Dr. Pooja Verma',
      email: 'pooja.verma@imd.gov.in',
      department: 'Cyclone Warning Division, RMC Chennai',
      cadre: 'FTC Forecaster',
      progress: 100,
      status: 'COMPLETED',
      score: '92.5%',
      passed: true,
      lastActive: '2 hours ago',
    },
    {
      id: 'trainee-3',
      name: 'Rohit Kulkarni',
      email: 'rohit.kulkarni@imd.gov.in',
      department: 'Doppler Radar Operations, MTI Pune',
      cadre: 'DRSTC Inductee',
      progress: 100,
      status: 'COMPLETED',
      score: '84.0%',
      passed: true,
      lastActive: '1 day ago',
    },
    {
      id: 'trainee-4',
      name: 'Sneha Deshmukh',
      email: 'sneha.deshmukh@imd.gov.in',
      department: 'Satellite Meteorology Division, RMC Mumbai',
      cadre: 'IMTC Officer',
      progress: 75,
      status: 'IN_PROGRESS',
      score: '--',
      passed: null,
      lastActive: '5 hours ago',
    },
    {
      id: 'trainee-5',
      name: 'Ananya Roy',
      email: 'ananya.roy@imd.gov.in',
      department: 'Climate Research & Services, Pune',
      cadre: 'Modular AI/HPC',
      progress: 100,
      status: 'COMPLETED',
      score: '96.0%',
      passed: true,
      lastActive: '30 mins ago',
    },
  ];

  const [rosterQuery, setRosterQuery] = useState('');
  const [cadreFilter, setCadreFilter] = useState<string>('ALL');

  const cadreOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(traineesRoster.map((t) => t.cadre)))],
    []
  );

  const filteredRoster = traineesRoster.filter((t) => {
    const q = rosterQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q);
    const matchCadre = cadreFilter === 'ALL' || t.cadre === cadreFilter;
    return matchQuery && matchCadre;
  });

  const avgCompletion = Math.round(traineesRoster.reduce((s, t) => s + t.progress, 0) / traineesRoster.length);
  const attempted = traineesRoster.filter((t) => t.passed !== null);
  const passRate = attempted.length > 0 ? Math.round((attempted.filter((t) => t.passed).length / attempted.length) * 100) : 0;
  const completedCount = traineesRoster.filter((t) => t.status === 'COMPLETED').length;

  const exportCsv = () => {
    const header = ['Name', 'Email', 'Department', 'Cadre', 'Progress %', 'Status', 'Score', 'Outcome', 'Last Active'];
    const rows = filteredRoster.map((t) => [
      t.name,
      t.email,
      t.department,
      t.cadre,
      String(t.progress),
      t.status,
      t.score,
      t.passed === null ? 'Not attempted' : t.passed ? 'Passed' : 'Failed',
      t.lastActive,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cohort-roster-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              COHORT TELEMETRY
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Real-time Learner Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Cohort Analytics & Submission Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Monitor trainee completion percentages, exam outcomes, and submission timestamps.
          </p>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Enrolled"
            value={`${traineesRoster.length} Officers`}
            change="Batch 2026-A"
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Avg Completion"
            value={`${avgCompletion}%`}
            change="↑ 12% this week"
            icon={TrendingUp}
            color="cyan"
          />
          <StatsCard
            title="Exam Pass Rate"
            value={`${passRate}%`}
            change="Benchmark: 70%"
            icon={Award}
            color="emerald"
          />
          <StatsCard
            title="Certificates Issued"
            value={`${completedCount} Issued`}
            change="100% verified"
            icon={CheckCircle2}
            color="purple"
          />
        </div>

        {/* Live Roster Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 shrink-0">
              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Learner Progress & Exam Records</span>
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search learner, email, division..."
                  value={rosterQuery}
                  onChange={(e) => setRosterQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none w-56"
                />
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 text-xs">
                {cadreOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCadreFilter(c)}
                    className={`px-2 py-0.5 rounded-lg transition-all whitespace-nowrap ${
                      cadreFilter === c
                        ? 'bg-[#0b1e36] dark:bg-[#122c4d] text-[#dfb76c] font-bold shadow-sm'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {c === 'ALL' ? 'All' : c}
                  </button>
                ))}
              </div>
              <button
                onClick={exportCsv}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV Roster</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px] text-slate-600 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-[11px] uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3 sticky left-0 bg-slate-50 dark:bg-slate-950/70 z-10">Learner Name</th>
                  <th className="px-4 py-3 min-w-[220px]">Department</th>
                  <th className="px-4 py-3">Curriculum Progress</th>
                  <th className="px-4 py-3">Assessment Outcome</th>
                  <th className="px-4 py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredRoster.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5 sticky left-0 bg-white dark:bg-slate-900/60 z-10">
                      <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{t.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px]" title={t.email}>{t.email}</div>
                      <div className="text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">{t.cadre}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{t.department}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden" role="progressbar" aria-valuenow={t.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${t.name} progress`}>
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-200 tabular-nums">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {t.passed !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold tabular-nums whitespace-nowrap ${
                            t.passed ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{t.passed ? `Passed (${t.score})` : `Failed (${t.score})`}</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400">Not attempted yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">{t.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRoster.length === 0 && (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No learners match “{rosterQuery}”</p>
                <button
                  type="button"
                  onClick={() => { setRosterQuery(''); setCadreFilter('ALL'); }}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}