'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
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
} from 'lucide-react';
import { SpotlightCard } from '@/components/shared/SpotlightCard';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import {
  MotionSection,
  MotionStagger,
  MotionCard,
  MotionButton,
  MotionText,
  Parallax,
  Magnetic,
  MotionCounter,
} from '@/components/shared/MotionPrimitives';
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  fadeInDown,
  slideInUp,
  scaleIn,
  hoverGlow,
  hoverLift,
  ease,
} from '@/lib/animations';
import { initialCourses, initialCadres } from '@/lib/mockData';
import { useVisualTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const router = useRouter();
  const { theme, config } = useVisualTheme();

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
      quote: 'Capacity Connect transforms meteorological training by replacing static course tracking with precision competency mapping across Doppler radars, NWP, and HPC modelling.',
      rating: 5,
    },
    {
      name: 'Dr. M. Ravichandran',
      role: 'Secretary, Ministry of Earth Sciences (MoES)',
      badge: 'Sovereign Capacity Mandate',
      quote: 'The 55/30/15 faculty allocation algorithm and real-time competency gap analysis directly advance Mission Mausam capacity building objectives across all regional centres.',
      rating: 5,
    },
    {
      name: 'Dr. S. Balachandran',
      role: 'Head, Regional Meteorological Centre (RMC Chennai)',
      badge: 'Operational Cyclone Forecaster Lead',
      quote: 'The Dual-Polarization radar nowcasting assessments and 1-click gap upskilling path reduced our operational forecaster certification cycle from months to days.',
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
      description: 'Atmospheric thermodynamics, surface synoptic charting, INSAT-3DS image interpretation, and standard WMO METAR code generation.',
    },
    {
      code: 'FTC',
      title: 'Forecasters Training Course',
      audience: 'Operational Weather & Cyclone Forecasters',
      duration: '6 Months Operational',
      icon: CloudRain,
      color: 'from-cyan-500 to-blue-600',
      description: 'Dual-Polarization Doppler Weather Radar interpretation, tropical cyclone track forecasting, and color-coded alert dissemination.',
    },
    {
      code: 'DRSTC',
      title: 'Direct Recruited Scientists Training Course',
      audience: 'Inducted Scientists-B / C (IMD / IITM / NCMRWF)',
      duration: '12 Months Comprehensive',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-600',
      description: 'Earth-system dynamics, non-hydrostatic governing equations, MPI/OpenMP parallelization on Pratyush/Mihir HPC, and 4D-Var data assimilation.',
    },
    {
      code: 'MODULAR',
      title: 'Modular Specialized In-Service Training',
      audience: 'In-Service Officers & Domain Specialists',
      duration: '2 to 6 Weeks Intensive',
      icon: Sparkles,
      color: 'from-amber-500 to-emerald-600',
      description: 'Physics-informed AI/ML precipitation nowcasting, convective storm modelling, and next-generation radar network telemetry.',
    },
  ];

  // Trust badges
  const trustBadges = [
    'Mission Mausam National Initiative', 'India Meteorological Department (IMD)', 'Ministry of Earth Sciences (MoES)',
    'National Institute of Tropical Meteorology (IITM)', 'NCMRWF Supercomputing', 'World Meteorological Organization (WMO) RTC',
    'Mission Mausam National Initiative', 'India Meteorological Department (IMD)', 'Ministry of Earth Sciences (MoES)',
    'National Institute of Tropical Meteorology (IITM)', 'NCMRWF Supercomputing', 'World Meteorological Organization (WMO) RTC',
  ];

  return (
    <div suppressHydrationWarning className="flex-1 flex flex-col space-y-0 pb-0 relative overflow-hidden transition-colors duration-500 selection:bg-cyan-500 selection:text-black">

      {/* ════════════════ HERO SECTION ════════════════ */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Multi-Spectral Aurora & Radar Horizon */}
        <div className="cyber-grid absolute inset-0 pointer-events-none opacity-60" />
        <motion.div
          className="bridgemind-aurora"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: ease.smooth }}
        />
        <motion.div
          className="bridgemind-beam"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 620 }}
          transition={{ duration: 1.2, delay: 0.2, ease: ease.smooth }}
        />

        <div className="max-w-7xl mx-auto text-center relative z-10">

          {/* Floating Mission Mausam Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: ease.smooth }}
            className="badge-iridescent mb-6 cursor-default inline-flex"
          >
            <Satellite className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span>Mission Mausam • Ministry of Earth Sciences & IMD</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              NATIONAL CAPACITY PLATFORM
            </span>
          </motion.div>

          {/* Hero Title */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <motion.h1
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: ease.smooth }}
            >
              Digital Capacity Building & <br />
              <span className="text-chrome">Competency Mapping</span>{' '}
              <span className="text-aurora">for Mission Mausam</span>
            </motion.h1>
            <motion.p
              className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: ease.smooth }}
            >
              An institutional platform engineered for the <strong>India Meteorological Department (IMD)</strong> to dynamically assess officer competencies, pinpoint cadre skill gaps (DRSTC, FTC, IMTC), and match top-ranked faculty using our weighted 55/30/15 pedagogical allocation engine.
            </motion.p>
          </div>

          {/* Strategic Justification Box */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: ease.smooth }}
            className="mt-8 max-w-4xl mx-auto rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-cyan-950/60 p-5 sm:p-6 backdrop-blur-xl text-left relative overflow-hidden shadow-2xl"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 text-indigo-400 mt-1">
                <Radio className="h-5 w-5" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Strategic Mandate Justification
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic">
                  &ldquo;As meteorological services increasingly incorporate AI/ML, high-performance computing (Pratyush/Mihir), next-generation Dual-Pol Doppler radars, INSAT-3DS satellites, and Earth-system modelling, a centralized competency-oriented digital learning platform continuously develops and tracks the vital skills required by the nation.&rdquo;
                </p>
                <div className="text-[11px] text-slate-400 font-medium pt-1">
                  — Ministry of Earth Sciences (MoES) & IMD Capacity Building Directive 2025–2026
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-5 pt-8"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: ease.smooth }}
          >
            <Link
              href="/admin/competency"
              className="btn-conic-glow group"
            >
              <div className="btn-conic-glow-inner gap-2.5">
                <Brain className="h-4 w-4 text-cyan-400" />
                <span>Launch Competency Matcher</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            <Link
              href="/trainee"
              className="btn-bridgemind-secondary group gap-2.5"
            >
              <Compass className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span>Explore Trainee Cadre Gap Hub</span>
            </Link>
          </motion.div>

          {/* 1-Click Interactive Persona Sandbox */}
          <motion.div
            className="pt-14 max-w-5xl mx-auto relative"
            initial={{ opacity: 0, y: 70, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.9, ease: ease.smooth }}
          >
            <div className="bridgemind-window p-6 sm:p-8 text-left space-y-5 relative">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                    <span className="text-xs font-black tracking-tight text-white">
                      CapacityConnect <span className="text-cyan-400 font-mono text-[11px]">Mission Mausam Live Sandbox</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    1-Click Direct Role Login
                  </span>
                </div>
              </div>

              {/* 3 Role Quick Login Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <button onClick={() => handleQuickLogin('TRAINEE')} className="w-full text-left">
                  <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.25)" className="hover:border-cyan-500/50 group h-full">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Award className="h-5 w-5 text-cyan-400" />
                      </div>
                      <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-black text-cyan-300 border border-cyan-500/20 font-mono">
                        DRSTC INDUCTEE
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 group-hover:text-cyan-400 transition-colors">
                      Aarav Patel (Scientist-B)
                    </div>
                    <div className="text-xs text-slate-400 mt-1">NWP Division • View personalized radar gaps & stream lectures</div>
                  </SpotlightCard>
                </button>

                <button onClick={() => handleQuickLogin('TRAINER')} className="w-full text-left">
                  <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.25)" className="hover:border-indigo-500/50 group h-full">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <BookOpen className="h-5 w-5 text-indigo-400" />
                      </div>
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[9px] font-black text-indigo-300 border border-indigo-500/20 font-mono">
                        LEAD FACULTY
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 group-hover:text-indigo-400 transition-colors">
                      Prof. Vikramaditya Sen
                    </div>
                    <div className="text-xs text-slate-400 mt-1">MTI Pune / IITM • Manage NetCDF materials & author exams</div>
                  </SpotlightCard>
                </button>

                <button onClick={() => handleQuickLogin('ADMIN')} className="w-full text-left">
                  <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)" className="hover:border-emerald-500/50 group h-full">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/20 font-mono">
                        DIRECTOR GENERAL
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-3 group-hover:text-emerald-400 transition-colors">
                      Dr. Mrutyunjay Mohapatra
                    </div>
                    <div className="text-xs text-slate-400 mt-1">National DG • Competency Gap Radar & 55/30/15 Allocations</div>
                  </SpotlightCard>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════ TRUST BADGE MARQUEE ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="py-6 border-y border-white/10 bg-black/80 backdrop-blur-md">
          <div className="marquee-container">
            <div className="marquee-track">
              {trustBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-6 py-2 rounded-full border border-white/10 bg-[#09090e] whitespace-nowrap">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-slate-300">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MotionSection>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* ════════════════ IMD TRAINING CADRE PATHWAYS SHOWCASE ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-bold text-cyan-300 font-mono">
              <Compass className="h-3.5 w-3.5" />
              AUTHENTIC IMD TRAINING ENVIRONMENT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              4 Specialized IMD Training Cadres
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Designed around how the India Meteorological Department and Ministry of Earth Sciences actually conduct structured capacity building.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {imdTrainingPathways.map((cadre, idx) => {
              const CadreIcon = cadre.icon;
              return (
                <MotionSection key={cadre.code} variant="slide-up" delay={idx * 100}>
                  <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.25)" className="space-y-4 h-full flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-cyan-500/15 px-2.5 py-1 text-xs font-mono font-bold text-cyan-300 border border-cyan-500/30">
                          {cadre.code} TRACK
                        </span>
                        <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <CadreIcon className="h-5 w-5" />
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
                        {cadre.title}
                      </h3>

                      <div className="text-[11px] text-indigo-300 font-medium">
                        Audience: {cadre.audience}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {cadre.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>{cadre.duration}</span>
                      <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                        Mapped <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </SpotlightCard>
                </MotionSection>
              );
            })}
          </div>
        </section>
      </MotionSection>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* ════════════════ KEY DIFFERENTIATOR: COMPETENCY GAP & 55/30/15 SIMULATOR ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="bridgemind-window p-6 sm:p-10 space-y-8 relative overflow-hidden">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-mono font-bold text-cyan-300 border border-cyan-500/30">
                    KEY DIFFERENTIATOR • 55/30/15 ALGORITHM
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Mission Mausam Intelligence</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-cyan-400" />
                  </div>
                  <span>Meteorological Competency Matching Engine</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                  Answers the institutional imperative: <em>&ldquo;What skills does an officer have, what is missing for their cadre, and which trainer/course is best suited to close that gap?&rdquo;</em>
                </p>
              </div>

              {/* Calculated Output Score Box */}
              <div className="rounded-2xl bg-black border border-white/15 p-6 text-center sm:text-right min-w-[220px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 font-mono">
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
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
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
              
              {/* Slider 1: Meteorological Skill Overlap (55%) */}
              <div className="rounded-2xl bg-[#0c0c14] border border-white/10 p-5 space-y-3 hover:border-cyan-500/40 transition-colors duration-300">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-cyan-400" /> Radar/NWP Skill Overlap (55%)
                  </span>
                  <span className="font-mono font-bold text-white tabular-nums">{skillOverlapSim}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={skillOverlapSim}
                  onChange={(e) => setSkillOverlapSim(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="text-[11px] text-slate-400">
                  Contribution: <span className="text-cyan-300 font-bold tabular-nums font-mono">{Math.round(skillOverlapSim * 0.55 * 10) / 10} / 55 pts</span>
                </div>
              </div>

              {/* Slider 2: Historical Rating (30%) */}
              <div className="rounded-2xl bg-[#0c0c14] border border-white/10 p-5 space-y-3 hover:border-amber-500/40 transition-colors duration-300">
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
              <div className="rounded-2xl bg-[#0c0c14] border border-white/10 p-5 space-y-3 hover:border-indigo-500/40 transition-colors duration-300">
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
      </MotionSection>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <MotionSection variant="fade-up">
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
              <MotionSection key={i} variant="slide-up" delay={i * 120}>
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
      </MotionSection>

      {/* ════════════════ FEATURED COURSES SHOWCASE ════════════════ */}
      <MotionSection variant="fade-up">
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
              <p className="text-xs text-slate-400 mt-1">
                Accredited training tracks covering DRSTC, FTC, IMTC, and Modular AI/HPC specializations.
              </p>
            </div>

            <Link
              href="/trainee/courses"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
            >
              <span>Browse Full IMD Catalog</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialCourses.map((course, idx) => (
              <MotionSection key={course.id} variant="slide-up" delay={idx * 100}>
                <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.2)" className="space-y-4 group h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-400 border border-cyan-500/20 font-mono">
                        {course.code} • {course.cadreTrack} TRACK
                      </span>
                      <span className="text-xs text-slate-400">{course.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
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
                      className="rounded-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:from-indigo-500 hover:to-cyan-500 px-4 py-2 font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      Stream Module
                    </Link>
                  </div>
                </SpotlightCard>
              </MotionSection>
            ))}
          </div>
        </section>
      </MotionSection>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* ════════════════ FINAL CTA ════════════════ */}
      <MotionSection variant="scale">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="bridgemind-window p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-4 py-1.5 text-xs font-mono font-bold text-cyan-300">
                <Radio className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                MISSION MAUSAM CAPACITY READY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Accelerate Meteorological Competency Nationwide
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Connect scientists, operational forecasters, and senior faculty across India on a single competency-driven digital learning ecosystem.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
                <Link
                  href="/admin/competency"
                  className="btn-conic-glow group"
                >
                  <div className="btn-conic-glow-inner gap-2.5">
                    <Brain className="h-4 w-4 text-cyan-400" />
                    <span>Run Competency Gap Analysis</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-bridgemind-secondary group gap-2.5"
                >
                  <Lock className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  <span>Sign In with Gov ID</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </MotionSection>
    </div>
  );
}
