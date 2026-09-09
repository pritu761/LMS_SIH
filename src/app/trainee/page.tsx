import { redirect } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { CompetencyRadarCard } from '@/components/trainee/CompetencyRadarCard';
import { LearningPathPlayer } from '@/components/trainee/LearningPathPlayer';
import { PrereqGraph } from '@/components/trainee/PrereqGraph';
import { ScheduleCalendar } from '@/components/trainee/ScheduleCalendar';
import { CertificateWall } from '@/components/trainee/CertificateWall';
import { RadarStudies } from '@/components/trainee/RadarStudies';
import { getCertificates, getSchedule, getTraineeTracks } from '@/services/traineeService';
import { getSharedStudies } from '@/services/radarService';

export const metadata = {
  title: 'My Learning Dashboard',
};

function greetingFor(date: Date): string {
  const hour = Number(
    new Intl.DateTimeFormat('en-IN', { hour: 'numeric', hour12: false, timeZone: 'Asia/Kolkata' }).format(date)
  );
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * GET /trainee — authenticated trainee dashboard (TRAINEE role; ADMIN is
 * admitted by the proxy and sees their own data only).
 *
 * Sections: (A) competency radar, (B) learning-path player, (C) prerequisite
 * graph, (D) schedule + .ics export, (E) certificate wall. All server data
 * is scoped to the logged-in user; the radar hydrates from its own API.
 */
export default async function TraineeDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string; lesson?: string }>;
}) {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/trainee');
  if (session.status === 'PENDING') redirect('/auth/pending');

  const sp = await searchParams;
  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
    select: { fullName: true },
  });
  const name = session.fullName || profile?.fullName || 'Officer';

  const now = new Date();
  const [tracksPayload, schedule, certificates, studies] = await Promise.all([
    getTraineeTracks(session.userId),
    getSchedule(session.userId, new Date(now.getTime() - 30 * 24 * 3600 * 1000), new Date(now.getTime() + 90 * 24 * 3600 * 1000)),
    getCertificates(session.userId),
    getSharedStudies(session.userId),
  ]);

  // Resolve deep link (?module=&lesson=) against real outline data.
  const deepTrack = tracksPayload.tracks.find((t) => t.modules.some((m) => m.code === (sp.module ?? '').toUpperCase()));
  const initialTrackCode = deepTrack?.code;
  const initialModuleCode = sp.module?.toUpperCase();
  const initialLessonCode = sp.lesson?.toUpperCase();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="TRAINEE" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">
              {greetingFor(now)}, {name.split(' ')[0]}
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              {tracksPayload.cohortTrackCode ? (
                <>Cohort track <span className="font-mono font-bold text-[#9a7224] dark:text-[#dfb76c]">{tracksPayload.cohortTrackCode}</span> • </>
              ) : null}
              {tracksPayload.resume ? (
                <>Resume where you left off in the player below.</>
              ) : (
                <>Pick a track in the player below to begin.</>
              )}
            </p>
          </div>
        </header>

        <CompetencyRadarCard />

        <LearningPathPlayer
          tracks={tracksPayload.tracks}
          cohortTrackCode={tracksPayload.cohortTrackCode}
          resume={tracksPayload.resume}
          initialTrackCode={initialTrackCode}
          initialModuleCode={initialModuleCode}
          initialLessonCode={initialLessonCode}
        />

        <PrereqGraph tracks={tracksPayload.tracks} cohortTrackCode={tracksPayload.cohortTrackCode} />

        <ScheduleCalendar items={schedule} />

        <RadarStudies studies={studies} />

        <CertificateWall certificates={certificates} />
      </main>
    </div>
  );
}
