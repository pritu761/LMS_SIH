import { redirect } from 'next/navigation';
import { Map as MapIcon } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { AdminStationsExplorer } from '@/components/admin/AdminStationsExplorer';
import { getStations } from '@/services/adminService';

export const metadata = { title: 'Station Readiness Map' };

/**
 * GET /admin/stations — live station readiness map (ADMIN only): national
 * summary cards, 38 clickable station markers (Leaflet + OSM) with a
 * region-overlay toggle, and the needs-attention list.
 */
export default async function StationsPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/admin/stations');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'ADMIN') redirect('/');

  const { stations, summary } = await getStations();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="ADMIN" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            <MapIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">Station readiness map</h1>
            <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">Live survey data • click any marker for the station dossier</p>
          </div>
        </header>
        <AdminStationsExplorer stations={stations} summary={summary} />
      </main>
    </div>
  );
}
