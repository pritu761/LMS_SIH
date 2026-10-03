import Link from 'next/link';
import { Presentation } from 'lucide-react';
import type { AnnotationShape, SharedStudy } from '@/services/radarTypes';

function ShapePreview({ shapes }: { shapes: AnnotationShape[] }) {
  const W = 120;
  const H = 74;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Annotation preview with ${shapes.length} shapes`} className="h-[74px] w-[120px] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-[#0b1e36] dark:border-white/10">
      <rect x={0} y={0} width={W} height={H} fill="#0b1e36" />
      {shapes.slice(0, 12).map((s, i) => {
        const pts = s.points.map((p) => `${(p.x * W).toFixed(1)},${(p.y * H).toFixed(1)}`).join(' ');
        if (s.tool === 'free') {
          return <polyline key={i} points={pts} fill="none" stroke={s.color} strokeWidth={s.width} strokeLinecap="round" />;
        }
        if (s.tool === 'arrow' && s.points.length > 1) {
          const a = s.points[0];
          const b = s.points[s.points.length - 1];
          return <line key={i} x1={a.x * W} y1={a.y * H} x2={b.x * W} y2={b.y * H} stroke={s.color} strokeWidth={s.width} strokeLinecap="round" />;
        }
        if (s.tool === 'rect' && s.points.length > 1) {
          const a = s.points[0];
          const b = s.points[s.points.length - 1];
          return <rect key={i} x={Math.min(a.x, b.x) * W} y={Math.min(a.y, b.y) * H} width={Math.abs(b.x - a.x) * W} height={Math.abs(b.y - a.y) * H} fill="none" stroke={s.color} strokeWidth={s.width} />;
        }
        if (s.tool === 'circle' && s.points.length > 1) {
          const a = s.points[0];
          const b = s.points[s.points.length - 1];
          return <circle key={i} cx={a.x * W} cy={a.y * H} r={Math.hypot((b.x - a.x) * W, (b.y - a.y) * H)} fill="none" stroke={s.color} strokeWidth={s.width} />;
        }
        return null;
      })}
    </svg>
  );
}

/**
 * Radar Case Study cards (Phase 2.3D, trainee side): annotated frames
 * trainers shared with the trainee's cohorts, with drawing thumbnails.
 */
export function RadarStudies({ studies }: { studies: SharedStudy[] }) {
  if (studies.length === 0) return null;
  return (
    <section id="radar-studies" aria-labelledby="studies-heading" className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
          <Presentation className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <h2 id="studies-heading" className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
            Radar case studies from your trainers
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{studies.length} annotated frame(s) shared with your cohorts</p>
        </span>
        <Link
          href="/radar"
          className="ml-auto rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
        >
          Open live radar
        </Link>
      </header>
      <ul className="grid gap-4 p-5 sm:grid-cols-2">
        {studies.map((s) => (
          <li key={s.id} className="flex gap-3 rounded-2xl border border-slate-100 p-3 dark:border-white/10">
            <ShapePreview shapes={s.drawing.shapes} />
            <span className="min-w-0">
              <span className="block font-mono text-[11px] font-bold text-[#9a7224] dark:text-[#dfb76c]">
                {s.caseCode} • T{s.frameT}{s.cohortCode ? ` • ${s.cohortCode}` : ''}
              </span>
              <span className="block truncate text-sm font-extrabold text-slate-800 dark:text-slate-100">{s.caseTitle}</span>
              <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-slate-600 dark:text-slate-300">{s.note}</span>
              <span className="mt-1 block font-mono text-[10px] text-slate-500">
                {s.authorName} • {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
