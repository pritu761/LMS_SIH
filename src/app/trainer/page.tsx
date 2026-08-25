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
  Sun,
  Moon,
  Sunrise,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { initialCourses, initialFeedbacks } from '@/lib/mockData';

function getGreeting(): { text: string; icon: React.ReactNode } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good morning', icon: <Sunrise className="h-5 w-5 text-amber-400" /> };
  if (hour < 17) return { text: 'Good afternoon', icon: <Sun className="h-5 w-5 text-amber-400" /> };
  return { text: 'Good evening', icon: <Moon className="h-5 w-5 text-indigo-400" /> };
}

export default function TrainerHubPage() {
  const course = initialCourses[0];
  const greeting = getGreeting();

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINER" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden animate-fade-in-up">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                FACULTY HUB
              </span>
              <span className="text-xs text-slate-400">Accredited Senior Faculty</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {greeting.icon}
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {greeting.text}, Prof. Vikramaditya Sen
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Principal Cloud Architect & Senior Faculty • National Institute of Smart Government
            </p>
          </div>
        </div>

        {/* Trainer KPIs */}
        <ScrollReveal animation="fade-up" delay={100}>
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
        </ScrollReveal>

        {/* Quick Action Navigation Buttons */}
        <ScrollReveal animation="fade-up" delay={200}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/trainer/library"
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-indigo-500/40 transition-all duration-500 group space-y-3 card-tilt hover:shadow-elevation-1"
            >
              <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:shadow-glow-sm transition-all duration-300">
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
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-500 group space-y-3 card-tilt hover:shadow-elevation-1"
            >
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:shadow-glow-cyan transition-all duration-300">
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
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl hover:border-emerald-500/40 transition-all duration-500 group space-y-3 card-tilt hover:shadow-elevation-1"
            >
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:shadow-glow-emerald transition-all duration-300">
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
        </ScrollReveal>

        {/* Active Module Curriculum & Recent Reviews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Course */}
          <ScrollReveal animation="fade-left" delay={100}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span>Active Assigned Course</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PUBLISHED
                </span>
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
                <div className="space-y-1.5 stagger-children">
                  {course.materials.map((m) => (
                    <div key={m.id} className="flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors">
                      <span className="truncate">{m.title}</span>
                      <span className="text-[10px] text-indigo-400 uppercase font-bold rounded bg-indigo-500/10 px-1.5 py-0.5">{m.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Qualitative Reviews Feed */}
          <ScrollReveal animation="fade-right" delay={200}>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </div>
                  <span>Recent Trainee Reviews</span>
                </h3>
                <span className="text-xs text-slate-400 rounded-lg bg-slate-800/60 px-2 py-1 border border-slate-700/50">Rating Impact: 30%</span>
              </div>

              <div className="space-y-3 stagger-children">
                {initialFeedbacks.map((fb) => (
                  <div key={fb.id} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4 space-y-2 hover:border-amber-500/20 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white text-xs">{fb.userName}</div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: fb.rating }, (_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-indigo-400 font-medium">{fb.userRole}</div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{fb.comment}&rdquo;</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}
