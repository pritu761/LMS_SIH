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
import { initialCourses } from '@/lib/mockData';
import { useVisualTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const router = useRouter();
  const { theme, config } = useVisualTheme();

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
      badge: 'National Framework',
      quote: 'Capacity Connect transformed our training pipeline with measurable competency mapping and seamless course delivery.',
      rating: 5,
    },
    {
      name: 'Rakesh Nair IAS',
      role: 'Joint Secretary, MeitY',
      badge: 'Sovereign Governance',
      quote: 'The 55/30/15 matching algorithm optimized our faculty deployment across 12 states — a breakthrough in governance efficiency.',
      rating: 5,
    },
    {
      name: 'Priya Krishnamurthy',
      role: 'Lead Trainer, DARPG',
      badge: 'Accredited Faculty',
      quote: 'The proctored assessment engine and instant certification workflow reduced our evaluation cycle from weeks to hours.',
      rating: 5,
    },
  ];

  // How It Works steps
  const howItWorks = [
    {
      icon: Users,
      title: 'Register & Sovereign RBAC',
      description: 'Create your account with institutional credentials. System Admin verifies identity and issues instant role authorization.',
      color: 'from-blue-500 to-indigo-600',
      iconColor: 'text-blue-400',
      glow: 'rgba(59, 130, 246, 0.25)',
    },
    {
      icon: BookOpen,
      title: 'Stream & AI Proctoring',
      description: 'Access modular HD video streams, curriculum slide decks, and complete anti-cheat proctored MCQ evaluations.',
      color: 'from-indigo-500 to-purple-600',
      iconColor: 'text-indigo-400',
      glow: 'rgba(99, 102, 241, 0.25)',
    },
    {
      icon: Award,
      title: 'Certify & 55/30/15 Deployment',
      description: 'Earn tamper-proof accredited credentials. Profile telemetry feeds into the national 55/30/15 faculty matching index.',
      color: 'from-amber-500 to-emerald-500',
      iconColor: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.25)',
    },
  ];

  // Trust badges
  const trustBadges = [
    'Digital India Initiative', 'MeitY Certified', 'NISG Framework',
    'DARPG Approved', 'Smart India Hackathon', 'NIC Sovereign Cloud',
    'Digital India Initiative', 'MeitY Certified', 'NISG Framework',
    'DARPG Approved', 'Smart India Hackathon', 'NIC Sovereign Cloud',
  ];

  return (
    <div suppressHydrationWarning className="flex-1 flex flex-col space-y-0 pb-0 relative overflow-hidden transition-colors duration-500 selection:bg-emerald-500 selection:text-black">

      {/* ════════════════ HERO SECTION (NEXT-GEN CYBER HORIZON) ════════════════ */}
      <section className="relative pt-16 sm:pt-28 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">

        {/* Cybernetic Horizon Grid & Multi-Spectral Aurora */}
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

          {/* Floating Verified GovTech Iridescent Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: ease.smooth }}
            className="badge-iridescent mb-8 cursor-default"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" />
            <span>Sovereign AI Engine • {config.name}</span>
            <span
              className="h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: config.primaryColor }}
            />
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border"
              style={{
                backgroundColor: `${config.primaryColor}25`,
                color: config.primaryColor,
                borderColor: `${config.primaryColor}50`,
              }}
            >
              {config.badgeText}
            </span>
          </motion.div>

          {/* Hero Title with Chrome & Aurora Metallic Lustre */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <motion.h1
              className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.03]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: ease.smooth }}
            >
              The Sovereign <br />
              <span className="text-chrome">Capacity AI</span>{' '}
              <span className="text-aurora">Engine</span>
            </motion.h1>
            <motion.p
              className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: ease.smooth }}
            >
              Empowering India&apos;s governance infrastructure with multi-factor 55/30/15 competency matching, anti-cheat proctored evaluations, and deterministic RBAC.
            </motion.p>
          </div>

          {/* Call to Action Buttons with Rotating Conic Glow Button */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-5 pt-8"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8, ease: ease.smooth }}
          >
            {/* Signature Conic Laser Glow CTA */}
            <Link
              href="/auth/register"
              className="btn-conic-glow group"
            >
              <div className="btn-conic-glow-inner gap-2.5">
                <Sparkles className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-12" />
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Frosted Secondary CTA */}
            <Link
              href="/auth/login"
              className="btn-bridgemind-secondary group gap-2.5"
            >
              <Lock className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span>Sign In with Gov ID</span>
            </Link>
          </motion.div>

          {/* Interactive BridgeMind App Sandbox Mockup with Floating Telemetry Chips */}
          <motion.div
            className="pt-16 max-w-5xl mx-auto relative"
            initial={{ opacity: 0, y: 70, rotateX: 6, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 1.0, ease: ease.smooth }}
            style={{ perspective: 1200 }}
          >
            {/* Main Window Box */}
            <div className="bridgemind-window p-6 sm:p-8 text-left space-y-5 relative">
              
              {/* macOS Window Titlebar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80 shadow-sm shadow-rose-500/40" />
                    <div className="h-3 w-3 rounded-full bg-amber-500/80 shadow-sm shadow-amber-500/40" />
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-sm shadow-emerald-500/40" />
                  </div>
                  <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                    <span className="text-xs font-black tracking-tight text-white">
                      CapacityConnect <span className="text-blue-400 font-normal font-mono text-[11px]">v2.4 Sovereign Sandbox</span>
                    </span>
                  </div>
                </div>

                {/* Integrated Telemetry Badges */}
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="hidden sm:flex items-center gap-1 rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-blue-300">
                    <Zap className="h-3 w-3 text-blue-400" />
                    12ms Edge Latency
                  </span>
                  <span className="hidden md:flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-emerald-300">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    99.4% Verified
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-300 font-bold">
                    <motion.span
                      className="h-2 w-2 rounded-full bg-emerald-400"
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    Live Sandbox
                  </span>
                </div>
              </div>

              {/* 1-Click Role Cards with Interactive Cursor Spotlights */}
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={staggerItem}>
                  <button
                    onClick={() => handleQuickLogin('TRAINEE')}
                    className="w-full text-left"
                  >
                    <SpotlightCard
                      spotlightColor="rgba(6, 182, 212, 0.25)"
                      className="hover:border-cyan-500/50 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Award className="h-5 w-5 text-cyan-400" />
                        </div>
                        <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-black text-cyan-300 border border-cyan-500/20 font-mono">
                          TRAINEE
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-3 group-hover:text-cyan-500 transition-colors">
                        Aarav Patel
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Stream lectures, track progress & take timed MCQs</div>
                    </SpotlightCard>
                  </button>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <button
                    onClick={() => handleQuickLogin('TRAINER')}
                    className="w-full text-left"
                  >
                    <SpotlightCard
                      spotlightColor="rgba(59, 130, 246, 0.25)"
                      className="hover:border-blue-500/50 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[9px] font-black text-blue-300 border border-blue-500/20 font-mono">
                          TRAINER
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-3 group-hover:text-blue-500 transition-colors">
                        Prof. Vikramaditya Sen
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Manage media library, create exams & cohort analytics</div>
                    </SpotlightCard>
                  </button>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <button
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="w-full text-left"
                  >
                    <SpotlightCard
                      spotlightColor="rgba(16, 185, 129, 0.25)"
                      className="hover:border-emerald-500/50 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[9px] font-black text-emerald-300 border border-emerald-500/20 font-mono">
                          ADMIN
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white mt-3 group-hover:text-emerald-500 transition-colors">
                        Dr. Rajeshwari Sharma
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Approve users, manage RBAC & run competency matching</div>
                    </SpotlightCard>
                  </button>
                </motion.div>
              </motion.div>
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
                  <Globe className="h-3.5 w-3.5 text-blue-400/80" />
                  <span className="text-xs font-semibold text-slate-300">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </MotionSection>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* ════════════════ SITEWIDE KPI SPOTLIGHT COUNTERS ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 text-xs font-bold text-blue-300 mb-4 font-mono">
              <BarChart3 className="h-3.5 w-3.5" />
              TELEMETRY & IMPACT
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              National Institutional Scale
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              Real-time sovereign telemetry powering civil service capacity acceleration across Indian departments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.2)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Trainees</span>
                <div className="rounded-xl p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={25480} separator="," />
                </div>
                <span className="text-xs font-bold text-emerald-400">↑ 14.2% MoM</span>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.2)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completion Rate</span>
                <div className="rounded-xl p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={94.6} decimals={1} suffix="%" />
                </div>
                <span className="text-xs font-bold text-emerald-400">↑ 3.1% YoY</span>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.2)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Credentials Issued</span>
                <div className="rounded-xl p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Award className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={18920} separator="," />
                </div>
                <span className="text-xs font-bold text-emerald-400">↑ 22.5%</span>
              </div>
            </SpotlightCard>

            <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.2)">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Verified Faculty</span>
                <div className="rounded-xl p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl font-black text-white tracking-tight">
                  <AnimatedCounter target={480} />
                </div>
                <span className="text-xs font-bold text-emerald-400">100% Accredited</span>
              </div>
            </SpotlightCard>
          </div>
        </section>
      </MotionSection>

      {/* ════════════════ SIGNATURE BENTO GRID (ARCHITECTURAL PILLARS) ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 text-xs font-bold text-indigo-300 mb-4 font-mono">
              <Cpu className="h-3.5 w-3.5" />
              ARCHITECTURAL PILLARS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Engineered to Stand Out
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Four state-of-the-art technical subsystems powering seamless civil service development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: 55/30/15 AI Engine (Spans 2 columns) */}
            <div className="md:col-span-2">
              <SpotlightCard spotlightColor="rgba(59, 130, 246, 0.25)" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[11px] font-mono font-bold text-blue-300 border border-blue-500/30">
                      55% SKILLS • 30% RATINGS • 15% VOLUME
                    </span>
                    <Brain className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-4">
                    Pedagogical Compatibility Index (55/30/15)
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Our deterministic weighted matching formula algorithmically pairs faculty expertise with cohort requirement matrices, minimizing skill deficits across all 28 states.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Deterministic Execution
                  </span>
                  <span>O(N log K) Matching Time</span>
                </div>
              </SpotlightCard>
            </div>

            {/* Bento Card 2: AI Proctored Exams */}
            <div>
              <SpotlightCard spotlightColor="rgba(245, 158, 11, 0.25)" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-mono font-bold text-amber-300 border border-amber-500/30">
                      ANTI-CHEAT SENTINEL
                    </span>
                    <Fingerprint className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4">
                    Edge Proctored MCQ Engine
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Automated tab-switch tracking, fullscreen enforcement, and synchronized server timers ensure exam integrity without invading privacy.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" /> Real-Time Integrity Audit
                </div>
              </SpotlightCard>
            </div>

            {/* Bento Card 3: RBAC Governance */}
            <div>
              <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.25)" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                      EDGE RBAC JWT
                    </span>
                    <Lock className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mt-4">
                    Multi-Tenant Persona Control
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Cryptographic tokens and Next.js middleware guards enforce granular separation between Admin, Faculty, and Trainee workspaces.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Zero Privilege Leakage
                </div>
              </SpotlightCard>
            </div>

            {/* Bento Card 4: Verifiable Credentials (Spans 2 columns) */}
            <div className="md:col-span-2">
              <SpotlightCard spotlightColor="rgba(6, 182, 212, 0.25)" className="h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-cyan-500/15 px-3 py-1 text-[11px] font-mono font-bold text-cyan-300 border border-cyan-500/30">
                      INSTANT CERTIFICATION
                    </span>
                    <Award className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-4">
                    Tamper-Proof Competency Passports
                  </h3>
                  <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                    Upon passing passing thresholds, verifiable certificates with cryptographic hash identifiers are generated instantly, ready for digital verification by ministry audit teams.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
                  <span className="text-cyan-300 font-bold">QR & Hash Verifiable</span>
                  <span>Sovereign Compliance Verified</span>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>
      </MotionSection>

      {/* Laser Divider */}
      <div className="laser-divider" />

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 text-xs font-bold text-cyan-300 mb-4 font-mono">
              <Rocket className="h-3.5 w-3.5" />
              LIFECYCLE
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Three Steps to Certification
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
              From identity onboarding to accredited credentials in an integrated flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-[2px]">
              <div className="h-full bg-gradient-to-r from-blue-500/40 via-amber-500/40 to-emerald-500/40" />
            </div>

            {howItWorks.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <MotionSection key={index} variant="slide-up" delay={index * 150}>
                  <SpotlightCard spotlightColor={step.glow} className="text-center space-y-4 h-full">
                    <div className="relative inline-flex">
                      <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} p-[1px] shadow-lg group-hover:scale-110 transition-all duration-500`}>
                        <div className="h-full w-full rounded-[15px] bg-black flex items-center justify-center">
                          <StepIcon className={`h-7 w-7 ${step.iconColor}`} />
                        </div>
                      </div>
                      <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-black border border-white/20 flex items-center justify-center text-xs font-black text-white font-mono">
                        0{index + 1}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </SpotlightCard>
                </MotionSection>
              );
            })}
          </div>
        </section>
      </MotionSection>

      {/* ════════════════ INTERACTIVE ALGORITHM SIMULATOR (BRIDGEMIND WINDOW) ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="bridgemind-window p-6 sm:p-10 space-y-8 relative overflow-hidden">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-mono font-bold text-blue-300 border border-blue-500/30">
                    INTERACTIVE ALGORITHM SIMULATOR
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Multi-Factor Pedagogical Index</span>
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
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 font-mono">
                    Compatibility Index
                  </span>
                  <div className="text-5xl font-black text-white mt-1 tabular-nums font-mono">
                    {calculatedSimScore}%
                  </div>
                  <span
                    className={`inline-block rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider mt-2 border font-mono ${
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
                  Contribution: <span className="text-blue-300 font-bold tabular-nums font-mono">{Math.round(skillOverlapSim * 0.55 * 10) / 10} / 55 pts</span>
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
                  Contribution: <span className="text-amber-300 font-bold tabular-nums font-mono">{Math.round((ratingSim / 5.0) * 100 * 0.30 * 10) / 10} / 30 pts</span>
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
                  Contribution: <span className="text-cyan-300 font-bold tabular-nums font-mono">{Math.round(Math.min(coursesSim / 10.0, 1.0) * 100 * 0.15 * 10) / 10} / 15 pts</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </MotionSection>

      {/* ════════════════ TESTIMONIALS (SPOTLIGHT CARDS) ════════════════ */}
      <MotionSection variant="fade-up">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-1.5 text-xs font-bold text-amber-300 mb-4 font-mono">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ENDORSEMENTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Trusted by Government Leadership
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
                ACCREDITED CATALOG
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
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors group"
            >
              <span>Browse Full Catalog</span>
              <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialCourses.map((course, idx) => (
              <MotionSection key={course.id} variant="slide-up" delay={idx * 100}>
                <SpotlightCard spotlightColor="rgba(99, 102, 241, 0.2)" className="space-y-4 group h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-400 border border-blue-500/20 font-mono">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-400">{course.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
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
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 px-4 py-2 font-bold shadow-md shadow-blue-600/30 transition-all hover:scale-105"
                    >
                      Stream Course
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

      {/* ════════════════ FINAL CTA (NEXT-GEN CYBER BANNER) ════════════════ */}
      <MotionSection variant="scale">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="bridgemind-window p-10 sm:p-16 text-center relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 border border-blue-500/30 px-4 py-1.5 text-xs font-mono font-bold text-blue-300">
                <Radio className="h-3.5 w-3.5 animate-pulse text-blue-400" />
                SOVEREIGN DEPLOYMENT READY
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Ready to Upgrade Your Capacity Pipeline?
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
                Join thousands of civil servants across India who are building verified competencies through Capacity Connect&apos;s intelligent learning platform.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
                <Link
                  href="/auth/register"
                  className="btn-conic-glow group"
                >
                  <div className="btn-conic-glow-inner gap-2.5">
                    <Sparkles className="h-4 w-4 text-amber-500 transition-transform group-hover:rotate-12" />
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
                <Link
                  href="/auth/login"
                  className="btn-bridgemind-secondary group gap-2.5"
                >
                  <Lock className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
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
