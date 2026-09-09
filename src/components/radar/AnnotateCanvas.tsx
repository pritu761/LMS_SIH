'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Brush, Circle as CircleIcon, Loader2, Pencil, Send, Square, Undo2, X } from 'lucide-react';
import type { AnnotationShape } from '@/services/radarTypes';

type Tool = AnnotationShape['tool'] | 'off';

const COLORS = ['#c59b48', '#38bdf8', '#fb7185'];

function drawShape(ctx: CanvasRenderingContext2D, s: AnnotationShape, W: number, H: number) {
  const pts = s.points.map((p) => ({ x: p.x * W, y: p.y * H }));
  if (pts.length === 0) return;
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (s.tool === 'free') {
    ctx.moveTo(pts[0].x, pts[0].y);
    for (const p of pts.slice(1)) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  } else if (s.tool === 'rect' && pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    ctx.strokeRect(a.x, a.y, b.x - a.x, b.y - a.y);
  } else if (s.tool === 'circle' && pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    ctx.beginPath();
    ctx.arc(a.x, a.y, Math.hypot(b.x - a.x, b.y - a.y), 0, Math.PI * 2);
    ctx.stroke();
  } else if (s.tool === 'arrow' && pts.length > 1) {
    const a = pts[0];
    const b = pts[pts.length - 1];
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    const head = 12;
    for (const d of [Math.PI - 0.45, Math.PI + 0.45]) {
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + head * Math.cos(ang + d - Math.PI), b.y + head * Math.sin(ang + d - Math.PI));
      ctx.stroke();
    }
  }
}

/**
 * Trainer annotation overlay (Phase 2.3D): freehand + shapes drawn on a
 * canvas pinned over the ops map, then shared to a cohort with a note
 * (saved frame + fan-out notifications → trainee Radar Case Study cards).
 * Coordinates are normalized (0–1) so drawings survive resizes.
 */
export function AnnotateCanvas({
  cohorts,
  caseId,
  frameT,
}: {
  cohorts: Array<{ id: string; code: string }>;
  caseId: string | null;
  frameT: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('off');
  const [color, setColor] = useState(COLORS[0]);
  const [shapes, setShapes] = useState<AnnotationShape[]>([]);
  const [current, setCurrent] = useState<AnnotationShape | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [cohortId, setCohortId] = useState(cohorts[0]?.id ?? '');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = wrap.clientWidth;
    const H = wrap.clientHeight;
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const s of shapes) drawShape(ctx, s, W, H);
    if (current) drawShape(ctx, current, W, H);
  }, [shapes, current]);

  useEffect(() => {
    paint();
    const onResize = () => paint();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [paint]);

  const toNorm = (e: React.PointerEvent) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height)),
    };
  };

  const onDown = (e: React.PointerEvent) => {
    if (tool === 'off') return;
    const p = toNorm(e);
    if (!p) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setCurrent({ tool, points: [p], color, width: 3 });
  };
  const onMove = (e: React.PointerEvent) => {
    if (tool === 'off' || !current) return;
    const p = toNorm(e);
    if (!p) return;
    if (tool === 'free') setCurrent({ ...current, points: [...current.points, p].slice(-500) });
    else setCurrent({ ...current, points: [current.points[0], p] });
  };
  const onUp = () => {
    if (current && current.points.length > 1) {
      setShapes((s) => [...s, current].slice(-200));
    }
    setCurrent(null);
  };

  const share = async () => {
    if (!cohortId || !note.trim() || shapes.length === 0) return;
    setSending(true);
    setMessage(null);
    try {
      const res = await fetch('/api/radar/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, cohortId, frameT, drawing: { shapes }, note: note.trim() }),
      });
      const body = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!res.ok || !body.success) throw new Error(body.error?.message ?? 'Share failed.');
      setMessage(`Shared to cohort — trainees get a Radar Case Study card + notification.`);
      setShareOpen(false);
      setNote('');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Share failed.');
    } finally {
      setSending(false);
    }
  };

  const tools: Array<{ id: Tool; label: string; Icon: typeof Brush }> = [
    { id: 'off', label: 'Navigate map', Icon: X },
    { id: 'free', label: 'Freehand', Icon: Brush },
    { id: 'rect', label: 'Rectangle', Icon: Square },
    { id: 'circle', label: 'Circle', Icon: CircleIcon },
    { id: 'arrow', label: 'Arrow', Icon: ArrowUpRight },
  ];

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-[400]">
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setCurrent(null)}
        className={`absolute inset-0 h-full w-full touch-none ${tool === 'off' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'}`}
        aria-label="Radar annotation canvas"
      />
      {/* Toolbar */}
      <div className="pointer-events-auto absolute left-3 top-12 flex flex-col gap-1 rounded-xl border border-slate-700 bg-slate-950/90 p-1.5 shadow-xl" role="toolbar" aria-label="Annotation tools">
        {tools.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTool(id)}
            aria-pressed={tool === id}
            title={label}
            className={`rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${tool === id ? 'bg-[#c59b48] text-[#0b1e36]' : 'text-slate-300 hover:bg-white/10'}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}
        <span className="my-0.5 h-px bg-white/15" aria-hidden="true" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            aria-label={`Ink color ${c}`}
            aria-pressed={color === c}
            className={`mx-auto h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-slate-950 ${color === c ? 'ring-white' : 'ring-transparent'}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <span className="my-0.5 h-px bg-white/15" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setShapes((s) => s.slice(0, -1))}
          disabled={shapes.length === 0}
          title="Undo last shape"
          className="rounded-lg p-2 text-slate-300 hover:bg-white/10 disabled:opacity-40"
        >
          <Undo2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {tool !== 'off' && (
        <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/90 px-3 py-1 font-mono text-[11px] font-bold text-amber-300">
          Draw on the frame • {shapes.length} shape(s)
        </p>
      )}
      {shapes.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setShareOpen(true);
          }}
          className="pointer-events-auto absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-[#c59b48] px-4 py-2.5 text-xs font-extrabold text-[#0b1e36] shadow-xl hover:bg-[#dfb76c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Send className="h-3.5 w-3.5" aria-hidden="true" />
          Share to Cohort
        </button>
      )}
      {message && !shareOpen && (
        <p className="pointer-events-auto absolute bottom-14 right-3 max-w-[260px] rounded-xl bg-slate-950/92 px-3 py-2 text-[11px] font-bold text-slate-200" aria-live="polite">
          {message}
        </p>
      )}

      {shareOpen && (
        <div className="pointer-events-auto fixed inset-0 z-[600] flex items-end justify-center bg-black/55 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <h2 id="share-title" className="flex items-center gap-2 font-display text-lg font-black text-[#0b1e36] dark:text-white">
              <Pencil className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
              Share annotated frame
            </h2>
            <p className="mt-1 font-mono text-[11px] text-slate-500">
              {shapes.length} shape(s) • frame T{frameT} • appears as a Radar Case Study card for the cohort
            </p>
            <label htmlFor="share-cohort" className="mt-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Cohort
            </label>
            <select
              id="share-cohort"
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            >
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>{c.code}</option>
              ))}
            </select>
            <label htmlFor="share-note" className="mt-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Trainer note
            </label>
            <textarea
              id="share-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What should trainees notice in this frame? (e.g. gust-front fine line ahead of the cores)"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/30 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShareOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={share}
                disabled={sending || !cohortId || !note.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
              >
                {sending ? 'Sharing…' : 'Share frame'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
