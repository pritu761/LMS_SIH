'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Layers,
  Cpu,
  ShieldCheck,
  Radio,
  Zap,
  Binary,
  Code2,
  Rocket,
  ArrowLeft,
  ChevronRight,
  Server,
  Terminal,
  Activity,
  CheckCircle2,
  FileCode2,
  Database,
  GitBranch,
} from 'lucide-react';
import { NestCodePlayground } from '@/components/shared/NestCodePlayground';
import { NestEcosystemShowcase } from '@/components/shared/NestEcosystemShowcase';
import { MotionSection } from '@/components/shared/MotionPrimitives';
import { ease } from '@/lib/animations';

export default function TechnicalArchitecturePage() {
  const architecturalPillars = [
    {
      title: 'Modular Cadre Boundaries',
      badge: 'NESTJS MODULES',
      icon: Layers,
      color: '#0b1e36',
      desc: 'Encapsulated domain boundaries separating DRSTC, FTC, and IMTC syllabus logic with strict Inversion-of-Control dependency contracts.',
      highlights: ['Feature Modules (@Module)', 'Dynamic Modules (.forRoot/.forFeature)', 'Isolated Domain Scope'],
    },
    {
      title: 'Inversion of Control (IoC)',
      badge: 'DEPENDENCY INJECTION',
      icon: Cpu,
      color: '#c59b48',
      desc: 'Decoupled service providers inject assessment algorithms, telemetry connectors, and the 55/30/15 faculty matching engine at runtime.',
      highlights: ['Custom Injection Tokens', 'Interface-Driven Contracts', 'Dynamic Matcher Swapping'],
    },
    {
      title: 'Strict Type-Safe DTOs',
      badge: 'TYPESCRIPT & ZOD',
      icon: ShieldCheck,
      color: '#059669',
      desc: 'End-to-end type safety for Doppler Radar and NWP assessments with strict schema validation and runtime sanity guards.',
      highlights: ['Class-Validator / Zod', 'Transform Pipes', 'Auto-Generated OpenAPI/Swagger'],
    },
    {
      title: 'Event-Driven Telemetry',
      badge: 'WEBSOCKETS & PUB/SUB',
      icon: Zap,
      color: '#0b1e36',
      desc: 'Low-latency telemetry streaming for live radar nowcasting simulations and instant cohort alert broadcasting.',
      highlights: ['Socket.io Gateways', 'Cluster-Wide Message Broker', 'Reactive Observables'],
    },
    {
      title: 'Enterprise Scalability',
      badge: 'MISSION CRITICAL',
      icon: Radio,
      color: '#c59b48',
      desc: 'Engineered for nationwide coordination across 38 Doppler Weather Radar installations and MoES supercomputing clusters.',
      highlights: ['Horizontally Scalable', 'Distributed Session Caching', 'Sub-50ms API Latency'],
    },
    {
      title: 'Pratyush/Mihir HPC Parallelism',
      badge: 'HIGH PERFORMANCE',
      icon: Binary,
      color: '#0b1e36',
      desc: 'MPI & OpenMP parallelized governing equations sandbox for numerical weather prediction model runs.',
      highlights: ['NetCDF/GRIB2 Parser', 'HPC Cluster Dispatcher', '4D-Var Data Assimilation'],
    },
  ];

  const systemFlow = [
    { step: '01', title: 'HTTP / WebSocket Ingress', desc: 'Secure TLS terminating at Next.js / NestJS Gateway with Rate Limiting & RBAC Guard.' },
    { step: '02', title: 'DTO Validation Pipe', desc: 'Runtime validation of Radar Telemetry schemas, Question Payloads, and Batch metadata.' },
    { step: '03', title: 'IoC Dependency Resolution', desc: 'Container injects the Faculty 55/30/15 Matcher and Proctored Assessment Engine.' },
    { step: '04', title: 'State & Database Transaction', desc: 'Prisma ORM transactions with PostgreSQL for atomic score calculation and gap updates.' },
    { step: '05', title: 'Live Telemetry Broadcast', desc: 'Real-time WebSocket event dispatched to Admin Control Room and Trainee Dashboard.' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-white/85 text-slate-900 dark:bg-[#070f1a] dark:text-slate-100 selection:bg-[#0b1e36] selection:text-[#c59b48]">
      {/* Top Banner / Breadcrumb */}
      <section className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-[#0b1e36]/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs font-sans font-medium text-slate-500 dark:text-slate-400">
            <Link href="/" className="hover:text-[#0b1e36] dark:hover:text-[#dfb76c] flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 dark:text-white font-semibold">Technical Architecture</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 text-[#0b1e36] dark:text-[#dfb76c] text-xs font-sans font-bold mb-2 border border-[#c59b48]/40">
                <Server className="h-3.5 w-3.5 text-[#c59b48]" />
                SYSTEM ARCHITECTURE & DESIGN SPECIFICATION
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#0b1e36] dark:text-white tracking-tight">
                Enterprise System Architecture
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl mt-2 leading-relaxed">
                A decoupled, modular, and type-safe architecture engineered for sovereign meteorological capacity building, real-time radar telemetry, and automated competency optimization.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/admin/radar"
                className="btn-gold flex items-center gap-1.5"
              >
                <Radio className="h-3.5 w-3.5 text-[#0b1e36] animate-pulse" />
                <span>Live 38 Doppler Radars</span>
              </Link>
              <a
                href="#playground"
                className="btn-nestjs-primary"
              >
                Inspect Code Playground
              </a>
              <Link
                href="/admin/competency"
                className="btn-nestjs-secondary"
              >
                Algorithm
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 6 ARCHITECTURAL PILLARS ════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c] font-sans">
            <Layers className="h-3.5 w-3.5 text-[#c59b48]" />
            CORE ARCHITECTURAL PILLARS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0b1e36] dark:text-white tracking-tight">
            Engineered for Scale, Safety & Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Every layer enforces strict encapsulation, runtime schema validation, and high-performance computing bridges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {architecturalPillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <MotionSection key={pillar.badge} variant="slide-up" delay={idx * 60}>
                <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1e36]/90 p-6 h-full flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md hover:border-[#c59b48]/60 transition-all group dark:text-slate-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase border bg-[#0b1e36]/5 dark:bg-[#c59b48]/15 border-[#0b1e36]/20 dark:border-[#c59b48]/30 text-[#0b1e36] dark:text-[#dfb76c]"
                      >
                        {pillar.badge}
                      </span>
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 bg-[#0b1e36] text-[#c59b48] shadow-sm"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#0b1e36] dark:text-white group-hover:text-[#c59b48] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 font-normal">
                        {pillar.desc}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/10">
                      {pillar.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 font-sans">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] font-sans text-slate-500 dark:text-slate-400">
                    <span>Verified Component</span>
                    <span className="text-[#0b1e36] dark:text-[#dfb76c] font-bold flex items-center gap-1">
                      Active Node
                    </span>
                  </div>
                </div>
              </MotionSection>
            );
          })}
        </div>
      </section>

      {/* ════════════════ SYSTEM DATAFLOW PIPELINE ════════════════ */}
      <section className="bg-slate-50 dark:bg-[#070f1a]/80 border-y border-slate-200 dark:border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c] font-sans">
              <GitBranch className="h-3.5 w-3.5 text-[#c59b48]" />
              EXECUTION PIPELINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0b1e36] dark:text-white tracking-tight">
              End-to-End Request Lifecycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              How a single competency evaluation or radar telemetry payload flows through our architectural layers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {systemFlow.map((s, idx) => (
              <div key={s.step} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1e36]/80 p-5 space-y-2 relative shadow-sm hover:border-[#c59b48] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-black text-[#0b1e36] dark:text-[#dfb76c] bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 px-2 py-0.5 rounded border border-[#0b1e36]/20 dark:border-[#c59b48]/30">
                    STAGE {s.step}
                  </span>
                  {idx < 4 && (
                    <ChevronRight className="hidden md:block h-4 w-4 text-slate-400 absolute -right-2 top-1/2 -translate-y-1/2 z-10" />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#0b1e36] dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ LIVE CODE PLAYGROUND ════════════════ */}
      <section id="playground" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c] font-sans">
            <Code2 className="h-3.5 w-3.5 text-[#c59b48]" />
            LIVE CODE PLAYGROUND
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0b1e36] dark:text-white tracking-tight">
            Inspect the Platform Decorators & Providers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Click through our TypeScript modules, controllers, DTOs, and guards, and execute live IoC dependency tests.
          </p>
        </div>

        <NestCodePlayground />
      </section>

      {/* ════════════════ ECOSYSTEM & TOOLS SHOWCASE ════════════════ */}
      <section id="ecosystem" className="bg-slate-50 dark:bg-[#070f1a]/80 border-t border-slate-200 dark:border-white/10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 border border-[#c59b48]/40 px-4 py-1.5 text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c] font-sans">
              <Rocket className="h-3.5 w-3.5 text-[#c59b48]" />
              INTEGRATED CAPACITY SUITE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0b1e36] dark:text-white tracking-tight">
              Observe, DevTools & Masterclasses
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Interactive tools built directly on our sovereign meteorological infrastructure.
            </p>
          </div>

          <NestEcosystemShowcase />
        </div>
      </section>

      {/* Return to Home CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 text-center">
        <div className="rounded-3xl border border-[#c59b48]/40 bg-white dark:bg-[#0b1e36] p-8 space-y-4 shadow-lg shadow-[#0b1e36]/5">
          <h3 className="text-xl font-bold text-[#0b1e36] dark:text-white">Ready to test the Competency & Gap Matching Engine?</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Experience our 55/30/15 mathematical faculty allocation model live on official IMD training scenarios.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/competency"
              className="btn-nestjs-primary"
            >
              Launch 55/30/15 Algorithm Matcher
            </Link>
            <Link
              href="/"
              className="btn-nestjs-secondary"
            >
              Back to Problem → Outcome Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}