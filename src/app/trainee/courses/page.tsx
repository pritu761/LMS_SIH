'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  Clock,
  Award,
  ChevronRight,
  Star,
  Sparkles,
  Compass,
  Radio,
  Bot,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCourses, initialCompetencies, initialCadres } from '@/lib/mockData';
import { useCourseChat } from '@/context/ChatContext';

export default function CourseCatalogPage() {
  const { openChat } = useCourseChat();
  const [search, setSearch] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');

  const tracks = [
    { id: 'ALL', label: 'All IMD Tracks' },
    { id: 'DRSTC', label: 'DRSTC (Scientists Inductees)' },
    { id: 'FTC', label: 'FTC (Forecasters Track)' },
    { id: 'IMTC', label: 'IMTC (Integrated Met Officers)' },
    { id: 'MODULAR', label: 'Modular Specialized (AI/HPC)' },
  ];

  const filteredCourses = initialCourses.filter((course) => {
    const matchesTrack = selectedTrack === 'ALL' || course.cadreTrack === selectedTrack;
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.trainerName.toLowerCase().includes(search.toLowerCase()) ||
      course.competencies.some((c) => c.competencyName.toLowerCase().includes(search.toLowerCase()));

    return matchesTrack && matchesSearch;
  });

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0 space-y-6">

        {/* Header - dark hero retained for brand impact */}
        <div className="rounded-3xl border border-[#c59b48]/30 bg-gradient-to-br from-[#0b1e36]/90 via-[#102744] to-[#081526] p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48]/60 to-transparent" />
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#c59b48]/15 px-2.5 py-0.5 text-xs font-bold !text-[#dfb76c] border border-[#c59b48]/30">
              MISSION MAUSAM CURRICULUM
            </span>
            <span className="text-xs !text-slate-300">IMD / MoES Official Training Tracks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black !text-white tracking-tight">
            Meteorological Capacity Curriculum
          </h1>
          <p className="text-xs sm:text-sm !text-slate-300">
            Select specialized modules across DRSTC, FTC, IMTC, and Modular tracks to close competency gaps and earn WMO-compliant certifications.
          </p>
        </div>

        {/* Search & Cadre Track Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search by topic (e.g. Radar, NWP, Satellite, AI Nowcasting, HPC, Cyclone)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#c59b48] focus:outline-none focus:ring-1 focus:ring-[#c59b48] shadow-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => openChat(search || undefined)}
              className="flex items-center gap-1.5 rounded-2xl border border-[#c59b48]/40 bg-[#c59b48]/10 px-4 py-2.5 text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c] shadow-md shadow-[#0b1e36]/10 hover:border-[#0b1e36] hover:bg-[#0b1e36] hover:text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Bot className="h-4 w-4 text-[#c59b48]" />
              <span className="hidden sm:inline">Ask AI</span>
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {tracks.map((tr) => (
              <button
                key={tr.id}
                onClick={() => setSelectedTrack(tr.id)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedTrack === tr.id
                    ? 'bg-[#0b1e36] text-[#dfb76c] border border-[#c59b48]/50 shadow-md shadow-[#0b1e36]/20 dark:bg-[#122c4d]'
                    : 'bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none'
                }`}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#131726]/90 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-md dark:shadow-xl hover:border-[#c59b48]/50 hover:shadow-[#c59b48]/10 dark:hover:shadow-[#c59b48]/15 transition-all flex flex-col group"
            >
              {/* Thumbnail / Header */}
              <div className="relative h-48 w-full bg-white dark:bg-slate-950 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/20 to-transparent dark:from-[#131726] dark:via-[#131726]/40 dark:to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-md bg-white/95 dark:bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-[#0b1e36] dark:text-[#c59b48] border border-slate-200 dark:border-[#c59b48]/30 backdrop-blur-md shadow-sm">
                    {course.code}
                  </span>
                  <span className="rounded-md bg-[#0b1e36] dark:bg-[#c59b48]/20 px-2 py-0.5 text-xs font-bold text-white dark:text-[#dfb76c] border border-slate-900/10 dark:border-[#c59b48]/30 backdrop-blur-md shadow-sm">
                    {course.cadreTrack} TRACK
                  </span>
                  <span className="rounded-md bg-emerald-600 dark:bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-white dark:text-emerald-300 border border-emerald-700/20 dark:border-emerald-500/30 backdrop-blur-md shadow-sm">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white group-hover:text-[#9a7224] dark:group-hover:text-[#c59b48] transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Target Competencies */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 dark:text-slate-400">
                    Mapped Competencies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {course.competencies.map((comp) => (
                      <span
                        key={comp.competencyId}
                        className="rounded bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 px-2 py-0.5 text-[10px] font-medium text-[#0b1e36] dark:text-[#dfb76c] border border-[#c59b48]/20"
                      >
                        {comp.competencyName} (Lvl {comp.requiredProficiency})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer / CTA */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900 dark:text-slate-200">{course.trainerName}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 tabular-nums">
                      <Star className="h-3 w-3 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
                      <span>{course.trainerRating} • {course.durationHours} Hours</span>
                    </div>
                  </div>

                  <Link
                    href={`/trainee/courses/${course.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0b1e36]/20 transition-all hover:scale-105"
                  >
                    <span>View Course</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#c59b48]" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}