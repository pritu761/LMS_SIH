import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Award,
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  FileLock2,
  GitFork,
  Layers,
  LibraryBig,
  ListOrdered,
  Tag,
  UserPlus,
} from 'lucide-react';
import { getCatalogTrack, getCatalogTracks } from '@/services/catalogService';

export const revalidate = 3600;

export async function generateStaticParams() {
  const tracks = await getCatalogTracks();
  return tracks.map((t) => ({ trackId: t.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ trackId: string }> }): Promise<Metadata> {
  const { trackId } = await params;
  const track = await getCatalogTrack(trackId);
  if (!track) return { title: 'Track not found' };
  return {
    title: `${track.name} (${track.code})`,
    description: `${track.description} ${track.moduleCount} modules, ${track.lessonCount} lessons, ${track.estimatedDurationHrs} hours. Free sample lesson included.`,
  };
}

/**
 * GET /catalog/[trackId] — public track outline (no login required).
 * Pre-rendered per track + revalidated hourly (ISR). Shows the full module
 * list with descriptions, learning outcomes, WMO tags, the prerequisite
 * chain, a free sample-lesson entry point and an enroll CTA.
 */
export default async function TrackDetailPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const track = await getCatalogTrack(trackId);
  if (!track) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-400 dark:hover:text-[#dfb76c]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All tracks
        </Link>
      </nav>

      {/* Header */}
      <header className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="h-2 w-full bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#0b1e36]" aria-hidden="true" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#0b1e36] px-2.5 py-1 font-mono text-xs font-bold tracking-wider text-[#dfb76c] dark:bg-[#c59b48]/15">
              {track.code}
            </span>
            <span className="rounded-full border border-slate-200 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:border-white/15 dark:text-slate-300">
              {track.level === 'ADVANCED' ? 'Advanced' : 'Foundation'}
            </span>
            {track.hasFreePreview && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-[11px] font-bold text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300">
                <Eye className="h-3 w-3" aria-hidden="true" />
                1 free sample lesson
              </span>
            )}
          </div>

          <h1 className="font-display mt-4 text-2xl font-black text-[#0b1e36] sm:text-3xl dark:text-white">
            {track.name}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
            {track.description}
          </p>

          {track.domains.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Domains covered">
              {track.domains.map((d) => (
                <span
                  key={d}
                  className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { icon: Layers, label: 'Modules', value: String(track.moduleCount) },
              { icon: LibraryBig, label: 'Lessons', value: String(track.lessonCount) },
              { icon: Clock3, label: 'Est. duration', value: `${Math.round(track.estimatedDurationHrs)} h` },
              { icon: GitFork, label: 'Prerequisites', value: String(track.prerequisiteCount) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-3 text-center dark:bg-white/5">
                <dt className="flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Icon className="h-3.5 w-3.5 text-[#c59b48]" aria-hidden="true" />
                  {label}
                </dt>
                <dd className="font-display mt-1 text-xl font-extrabold text-[#0b1e36] dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>

          {track.certificationBadge && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-[#c59b48]/30 bg-[#c59b48]/10 px-4 py-2.5 text-sm font-bold text-[#7a5a1c] dark:text-[#dfb76c]">
              <Award className="h-5 w-5 shrink-0 text-[#c59b48]" aria-hidden="true" />
              Certification on completion: {track.certificationBadge}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {track.hasFreePreview && (
              <Link
                href={`/catalog/${track.code}/preview`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c59b48] px-6 py-3 text-sm font-extrabold text-[#0b1e36] shadow-md transition-all hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b1e36] focus-visible:ring-offset-2"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Preview Sample Lesson
              </Link>
            )}
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b1e36] px-6 py-3 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] focus-visible:ring-offset-2 dark:bg-white dark:text-[#0b1e36] dark:hover:bg-slate-200"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              Enroll / Login to Start
            </Link>
          </div>
        </div>
      </header>

      {/* Learning path order */}
      <section aria-labelledby="path-heading" className="mt-10">
        <h2
          id="path-heading"
          className="flex items-center gap-2 font-display text-lg font-extrabold text-[#0b1e36] dark:text-white"
        >
          <ListOrdered className="h-5 w-5 text-[#c59b48]" aria-hidden="true" />
          Recommended learning path
        </h2>
        <ol className="mt-4 flex flex-col gap-2">
          {track.modules.map((m, i) => (
            <li
              key={m.code}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0b1e36] font-mono text-xs font-bold text-[#dfb76c]">
                {i + 1}
              </span>
              <span className="font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]">{m.code}</span>
              <span className="font-bold text-slate-800 dark:text-slate-100">{m.title}</span>
              {m.prerequisiteCodes.length > 0 && (
                <span className="ml-auto inline-flex flex-wrap items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  Requires:
                  {m.prerequisiteCodes.map((p) => (
                    <span
                      key={p}
                      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-bold dark:bg-white/10"
                    >
                      {p}
                    </span>
                  ))}
                </span>
              )}
              {i < track.modules.length - 1 && <ChevronDown className="h-4 w-4 text-slate-300 dark:text-slate-600" aria-hidden="true" />}
            </li>
          ))}
        </ol>
      </section>

      {/* Modules */}
      <section aria-labelledby="modules-heading" className="mt-10">
        <h2
          id="modules-heading"
          className="flex items-center gap-2 font-display text-lg font-extrabold text-[#0b1e36] dark:text-white"
        >
          <BookOpenText className="h-5 w-5 text-[#c59b48]" aria-hidden="true" />
          Modules ({track.modules.length})
        </h2>
        <div className="mt-4 space-y-4">
          {track.modules.map((m, i) => (
            <details
              key={m.code}
              open={i === 0}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md dark:border-white/10 dark:bg-[#0b1e36]/60"
            >
              <summary className="flex cursor-pointer list-none items-start gap-3 p-5 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#c59b48] sm:items-center dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0b1e36]/5 font-mono text-xs font-bold text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[11px] font-bold tracking-wider text-[#9a7224] dark:text-[#dfb76c]">
                    {m.code} • {Math.round(m.durationHours)} H • {m.lessons.length} LESSONS
                  </span>
                  <span className="font-display mt-0.5 block text-base font-extrabold text-[#0b1e36] dark:text-white">
                    {m.title}
                  </span>
                </span>
                <ChevronRight
                  className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-90"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-slate-100 px-5 py-5 dark:border-white/10">
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{m.description}</p>

                {m.outcomes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Learning outcomes
                    </h3>
                    <ul className="mt-2 space-y-1.5">
                      {m.outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.wmoTags.length > 0 && (
                  <div className="mt-4">
                    <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Tag className="h-3.5 w-3.5" aria-hidden="true" />
                      WMO competency tags
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.wmoTags.map((w) => (
                        <span
                          key={w}
                          className="rounded-md border border-[#c59b48]/40 bg-[#c59b48]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#7a5a1c] dark:text-[#dfb76c]"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {m.lessons.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Lessons
                    </h3>
                    <ol className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 dark:divide-white/10 dark:border-white/10">
                      {m.lessons.map((l) => (
                        <li
                          key={l.code || l.title}
                          className="flex items-center gap-2.5 bg-slate-50/60 px-3.5 py-2.5 text-sm dark:bg-white/[0.03]"
                        >
                          {l.isPreviewFree ? (
                            <Eye className="h-4 w-4 shrink-0 text-sky-500" aria-hidden="true" />
                          ) : (
                            <FileLock2 className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                          )}
                          <span className="min-w-0 flex-1 truncate font-semibold text-slate-700 dark:text-slate-200">
                            {l.title}
                          </span>
                          {l.isPreviewFree ? (
                            <Link
                              href={`/catalog/${track.code}/preview`}
                              className="shrink-0 rounded-lg bg-sky-100 px-2.5 py-1 text-[11px] font-extrabold text-sky-700 transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:bg-sky-500/15 dark:text-sky-300 dark:hover:bg-sky-500/25"
                            >
                              FREE PREVIEW
                            </Link>
                          ) : (
                            <span className="shrink-0 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                              LOGIN TO ACCESS
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        aria-labelledby="cta-heading"
        className="relative mt-12 overflow-hidden rounded-3xl bg-[#0b1e36] p-8 text-center text-white sm:p-10"
      >
        <div
          className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#c59b48] to-transparent"
          aria-hidden="true"
        />
        <h2 id="cta-heading" className="font-display text-xl font-black sm:text-2xl">
          Ready to start <span className="text-[#dfb76c]">{track.code}</span>?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          Log in with your official Gov ID to unlock all {track.lessonCount} lessons, track competency gaps and earn
          the {track.certificationBadge ?? 'track certificate'}.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {track.hasFreePreview && (
            <Link
              href={`/catalog/${track.code}/preview`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c59b48]/60 px-6 py-3 text-sm font-extrabold text-[#dfb76c] transition-colors hover:bg-[#c59b48]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48]"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Try the free lesson first
            </Link>
          )}
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c59b48] px-6 py-3 text-sm font-extrabold text-[#0b1e36] transition-colors hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Enroll / Login to Start
          </Link>
        </div>
      </section>
    </div>
  );
}
