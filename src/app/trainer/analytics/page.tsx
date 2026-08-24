'use client';

import React from 'react';
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
      email: 'aarav.trainee@capacityconnect.gov',
      department: 'State Data Center',
      progress: 50,
      status: 'IN_PROGRESS',
      score: '--',
      passed: null,
      lastActive: '10 mins ago',
    },
    {
      id: 'trainee-2',
      name: 'Pooja Verma',
      email: 'pooja.verma@nic.in',
      department: 'National Informatics Centre',
      progress: 100,
      status: 'COMPLETED',
      score: '92.5%',
      passed: true,
      lastActive: '2 hours ago',
    },
    {
      id: 'trainee-3',
      name: 'Rohit Kulkarni',
      email: 'rohit.k@meity.gov.in',
      department: 'Ministry of Electronics & IT',
      progress: 100,
      status: 'COMPLETED',
      score: '84.0%',
      passed: true,
      lastActive: '1 day ago',
    },
    {
      id: 'trainee-4',
      name: 'Sneha Deshmukh',
      email: 'sneha.d@gov.in',
      department: 'Public Works Dept',
      progress: 25,
      status: 'IN_PROGRESS',
      score: '--',
      passed: null,
      lastActive: '3 days ago',
    },
  ];

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/20">
              COHORT TELEMETRY
            </span>
            <span className="text-xs text-slate-400">Real-time Learner Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Cohort Analytics & Submission Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Monitor trainee completion percentages, exam outcomes, and submission timestamps.
          </p>
        </div>

        {/* Analytics KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Total Enrolled"
            value="42 Officers"
            change="Batch 2026-A"
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Avg Completion"
            value="68.8%"
            change="↑ 12% this week"
            icon={TrendingUp}
            color="cyan"
          />
          <StatsCard
            title="Exam Pass Rate"
            value="88.3%"
            change="Benchmark: 70%"
            icon={Award}
            color="emerald"
          />
          <StatsCard
            title="Certificates Issued"
            value="26 Issued"
            change="100% verified"
            icon={CheckCircle2}
            color="purple"
          />
        </div>

        {/* Live Roster Table */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <span>Learner Progress & Exam Records</span>
            </h3>

            <button
              onClick={() => alert('Exporting cohort telemetry CSV report...')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV Roster</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/70 text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-4 py-3">Learner Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Curriculum Progress</th>
                  <th className="px-4 py-3">Assessment Outcome</th>
                  <th className="px-4 py-3">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {traineesRoster.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white">{t.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{t.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{t.department}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-200">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {t.passed !== null ? (
                        <span
                          className={`inline-flex items-center gap-1 font-bold ${
                            t.passed ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Passed ({t.score})</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">Not attempted yet</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400">{t.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
