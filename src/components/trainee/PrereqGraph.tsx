'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ArrowRight, GitFork } from 'lucide-react';
import type { ModuleStatus, TraineeTrackView } from '@/services/traineeTypes';
import { MODULE_STATUS_LABEL } from '@/services/traineeTypes';

type ModuleNode = Node<{ label: React.ReactNode; code: string; status: ModuleStatus }>;

const STATUS_STYLE: Record<ModuleStatus, { border: string; bg: string; dot: string }> = {
  completed: { border: '#10b981', bg: '#ecfdf5', dot: '#10b981' },
  'in-progress': { border: '#2563eb', bg: '#eff6ff', dot: '#2563eb' },
  locked: { border: '#94a3b8', bg: '#f1f5f9', dot: '#94a3b8' },
  failed: { border: '#f43f5e', bg: '#fff1f2', dot: '#f43f5e' },
  available: { border: '#0b1e36', bg: '#ffffff', dot: '#0b1e36' },
};

function layoutModules(modules: TraineeTrackView['modules']): { nodes: ModuleNode[]; edges: Edge[] } {
  const byCode = new Map(modules.map((m) => [m.code, m]));
  const depthMemo = new Map<string, number>();
  const depth = (code: string, seen: string[]): number => {
    const hit = depthMemo.get(code);
    if (hit !== undefined) return hit;
    if (seen.indexOf(code) !== -1) return 0;
    const next = seen.concat([code]);
    const m = byCode.get(code);
    const d =
      !m || m.prerequisiteCodes.length === 0
        ? 0
        : 1 + Math.max.apply(null, [0].concat(m.prerequisiteCodes.map((p) => depth(p, next))));
    depthMemo.set(code, d);
    return d;
  };
  const layerList: Array<{ depth: number; items: typeof modules }> = [];
  modules.forEach((m) => {
    const d = depth(m.code, []);
    const found = layerList.filter((l) => l.depth === d)[0];
    if (found) found.items.push(m);
    else layerList.push({ depth: d, items: [m] });
  });
  layerList.sort((a, b) => a.depth - b.depth);
  const nodes: ModuleNode[] = [];
  layerList.forEach((layer) => {
    layer.items.forEach((m, i) => {
      const s = STATUS_STYLE[m.status];
      nodes.push({
        id: m.code,
        position: { x: layer.depth * 250 + 10, y: i * 132 + 10 },
        data: {
          code: m.code,
          status: m.status,
          label: (
            <div className="w-[200px] text-left">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.dot }} />
                {m.code}
              </span>
              <span className="mt-0.5 block truncate text-[13px] font-extrabold text-slate-800">{m.title}</span>
              <span className="mt-0.5 block text-[11px] font-semibold text-slate-500">
                {m.completedLessons}/{m.totalLessons} lessons • {MODULE_STATUS_LABEL[m.status]}
              </span>
            </div>
          ),
        },
        style: { border: `2px solid ${s.border}`, background: s.bg, borderRadius: 14, padding: 10, width: 220 },
      });
    });
  });
  const edges: Edge[] = [];
  for (const m of modules) {
    for (const pre of m.prerequisiteCodes) {
      if (!byCode.has(pre)) continue;
      edges.push({
        id: `${pre}->${m.code}`,
        source: pre,
        target: m.code,
        animated: m.status === 'locked',
        style: { stroke: '#c59b48', strokeWidth: 2 },
      });
    }
  }
  return { nodes, edges };
}

/**
 * Prerequisite DAG (Section C): modules as nodes, prerequisites as edges,
 * colored green (completed) / blue (in progress) / gray (locked) / red
 * (failed). Selecting a node shows its summary with a deep link into the
 * learning-path player.
 */
export function PrereqGraph({ tracks, cohortTrackCode }: { tracks: TraineeTrackView[]; cohortTrackCode: string | null }) {
  const [trackCode, setTrackCode] = useState(cohortTrackCode ?? tracks[0]?.code ?? '');
  const track = useMemo(() => tracks.find((t) => t.code === trackCode) ?? tracks[0], [tracks, trackCode]);
  const { nodes, edges } = useMemo(() => layoutModules(track?.modules ?? []), [track]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const selected = track?.modules.find((m) => m.code === selectedCode) ?? null;

  if (!track) return null;

  return (
    <section aria-labelledby="prereq-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
          <GitFork className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <h2 id="prereq-heading" className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
            Prerequisite graph
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Click a module for details • drag to pan • scroll to zoom</p>
        </span>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Select track for graph">
          {tracks.map((t) => (
            <button
              key={t.code}
              type="button"
              onClick={() => {
                setTrackCode(t.code);
                setSelectedCode(null);
              }}
              aria-pressed={t.code === track.code}
              className={`rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${
                t.code === track.code
                  ? 'bg-[#0b1e36] text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300'
              }`}
            >
              {t.code}
            </button>
          ))}
        </div>
      </header>
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="h-[440px] w-full bg-slate-50/60 dark:bg-black/20" role="application" aria-label={`Prerequisite graph for ${track.code}`}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={(_e, n) => setSelectedCode((n as ModuleNode).id)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.4}
            proOptions={{ hideAttribution: false }}
          >
            <Background gap={18} size={1} />
            <Controls position="bottom-right" />
            <MiniMap pannable zoomable style={{ background: 'transparent' }} />
          </ReactFlow>
        </div>
        <aside aria-live="polite" aria-label="Selected module" className="border-t border-slate-100 p-5 lg:border-l lg:border-t-0 dark:border-white/10">
          {selected ? (
            <div>
              <p className="font-mono text-[11px] font-bold text-[#9a7224] dark:text-[#dfb76c]">{selected.code}</p>
              <h3 className="font-display mt-1 text-base font-extrabold text-[#0b1e36] dark:text-white">{selected.title}</h3>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selected.description}</p>
              <dl className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="font-bold text-slate-500">Status</dt>
                  <dd className="font-bold text-slate-700 dark:text-slate-200">{MODULE_STATUS_LABEL[selected.status]}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="font-bold text-slate-500">Lessons</dt>
                  <dd className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {selected.completedLessons}/{selected.totalLessons}
                  </dd>
                </div>
                {selected.prerequisiteCodes.length > 0 && (
                  <div className="flex justify-between gap-2">
                    <dt className="font-bold text-slate-500">Requires</dt>
                    <dd className="font-mono font-bold text-slate-700 dark:text-slate-200">{selected.prerequisiteCodes.join(', ')}</dd>
                  </div>
                )}
              </dl>
              <Link
                href={`/trainee?module=${selected.code}#learning-path`}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
              >
                Go to Module
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 text-center">
              <GitFork className="h-8 w-8 text-slate-300 dark:text-slate-600" aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Select a module node to see its summary and jump into the player.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Completed</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-600" />In progress</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-400" />Locked</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" />Needs retry</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
