import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { initialCourses, initialEnrollments } from '@/lib/mockData';
import { CoursePlayer } from '@/components/trainee/CoursePlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { notFound } from 'next/navigation';

export default async function CourseStreamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = initialCourses.find((c) => c.id === id || c.slug === id);

  if (!course) {
    notFound();
  }

  const enrollment = initialEnrollments.find((e) => e.courseId === course.id) || {
    completedMaterialIds: [],
    progressPercentage: 0,
  };

  const relatedCourses = initialCourses.filter(
    (c) => c.id !== course.id && (c.cadreTrack === course.cadreTrack || c.trainerId === course.trainerId)
  ).slice(0, 2);

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0 space-y-6">
        <Link
          href="/trainee/courses"
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#0b1e36] dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Back to Mission Tracks</span>
        </Link>

        <CoursePlayer course={course} initialEnrollment={enrollment} />

        {relatedCourses.length > 0 && (
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Continue with related {course.cadreTrack} modules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedCourses.map((c) => (
                <Link
                  key={c.id}
                  href={`/trainee/courses/${c.id}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-[#c59b48]/50 transition-all group"
                >
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">{c.code} • {c.cadreTrack} • {c.durationHours}h</div>
                  <div className="text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-[#9a7224] dark:group-hover:text-[#dfb76c] leading-snug mt-1 line-clamp-2">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{c.trainerName} • ★ {c.trainerRating.toFixed(1)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
