'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Fingerprint,
  Radio,
  Binary,
  Activity,
  Flame,
  Compass,
  Radar,
  CloudRain,
  Satellite,
  Code2,
  Terminal,
  Play,
  GitBranch,
  ArrowUpRight,
  ExternalLink,
  Mail,
  Send,
} from 'lucide-react';
import { SpotlightCard } from '@/components/shared/SpotlightCard';
import { NestCodePlayground } from '@/components/shared/NestCodePlayground';
import { NestEcosystemShowcase } from '@/components/shared/NestEcosystemShowcase';
import { MotionSection } from '@/components/shared/MotionPrimitives';
import { ease } from '@/lib/animations';
import { initialCourses } from '@/lib/mockData';

export default function HomePage() {
  const router = useRouter();

  // Interactive Live Algorithm Simulator on Hero
  const [skillOverlapSim, setSkillOverlapSim] = useState(92);
  const [ratingSim, setRatingSim] = useState(4.9);
  const [coursesSim, setCoursesSim] = useState(12);

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

  // IMD & Mission Mausam Testimonials
  const testimonials = [
    {
      name: 'Dr. Mrutyunjay Mohapatra',
      role: 'Director General of Meteorology, IMD',
      badge: 'Mission Mausam National Lead',
      quote:
        'Capacity Connect transforms meteorological training by replacing static course tracking with precision competency mapping across Doppler radars, NWP, and HPC modelling.',
      rating: 5,
    },
    {
      name: 'Dr. M. Ravichandran',
      role: 'Secretary, Ministry of Earth Sciences (MoES)',
      badge: 'Sovereign Capacity Mandate',
      quote:
        'The 55/30/15 faculty allocation algorithm and real-time competency gap analysis directly advance Mission Mausam capacity building objectives across all regional centres.',
      rating: 5,
    },
    {
      name: 'Dr. S. Balachandran',
      role: 'Head, Regional Meteorological Centre (RMC Chennai)',
      badge: 'Operational Cyclone Forecaster Lead',
      quote:
        'The Dual-Polarization radar nowcasting assessments and 1-click gap upskilling path reduced our operational forecaster certification cycle from months to days.',
      rating: 5,
    },
  ];

  // IMD Training Pathways
  const imdTrainingPathways = [
    {
      code: 'IMTC',
      title: 'Integrated Meteorological Training Course',
      audience: 'Foundational Officers & Observers',
      duration: '4 Months Foundation',
      icon: Compass,
      color: 'from-blue-500 to-indigo-600',
      description:
        'Atmospheric thermodynamics, surface synoptic charting, INSAT-3DS image interpretation, and standard WMO METAR code generation.',
    },
    {
      code: 'FTC',
      title: 'Forecasters Training Course',
      audience: 'Operational Weather & Cyclone Forecasters',
      duration: '6 Months Operational',
      icon: CloudRain,
      color: 'from-cyan-500 to-blue-600',
      description:
        'Dual-Polarization Doppler Weather Radar interpretation, tropical cyclone track forecasting, and color-coded alert dissemination.',
    },
    {
      code: 'DRSTC',
      title: 'Direct Recruited Scientists Training Course',
      audience: 'Inducted Scientists-B / C (IMD / IITM / NCMRWF)',
      duration: '12 Months Comprehensive',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-600',
      description:
        'Earth-system dynamics, non-hydrostatic governing equations, MPI/OpenMP parallelization on Pratyush/Mihir HPC, and 4D-Var data assimilation.',
    },
    {
      code: 'MODULAR',
      title: 'Modular Specialized In-Service Training',
      audience: 'In-Service Officers & Domain Specialists',
      duration: '2 to 6 Weeks Intensive',
      icon: Sparkles,
      color: 'from-amber-500 to-emerald-600',
      description:
        'Physics-informed AI/ML precipitation nowcasting, convective storm modelling, and next-generation radar network telemetry.',
    },
  ];

  // NestJS-inspired Architectural Pillars
  const architecturalPillars = [
    {
      title: 'Modular Cadre Architecture',
      badge: 'MODULES',
      icon: Layers,
      color: '#ff4d6d',
      desc: 'Encapsulated domain boundaries separating DRSTC, FTC, and IMTC syllabus logic with clean Inversion-of-Control dependency contracts.',
    },
    {
      title: 'Inversion of Control DI',
      badge: 'DEPENDENCY INJECTION',
      icon: Cpu,
      color: '#38bdf8',
      desc: 'Automated skill gap injection binding deficient competencies to accredited trainer repositories and high-performance labs.',
    },
    {
      title: 'Strict Type-Safe Rubrics',
      badge: 'TYPESCRIPT DTOs',
      icon: ShieldCheck,
      color: '#34d399',
      desc: 'End-to-end type safety for Doppler Radar and NWP assessments with strict schema validation and runtime sanity guards.',
    },
    {
      title: 'Enterprise Scalability',
      badge: 'MISSION CRITICAL',
      icon: Radio,
      color: '#fbbf24',
      desc: 'Engineered for nationwide coordination across 38 Doppler Weather Radar installations and MoES supercomputing clusters.',
    },
    {
      title: 'Event-Driven Microservices',
      badge: 'WEBSOCKETS & PUB/SUB',
      icon: Zap,
      color: '#c084fc',
      desc: 'Low-latency telemetry streaming for live radar nowcasting simulations and instant cohort alert broadcasting.',
    },
    {
      title: 'Pratyush/Mihir HPC Parallelism',
      badge: 'HIGH PERFORMANCE',
      icon: Binary,
      color: '#f43f5e',
      desc: 'MPI & OpenMP parallelized governing equations sandbox for numerical weather prediction model runs.',
    },
  ];

  // Trust badges
  const trustBadges = [
    'Mission Mausam National Initiative',
    'India Meteorological Department (IMD)',
    'Ministry of Earth Sciences (MoES)',
    'Indian Institute of Tropical Meteorology (IITM Pune)',
    'NCMRWF Supercomputing',
    'World Meteorological Organization (WMO) RTC',
    'ISRO Space Applications Centre',
    'National Disaster Management Authority (NDMA)',
    'Mission Mausam National Initiative',
    'India Meteorological Department (IMD)',
    'Ministry of Earth Sciences (MoES)',
    'Indian Institute of Tropical Meteorology (IITM Pune)',
  ];

  return (
    <div
      suppressHydrationWarning
      className="flex-1 flex flex-col space-y-0 pb-0 relative overflow-hidden transition-colors duration-500 selection:bg-[#e0234e] selection:text-white bg-[#050303] text-white"
    >
      {/* ════════════════ NESTJS FRAMED HERO SECTION ════════════════ */}
      <section className="sm:p-8 p-3 w-full">
        <div className="relative rounded-[24px] sm:rounded-[36px] overflow-hidden min-h-[780px] xl:min-h-[850px] border border-[#e0234e]/30 shadow-2xl shadow-[#e0234e]/20 flex flex-col justify-between p-6 sm:p-12 lg:p-16 nestjs-hero-bg">
          
          {/* Ambient Glowing Aurora Mesh */}
          <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#e0234e]/40 via-transparent to-transparent" />
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#ff4d6d]/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[#780f20]/30 blur-[150px] pointer-events-none" />

          {/* Hero Center Text & Actions */}
          <div className="relative z-10 text-center max-w-5xl mx-auto py-12 sm:py-20 space-y-6">
            
            {/* Top Mission Mausam Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#e0234e]/15 border border-[#e0234e]/40 text-xs font-mono font-bold text-[#ff758c] mb-2 shadow-lg shadow-[#e0234e]/10"
            >
              <span className="h-2 w-2 rounded-full bg-[#e0234e] animate-ping" />
              <span>MISSION MAUSAM • MINISTRY OF EARTH SCIENCES & IMD</span>
            </motion.div>

            {/* Giant NestJS Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: ease.smooth }}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-white"
            >
              More than just a <br />
              <span className="text-nestjs-gradient text-nestjs-glow">Learning Platform</span>
            </motion.h1>

            {/* Monospace Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: ease.smooth }}
              className="font-mono text-xs sm:text-sm md:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed opacity-90"
            >
              CapacityConnect is the national meteorological competency engine engineered for the{' '}
              <strong className="text-white">India Meteorological Department (IMD)</strong> to dynamically assess officer skills, resolve cadre gaps, and match certified faculty via our weighted 55/30/15 algorithm.
            </motion.p>

            {/* Dual Iconic NestJS CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: ease.smooth }}
              className="flex flex-wrap items-center justify-center gap-4 pt-6"
            >
              <Link href="/admin/competency" className="btn-nestjs-primary group">
                <Brain className="h-4 w-4 text-[#e0234e]" />
                <span>Launch Competency Engine</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link href="/trainee" className="btn-nestjs-secondary group">
                <Compass className="h-4 w-4 text-slate-400 group-hover:text-[#ff758c] transition-colors" />
                <span>Explore Trainee Hub</span>
              </Link>
            </motion.div>

            {/* Strategic Mandate Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 max-w-4xl mx-auto rounded-3xl border border-white/10 bg-black/60 p-4 sm:p-5 backdrop-blur-xl text-left flex items-start gap-4 shadow-xl"
            >
              <div className="h-9 w-9 rounded-xl bg-[#e0234e]/20 border border-[#e0234e]/30 flex items-center justify-center shrink-0 text-[#ff4d6d] mt-1">
                <Radio className="h-4 w-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff758c] bg-[#e0234e]/10 px-2 py-0.5 rounded border border-[#e0234e]/20">
                    Sovereign Mandate
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Directive 2025–2026</span>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  &ldquo;A unified competency-driven platform synchronizing 38 Doppler Radars, NWP, and HPC modelling for the nation.&rdquo;
                </p>
              </div>
            </motion.div>
          </div>

          {/* 1-Click Direct Role Sandbox Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: ease.smooth }}
            className="relative z-10 w-full max-w-5xl mx-auto rounded-3xl bg-[#090306]/90 border border-white/10 p-4 sm:p-6 backdrop-blur-2xl space-y-3 shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/10 text-xs font-mono gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold text-white">1-Click Live Persona Sandbox</span>
              </div>
              <span className="text-slate-400 text-[11px]">Instant Direct Authentication</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickLogin('TRAINEE')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-[#e0234e]/15 border border-white/5 hover:border-[#e0234e]/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-[#e0234e]/20 text-[#ff4d6d] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#ff758c] bg-[#e0234e]/10 px-2 py-0.5 rounded border border-[#e0234e]/20">
                    DRSTC INDUCTEE
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-[#ff758c] transition-colors">
                  Aarav Patel (Scientist-B)
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">NWP Division • Radar Gaps</div>
              </button>

              <button
                onClick={() => handleQuickLogin('TRAINER')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    LEAD FACULTY
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Prof. Vikramaditya Sen
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">MTI Pune / IITM • NetCDF Labs</div>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN')}
                className="w-full text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-emerald-500/15 border border-white/5 hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    DIRECTOR GENERAL
                  </span>
                </div>
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Dr. Mrutyunjay Mohapatra
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">National DG • 55/30/15 Allocations</div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ TERMINAL TRUST MARQUEE ════════════════ */}
      <section className="py-8 border-y border-white/10 bg-[#030102]">
        <div className="max-w-7xl mx-auto px-4 text-center mb-4">
          <div className="font-mono text-xs text-slate-400 flex items-center justify-center gap-1.5">
            <span className="text-[#ff4d6d] font-bold">//</span>
            <span>TRUSTED BY LEADING METEOROLOGICAL & DEFENSE INSTITUTIONS</span>
            <span className="cursor-blink text-[#ff4d6d]">_</span>
          </div>
        </div>

        <div className="marquee-container">
          <div className="marquee-track">
            {trustBadges.map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-[#0c0407] whitespace-nowrap text-xs font-mono text-slate-300 hover:border-[#e0234e]/40 transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-[#ff4d6d]" />
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ NESTJS ARCHITECTURE BENTO GRID ════════════════ */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e0234e]/10 border border-[#e0234e]/30 px-4 py-1.5 text-xs font-bold text-[#ff4d6d] font-mono">
            <Layers className="h-3.5 w-3.5" />
            THE ARCHITECTURAL PILLARS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Engineered with NestJS Paradigm
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Combines Object-Oriented modularity, Inversion of Control, and Functional Reactive telemetry for robust sovereign scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {architecturalPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <MotionSection key={pillar.badge} variant="slide-up" delay={idx * 80}>
                <div className="nestjs-bento-card p-6 h-full flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border"
                        style={{
                          backgroundColor: `${pillar.color}15`,
                          borderColor: `${pillar.color}35`,
                          color: pillar.color,
                        }}
                      >
                        {pillar.badge}
                      </span>
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                        style={{
                          backgroundColor: `${pillar.color}20`,
                          color: pillar.color,
                        }}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-[#ff758c] transition-colors">
                      {pillar.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Verified Core</span>
                    <span className="text-[#ff4d6d] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Active <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </MotionSection>
            );
          })}
        </div>
      </section>

      {/* ════════════════ INTERACTIVE CODE PLAYGROUND ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 font-mono">
            <Code2 className="h-3.5 w-3.5" />
            LIVE CODE PLAYGROUND
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Inspect the Platform Decorators
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Click through our TypeScript modules, controllers, and guards, and execute live IoC dependency tests.
          </p>
        </div>

        <NestCodePlayground />
      </section>

      {/* ════════════════ ECOSYSTEM & TOOLS SHOWCASE ════════════════ */}
      <section id="ecosystem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/30 px-4 py-1.5 text-xs font-bold text-purple-300 font-mono">
            <Rocket className="h-3.5 w-3.5" />
            THE SUITE OF TOOLS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Integrated Capacity Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Explore Observe telemetry, DevTools dependency visualizer, Deploy batch manager, and Accredited Masterclasses.
          </p>
        </div>

        <NestEcosystemShowcase />
      </section>

      {/* ════════════════ 55/30/15 ALLOCATION SIMULATOR ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="rounded-[32px] bg-gradient-to-br from-[#0e0408] via-[#1a070e] to-[#0a0205] border border-[#e0234e]/30 p-6 sm:p-10 space-y-8 relative overflow-hidden shadow-2xl shadow-[#e0234e]/10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-[#e0234e]/15 px-3 py-1 text-xs font-mono font-bold text-[#ff4d6d] border border-[#e0234e]/30">
                  KEY DIFFERENTIATOR • 55/30/15 ALGORITHM
                </span>
                <span className="text-xs text-slate-400 font-mono">IoC Provider</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#e0234e]/10 border border-[#e0234e]/20 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-[#ff4d6d]" />
                </div>
                <span>Pedagogical Allocation Engine</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                Answers the institutional imperative: <em>&ldquo;What skills does an officer have, what is missing for their cadre, and which trainer is best suited to close that gap?&rdquo;</em>
              </p>
            </div>

            {/* Calculated Output Score Box */}
            <div className="rounded-2xl bg-[#090b12] border border-[#e0234e]/30 p-6 text-center sm:text-right min-w-[220px] shadow-2xl shadow-[#e0234e]/15 relative overflow-hidden">
              <div className="relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff4d6d] font-mono">
                  Faculty Compatibility Index
                </span>
                <div className="text-5xl font-black text-white mt-1 tabular-nums font-mono">
                  {calculatedSimScore}%
                </div>
                <span
                  className={`inline-block rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider mt-2 border font-mono ${
                    calculatedSimScore >= 85
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : calculatedSimScore >= 70
                      ? 'bg-[#e0234e]/10 text-[#ff4d6d] border-[#e0234e]/30'
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
            {/* Slider 1: Radar/NWP Skill Overlap (55%) */}
            <div className="rounded-2xl bg-[#0c0407] border border-white/10 p-5 space-y-3 hover:border-[#e0234e]/50 transition-colors duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#ff4d6d] flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#ff4d6d]" /> Radar/NWP Skill Overlap (55%)
                </span>
                <span className="font-mono font-bold text-white tabular-nums">{skillOverlapSim}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skillOverlapSim}
                onChange={(e) => setSkillOverlapSim(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#e0234e]"
              />
              <div className="text-[11px] text-slate-400">
                Contribution: <span className="text-[#ff758c] font-bold tabular-nums font-mono">{Math.round(skillOverlapSim * 0.55 * 10) / 10} / 55 pts</span>
              </div>
            </div>

            {/* Slider 2: Historical Rating (30%) */}
            <div className="rounded-2xl bg-[#0c0407] border border-white/10 p-5 space-y-3 hover:border-amber-500/40 transition-colors duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Faculty Review Score (30%)
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
                Contribution: <span className="text-amber-300 font-bold tabular-nums font-mono">{Math.round((ratingSim / 5.0) * 100 * 0.30 * 10) / 10} / 30 pts</span>
              </div>
            </div>

            {/* Slider 3: Past Courses Delivered (15%) */}
            <div className="rounded-2xl bg-[#0c0407] border border-white/10 p-5 space-y-3 hover:border-indigo-500/40 transition-colors duration-300">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> Cohorts Delivered (15%)
                </span>
                <span className="font-mono font-bold text-white tabular-nums">{coursesSim} Batches</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={coursesSim}
                onChange={(e) => setCoursesSim(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
              />
              <div className="text-[11px] text-slate-400">
                Contribution: <span className="text-indigo-300 font-bold tabular-nums font-mono">{Math.round(Math.min(coursesSim / 10.0, 1.0) * 100 * 0.15 * 10) / 10} / 15 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ IMD TRAINING CADRE PATHWAYS ════════════════ */}
      <section id="pathways" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e0234e]/10 border border-[#e0234e]/30 px-4 py-1.5 text-xs font-bold text-[#ff4d6d] font-mono">
            <Compass className="h-3.5 w-3.5" />
            AUTHENTIC IMD CADRES
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            4 Specialized Capacity Pathways
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Designed around how the India Meteorological Department and Ministry of Earth Sciences actually conduct structured capacity building.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {imdTrainingPathways.map((cadre, idx) => {
            const CadreIcon = cadre.icon;
            return (
              <MotionSection key={cadre.code} variant="slide-up" delay={idx * 80}>
                <SpotlightCard spotlightColor="rgba(224, 35, 78, 0.28)" className="space-y-4 h-full flex flex-col justify-between group hover:border-[#e0234e]/60 transition-all shadow-lg hover:shadow-[#e0234e]/15">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[#e0234e]/15 px-2.5 py-1 text-xs font-mono font-bold text-[#ff4d6d] border border-[#e0234e]/30">
                        {cadre.code} TRACK
                      </span>
                      <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#ff4d6d] group-hover:scale-110 group-hover:bg-[#e0234e]/20 transition-all">
                        <CadreIcon className="h-5 w-5" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#ff758c] transition-colors leading-snug">
                      {cadre.title}
                    </h3>

                    <div className="text-[11px] text-[#ff758c] font-medium">
                      Audience: {cadre.audience}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cadre.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                    <span>{cadre.duration}</span>
                    <span className="text-[#ff4d6d] font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      Mapped <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </SpotlightCard>
              </MotionSection>
            );
          })}
        </div>
      </section>

      {/* ════════════════ FEATURED COURSES SHOWCASE ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-bold text-purple-300 mb-3 font-mono">
              <BookOpen className="h-3.5 w-3.5" />
              OFFICIAL IMD CURRICULUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Featured Mission Mausam Modules
            </h2>
          </div>

          <Link
            href="/trainee/courses"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#ff758c] hover:text-white transition-colors group"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialCourses.map((course, idx) => (
            <MotionSection key={course.id} variant="slide-up" delay={idx * 100}>
              <SpotlightCard spotlightColor="rgba(224, 35, 78, 0.2)" className="space-y-4 group h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#e0234e]/10 px-2.5 py-1 text-xs font-bold text-[#ff4d6d] border border-[#e0234e]/20 font-mono">
                      {course.code} • {course.cadreTrack} TRACK
                    </span>
                    <span className="text-xs text-slate-400">{course.category}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#ff758c] transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs text-slate-400">
                  <div>Faculty: <span className="text-slate-200 font-medium">{course.trainerName}</span></div>
                  <Link
                    href={`/trainee/courses/${course.id}`}
                    className="rounded-full bg-[#e0234e] hover:bg-[#ff2d55] text-white px-4 py-2 font-bold shadow-md shadow-[#e0234e]/30 transition-all hover:scale-105"
                  >
                    Stream Module
                  </Link>
                </div>
              </SpotlightCard>
            </MotionSection>
          ))}
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-300 mb-4 font-mono">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            INSTITUTIONAL ENDORSEMENTS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Trusted by IMD & MoES Leadership
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <MotionSection key={i} variant="slide-up" delay={i * 100}>
              <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.2)" className="space-y-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: t.rating }, (_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic mt-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </SpotlightCard>
            </MotionSection>
          ))}
        </div>
      </section>

      {/* ════════════════ FINAL INSTITUTIONAL CTA ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="rounded-[36px] bg-gradient-to-r from-[#17050a] via-[#3a0815] to-[#120408] border border-[#e0234e]/40 p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl shadow-[#e0234e]/20">
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e0234e]/20 border border-[#e0234e]/40 px-4 py-1.5 text-xs font-mono font-bold text-[#ff758c]">
              <Radio className="h-3.5 w-3.5 animate-pulse text-[#ff4d6d]" />
              MISSION MAUSAM CAPACITY READY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Accelerate Meteorological Competency Nationwide
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Connect scientists, operational forecasters, and senior faculty across India on a single competency-driven digital learning ecosystem.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/admin/competency" className="btn-nestjs-primary group">
                <Brain className="h-4 w-4 text-[#e0234e]" />
                <span>Run Competency Gap Analysis</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/auth/login" className="btn-nestjs-secondary group">
                <Lock className="h-4 w-4 text-slate-400 group-hover:text-[#ff758c] transition-colors" />
                <span>Sign In with Gov ID</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
