'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Video,
  FileText,
  Target,
  Activity,
  Flame,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCourses, initialEnrollments } from '@/lib/mockData';

export default function TraineeDashboard() {
  const enrollment = initialEnrollments[0];
  const enrolledCourse = initialCourses.find((c) => c.id === enrollment.courseId) || initialCourses[0];
  const [userName, setUserName] = useState('Trainee');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserName(d.user.fullName || d.user.profile?.fullName || 'Trainee');
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0 space-y-6">

        {/* Trainee Welcome Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-400 border border-cyan-500/20">
                TRAINEE PORTAL
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Verified & Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Welcome back, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Continue your learning journey and track your professional development milestones.
            </p>
          </div>
        </div>

        {/* Trainee KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard
            title="Enrolled Courses"
            value="1 Active"
            change="In Progress"
            icon={BookOpen}
            color="indigo"
          />
          <StatsCard
            title="Verified Competencies"
            value="2 Mapped"
            change="Lvl 2 Average"
            icon={Award}
            color="cyan"
          />
          <StatsCard
            title="Avg Exam Score"
            value="--"
            change="Pending Assessment"
            icon={TrendingUp}
            color="emerald"
          />
        </div>

        {/* Active Enrolled Course Banner */}
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-400" />
                  IN PROGRESS • {enrollment.progressPercentage}% COMPLETE
                </span>
                <span className="text-xs text-slate-400">{enrolledCourse.category}</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {enrolledCourse.title}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Delivered by <span className="text-white font-semibold">{enrolledCourse.trainerName}</span>
              </p>
            </div>

            <Link
              href={`/trainee/courses/${enrolledCourse.id}`}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Video className="h-4 w-4" />
              <span>Resume Learning</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000"
                style={{ width: `${enrollment.progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                {enrollment.completedMaterialIds.length} of {enrolledCourse.materials.length} Lessons
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3 text-amber-400" />
                Assessment Ready
              </span>
            </div>
          </div>
        </div>

        {/* Catalog Quick Spotlight & CMS Bulletins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Catalog Spotlight */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>Recommended for Your Track</span>
              </h3>
              <Link href="/trainee/courses" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-0.5">
                <span>View All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {initialCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/trainee/courses/${c.id}`}
                  className="block rounded-2xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 hover:border-indigo-500/40 transition-all group hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-indigo-400 font-bold">{c.code}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {c.durationHours}h
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">{c.title}</h4>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">{c.trainerName}</span>
                    <span className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-0.5">
                      <span>Open</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Ministry CMS Bulletins */}
          <AnnouncementFeed />
        </div>
      </main>
    </div>
  );
}
