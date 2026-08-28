'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  GitBranch,
  Rocket,
  GraduationCap,
  Radar,
  Cpu,
  Layers,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
  CheckCircle2,
  Terminal,
  Play,
  Clock,
  Compass,
} from 'lucide-react';
import Link from 'next/link';

interface ToolItem {
  id: string;
  badge: string;
  name: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  tags: string[];
  features: string[];
  ctaText: string;
  ctaLink: string;
  previewType: 'telemetry' | 'graph' | 'deploy' | 'courses';
}

const TOOLS: ToolItem[] = [
  {
    id: 'observe',
    badge: '01 • TELEMETRY',
    name: 'Capacity Observe',
    subtitle: 'Real-Time Doppler & Trainee Skill Telemetry',
    description:
      'Continuous distributed monitoring across all 38 Doppler Weather Radar stations, tracking forecaster accuracy, INSAT-3DS interpretation latency, and active competency deficits in real time.',
    icon: Activity,
    color: '#ff4d6d',
    tags: ['Live Nowcasting Stream', 'Latency: 14ms', 'WMO METAR Alerts'],
    features: [
      'Autonomous live radar stream anomaly tracking',
      'Automated competency regression warnings',
      'Real-time WebSocket event dispatch to Regional Centres',
    ],
    ctaText: 'Open Live Radar Telemetry',
    ctaLink: '/admin/reports',
    previewType: 'telemetry',
  },
  {
    id: 'devtools',
    badge: '02 • GRAPH VISUALIZER',
    name: 'Competency DevTools',
    subtitle: 'Interactive Cadre Dependency & Prerequisite Graph',
    description:
      'Deep dependency tree inspection for meteorological curricula. Visualizes how foundational physics modules map into advanced HPC 4D-Var data assimilation and tropical cyclone track modeling.',
    icon: GitBranch,
    color: '#38bdf8',
    tags: ['Dependency Tree', 'Cadre Prereqs', 'Circular Gap Check'],
    features: [
      'Multi-spectral radar skill dependency mapping',
      'Inversion-of-Control prerequisite resolution',
      'Instant bottleneck & prerequisite gap pinpointing',
    ],
    ctaText: 'Launch Competency Graph',
    ctaLink: '/admin/competency',
    previewType: 'graph',
  },
  {
    id: 'deploy',
    badge: '03 • ORCHESTRATION',
    name: 'Deploy & Orchestrate',
    subtitle: '1-Click National Induction Batch Provisioning',
    description:
      'Instantly generate, configure, and dispatch accredited training cohorts across MTI Pune, RMC Chennai, RMC Kolkata, and Delhi Headquarters with automated syllabus binding and faculty assignment.',
    icon: Rocket,
    color: '#a855f7',
    tags: ['5 Regional Centres', '1-Click Rollout', 'Auto-Rubrics'],
    features: [
      'Automated faculty matching via 55/30/15 engine',
      'Direct provisioning of NetCDF/GRIB2 sandbox labs',
      'National synchronization with MoES mandate timeline',
    ],
    ctaText: 'Provision Training Cohort',
    ctaLink: '/admin/batches',
    previewType: 'deploy',
  },
  {
    id: 'courses',
    badge: '04 • MASTERCLASS',
    name: 'Official IMD Masterclass',
    subtitle: 'Accredited Video & Interactive Sim Streams',
    description:
      'Stream verified meteorological modules directly on your device. Designed by Senior Scientists and Professors from IITM, IMD, and NCMRWF with hands-on HPC sandbox exercises.',
    icon: GraduationCap,
    color: '#34d399',
    tags: ['DRSTC Accredited', 'Dual-Pol Labs', 'WMO RTC Certified'],
    features: [
      'Interactive Doppler radar velocity de-aliasing labs',
      'High-throughput video streaming with chapter checkpoints',
      'Instant digital competency certification',
    ],
    ctaText: 'Browse Masterclass Catalog',
    ctaLink: '/trainee/courses',
    previewType: 'courses',
  },
];

