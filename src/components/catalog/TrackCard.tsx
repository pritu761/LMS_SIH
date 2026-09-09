import Link from 'next/link';
import { ArrowRight, Award, Clock3, Eye, GitFork, Layers, LibraryBig } from 'lucide-react';
import type { CatalogTrackSummary } from '@/services/catalogTypes';

const LEVEL_STYLES: Record<string, string> = {
  FOUNDATION:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30',
  ADVANCED:
    'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
};

interface TrackCardProps {
  track: CatalogTrackSummary;
  /** Module/lesson-level match context from keyword search (optional). */
  matchNote?: string | null;
}

/**
 * Public catalog track card: title, domains, module/lesson counts, estimated
 * duration, certification badge and prerequisite-link count.
 */
export function TrackCard({ track, matchNote }: TrackCardProps) {
  return (
    <article
      aria-labelledby={`track-${track.code}-title`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#0b1e36]/10 hover:border-[#c59b48]/50 dark:border-white/10 dark:bg-[#0b1e36]/60 dark:hover:border-[#c59b48]/50"
    >
      <div className="h-1.5 w-full bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#0b1e36]" aria-hidden="true" />
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#0b1e36] px-2 py-1 font-mono text-[11px] font-bold tracking-wider text-[#dfb76c] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
            {track.code}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${LEVEL_STYLES[track.level] ?? LEVEL_STYLES['FOUNDATION']}`}
          >
            {track.level === 'ADVANCED' ? 'Advanced' : 'Foundation'}
          </span>
          {track.hasFreePreview && (
            <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
              <Eye className="h-3 w-3" aria-hidden="true" />
              Free preview
            </span>
          )}
        </div>

        <div>
          <h3
            id={`track-${track.code}-title`}
            className="font-display text-lg font-extrabold leading-snug text-[#0b1e36] dark:text-white"
          >
            <Link href={`/catalog/${track.code}`} className="transition-colors group-hover:text-[#9a7224] dark:group-hover:text-[#dfb76c]">
              <span aria-hidden="true" className="absolute inset-0" />
              {track.name}
            </Link>
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{track.description}</p>
        </div>

        {track.domains.length > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label={`Domains covered in ${track.name}`}>
            {track.domains.map((d) => (
              <span
                key={d}
                className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200"
              >
                {d}
              </span>
            ))}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-center dark:border-white/10 sm:grid-cols-4">
          <div className="rounded-lg bg-slate-50 px-1 py-2 dark:bg-white/5">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Layers className="h-3 w-3" aria-hidden="true" /> Modules
            </dt>
            <dd className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">{track.moduleCount}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-1 py-2 dark:bg-white/5">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <LibraryBig className="h-3 w-3" aria-hidden="true" /> Lessons
            </dt>
            <dd className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">{track.lessonCount}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-1 py-2 dark:bg-white/5">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Clock3 className="h-3 w-3" aria-hidden="true" /> Hours
            </dt>
            <dd className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">
              {Math.round(track.estimatedDurationHrs)}
            </dd>
          </div>
          <div className="rounded-lg bg-slate-50 px-1 py-2 dark:bg-white/5">
            <dt className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <GitFork className="h-3 w-3" aria-hidden="true" /> Prereqs
            </dt>
            <dd className="font-display text-lg font-extrabold text-[#0b1e36] dark:text-white">{track.prerequisiteCount}</dd>
          </div>
        </dl>

        {track.certificationBadge && (
          <p className="flex items-center gap-2 rounded-lg border border-[#c59b48]/30 bg-[#c59b48]/10 px-3 py-2 text-xs font-bold text-[#7a5a1c] dark:text-[#dfb76c]">
            <Award className="h-4 w-4 shrink-0 text-[#c59b48]" aria-hidden="true" />
            {track.certificationBadge}
          </p>
        )}

        {matchNote && (
          <p className="text-xs font-semibold text-sky-700 dark:text-sky-300" role="note">
            {matchNote}
          </p>
        )}

        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-bold text-[#0b1e36] dark:text-[#dfb76c]">
          View track outline
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
