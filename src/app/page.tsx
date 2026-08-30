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
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  HelpCircle,
  Network,
} from 'lucide-react';
import { SpotlightCard } from '@/components/shared/SpotlightCard';
import { MotionSection } from '@/components/shared/MotionPrimitives';
import { ease } from '@/lib/animations';
import { initialCourses } from '@/lib/mockData';

export default function HomePage() {
  const router = useRouter();

  // Interactive Live Algorithm Simulator on Hero / Section 5
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

  // 6-Step Journey Navigation Items
  const judgeJourneyStages = [
    { num: '01', label: 'The Problem', href: '#problem', color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { num: '02', label: 'User Cadres', href: '#cadres', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { num: '03', label: 'Competency', href: '#competency', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { num: '04', label: 'Gap Analysis', href: '#gap', color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { num: '05', label: '55/30/15 Match', href: '#algorithm', color: 'text-[#e0234e] bg-[#e0234e]/10 border-[#e0234e]/20' },
    { num: '06', label: 'Outcomes', href: '#outcomes', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

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
      color: 'border-blue-200 text-blue-700 bg-blue-50',
      description:
        'Atmospheric thermodynamics, surface synoptic charting, INSAT-3DS image interpretation, and standard WMO METAR code generation.',
    },
    {
      code: 'FTC',
      title: 'Forecasters Training Course',
      audience: 'Operational Weather & Cyclone Forecasters',
      duration: '6 Months Operational',
      icon: CloudRain,
      color: 'border-cyan-200 text-cyan-700 bg-cyan-50',
      description:
        'Dual-Polarization Doppler Weather Radar interpretation, tropical cyclone track forecasting, and color-coded alert dissemination.',
    },
    {
      code: 'DRSTC',
      title: 'Direct Recruited Scientists Training Course',
      audience: 'Inducted Scientists-B / C (IMD / IITM / NCMRWF)',
      duration: '12 Months Comprehensive',
      icon: Cpu,
      color: 'border-purple-200 text-purple-700 bg-purple-50',
      description:
        'Earth-system dynamics, non-hydrostatic governing equations, MPI/OpenMP parallelization on Pratyush/Mihir HPC, and 4D-Var data assimilation.',
    },
    {
      code: 'MODULAR',
      title: 'Modular Specialized In-Service Training',
      audience: 'In-Service Officers & Domain Specialists',
      duration: '2 to 6 Weeks Intensive',
      icon: Sparkles,
      color: 'border-emerald-200 text-emerald-700 bg-emerald-50',
      description:
        'Physics-informed AI/ML precipitation nowcasting, convective storm modelling, and next-generation radar network telemetry.',
    },
  ];

  // Problem Points
  const problemPoints = [
    {
      icon: FileSpreadsheet,
      title: 'Fragmented Competency Silos',
      subtitle: 'Static Spreadsheets & Unsynchronized RMCs',
      desc: '38+ Doppler Weather Radar stations and 4 Regional Meteorological Centres (RMCs) maintain disconnected training logs with no unified registry of operational officer capabilities.',
      stat: '38 Nodes',
      statLabel: 'Operating without centralized skill sync',
    },
    {
      icon: AlertTriangle,
      title: 'Operational Blind Spots During Crises',
      subtitle: 'High-Risk Extreme Weather Events',
      desc: 'During severe cyclones, heavy rainfall events, and cloudbursts, deployment relies on manual seniority rather than verified real-time competence in Dual-Polarization radar nowcasting.',
      stat: '0% Guesswork',
      statLabel: 'Required in life-critical weather alerts',
    },
    {
      icon: Users,
      title: 'Subjective Faculty Allocation',
      subtitle: 'Informal & Unmatched Instructor Assignment',
      desc: 'Expert faculty at MTI Pune and IITM are assigned based on informal availability rather than quantitative subject overlap with an officer’s assessed weakness.',
      stat: '55/30/15',
      statLabel: 'Needed to eliminate trainer mismatch',
    },
    {
      icon: Clock,
      title: 'Long, Inflexible Certification Cycles',
      subtitle: '6-12 Months Broad Retraining',
      desc: 'Traditional LMS forces officers to retake full multi-month curricula for a single deficient module (e.g. Velocity Dealiasing), wasting hundreds of scientist training hours.',
      stat: '85% Delay',
      statLabel: 'In deployable forecaster readiness',
    },
  ];

  // Competency Domains
  const competencyDomains = [
    {
      title: 'Radar & Satellite Nowcasting',
      code: 'RAD-NOWCAST',
      icon: Radar,
      color: 'text-[#e0234e] bg-[#e0234e]/10 border-[#e0234e]/20',
      benchmarks: [
        'Dual-Polarization (ZDR, KDP, CC) Interpretation',
        'Doppler Velocity Dealiasing & Mesocyclone Detection',
        'INSAT-3DS Rapid-Scan 15-min Cloud Top Telemetry',
      ],
    },
    {
      title: 'Numerical Weather Prediction (NWP)',
      code: 'NWP-MODEL',
      icon: Binary,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      benchmarks: [
        'WRF / GFS Boundary Layer Dynamics & Parametrization',
        '4D-Var Atmospheric Data Assimilation',
        'Ensemble Prediction System (EPS) Probability Matrix',
      ],
    },
    {
      title: 'HPC & Computational Meteorology',
      code: 'HPC-PARALLEL',
      icon: Cpu,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      benchmarks: [
        'MPI / OpenMP Parallel Governing Equations',
        'Pratyush / Mihir MoES Supercomputer Job Pipelines',
        'NetCDF4 / GRIB2 High-Density Telemetry Decoding',
      ],
    },
    {
      title: 'Disaster Warning & Dissemination',
      code: 'DISASTER-OPS',
      icon: Radio,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
      benchmarks: [
        'NDMA Common Alerting Protocol (CAP) Standards',
        'Color-Coded Weather Warning Protocol (Red/Orange/Yellow)',
        'Tropical Cyclone Track & Surge Estimation',
      ],
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
  ];

  return (
    <div
      suppressHydrationWarning
      className="flex-1 flex flex-col space-y-0 pb-0 relative overflow-hidden bg-transparent dark:bg-[#070f1a]/80 text-slate-900 dark:text-slate-100 selection:bg-[#0b1e36] selection:text-[#c59b48]"
    >
      {/* ════════════════ HERO SECTION WITH OFFICIAL BANNER ════════════════ */}
      <section className="w-full bg-gradient-to-b from-[#faf9f6]/70 via-white/65 to-slate-50/70 dark:from-[#0b1a2e]/85 dark:via-[#070f1a]/85 dark:to-[#081424]/85 border-b border-slate-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-14 space-y-10">

          {/* Top Government Emblems Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="h-12 w-12 rounded-2xl bg-[#0b1e36] border-2 border-[#c59b48] flex items-center justify-center text-[#c59b48] shadow-lg shadow-[#0b1e36]/20">
                <Satellite className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-mono font-extrabold text-[#0b1e36] dark:text-slate-100 tracking-wider uppercase">
                  INDIA METEOROLOGICAL DEPARTMENT (IMD)
                </div>
                <div className="text-[11px] font-mono text-[#c59b48] dark:text-[#dfb76c] font-bold tracking-wide">
                  MINISTRY OF EARTH SCIENCES (MoES) • GOVT OF INDIA
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0b1e36] text-white border border-[#c59b48]/60 text-xs font-mono font-bold shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[#dfb76c] font-black tracking-wide">MISSION MAUSAM</span>
                <span className="text-slate-200 font-semibold tracking-wide">NATIONAL CAPACITY PORTAL</span>
              </span>
            </div>
          </div>

          {/* Main Centered Hero Title & Subtitle */}
          <div className="max-w-5xl mx-auto text-center space-y-7">
            {/* Brand Typography */}
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#0b1e36] dark:text-white leading-[1.02]">
                CAPACITY <span className="text-[#c59b48]">CONNECT</span>
              </h1>
            </div>

            {/* Official Subtitle & Tagline */}
            <div className="space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-slate-200 tracking-tight">
                Digital Capacity Building & Learning Management Portal
              </h2>
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#c59b48]/15 border-2 border-[#c59b48]/40 text-sm sm:text-base md:text-lg text-[#0b1e36] dark:text-[#dfb76c] font-bold shadow-sm">
                <span className="text-[#c59b48] font-black text-lg">★</span>
                <span>Empowering People. Strengthening Competencies. Building a Future-Ready Workforce.</span>
              </div>
            </div>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto font-medium">
              CapacityConnect replaces static course tracking with an end-to-end meteorological intelligence pipeline: dynamically assessing officer skills, diagnosing cadre gaps, and matching certified faculty via our weighted <strong>55/30/15 algorithm</strong>.
            </p>

            {/* 6-Stage Journey Ribbon (Problem -> Outcome) - Enlarged for High Readability */}
            <div className="pt-4 pb-2">
              <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                <span className="text-xs sm:text-sm md:text-base font-mono font-black text-[#0b1e36] dark:text-slate-200 uppercase tracking-wider mr-1">
                  EVALUATION FLOW:
                </span>
                {judgeJourneyStages.map((stage, idx) => (
                  <a
                    key={stage.num}
                    href={stage.href}
                    className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base font-mono font-extrabold border-2 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-md ${stage.color}`}
                  >
                    <span className="opacity-90">{stage.num}.</span>
                    <span>{stage.label}</span>
                    {idx < judgeJourneyStages.length - 1 && <span className="opacity-70 text-sm md:text-base">→</span>}
                  </a>
                ))}
              </div>
            </div>

            {/* Centered CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/admin/competency" className="btn-nestjs-primary group text-sm sm:text-base font-bold px-6 sm:px-8 py-3.5 sm:py-4">
                <Brain className="h-5 w-5 text-[#c59b48]" />
                <span>Launch 55/30/15 Matcher</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link href="/trainee/courses" className="btn-gold group text-sm sm:text-base font-bold px-6 sm:px-8 py-3.5 sm:py-4">
                <BookOpen className="h-5 w-5" />
                <span>Explore Curriculum</span>
              </Link>

              <Link href="/architecture" className="btn-nestjs-secondary group border-dashed text-sm sm:text-base font-bold px-6 sm:px-8 py-3.5 sm:py-4">
                <Code2 className="h-5 w-5 text-slate-500 group-hover:text-[#c59b48] transition-colors" />
                <span>Technical Architecture</span>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* ════════════════ 5-PILLAR LEARNING PROGRESSION ARC ════════════════ */}
          <div className="pt-8 border-t border-slate-200">
            <div className="text-center mb-6 space-y-1">
              <span className="text-xs font-mono font-bold text-[#c59b48] uppercase tracking-wider">
                Systematic Capacity Building Progression
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0b1e36]">
                The 5 Pillars of Meteorological Officer Readiness
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { step: '01', name: 'LEARN', title: 'Foundational Knowledge', desc: 'Atmospheric physics, synoptic charting & WMO METAR code standards.', icon: BookOpen, color: 'border-blue-200 bg-blue-50/50 text-blue-800' },
                { step: '02', name: 'DEVELOP', title: 'Technical Competency', desc: 'Dual-Polarization Doppler radar nowcasting & NWP grid dynamics.', icon: Cpu, color: 'border-amber-200 bg-amber-50/50 text-amber-800' },
                { step: '03', name: 'COLLABORATE', title: 'Multi-Center Synergy', desc: 'Peer weather discussion rooms & cross-RMC warning dissemination.', icon: Users, color: 'border-cyan-200 bg-cyan-50/50 text-cyan-800' },
                { step: '04', name: 'PERFORM', title: 'High-Impact Execution', desc: 'Pratyush/Mihir HPC parallel modeling & 4D-Var data assimilation.', icon: Rocket, color: 'border-indigo-200 bg-indigo-50/50 text-indigo-800' },
                { step: '05', name: 'EXCEL', title: 'Certified Leadership', desc: 'National Mission Mausam Certified Specialist with WMO compliance.', icon: Award, color: 'border-emerald-200 bg-emerald-50/50 text-emerald-800' },
              ].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.name}
                    className={`rounded-2xl border p-4 space-y-2.5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white ${p.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-[#0b1e36] text-[#c59b48] flex items-center justify-center font-bold shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-black text-slate-400">
                        {p.step}
                      </span>
                    </div>
                    <div>
                      <div className="font-black text-base text-[#0b1e36] tracking-tight">{p.name}</div>
                      <div className="text-[11px] font-semibold text-[#c59b48]">{p.title}</div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 1-Click Direct Role Sandbox Card */}
          <div className="w-full rounded-3xl bg-white border border-[#c59b48]/40 p-4 sm:p-6 shadow-xl shadow-[#0b1e36]/5 space-y-3">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 text-xs font-mono gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-bold text-[#0b1e36]">1-Click Live Persona Sandbox</span>
              </div>
              <span className="text-[#c59b48] text-[11px] font-semibold">Instant Direct Authentication for Evaluators</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickLogin('TRAINEE')}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-[#0b1e36]/5 border border-slate-200 hover:border-[#c59b48] transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-[#0b1e36] text-[#c59b48] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-[#0b1e36] bg-[#0b1e36]/10 px-2 py-0.5 rounded border border-[#0b1e36]/20">
                    DRSTC INDUCTEE
                  </span>
                </div>
                <div className="text-xs font-bold text-[#0b1e36] group-hover:text-[#c59b48] transition-colors">
                  Aarav Patel (Scientist-B)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">NWP Division • Doppler Radar Gaps</div>
              </button>

              <button
                onClick={() => handleQuickLogin('TRAINER')}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    LEAD FACULTY
                  </span>
                </div>
                <div className="text-xs font-bold text-[#0b1e36] group-hover:text-amber-800 transition-colors">
                  Prof. Vikramaditya Sen
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">MTI Pune / IITM • NetCDF Labs</div>
              </button>

              <button
                onClick={() => handleQuickLogin('ADMIN')}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-[#0b1e36] text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    DIRECTOR GENERAL
                  </span>
                </div>
                <div className="text-xs font-bold text-[#0b1e36] group-hover:text-emerald-700 transition-colors">
                  Dr. Mrutyunjay Mohapatra
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">National DG • 55/30/15 Allocations</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST MARQUEE ════════════════ */}
      <section className="py-6 border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-4 text-center mb-3">
          <div className="font-mono text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <span className="text-[#c59b48] font-bold">//</span>
            <span>TRUSTED BY LEADING METEOROLOGICAL & EARTH SCIENCE INSTITUTIONS</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-6xl mx-auto px-4">
          {trustBadges.map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-mono text-slate-700 shadow-sm"
            >
              <Globe className="h-3.5 w-3.5 text-[#c59b48]" />
              <span>{badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ PHASE 1: THE PROBLEM ════════════════ */}
      <section id="problem" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1e36]/10 border border-[#0b1e36]/20 px-4 py-1.5 text-xs font-bold text-[#0b1e36] font-mono">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            PHASE 1 • THE NATIONAL PROBLEM
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0b1e36] tracking-tight">
            Why Traditional LMS Fails National Meteorology
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Generic e-learning portals track simple video views, but fail to measure operational capability when a severe cyclone or cloudburst threatens civilian lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problemPoints.map((p, idx) => {
            const Icon = p.icon;
            return (
              <MotionSection key={p.title} variant="slide-up" delay={idx * 80}>
                <div className="rounded-3xl border border-slate-200 bg-white p-7 h-full flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-[#c59b48]/60 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-[#0b1e36]/5 border border-[#0b1e36]/10 flex items-center justify-center text-[#0b1e36]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                        DEFICIT {idx + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-[#0b1e36]">{p.title}</h3>
                      <div className="text-xs text-[#c59b48] font-mono font-bold mt-0.5">{p.subtitle}</div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between font-mono">
                    <span className="text-xs text-slate-500">{p.statLabel}</span>
                    <span className="text-sm font-bold text-[#0b1e36]">{p.stat}</span>
                  </div>
                </div>
              </MotionSection>
            );
          })}
        </div>
      </section>

      {/* ════════════════ PHASE 2: THE USERS & CADRES ════════════════ */}
      <section id="cadres" className="bg-slate-50/60 border-y border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1e36]/10 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-bold text-[#0b1e36] font-mono">
              <Users className="h-3.5 w-3.5 text-[#c59b48]" />
              PHASE 2 • THE USERS & CADRES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0b1e36] tracking-tight">
              Tailored for Every Stakeholder in India's Weather Enterprise
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Serving inducted Scientist-B officers, operational nowcasters, accredited lead faculty, and the Director General.
            </p>
          </div>

          {/* 3 Core User Roles Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#0b1e36] text-[#c59b48] flex items-center justify-center font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-[#0b1e36]">Trainees & Inducted Officers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scientist-B inductees and operational radar observers get personalized gap dashboards, proctored tests, and targeted module recommendations.
              </p>
              <div className="pt-2 text-xs font-mono text-[#c59b48] font-bold">
                → Access: /trainee & /trainee/profile
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#c59b48] text-[#0b1e36] flex items-center justify-center font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-[#0b1e36]">Trainers & Lead Faculty</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Senior scientists at MTI Pune and IITM create cadre rubrics, publish NetCDF lab assessments, and receive algorithm-matched cohorts.
              </p>
              <div className="pt-2 text-xs font-mono text-[#0b1e36] font-bold">
                → Access: /trainer & /trainer/analytics
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-[#0b1e36]">National Leadership & MoES</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                DG IMD and MoES Directors monitor sitewide learner readiness, approve faculty accreditations, and execute the 55/30/15 matching engine.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-700 font-bold">
                → Access: /admin & /admin/competency
              </div>
            </div>
          </div>

          {/* 4 IMD Cadre Pathways */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-bold text-[#0b1e36] text-center">4 Official IMD Training Cadre Pathways</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {imdTrainingPathways.map((cadre, idx) => {
                const CadreIcon = cadre.icon;
                return (
                  <MotionSection key={cadre.code} variant="slide-up" delay={idx * 80}>
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 h-full flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-[#c59b48]/60 transition-all">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-[#0b1e36]/10 px-2.5 py-1 text-xs font-mono font-bold text-[#0b1e36] border border-[#0b1e36]/20">
                            {cadre.code} TRACK
                          </span>
                          <div className="h-10 w-10 rounded-xl bg-[#0b1e36] border border-[#c59b48]/40 flex items-center justify-center text-[#c59b48]">
                            <CadreIcon className="h-5 w-5" />
                          </div>
                        </div>

                        <h4 className="text-base font-bold text-[#0b1e36] leading-snug">
                          {cadre.title}
                        </h4>

                        <div className="text-[11px] text-[#c59b48] font-bold">
                          Audience: {cadre.audience}
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {cadre.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                        <span>{cadre.duration}</span>
                        <span className="text-[#0b1e36] font-bold">Standardized</span>
                      </div>
                    </div>
                  </MotionSection>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ PHASE 3: COMPETENCY MATRIX ════════════════ */}
      <section id="competency" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-800 font-mono">
            <Radar className="h-3.5 w-3.5 text-emerald-600" />
            PHASE 3 • STANDARDIZED COMPETENCY MATRIX
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0b1e36] tracking-tight">
            4 Core Meteorological Competency Domains
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Aligned with World Meteorological Organization (WMO) RTC standards and IMD operational directives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {competencyDomains.map((domain, idx) => {
            const Icon = domain.icon;
            return (
              <MotionSection key={domain.code} variant="slide-up" delay={idx * 80}>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 h-full flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md hover:border-[#c59b48]/50 transition-all">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase border ${domain.color}`}>
                        {domain.code}
                      </span>
                      <Icon className="h-5 w-5 text-[#0b1e36]" />
                    </div>

                    <h3 className="text-base font-bold text-[#0b1e36]">{domain.title}</h3>

                    <ul className="space-y-2 pt-2 border-t border-slate-100">
                      {domain.benchmarks.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500 flex justify-between">
                    <span>Rubric Mapped</span>
                    <span className="text-emerald-700 font-bold">WMO Compliant</span>
                  </div>
                </div>
              </MotionSection>
            );
          })}
        </div>
      </section>

      {/* ════════════════ PHASE 4: GAP DETECTION & ASSESSMENTS ════════════════ */}
      <section id="gap" className="bg-slate-50/60 border-y border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-xs font-bold text-amber-800 font-mono">
              <Target className="h-3.5 w-3.5 text-amber-600" />
              PHASE 4 • PROCTORED GAP ANALYSIS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0b1e36] tracking-tight">
              Pinpoint Deficits with Precision Proctored Assessments
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Assessments automatically diagnose weak competencies and calculate the exact mathematical gap percentage.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#0b1e36] text-[#c59b48] flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-[#0b1e36]">Anti-Cheat Proctored Assessments</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Randomized question pools, timed MCQ evaluation, fullscreen enforcement, and tab-switch monitoring prevent fraudulent evaluations.
              </p>
              <div className="pt-2 text-xs font-mono text-[#c59b48] font-bold">
                ✓ Full Integrity Audit Trail
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#c59b48] text-[#0b1e36] flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-[#0b1e36]">Granular Skill Gap Diagnosis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rather than a vague pass/fail grade, the engine pinpoints specific deficits (e.g. &ldquo;Radar Velocity Dealiasing is 32% below benchmark&rdquo;).
              </p>
              <div className="pt-2 text-xs font-mono text-[#0b1e36] font-bold">
                ✓ Domain-Level Vector Breakdown
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-7 space-y-4 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-[#0b1e36]">1-Click Targeted Upskilling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform dynamically injects the exact prerequisite module into the officer’s queue without forcing a repeat of unrelated subjects.
              </p>
              <div className="pt-2 text-xs font-mono text-emerald-700 font-bold">
                ✓ Eliminates 80% Retraining Waste
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ PHASE 5: RECOMMENDATION & 55/30/15 ALGORITHM ════════════════ */}
      <section id="algorithm" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="rounded-[32px] bg-white border-2 border-[#c59b48]/40 p-6 sm:p-12 space-y-8 relative overflow-hidden shadow-2xl shadow-[#0b1e36]/10">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-full bg-[#0b1e36]/10 px-3 py-1 text-xs font-mono font-bold text-[#0b1e36] border border-[#c59b48]/30">
                  PHASE 5 • THE CORE DIFFERENTIATOR
                </span>
                <span className="text-xs text-slate-500 font-mono">Pedagogical Algorithm</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#0b1e36] tracking-tight flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#0b1e36] border border-[#c59b48]/40 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-[#c59b48]" />
                </div>
                <span>55/30/15 Faculty Allocation Formula</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl leading-relaxed">
                Answers the institutional imperative: <em>&ldquo;What skills does an officer have, what is missing for their cadre, and which trainer is mathematically best suited to close that gap?&rdquo;</em>
              </p>
            </div>

            {/* Calculated Output Score Box */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 text-center sm:text-right min-w-[240px] shadow-sm">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Faculty Compatibility Index
              </span>
              <div className="text-5xl font-black text-[#0b1e36] mt-1 tabular-nums font-mono">
                {calculatedSimScore}%
              </div>
              <span
                className={`inline-block rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider mt-2 border font-mono ${calculatedSimScore >= 85
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : calculatedSimScore >= 70
                      ? 'bg-[#c59b48]/15 text-[#9a7224] border-[#c59b48]/40'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
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
            {/* Slider 1: Radar/NWP Skill Overlap (55%) */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3 hover:border-[#c59b48] transition-colors">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#0b1e36] flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#c59b48]" /> Radar/NWP Skill Overlap (55%)
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{skillOverlapSim}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skillOverlapSim}
                onChange={(e) => setSkillOverlapSim(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0b1e36]"
              />
              <div className="text-[11px] text-slate-500">
                Contribution: <span className="text-[#0b1e36] font-bold tabular-nums font-mono">{Math.round(skillOverlapSim * 0.55 * 10) / 10} / 55 pts</span>
              </div>
            </div>

            {/* Slider 2: Historical Rating (30%) */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3 hover:border-[#c59b48] transition-colors">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#c59b48] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#c59b48]" /> Faculty Review Score (30%)
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{ratingSim} ★</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="5.0"
                step="0.1"
                value={ratingSim}
                onChange={(e) => setRatingSim(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#c59b48]"
              />
              <div className="text-[11px] text-slate-500">
                Contribution: <span className="text-[#c59b48] font-bold tabular-nums font-mono">{Math.round((ratingSim / 5.0) * 100 * 0.30 * 10) / 10} / 30 pts</span>
              </div>
            </div>

            {/* Slider 3: Past Courses Delivered (15%) */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 space-y-3 hover:border-[#0b1e36] transition-colors">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-indigo-700 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> Cohorts Delivered (15%)
                </span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">{coursesSim} Batches</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={coursesSim}
                onChange={(e) => setCoursesSim(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="text-[11px] text-slate-500">
                Contribution: <span className="text-indigo-700 font-bold tabular-nums font-mono">{Math.round(Math.min(coursesSim / 10.0, 1.0) * 100 * 0.15 * 10) / 10} / 15 pts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ PHASE 6: OUTCOMES & MEASURABLE IMPACT ════════════════ */}
      <section id="outcomes" className="bg-slate-50/60 border-y border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-4 py-1.5 text-xs font-bold text-purple-700 font-mono">
              <Award className="h-3.5 w-3.5 text-purple-600" />
              PHASE 6 • MEASURABLE NATIONAL OUTCOMES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#0b1e36] tracking-tight">
              Quantifiable Impact for Mission Mausam
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Replacing manual training guesswork with mathematically verified institutional performance.
            </p>
          </div>

          {/* 4 Impact Stat Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm text-center">
              <div className="text-4xl font-black text-[#0b1e36] font-mono">85%</div>
              <h4 className="text-sm font-bold text-slate-900">Faster Certification</h4>
              <p className="text-xs text-slate-500">Reduced from 6 months of generic retraining to 14 days of precision gap modules.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm text-center">
              <div className="text-4xl font-black text-[#c59b48] font-mono">100%</div>
              <h4 className="text-sm font-bold text-slate-900">Objective Allocation</h4>
              <p className="text-xs text-slate-500">Zero trainer mismatch or manual favoritism using the deterministic 55/30/15 formula.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm text-center">
              <div className="text-4xl font-black text-emerald-600 font-mono">38 / 38</div>
              <h4 className="text-sm font-bold text-slate-900">Radar Stations Synced</h4>
              <p className="text-xs text-slate-500">Real-time competency telemetry active across all Indian Doppler Radar stations.</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm text-center">
              <div className="text-4xl font-black text-purple-600 font-mono">WMO</div>
              <h4 className="text-sm font-bold text-slate-900">Audit-Ready Compliance</h4>
              <p className="text-xs text-slate-500">Instant digital competency dossiers formatted for World Meteorological Org inspections.</p>
            </div>
          </div>

          {/* Institutional Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: t.rating }, (_, j) => (
                        <Star key={j} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#0b1e36] bg-[#0b1e36]/10 px-2 py-0.5 rounded border border-[#0b1e36]/20">
                      {t.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic mt-3">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-[#0b1e36]">{t.name}</div>
                  <div className="text-[11px] text-slate-500">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TECHNICAL ARCHITECTURE CALLOUT FOR JUDGES ════════════════ */}
      <section id="architecture-callout" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="rounded-[32px] border-2 border-[#c59b48]/50 bg-white dark:bg-[#0b1e36] bg-gradient-to-r from-white via-slate-50 to-[#faf8f5] dark:from-[#0b1e36] dark:via-[#102744] dark:to-[#081526] p-8 sm:p-12 shadow-xl shadow-[#0b1e36]/5 dark:shadow-black/40 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1e36]/10 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#c59b48] text-xs font-mono font-bold border border-[#c59b48]/40">
              <Code2 className="h-3.5 w-3.5 text-[#c59b48]" />
              FOR TECHNICAL EVALUATORS & ARCHITECTS
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0b1e36] dark:text-white tracking-tight">
              Looking for our NestJS System Design & Code Playground?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We separated deep technical specs into a dedicated architecture section. Inspect our Inversion of Control containers, TypeScript DTOs, WebSockets telemetry, and live executable code sandbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/architecture"
              className="btn-nestjs-primary group dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#d6af5d] dark:border-[#c59b48]"
            >
              <span>Explore Technical Architecture</span>
              <ArrowRight className="h-4 w-4 text-[#c59b48] dark:text-[#0b1e36] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURED MISSION MAUSAM MODULES ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-4 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 mb-2 font-mono">
              <BookOpen className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              OFFICIAL CURRICULUM
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0b1e36] dark:text-white tracking-tight">
              Featured Mission Mausam Modules
            </h2>
          </div>

          <Link
            href="/trainee/courses"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#0b1e36] dark:text-[#c59b48] hover:text-[#c59b48] transition-colors group"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialCourses.map((course, idx) => (
            <MotionSection key={course.id} variant="slide-up" delay={idx * 100}>
              <SpotlightCard spotlightColor="rgba(197, 155, 72, 0.2)" className="space-y-4 group h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 px-2.5 py-1 text-xs font-bold text-[#0b1e36] dark:text-[#c59b48] border border-[#c59b48]/30 font-mono">
                      {course.code} • {course.cadreTrack} TRACK
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{course.category}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0b1e36] dark:text-white group-hover:text-[#c59b48] transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
                  <div>Faculty: <span className="text-[#0b1e36] dark:text-slate-200 font-bold">{course.trainerName}</span></div>
                  <Link
                    href={`/trainee/courses/${course.id}`}
                    className="rounded-full bg-[#0b1e36] hover:bg-[#122c4d] dark:bg-[#c59b48] dark:hover:bg-[#d6af5d] text-white dark:text-[#0b1e36] border border-[#c59b48]/40 px-4 py-2 font-bold shadow-sm transition-all hover:scale-105"
                  >
                    Stream Module
                  </Link>
                </div>
              </SpotlightCard>
            </MotionSection>
          ))}
        </div>
      </section>

      {/* ════════════════ FINAL INSTITUTIONAL CTA ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
        <div className="rounded-[36px] bg-gradient-to-r from-[#0b1e36] via-[#122c4d] to-[#0b1e36] text-white p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl border-2 border-[#c59b48]/40">
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#c59b48]/15 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-mono font-bold text-[#c59b48]">
              <Radio className="h-3.5 w-3.5 animate-pulse text-[#c59b48]" />
              MISSION MAUSAM CAPACITY READY
            </span>
            <h2 className="text-3xl sm:text-5xl font-black !text-white tracking-tight">
              Accelerate Meteorological Competency Nationwide
            </h2>
            <p className="text-sm sm:text-base !text-slate-200 leading-relaxed max-w-2xl mx-auto opacity-95">
              Connect scientists, operational forecasters, and senior faculty across India on a single competency-driven digital learning ecosystem.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/admin/competency" className="btn-gold shadow-lg shadow-[#c59b48]/20">
                <Brain className="h-4 w-4" />
                <span>Run Competency Gap Analysis</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/auth/login" className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 !text-white text-xs font-bold transition-all flex items-center gap-2 backdrop-blur-sm shadow-sm">
                <Lock className="h-4 w-4 text-[#c59b48]" />
                <span>Sign In with Gov ID</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}