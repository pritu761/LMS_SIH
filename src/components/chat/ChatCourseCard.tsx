'use client';

import React from 'react';
import Link from 'next/link';
import { MockCourse } from '@/lib/mockData';
import { BookOpen, Clock, Star, Award, ChevronRight, Play, CheckCircle2 } from 'lucide-react';

interface ChatCourseCardProps {
  course: MockCourse;
  onNavigate?: () => void;
}

export function ChatCourseCard({ course, onNavigate }: ChatCourseCardProps) {
  const cadreColors: Record<string, { bg: string; text: string; border: string }> = {
    DRSTC: { bg: 'bg-[#c59b48]/15', text: 'text-[#9a7224] dark:text-[#dfb76c]', border: 'border-[#c59b48]/30' },
    FTC: { bg: 'bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30' },
    IMTC: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30' },
    MODULAR: { bg: 'bg-purple-500/10', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-500/30' },
  };

  const style = cadreColors[course.cadreTrack] || cadreColors.DRSTC;

  return (
    <div className="my-2 group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/90 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-[#c59b48]/50 hover:bg-slate-50 dark:hover:bg-slate-800/90 shadow-lg hover:shadow-[#c59b48]/15">
      <div className="flex gap-3">
        {/* Thumbnail Preview */}
        <Link
          href={`/trainee/courses/${course.id}`}
          onClick={onNavigate}
          className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 block cursor-pointer"
        >
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-slate-200 tabular-nums">
            <Clock className="h-2.5 w-2.5 text-[#c59b48]" />
            {course.durationHours}h
          </div>
        </Link>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
            >
              {course.cadreTrack}
            </span>
            <span className="rounded-md bg-slate-900/[0.06] dark:bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-900/10 dark:border-white/5">
              {course.code}
            </span>
            <span className="rounded-md bg-slate-900/[0.06] dark:bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:text-slate-300 border border-slate-900/10 dark:border-white/5">
              {course.level}
            </span>
          </div>

          <Link href={`/trainee/courses/${course.id}`} onClick={onNavigate} className="block">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#9a7224] dark:group-hover:text-[#c59b48] transition-colors line-clamp-1 hover:underline cursor-pointer">
              {course.title}
            </h4>
          </Link>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate max-w-[140px]">
              {course.trainerName}
            </span>
            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold flex-shrink-0 tabular-nums">
              <Star className="h-3 w-3 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
              <span>{course.trainerRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-[#c59b48]" />
          <span>{course.materials?.length || 0} Lectures & Docs</span>
        </div>

        <Link
          href={`/trainee/courses/${course.id}`}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-[#0b1e36]/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="h-2.5 w-2.5 fill-white" />
          <span>View Course</span>
          <ChevronRight className="h-3 w-3 text-[#c59b48]" />
        </Link>
      </div>
    </div>
  );
}