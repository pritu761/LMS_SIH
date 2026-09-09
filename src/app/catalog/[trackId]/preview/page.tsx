import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, Eye, FileText, PlayCircle, UserPlus } from 'lucide-react';
import { Markdown } from '@/components/catalog/Markdown';
import { getCatalogTracks, getFreePreviewLesson } from '@/services/catalogService';

export const revalidate = 3600;

export async function generateStaticParams() {
  const tracks = await getCatalogTracks();
  return tracks.filter((t) => t.hasFreePreview).map((t) => ({ trackId: t.code }));
}

export async function generateMetadata({ params }: { params: Promise<{ trackId: string }> }): Promise<Metadata> {
  const { trackId } = await params;
  const lesson = await getFreePreviewLesson(trackId);
  if (!lesson) return { title: 'Preview not found' };
  return {
    title: `Free Preview: ${lesson.lessonTitle}`,
    description: `Try a free sample lesson from ${lesson.trackName} (${lesson.trackCode}) — no login required.`,
  };
}

/**
 * GET /catalog/[trackId]/preview — one free lesson per track, no login.
 * Pre-rendered + revalidated hourly (ISR). Only lessons flagged
 * isPreviewFree + PUBLISHED are ever served here; everything else requires
 * authentication via the trainee learning-path player (Phase 1.3B).
 */
export default async function TrackPreviewPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const lesson = await getFreePreviewLesson(trackId);
  if (!lesson) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 font-bold text-slate-500 transition-colors hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-400 dark:hover:text-[#dfb76c]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Catalog
        </Link>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          /
        </span>
        <Link
          href={`/catalog/${lesson.trackCode}`}
          className="font-bold text-slate-500 transition-colors hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-400 dark:hover:text-[#dfb76c]"
        >
          {lesson.trackCode}
        </Link>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
          /
        </span>
        <span className="font-bold text-[#0b1e36] dark:text-white">Free preview</span>
      </nav>

      <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200">
        <Eye className="mr-1.5 inline h-4 w-4" aria-hidden="true" />
        You are previewing a free sample lesson from <strong>{lesson.trackName}</strong> — no login required. Enroll
        to unlock the full track.
      </div>

      <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="h-2 w-full bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#0b1e36]" aria-hidden="true" />
        <div className="p-6 sm:p-10">
          <p className="font-mono text-xs font-bold tracking-wider text-[#9a7224] dark:text-[#dfb76c]">
            {lesson.moduleCode} • {lesson.moduleTitle}
          </p>
          <h1 className="font-display mt-2 text-2xl font-black text-[#0b1e36] sm:text-3xl dark:text-white">
            {lesson.lessonTitle}
          </h1>
          {lesson.wmoTags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5" aria-label="WMO competency tags">
              {lesson.wmoTags.map((w) => (
                <span
                  key={w}
                  className="rounded-md border border-[#c59b48]/40 bg-[#c59b48]/10 px-2 py-0.5 font-mono text-[11px] font-bold text-[#7a5a1c] dark:text-[#dfb76c]"
                >
                  {w}
                </span>
              ))}
            </div>
          )}

          <div className="mt-2">
            <Markdown content={lesson.content} />
          </div>

          {lesson.videoUrl && (
            <a
              href={lesson.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-[#0b1e36] transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-white"
            >
              <PlayCircle className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
              Watch the companion video
            </a>
          )}

          {lesson.resources.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Downloadable resources
              </h2>
              <ul className="mt-2 space-y-2">
                {lesson.resources.map((r) => (
                  <li key={r.id}>
                    <a
                      href={r.url}
                      download
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/10 dark:hover:border-[#c59b48]/50"
                    >
                      <FileText className="h-5 w-5 shrink-0 text-[#c59b48]" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{r.name}</span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {r.kind}
                          {r.size ? ` • ${r.size}` : ''}
                        </span>
                      </span>
                      <Download className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

      <section
        aria-labelledby="preview-cta"
        className="mt-8 rounded-3xl bg-[#0b1e36] p-8 text-center text-white"
      >
        <h2 id="preview-cta" className="font-display text-xl font-black">
          Liked this lesson? <span className="text-[#dfb76c]">Unlock the full track.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-300">
          Enroll to access every lesson, track your competency radar and earn a verifiable certificate.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#c59b48] px-6 py-3 text-sm font-extrabold text-[#0b1e36] transition-colors hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Enroll / Login to Start
          </Link>
          <Link
            href={`/catalog/${lesson.trackCode}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3 text-sm font-extrabold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48]"
          >
            Back to {lesson.trackCode} outline
          </Link>
        </div>
      </section>
    </div>
  );
}
