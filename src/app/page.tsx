'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen,
  Brain,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Video,
  FileCheck,
  TrendingUp,
  Sliders,
  Cpu,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { initialCourses } from '@/lib/mockData';

export default function HomePage() {
  const router = useRouter();

  // Interactive Live Algorithm Simulator on Hero
  const [skillOverlapSim, setSkillOverlapSim] = useState(88);
  const [ratingSim, setRatingSim] = useState(4.8);
  const [coursesSim, setCoursesSim] = useState(8);

  const calculatedSimScore = Math.round(
    skillOverlapSim * 0.55 + (ratingSim / 5.0) * 100 * 0.30 + Math.min(coursesSim / 10.0, 1.0) * 100 * 0.15
  );

  const handleQuickLogin = async (role: string) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TRAINER') router.push('/trainer');
        else router.push('/trainee');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-20 pb-24 relative overflow-hidden bg-grid-pattern">
      
      {/* Background Animated Ambient Lights */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute top-40 right-1/4 translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8 z-10">
        
        {/* Floating Verified Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-950/60 px-4 py-1.5 text-xs font-semibold text-indigo-300 backdrop-blur-xl shadow-lg shadow-indigo-500/20 hover:scale-105 transition-transform cursor-default">
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>National Digital Capacity Building Framework v2.4</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Empowering Public Governance with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent animate-aurora">
              Precision Intelligence
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Capacity Connect unifies role-based access control, timed proctored assessments, and automated 55/30/15 competency mapping on serverless PostgreSQL.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/auth/register"
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 hover:shadow-indigo-500/50"
          >
            <span>Register New Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/auth/login"
            className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800/90 px-7 py-4 text-sm font-semibold text-slate-200 transition-all hover:border-slate-600 backdrop-blur-md"
          >
            <span>Sign In with ID</span>
          </Link>
        </div>

        {/* Interactive Instant Demo Role Launcher Card */}
        <div className="pt-6 max-w-4xl mx-auto">
          <div className="rounded-3xl border border-indigo-500/30 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>Instant Evaluator Demo Login (1-Click Role Switcher)</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live Demo Mode Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => handleQuickLogin('TRAINEE')}
                className="rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 to-slate-950/80 hover:border-cyan-400 p-4 text-left transition-all group hover:-translate-y-1 shadow-lg shadow-cyan-950/20"
              >
                <div className="flex items-center justify-between">
                  <Award className="h-6 w-6 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 text-[10px] font-black text-cyan-300 border border-cyan-500/30">
                    TRAINEE
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-3 group-hover:text-cyan-200">
                  Aarav Patel
                </div>
                <div className="text-xs text-slate-400">Stream lectures, track progress & take timed MCQs</div>
              </button>

              <button
                onClick={() => handleQuickLogin('TRAINER')}
                className="rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-slate-950/80 hover:border-indigo-400 p-4 text-left transition-all group hover:-translate-y-1 shadow-lg shadow-indigo-950/20"
              >
                <div className="flex items-center justify-between">
                  <BookOpen className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 text-[10px] font-black text-indigo-300 border border-indigo-500/30">
                    TRAINER
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-3 group-hover:text-indigo-200">
                  Prof. Vikramaditya Sen
                </div>
                <div className="text-xs text-slate-400">Manage media library, create exams & cohort analytics</div>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN')}
                className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-950/80 hover:border-emerald-400 p-4 text-left transition-all group hover:-translate-y-1 shadow-lg shadow-emerald-950/20"
              >
                <div className="flex items-center justify-between">
                  <ShieldCheck className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                    SYSTEM ADMIN
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-3 group-hover:text-emerald-200">
                  Dr. Rajeshwari Sharma
                </div>
                <div className="text-xs text-slate-400">Approve users, manage RBAC & run competency matching</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sitewide KPI Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Active Trainees"
            value="25,480"
            change="14.2% vs last month"
            icon={Users}
            color="indigo"
          />
          <StatsCard
            title="Course Completion Rate"
            value="94.6%"
            change="3.1% YoY"
            icon={TrendingUp}
            color="emerald"
          />
          <StatsCard
            title="Verified Certifications"
            value="18,920"
            change="22.5% increase"
            icon={Award}
            color="cyan"
          />
          <StatsCard
            title="Accredited Faculty"
            value="480"
            change="100% verified"
            icon={ShieldCheck}
            color="amber"
          />
        </div>
      </section>

      {/* Interactive 55/30/15 Competency Algorithm Live Simulator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-md bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
                  INTERACTIVE ALGORITHM SIMULATOR
                </span>
                <span className="text-xs text-slate-400">Multi-Factor Compatibility Index</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <Brain className="h-7 w-7 text-indigo-400" />
                <span>Test the 55/30/15 Competency Matching Model Live</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Adjust the pedagogical parameters below to see the weighted compatibility score update instantly in real-time.
              </p>
            </div>

            {/* Calculated Output Score Box */}
            <div className="rounded-2xl bg-slate-950/80 border border-indigo-500/40 p-5 text-center sm:text-right min-w-[200px] shadow-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Compatibility Index
              </span>
              <div className="text-4xl font-black text-white mt-1">
                {calculatedSimScore}%
              </div>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider mt-1 border ${
                  calculatedSimScore >= 85
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : calculatedSimScore >= 70
                    ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}
              >
                {calculatedSimScore >= 85
                  ? 'HIGHLY RECOMMENDED'
                  : calculatedSimScore >= 70
                  ? 'QUALIFIED'
                  : 'NEEDS UPSKILLING'}
              </span>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Slider 1: Skill Overlap (55%) */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-400" /> Skill Overlap (55%)
                </span>
                <span className="font-mono font-bold text-white">{skillOverlapSim}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skillOverlapSim}
                onChange={(e) => setSkillOverlapSim(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="text-[11px] text-slate-400">
                Contribution: <span className="text-indigo-300 font-bold">{Math.round(skillOverlapSim * 0.55 * 10) / 10} / 55 pts</span>
              </div>
            </div>

            {/* Slider 2: Historical Rating (30%) */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Faculty Rating (30%)
                </span>
                <span className="font-mono font-bold text-white">{ratingSim} ★</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={ratingSim}
                onChange={(e) => setRatingSim(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="text-[11px] text-slate-400">
                Contribution: <span className="text-amber-300 font-bold">{Math.round((ratingSim / 5.0) * 100 * 0.30 * 10) / 10} / 30 pts</span>
              </div>
            </div>

            {/* Slider 3: Past Courses Delivered (15%) */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-5 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-cyan-400" /> Delivery Volume (15%)
                </span>
                <span className="font-mono font-bold text-white">{coursesSim} Courses</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={coursesSim}
                onChange={(e) => setCoursesSim(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="text-[11px] text-slate-400">
                Contribution: <span className="text-cyan-300 font-bold">{Math.round(Math.min(coursesSim / 10.0, 1.0) * 100 * 0.15 * 10) / 10} / 15 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Featured Sovereign Capacity Modules
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Accredited courses with video stream playback, slide deck downloads, and timed certifications.
            </p>
          </div>

          <Link
            href="/trainee/courses"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 hover:border-indigo-500/50 transition-all group hover:-translate-y-1 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20">
                  {course.code}
                </span>
                <span className="text-xs text-slate-400">{course.category}</span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                {course.title}
              </h3>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
                <div>Faculty: <span className="text-slate-200 font-medium">{course.trainerName}</span></div>
                <Link
                  href={`/trainee/courses/${course.id}`}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 px-4 py-2 font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  Stream Course
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
