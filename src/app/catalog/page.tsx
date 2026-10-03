import type { Metadata } from 'next';
import { CatalogExplorer } from '@/components/catalog/CatalogExplorer';
import { getCatalogTracks } from '@/services/catalogService';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Public Curriculum Catalog',
  description:
    'Browse IMD Mission Mausam training tracks — IMTC, FTC, DRSTC and Modular short courses — with modules, WMO competencies and free sample lessons. No login required.',
};

/**
 * GET /catalog — public curriculum catalog (no login required).
 * Statically generated + revalidated hourly (ISR). Curriculum metadata is
 * fetched from the DB via Prisma; no user data is involved, so no PII can
 * leak. Interactive search/filtering runs client-side in <CatalogExplorer/>.
 */
export default async function CatalogPage() {
  const tracks = await getCatalogTracks();
  const totalModules = tracks.reduce((n, t) => n + t.moduleCount, 0);
  const totalLessons = tracks.reduce((n, t) => n + t.lessonCount, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#9a7224] dark:text-[#dfb76c]">
          IMD • Mission Mausam • Open to all
        </p>
        <h1 className="font-display mt-3 text-3xl font-black text-[#0b1e36] sm:text-4xl dark:text-white">
          Public Curriculum Catalog
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          Every training track, module and WMO competency in one place —{' '}
          <span className="font-bold text-[#0b1e36] dark:text-white">{tracks.length} tracks</span>,{' '}
          <span className="font-bold text-[#0b1e36] dark:text-white">{totalModules} modules</span>,{' '}
          <span className="font-bold text-[#0b1e36] dark:text-white">{totalLessons} lessons</span>. Open any track for
          the full outline and a free sample lesson. No login required.
        </p>
      </header>

      <div className="mt-10">
        <CatalogExplorer tracks={tracks} />
      </div>
    </div>
  );
}
