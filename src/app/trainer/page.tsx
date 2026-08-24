'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Video,
  FileCheck,
  BarChart3,
  Users,
  Star,
  Sparkles,
  ChevronRight,
  UploadCloud,
  Plus,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCourses, initialFeedbacks } from '@/lib/mockData';

export default function TrainerHubPage() {
  const course = initialCourses[0];

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
              FACULTY HUB
            </span>
            <span className="text-xs text-slate-400">Accredited Senior Faculty</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome back, Prof. Vikramaditya Sen
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Principal Cloud Architect & Senior Faculty • National Institute of Smart Government
          </p>
        </div>

        {/* Trainer KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatsCard
            title="Courses Delivered"
            value="12 Cohorts"
            change="1 Active"
            icon={BookOpen}
            color="indigo"
          />
          <StatsCard
            title="Learners Trained"
            value="4,820"
            change="96.2% Completion"
            icon={Users}
            color="cyan"
          />
          <StatsCard
            title="Faculty Rating"
            value="4.85 ★"
            change="Top 5% National"
            icon={Star}
            color="amber"
          />
          <StatsCard
            title="Matching Compatibility"
            value="94.2%"
            change="Cloud Arch Track"
            icon={Sparkles}
            color="emerald"
          />
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/trainer/library"
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors">
                Media Library & Uploads
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Upload MP4 lectures, PDF slide decks, and module reading references.
              </p>
            </div>
          </Link>

          <Link
            href="/trainer/assessments/create"
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                MCQ Assessment Builder
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Author timed subject-wise exams, time limits, weights, and explanations.
              </p>
            </div>
          </Link>

          <Link
            href="/trainer/analytics"
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all group space-y-3"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                Cohort Analytics
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Live roster tracking trainee completion percentages and scores.
              </p>
            </div>
          </Link>
        </div>

        {/* Active Module Curriculum & Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Course */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-400" />
                <span>Active Assigned Course</span>
              </h3>
              <span className="text-xs font-bold text-emerald-400">PUBLISHED</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold">
                {course.code}
              </span>
              <h4 className="text-sm font-bold text-white">{course.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{course.description}</p>
            </div>

            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3.5 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Uploaded Curriculum Assets ({course.materials.length})
              </span>
              <div className="space-y-1.5">
                {course.materials.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs text-slate-300">
                    <span className="truncate">{m.title}</span>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold">{m.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Qualitative Reviews Feed */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span>Recent Trainee Reviews</span>
              </h3>
              <span className="text-xs text-slate-400">Rating Impact: 30% Weight</span>
            </div>

            <div className="space-y-3">
              {initialFeedbacks.map((fb) => (
                <div key={fb.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-xs">{fb.userName}</div>
                    <div className="flex items-center text-amber-400">
                      {'★'.repeat(fb.rating)}
                    </div>
                  </div>
                  <div className="text-[10px] text-indigo-400 font-medium">{fb.userRole}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">&ldquo;{fb.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
