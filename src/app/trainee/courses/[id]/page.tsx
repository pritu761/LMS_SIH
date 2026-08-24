import React from 'react';
import { initialCourses, initialEnrollments } from '@/lib/mockData';
import { CoursePlayer } from '@/components/trainee/CoursePlayer';
import { Sidebar } from '@/components/layout/Sidebar';
import { notFound } from 'next/navigation';

export default function CourseStreamPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const course = initialCourses.find((c) => c.id === id || c.slug === id) || initialCourses[0];

  if (!course) {
    notFound();
  }

  const enrollment = initialEnrollments.find((e) => e.courseId === course.id) || {
    completedMaterialIds: ['mat-1'],
    progressPercentage: 50,
  };

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="TRAINEE" />

      <main className="flex-1 min-w-0">
        <CoursePlayer course={course} initialEnrollment={enrollment} />
      </main>
    </div>
  );
}
