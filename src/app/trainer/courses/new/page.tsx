import { redirect } from 'next/navigation';
import { PenSquare } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { LessonStudio } from '@/components/trainer/LessonStudio';
import { getWmoTagSuggestions, listAuthoringLessons, listAuthoringModules } from '@/services/trainerService';

export const metadata = { title: 'Course Authoring Studio' };

/**
 * GET /trainer/courses/new — block-based lesson authoring studio (Section B):
 * text / video / file / quiz / code blocks, WMO tag picker, draft → publish
 * (versioned) → archive lifecycle, version history with diff + rollback.
 * The picker also opens existing lessons for editing.
 */
export default async function CourseAuthoringPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainer/courses/new');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const [modules, lessons, wmoSuggestions] = await Promise.all([
    listAuthoringModules(),
    listAuthoringLessons(),
    getWmoTagSuggestions(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINER" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <PenSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">
              Course authoring studio
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {modules.length} modules • {lessons.length} lessons • every publish snapshots a version
            </p>
          </div>
        </header>
        <LessonStudio modules={modules} lessons={lessons} wmoSuggestions={wmoSuggestions} />
      </main>
    </div>
  );
}
