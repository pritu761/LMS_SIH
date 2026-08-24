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
} from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { initialCourses, initialCompetencies } from '@/lib/mockData';

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const categories = ['ALL', 'Cloud & DevOps', 'Data & AI', 'Governance & Leadership'];

  const filteredCourses = initialCourses.filter((course) => {
    const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0 space-y-6">
        
        {/* Header */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-indigo-500/10 px-2.5 py-0.5 text-xs font-bold text-indigo-400 border border-indigo-500/20">
              NATIONAL CURRICULUM
            </span>
            <span className="text-xs text-slate-400">Accredited Capacity Building Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Explore Courses & Competencies
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Select high-impact modules to earn verified digital credentials and upgrade your skill portfolio.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by topic, competency, or course code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-700/80 bg-slate-900/80 pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-xl hover:border-indigo-500/50 transition-all flex flex-col group"
            >
              {/* Thumbnail / Header */}
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="rounded-md bg-slate-950/80 px-2 py-0.5 text-xs font-bold text-indigo-400 border border-slate-700 backdrop-blur-md">
                    {course.code}
                  </span>
                  <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Target Competencies */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Mapped Competencies
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {course.competencies.map((comp) => (
                      <span
                        key={comp.competencyId}
                        className="rounded bg-indigo-950/70 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20"
                      >
                        {comp.competencyName}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer / CTA */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{course.trainerName}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span>{course.trainerRating} ★ • {course.durationHours} Hours</span>
                    </div>
                  </div>

                  <Link
                    href={`/trainee/courses/${course.id}`}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <span>Enroll / Play</span>
                    <ChevronRight className="h-3.5 w-3.5" />
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
