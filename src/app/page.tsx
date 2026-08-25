'use client';

import React, { useState, useEffect } from 'react';
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
  Globe,
  Lock,
  BarChart3,
  Star,
  Rocket,
  Target,
} from 'lucide-react';
import { StatsCard } from '@/components/shared/StatsCard';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
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

  // Testimonials
  const testimonials = [
    {
      name: 'Dr. Meera Iyer',
      role: 'Director, NISG Hyderabad',
      quote: 'Capacity Connect transformed our training pipeline with measurable competency mapping and seamless course delivery.',
      rating: 5,
    },
    {
      name: 'Rakesh Nair IAS',
      role: 'Joint Secretary, MeitY',
      quote: 'The 55/30/15 matching algorithm optimized our faculty deployment across 12 states — a breakthrough in governance efficiency.',
      rating: 5,
    },
    {
      name: 'Priya Krishnamurthy',
      role: 'Lead Trainer, DARPG',
      quote: 'The proctored assessment engine and instant certification workflow reduced our evaluation cycle from weeks to hours.',
      rating: 5,
    },
  ];

  // How It Works steps
  const howItWorks = [
    {
      icon: Users,
      title: 'Register & Verify',
      description: 'Create your account with government credentials. Admin verifies and assigns your RBAC role within 24 hours.',
      color: 'from-cyan-500 to-indigo-500',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
    },
    {
      icon: BookOpen,
      title: 'Learn & Assess',
      description: 'Stream HD video lectures, download PDF resources, and complete timed proctored MCQ assessments.',
      color: 'from-indigo-500 to-purple-500',
      iconColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
    },
    {
      icon: Award,
      title: 'Certify & Grow',
      description: 'Earn verified competency credentials. Your profile rating feeds into the national 55/30/15 matching algorithm.',
      color: 'from-purple-500 to-emerald-500',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
    },
  ];

  // Trust badges
  const trustBadges = [
    'Digital India Initiative', 'MeitY Certified', 'NISG Framework',
    'DARPG Approved', 'Smart India Hackathon', 'NIC Infrastructure',
    'Digital India Initiative', 'MeitY Certified', 'NISG Framework',
    'DARPG Approved', 'Smart India Hackathon', 'NIC Infrastructure',
  ];

  return (
    <div suppressHydrationWarning className="flex-1 flex flex-col space-y-0 pb-0 relative overflow-hidden">
      
      {/* ════════════════ HERO SECTION (BRIDGEMIND STYLE) ════════════════ */}
      <section className="relative pt-16 sm:pt-28 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* BridgeMind Signature Aurora Beam & Split Radiant Lighting */}
        <div className="bridgemind-aurora" />
        <div className="bridgemind-beam" />

        <div className="max-w-7xl mx-auto text-center relative z-10">

          {/* Floating Verified Pill Badge */}
          <div className="animate-fade-in-down inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs font-semibold text-white backdrop-blur-xl shadow-2xl hover:scale-105 transition-transform cursor-default mb-8">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
            <span>The Sovereign Capacity Super App</span>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
            <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
              GovTech v2.4
            </span>
          </div>

          {/* Hero Title (BridgeMind commanding font) */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.04] animate-fade-in-up">
              The Capacity <br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-blue-300 bg-clip-text text-transparent">
                Super App
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              AI-driven competency matching, proctored exams, and sovereign institutional training that powers 25,000+ public sector leaders across India.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 animate-fade-in-up animation-delay-400">
            <Link
              href="/auth/register"
              className="btn-bridgemind-primary group gap-2.5"
            >
              <Sparkles className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-12" />
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/auth/login"
              className="btn-bridgemind-secondary group gap-2.5"
            >
              <Lock className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span>Sign In with ID</span>
            </Link>
          </div>

          {/* Interactive BridgeMind App Window Mockup */}
          <div className="pt-12 max-w-5xl mx-auto animate-slide-in-up animation-delay-600">
            <div className="bridgemind-window p-6 sm:p-8 text-left space-y-5">
              
              {/* macOS Window Titlebar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80 shadow-sm shadow-rose-500/40" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/40" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/40" />
                  </div>
                  <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                    <span className="text-xs font-black tracking-tight text-white">CapacityConnect <span className="text-blue-400 font-normal">One</span></span>
                  </div>
                </div>

                {/* Segmented workspace tabs */}
                <div className="hidden sm:flex items-center bg-[#0e0e16] border border-white/10 rounded-full p-1 text-[11px] font-bold text-slate-400">
                  <span className="px-3 py-1 bg-white/10 text-white rounded-full">Interactive Demo</span>
                  <span className="px-3 py-1">1-Click Switcher</span>
                </div>

                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sandbox
                </span>
              </div>

              {/* 1-Click Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 stagger-children">
                <button
                  onClick={() => handleQuickLogin('TRAINEE')}
                  className="rounded-2xl border border-white/10 bg-[#0c0c13] hover:border-cyan-500/50 p-5 text-left transition-all group hover:-translate-y-1 hover:shadow-glow-cyan"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Award className="h-5 w-5 text-cyan-400" />
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-black text-cyan-300 border border-cyan-500/20">
                      TRAINEE
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-3 group-hover:text-cyan-200 transition-colors">
                    Aarav Patel
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Stream lectures, track progress & take timed MCQs</div>
                </button>

                <button
                  onClick={() => handleQuickLogin('TRAINER')}
                  className="rounded-2xl border border-white/10 bg-[#0c0c13] hover:border-blue-500/50 p-5 text-left transition-all group hover:-translate-y-1 hover:shadow-glow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-black text-blue-300 border border-blue-500/20">
                      TRAINER
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-3 group-hover:text-blue-200 transition-colors">
                    Prof. Vikramaditya Sen
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Manage media library, create exams & cohort analytics</div>
                </button>

                <button
                  onClick={() => handleQuickLogin('ADMIN')}
                  className="rounded-2xl border border-white/10 bg-[#0c0c13] hover:border-emerald-500/50 p-5 text-left transition-all group hover:-translate-y-1 hover:shadow-glow-emerald"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/20">
                      SYSTEM ADMIN
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-3 group-hover:text-emerald-200 transition-colors">
                    Dr. Rajeshwari Sharma
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Approve users, manage RBAC & run competency matching</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST BADGE MARQUEE ════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="py-6 border-y border-white/10 bg-black/60 backdrop-blur-md">
          <div className="marquee-container">
            <div className="marquee-track">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-[#09090e] whitespace-nowrap">
                  <Globe className="h-3.5 w-3.5 text-blue-400/80" />
                  <span className="text-xs font-semibold text-slate-300">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ SITEWIDE KPI COUNTERS ════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-300 mb-4">
              <BarChart3 className="h-3.5 w-3.5" />
              Platform Intelligence
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              National Impact at Scale
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Real-time metrics from the Capacity Connect platform powering India&apos;s civil service capacity building.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bridgemind-card p-6 overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Trainees</span>
                <div className="rounded-xl p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={25480} separator="," />
                </div>
                <span className="text-xs font-bold text-emerald-400">↑ 14.2%</span>
              </div>
            </div>

            <div className="bridgemind-card p-6 overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion Rate</span>
                <div className="rounded-xl p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={94.6} decimals={1} suffix="%" />
                </div>
                <span className="text-xs font-bold text-emerald-400">↑ 3.1% YoY</span>
              </div>
            </div>

            <div className="bridgemind-card p-6 overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Certifications</span>
                <div className="rounded-xl p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={18920} separator="," />
                </div>
                <span className="text-xs font-bold text-emerald-400">↑ 22.5%</span>
              </div>
            </div>

            <div className="bridgemind-card p-6 overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Faculty</span>
                <div className="rounded-xl p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={480} />
                </div>
                <span className="text-xs font-bold text-emerald-400">100% verified</span>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-bold text-cyan-300 mb-4">
              <Rocket className="h-3.5 w-3.5" />
              Getting Started
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Three Steps to Certification
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              From registration to verified credentials in a seamless digital workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-[2px]">
              <div className="h-full bg-gradient-to-r from-blue-500/40 via-amber-500/40 to-emerald-500/40" />
            </div>

            {howItWorks.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <ScrollReveal key={index} animation="slide-up" delay={index * 150}>
                  <div className="relative text-center space-y-4 group">
                    {/* Step number & icon */}
                    <div className="relative inline-flex">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} p-[1px] shadow-lg group-hover:scale-110 transition-all duration-500`}>
                        <div className="h-full w-full rounded-[15px] bg-black flex items-center justify-center">
                          <StepIcon className={`h-7 w-7 ${step.iconColor}`} />
                        </div>
                      </div>
                      <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-black border border-white/20 flex items-center justify-center text-xs font-black text-white">
                        {index + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ INTERACTIVE ALGORITHM SIMULATOR (BRIDGEMIND CARD) ════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="bridgemind-window p-6 sm:p-10 space-y-8 relative overflow-hidden">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
                    INTERACTIVE ALGORITHM SIMULATOR
                  </span>
                  <span className="text-xs text-slate-400">Multi-Factor Compatibility Index</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-blue-400" />
                  </div>
                  <span>Test the 55/30/15 Competency Model Live</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
                  Adjust the pedagogical parameters below to see the weighted compatibility score update instantly in real-time.
                </p>
              </div>

              {/* Calculated Output Score Box */}
              <div className="rounded-2xl bg-black border border-white/15 p-6 text-center sm:text-right min-w-[200px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                    Compatibility Index
                  </span>
                  <div className="text-5xl font-black text-white mt-1 tabular-nums">
                    {calculatedSimScore}%
                  </div>
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider mt-2 border ${
                      calculatedSimScore >= 85
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : calculatedSimScore >= 70
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
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
            </div>

            {/* Interactive Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Slider 1: Skill Overlap (55%) */}
              <div className="rounded-2xl bg-[#0c0c14] border border-white/10 p-5 space-y-3 hover:border-blue-500/40 transition-colors duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-blue-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-blue-400" /> Skill Overlap (55%)
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">{skillOverlapSim}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillOverlapSim}
                  onChange={(e) => setSkillOverlapSim(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="text-[11px] text-slate-400">
                  Contribution: <span className="text-blue-300 font-bold tabular-nums">{Math.round(skillOverlapSim * 0.55 * 10) / 10} / 55 pts</span>
                </div>
              </div>

              {/* Slider 2: Historical Rating (30%) */}
              <div className="rounded-2xl bg-[#0c0c14] border border-white/10 p-5 space-y-3 hover:border-amber-500/40 transition-colors duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Faculty Rating (30%)
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">{ratingSim} ★</span>
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
                  Contribution: <span className="text-amber-300 font-bold tabular-nums">{Math.round((ratingSim / 5.0) * 100 * 0.30 * 10) / 10} / 30 pts</span>
                </div>
              </div>

              {/* Slider 3: Past Courses Delivered (15%) */}
              <div className="rounded-2xl bg-[#0c0c14] border border-white/10 p-5 space-y-3 hover:border-cyan-500/40 transition-colors duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-cyan-400" /> Delivery Volume (15%)
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">{coursesSim} Courses</span>
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
                  Contribution: <span className="text-cyan-300 font-bold tabular-nums">{Math.round(Math.min(coursesSim / 10.0, 1.0) * 100 * 0.15 * 10) / 10} / 15 pts</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-300 mb-4">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by Government Leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={i} animation="slide-up" delay={i * 120}>
                <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl space-y-4 hover:border-indigo-500/30 transition-all duration-500 card-tilt group">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: t.rating }, (_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="pt-3 border-t border-slate-800/60">
                    <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{t.name}</div>
                    <div className="text-xs text-slate-400">{t.role}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ FEATURED COURSES SHOWCASE ════════════════ */}
      <ScrollReveal animation="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-bold text-purple-300 mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                Course Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Featured Sovereign Capacity Modules
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Accredited courses with video stream playback, slide deck downloads, and timed certifications.
              </p>
            </div>

            <Link
              href="/trainee/courses"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
            >
              <span>Browse Full Catalog</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialCourses.map((course, idx) => (
              <ScrollReveal key={course.id} animation="slide-up" delay={idx * 100}>
                <div
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 hover:border-indigo-500/40 transition-all duration-500 group hover:-translate-y-1 shadow-xl hover:shadow-elevation-2 card-tilt"
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

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                    <div>Faculty: <span className="text-slate-200 font-medium">{course.trainerName}</span></div>
                    <Link
                      href={`/trainee/courses/${course.id}`}
                      className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white hover:from-indigo-500 hover:to-indigo-400 px-4 py-2 font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105 btn-shimmer"
                    >
                      Stream Course
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ FINAL CTA (BRIDGEMIND STYLE) ════════════════ */}
      <ScrollReveal animation="scale">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="bridgemind-window p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Ready to Upgrade Your Capacity Pipeline?
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
                Join thousands of civil servants across India who are building verified competencies through Capacity Connect&apos;s intelligent learning platform.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <Link
                  href="/auth/register"
                  className="btn-bridgemind-primary group gap-2.5"
                >
                  <Sparkles className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-12" />
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-bridgemind-secondary group gap-2.5"
                >
                  <Lock className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  <span>Sign In with ID</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
