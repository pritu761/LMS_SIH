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
  Sun,
  Moon,
  Sunrise,
  Radio,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { AnnouncementFeed } from '@/components/shared/AnnouncementFeed';
import { Sidebar } from '@/components/layout/Sidebar';
import { MotionSection } from '@/components/shared/MotionPrimitives';
import { TraineeSkillGapCard } from '@/components/trainee/TraineeSkillGapCard';
import { initialCourses, initialEnrollments, initialUsers } from '@/lib/mockData';

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: <Sunrise className="h-5 w-5 text-amber-400" /> };
  if (hour < 17) return { text: 'Good afternoon', icon: <Sun className="h-5 w-5 text-amber-400" /> };
  return { text: 'Good evening', icon: <Moon className="h-5 w-5 text-indigo-400" /> };
}

export default function TraineeDashboard() {
  const enrollment = initialEnrollments[0];
  const enrolledCourse = initialCourses.find((c) => c.id === enrollment.courseId) || initialCourses[0];
  const [userName, setUserName] = useState('Aarav Patel');
  const greeting = getGreeting();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserName(d.user.fullName || d.user.profile?.fullName || 'Aarav Patel');
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0 space-y-6">

        {/* Trainee Welcome Header - retains dark hero for contrast in both modes */}
        <div className="rounded-3xl border border-[#c59b48]/30 bg-gradient-to-br from-[#0b1e36]/90 via-[#102744] to-[#081526] p-6 sm:p-8 backdrop-blur-xl space-y-3 relative overflow-hidden animate-fade-in-up shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#c59b48]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c59b48]/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48]/60 to-transparent animate-gradient-shift bg-[length:200%_100%]" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#c59b48]/15 px-2.5 py-0.5 text-xs font-bold text-[#dfb76c] border border-[#c59b48]/30">
                MISSION MAUSAM • DRSTC INDUCTION
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                Active Cadre Track
              </span>
            </div>
            <div className="flex items-center gap-3 mt-2" suppressHydrationWarning>
              {greeting.icon}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" suppressHydrationWarning>
                {greeting.text}, {userName}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Scientist-B • Numerical Weather Prediction Division, Mausam Bhavan, New Delhi
            </p>
          </div>
        </div>

        {/* Trainee KPIs */}
        <MotionSection variant="fade-up" delay={100}>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatsCard
              title="Active Curriculum"
              value="1 Module"
              change="DRSTC-101 (50%)"
              icon={BookOpen}
              color="indigo"
            />
            <StatsCard
              title="Verified Skills"
              value="6 Mapped"
              change="NWP, HPC, Satellite"
              icon={Award}
              color="cyan"
            />
            <StatsCard
              title="Cadre Readiness"
              value="64%"
              change="DRSTC 2026 Batch"
              icon={Target}
              color="emerald"
            />
            <StatsCard
              title="Skill Gaps"
              value="2 Deficits"
              change="Radar & AI Focus"
              icon={TrendingUp}
              color="amber"
            />
          </div>
        </MotionSection>

        {/* Key Differentiator: Personal Competency Gap & Cadre Progression Recommender */}
        <MotionSection variant="fade-up" delay={150}>
          <TraineeSkillGapCard />
        </MotionSection>

        {/* Active Enrolled Course Banner */}
        <MotionSection variant="fade-up" delay={200}>
          <div className="rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-indigo-50 dark:from-indigo-950/40 via-white dark:via-slate-900/80 to-white dark:to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-elevation-2 space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none animate-breathe" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Flame className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                    IN PROGRESS • {enrollment.progressPercentage}% COMPLETE
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{enrolledCourse.cadreTrack} Track • {enrolledCourse.category}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {enrolledCourse.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Delivered by <span className="text-slate-900 dark:text-white font-semibold">{enrolledCourse.trainerName}</span> ({enrolledCourse.trainerSpecialization})
                </p>
              </div>

              <Link
                href={`/trainee/courses/${enrolledCourse.id}`}
                className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 hover:shadow-glow-md btn-shimmer"
              >
                <Video className="h-4 w-4" />
                <span>Resume Lecture</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Animated Progress bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-1000 relative"
                  style={{ width: `${enrollment.progressPercentage}%` }}
                >
                  <div className="absolute inset-0 animate-stripe opacity-30 rounded-full" />
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                  {enrollment.completedMaterialIds.length} of {enrolledCourse.materials.length} Modules Completed
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                  Exam Window Ready
                </span>
              </div>
            </div>
          </div>
        </MotionSection>

        {/* Catalog Quick Spotlight & CMS Bulletins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Catalog Spotlight */}
          <MotionSection variant="fade-left" delay={100}>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <span>Mission Mausam Curated Catalog</span>
                </h3>
                <Link href="/trainee/courses" className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors flex items-center gap-0.5 group">
                  <span>View All</span>
                  <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              <div className="space-y-3 stagger-children">
                {initialCourses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/trainee/courses/${c.id}`}
                    className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 p-4 space-y-2 hover:border-indigo-500/40 transition-all duration-300 group hover:-translate-y-0.5 hover:shadow-elevation-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{c.code} • {c.cadreTrack}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {c.durationHours}h
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors leading-snug">{c.title}</h4>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.trainerName}</span>
                      <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 flex items-center gap-0.5">
                        <span>Open</span>
                        <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </MotionSection>

          {/* Ministry CMS Bulletins */}
          <MotionSection variant="fade-right" delay={200}>
            <AnnouncementFeed />
          </MotionSection>
        </div>
      </main>
    </div>
  );
}