export function NestEcosystemShowcase() {
  const [activeTab, setActiveTab] = useState<ToolItem>(TOOLS[0]);

  return (
    <div className="w-full space-y-8">
      {/* Tab Selectors styled like NestJS ecosystem pills */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTab.id === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-mono text-xs transition-all duration-300 ${
                isActive
                  ? 'bg-[#0b1e36] text-white border border-[#c59b48] shadow-lg shadow-[#0b1e36]/40 scale-105'
                  : 'bg-[#060a12] text-slate-300 border border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <div
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-all"
                style={{
                  backgroundColor: isActive ? `${tool.color}25` : 'rgba(255,255,255,0.05)',
                  color: isActive ? tool.color : '#94a3b8',
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {tool.badge.split('•')[1]?.trim() || tool.badge}
                </div>
                <div className="text-sm font-bold text-white font-sans">{tool.name}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Tool Feature Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="rounded-[32px] bg-gradient-to-br from-[#060a12] via-[#0b1424] to-[#04070d] border border-[#c59b48]/30 p-6 sm:p-10 shadow-2xl shadow-[#0b1e36]/30 relative overflow-hidden"
        >
          {/* Subtle ambient light behind tool */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: activeTab.color }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Col: Tool Details (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border"
                  style={{
                    backgroundColor: `${activeTab.color}15`,
                    borderColor: `${activeTab.color}40`,
                    color: activeTab.color,
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {activeTab.badge}
                </span>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {activeTab.name}
                </h3>
                <p className="text-sm font-semibold text-[#c59b48]">{activeTab.subtitle}</p>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {activeTab.description}
              </p>

              {/* Feature Points */}
              <div className="space-y-2.5 pt-2">
                {activeTab.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-100">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 mt-0.5"
                      style={{ color: activeTab.color }}
                    />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Tag Pills */}
              <div className="flex flex-wrap gap-2 pt-2">
                {activeTab.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-white/10 border border-white/15 text-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* CTA Button */}
              <div className="pt-2">
                <Link
                  href={activeTab.ctaLink}
                  className="btn-nestjs-primary group"
                  style={{
                    boxShadow: `0 4px 20px rgba(255, 255, 255, 0.2), 0 0 30px ${activeTab.color}40`,
                  }}
                >
                  <span>{activeTab.ctaText}</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Right Col: Interactive Visual Mockup (6 cols) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-[#040102] border border-white/10 p-5 shadow-2xl space-y-4 font-mono text-xs">
                {/* Mock Window Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{activeTab.id}.nest.imd.gov.in</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    LIVE
                  </span>
                </div>

                {/* Content based on previewType */}
                {activeTab.previewType === 'telemetry' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                        <div className="text-[10px] text-slate-300">Doppler Network Active</div>
                        <div className="text-xl font-bold text-white">38 / 38 Nodes</div>
                        <div className="text-[10px] text-emerald-400">100% Operational</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/10 border border-white/10 space-y-1">
                        <div className="text-[10px] text-slate-300">Trainee Stream P99</div>
                        <div className="text-xl font-bold text-[#dfb76c]">14.2 ms</div>
                        <div className="text-[10px] text-slate-400">Ultra-Low Latency</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#060a12] border border-[#c59b48]/20 space-y-2">
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>LIVE NOWCASTING EVENT STREAM</span>
                        <span className="text-[#dfb76c] animate-pulse">● REC</span>
                      </div>
                      <div className="text-[11px] text-slate-200 leading-snug">
                        [RMC Chennai] Dual-Pol ZDR signature mapped • Forecaster score: 96%
                      </div>
                      <div className="text-[11px] text-slate-200 leading-snug">
                        [MTI Pune] DRSTC Cohort 2026 HPC governing equations stream verified
                      </div>
                    </div>
                  </div>
                )}

                {activeTab.previewType === 'graph' && (
                  <div className="space-y-3 p-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
                      <span>Dependency Node Tree</span>
                      <span className="text-cyan-400">4 Modules Linked</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px]">
                        <Layers className="h-3.5 w-3.5" />
                        <span>CoreAtmosphericDynamicsModule</span>
                        <span className="ml-auto text-[9px] bg-cyan-500/20 px-1.5 py-0.5 rounded">ROOT</span>
                      </div>
                      <div className="ml-6 pl-3 border-l-2 border-dashed border-cyan-500/40 space-y-2">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px]">
                          <Cpu className="h-3.5 w-3.5" />
                          <span>DopplerRadarNowcastingProvider</span>
                          <span className="ml-auto text-[9px] text-emerald-400">INJECTED</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-[#c59b48]/10 border border-[#c59b48]/30 text-[#dfb76c] text-[11px]">
                          <Zap className="h-3.5 w-3.5" />
                          <span>PedagogicalWeightedMatcher (55/30/15)</span>
                          <span className="ml-auto text-[9px] text-amber-300">RESOLVED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab.previewType === 'deploy' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-purple-300">
                        <span>Cohort Deployment Target</span>
                        <span className="font-bold">MTI PUNE & RMC CHENNAI</span>
                      </div>
                      <div className="text-sm font-bold text-white">DRSTC 2026 Phase-1 Rollout</div>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-slate-200 bg-black/40 p-3 rounded-xl">
                      <div className="flex justify-between">
                        <span>Enrolled Officers:</span>
                        <span className="text-white font-bold">48 Scientists-B</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assigned Faculty:</span>
                        <span className="text-white font-bold">Prof. V. Sen (94.6% Match)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HPC Quota Allocation:</span>
                        <span className="text-emerald-400 font-bold">Pratyush 256 Cores</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab.previewType === 'courses' && (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden bg-[#0b1a2e] border border-white/10 aspect-video flex items-center justify-center group cursor-pointer">
                      <div className="h-12 w-12 rounded-full bg-[#0b1e36] border border-[#c59b48]/60 flex items-center justify-center text-[#c59b48] shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[10px] bg-black/70 backdrop-blur-md px-2 py-1 rounded">
                        <span className="text-white font-bold">Module 04: Dual-Pol Doppler Velocity De-aliasing</span>
                        <span className="text-slate-300">42:15</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}