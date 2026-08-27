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
    DRSTC: { bg: 'bg-[#e0234e]/15', text: 'text-[#ff4d6d]', border: 'border-[#e0234e]/30' },
    FTC: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    IMTC: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    MODULAR: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  };

  const style = cadreColors[course.cadreTrack] || cadreColors.DRSTC;

  return (
    <div className="my-2 group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-3.5 backdrop-blur-md transition-all duration-300 hover:border-[#e0234e]/50 hover:bg-slate-800/90 shadow-lg hover:shadow-[#e0234e]/15">
      <div className="flex gap-3">
        {/* Thumbnail Preview */}
        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-800">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/80 px-1 py-0.5 text-[9px] font-bold text-slate-300">
            <Clock className="h-2.5 w-2.5 text-[#ff4d6d]" />
            {course.durationHours}h
          </div>
        </div>

        {/* Course Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span
              className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}
            >
              {course.cadreTrack}
            </span>
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 border border-white/5">
              {course.code}
            </span>
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-slate-300">
              {course.level}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white group-hover:text-[#ff758c] transition-colors line-clamp-1">
            {course.title}
          </h4>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate max-w-[140px]">
              {course.trainerName}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-semibold flex-shrink-0">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{course.trainerRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="text-[10px] text-slate-400 flex items-center gap-1">
          <BookOpen className="h-3 w-3 text-[#ff4d6d]" />
          <span>{course.materials?.length || 0} Lectures & Docs</span>
        </div>

        <Link
          href={`/trainee/courses/${course.id}`}
          onClick={onNavigate}
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#e0234e] to-[#ff4d6d] px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm shadow-[#e0234e]/25 transition-all duration-200 hover:from-[#d01b44] hover:to-[#ea2845] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Play className="h-2.5 w-2.5 fill-white" />
          <span>View Course</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
