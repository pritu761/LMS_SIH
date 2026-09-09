'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Code2,
  Eye,
  FileUp,
  Film,
  History,
  ListPlus,
  Loader2,
  Plus,
  Save,
  Send,
  Tags,
  Trash2,
  TriangleAlert,
  Type,
  X,
} from 'lucide-react';
import { Markdown } from '@/components/catalog/Markdown';
import type {
  AuthoringLessonDetail,
  AuthoringLessonRow,
  AuthoringModuleOption,
  LessonBlock,
} from '@/services/trainerTypes';

interface StudioProps {
  modules: AuthoringModuleOption[];
  lessons: AuthoringLessonRow[];
  wmoSuggestions: { wmoTags: string[]; domains: string[] };
}

interface LessonApiResponse {
  success: boolean;
  data?: { lesson: AuthoringLessonDetail };
  error?: { message: string };
}

let blockSeq = 0;
function newId(prefix: string): string {
  blockSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${blockSeq}`;
}

/** Client mirror of the server's serializeBlocks (preview + rollback diff). */
function serializePreview(blocks: LessonBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (b.kind === 'text') parts.push(b.markdown);
    else if (b.kind === 'video') parts.push(`[Video${b.caption ? `: ${b.caption}` : ''}](${b.url})`);
    else if (b.kind === 'file') parts.push(`[Download: ${b.name}](${b.url})`);
    else if (b.kind === 'code') parts.push(`\`\`\`${b.language}\n${b.code}\n\`\`\``);
    else if (b.kind === 'quiz') {
      parts.push(`**Practice check:** ${b.prompt}\n${b.options.map((o) => `- ${o.text}${b.correctIds.includes(o.id) ? ' (correct)' : ''}`).join('\n')}`);
    }
  }
  return parts.join('\n\n');
}

/** Tiny LCS line diff for the rollback preview. */
function diffLines(oldText: string, newText: string): Array<{ kind: 'same' | 'add' | 'del'; text: string }> {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out: Array<{ kind: 'same' | 'add' | 'del'; text: string }> = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      if (out.length < 400) out.push({ kind: 'same', text: a[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ kind: 'del', text: a[i] });
      i += 1;
    } else {
      out.push({ kind: 'add', text: b[j] });
      j += 1;
    }
    if (out.length > 600) break;
  }
  while (i < m) {
    out.push({ kind: 'del', text: a[i] });
    i += 1;
  }
  while (j < n) {
    out.push({ kind: 'add', text: b[j] });
    j += 1;
  }
  return out;
}

const KIND_META = [
  { kind: 'text', label: 'Text', Icon: Type },
  { kind: 'video', label: 'Video', Icon: Film },
  { kind: 'file', label: 'File', Icon: FileUp },
  { kind: 'quiz', label: 'Quiz', Icon: ListPlus },
  { kind: 'code', label: 'Code', Icon: Code2 },
] as const;

/**
 * Course authoring studio (Section B): block-based lesson builder (text /
 * video / file / quiz / code), WMO tag picker, draft/publish/archive,
 * version history with diff preview and append-only rollback.
 */
export function LessonStudio({ modules, lessons: lessonRows, wmoSuggestions }: StudioProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [moduleCode, setModuleCode] = useState(modules[0]?.code ?? '');
  const [title, setTitle] = useState('');
  const [blocks, setBlocks] = useState<LessonBlock[]>([{ id: newId('blk'), kind: 'text', markdown: '# New lesson\n\nStart writing…' }]);
  const [wmoTags, setWmoTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isPreviewFree, setIsPreviewFree] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [versions, setVersions] = useState<AuthoringLessonDetail['versions']>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [status, setStatus] = useState('DRAFT');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rollbackV, setRollbackV] = useState<number | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const previewMd = useMemo(() => serializePreview(blocks), [blocks]);

  const patchBlock = (id: string, patch: Partial<LessonBlock>) => {
    setBlocks((bs) => bs.map((b) => (b.id === id ? ({ ...b, ...patch } as LessonBlock) : b)));
  };
  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const next = [...bs];
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  };

  const addBlock = (kind: LessonBlock['kind']) => {
    const base = { id: newId('blk') };
    const block: LessonBlock =
      kind === 'text'
        ? { ...base, kind, markdown: '' }
        : kind === 'video'
          ? { ...base, kind, url: '', caption: '' }
          : kind === 'file'
            ? { ...base, kind, url: '', name: '', fileKind: 'PDF' }
            : kind === 'quiz'
              ? { ...base, kind, prompt: '', questionType: 'SINGLE_CHOICE' as const, options: [{ id: 'opt_1', text: '' }, { id: 'opt_2', text: '' }], correctIds: [] as string[] }
              : { ...base, kind, language: 'text', code: '' };
    setBlocks((bs) => [...bs, block]);
  };

  const uploadFile = async (blockId: string, file: File) => {
    setUploadingFor(blockId);
    setMsg(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const body = (await res.json()) as { success: boolean; data?: { fileUrl: string; fileName: string; fileSize: string; fileType: string }; error?: string };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error ?? 'Upload failed.');
      const kind = body.data.fileType.includes('pdf') ? 'PDF' : body.data.fileType.startsWith('video/') ? 'VIDEO' : body.data.fileType.startsWith('image/') ? 'IMAGE' : 'LINK';
      patchBlock(blockId, { url: body.data.fileUrl, name: body.data.fileName, fileKind: kind, size: body.data.fileSize } as Partial<LessonBlock>);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Upload failed.');
    } finally {
      setUploadingFor(null);
    }
  };

  const openLesson = async (id: string | null) => {
    setMsg(null);
    setRollbackV(null);
    if (!id) {
      setEditingId(null);
      setModuleCode(modules[0]?.code ?? '');
      setTitle('');
      setBlocks([{ id: newId('blk'), kind: 'text', markdown: '# New lesson\n\nStart writing…' }]);
      setWmoTags([]);
      setIsPreviewFree(false);
      setIsOffline(false);
      setVersions([]);
      setCurrentVersion(1);
      setStatus('DRAFT');
      return;
    }
    setLoadingLesson(true);
    try {
      const res = await fetch(`/api/trainer/lessons/${id}`);
      const body = (await res.json()) as LessonApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not open lesson.');
      const l = body.data.lesson;
      setEditingId(l.id);
      setTitle(l.title);
      setBlocks(l.blocks.length > 0 ? l.blocks : [{ id: newId('blk'), kind: 'text', markdown: l.content }]);
      setWmoTags(l.wmoTags);
      setIsPreviewFree(l.isPreviewFree);
      setIsOffline(l.isOfflineAvailable);
      setVersions(l.versions);
      setCurrentVersion(l.version);
      setStatus(l.status);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not open lesson.');
    } finally {
      setLoadingLesson(false);
    }
  };

  const payload = () => ({
    title: title.trim(),
    blocks,
    wmoTags,
    contentType: 'MIXED' as const,
    videoUrl: null,
    pdfUrl: null,
    resources: [],
    isPreviewFree,
    isOfflineAvailable: isOffline,
  });

  const save = async (action: 'draft' | 'publish' | 'archive' | 'rollback') => {
    if (!title.trim()) {
      setMsg('Give the lesson a title first.');
      return;
    }
    if (action !== 'archive' && blocks.length === 0) {
      setMsg('Add at least one content block.');
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      let res: Response;
      if (!editingId) {
        if (!moduleCode) throw new Error('Pick a module first.');
        res = await fetch('/api/trainer/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleCode, ...payload() }),
        });
      } else {
        res = await fetch(`/api/trainer/lessons/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload(), action, rollbackVersion: action === 'rollback' ? rollbackV ?? undefined : undefined }),
        });
      }
      const body = (await res.json()) as LessonApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Save failed.');
      const l = body.data.lesson;
      setEditingId(l.id);
      setVersions(l.versions);
      setCurrentVersion(l.version);
      setStatus(l.status);
      setBlocks(l.blocks.length > 0 ? l.blocks : blocks);
      setRollbackV(null);
      const labels = { draft: 'Draft saved', publish: `Published as v${l.version}`, archive: 'Archived', rollback: `Rolled back — now v${l.version}` };
      setMsg(`${labels[action]} (${l.code ?? 'new'}).`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Studio header: lesson picker */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <label htmlFor="studio-lesson" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Editing
        </label>
        <select
          id="studio-lesson"
          value={editingId ?? ''}
          onChange={(e) => openLesson(e.target.value || null)}
          disabled={loadingLesson}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
        >
          <option value="">+ New lesson…</option>
          {lessonRows.map((l) => (
            <option key={l.id} value={l.id}>
              [{l.status}] {l.moduleCode} • {l.title}
            </option>
          ))}
        </select>
        {loadingLesson && <Loader2 className="h-4 w-4 animate-spin text-[#c59b48]" aria-label="Loading lesson" />}
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
          v{currentVersion} • {status}
        </span>
      </div>

      {!editingId && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="studio-module" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            New lesson under module
          </label>
          <select
            id="studio-module"
            value={moduleCode}
            onChange={(e) => setModuleCode(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
          >
            {modules.map((m) => (
              <option key={m.code} value={m.code}>
                {m.trackCode} • {m.code} — {m.title} ({m.lessonCount})
              </option>
            ))}
          </select>
        </div>
      )}

      <label htmlFor="studio-title" className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Lesson title
      </label>
      <input
        id="studio-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Reading a PPI: Z, Clutter and Anomalous Propagation"
        maxLength={200}
        className="-mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-display text-lg font-extrabold focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-[#0b1e36]/60 dark:text-white"
      />

      {/* Blocks */}
      <ol className="space-y-4">
        {blocks.map((b, i) => (
          <li key={b.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <div className="flex items-center gap-1.5 border-b border-slate-100 bg-slate-50/70 px-3 py-2 dark:border-white/10 dark:bg-black/20">
              <span className="mr-1 rounded-md bg-[#0b1e36] px-2 py-0.5 font-mono text-[11px] font-bold text-[#dfb76c]">
                {i + 1} • {b.kind.toUpperCase()}
              </span>
              <span className="flex-1" />
              <button type="button" onClick={() => moveBlock(b.id, -1)} disabled={i === 0} aria-label="Move block up" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-white/10">
                <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => moveBlock(b.id, 1)} disabled={i === blocks.length - 1} aria-label="Move block down" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-white/10">
                <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setBlocks((bs) => bs.filter((x) => x.id !== b.id))} aria-label="Delete block" className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20">
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-4">
              {b.kind === 'text' && (
                <label className="block">
                  <span className="sr-only">Markdown text</span>
                  <textarea
                    value={b.markdown}
                    onChange={(e) => patchBlock(b.id, { markdown: e.target.value })}
                    rows={6}
                    placeholder="Write Markdown… (# heading, - list, > callout)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                  />
                </label>
              )}
              {b.kind === 'video' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500">Video URL (YouTube/Vimeo/direct)
                    <input
                      value={b.url}
                      onChange={(e) => patchBlock(b.id, { url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=…"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-500">Caption (optional)
                    <input
                      value={b.caption ?? ''}
                      onChange={(e) => patchBlock(b.id, { caption: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                    />
                  </label>
                </div>
              )}
              {b.kind === 'file' && (
                <div className="space-y-2">
                  {!b.url ? (
                    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center hover:border-[#c59b48] dark:border-white/15">
                      {uploadingFor === b.id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#c59b48]" aria-label="Uploading" />
                      ) : (
                        <>
                          <FileUp className="h-6 w-6 text-slate-500" aria-hidden="true" />
                          <span className="text-xs font-bold text-slate-500">PDF, GRIB2, NetCDF samples… (stored free, local)</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="sr-only"
                        disabled={uploadingFor === b.id}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) uploadFile(b.id, f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                  ) : (
                    <p className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      {b.name}
                      <button type="button" onClick={() => patchBlock(b.id, { url: '', name: '' })} className="ml-auto text-xs underline">replace</button>
                    </p>
                  )}
                </div>
              )}
              {b.kind === 'quiz' && (
                <QuizEditor
                  prompt={b.prompt}
                  questionType={b.questionType}
                  options={b.options}
                  correctIds={b.correctIds}
                  explanation={b.explanation ?? ''}
                  onChange={(patch) => patchBlock(b.id, patch)}
                />
              )}
              {b.kind === 'code' && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <label className="text-xs font-bold text-slate-500">Language
                      <input value={b.language} onChange={(e) => patchBlock(b.id, { language: e.target.value })} className="ml-2 w-28 rounded-lg border border-slate-200 px-2 py-1 font-mono text-xs dark:border-white/15 dark:bg-black/20" />
                    </label>
                    <label className="flex-1 text-xs font-bold text-slate-500">Caption
                      <input value={b.caption ?? ''} onChange={(e) => patchBlock(b.id, { caption: e.target.value })} className="ml-2 w-full rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-white/15 dark:bg-black/20" />
                    </label>
                  </div>
                  <label className="block text-xs font-bold text-slate-500">Read-only code
                    <textarea value={b.code} onChange={(e) => patchBlock(b.id, { code: e.target.value })} rows={5} spellCheck={false} className="mt-1 w-full rounded-xl border border-slate-200 bg-[#0b1e36] px-3 py-2 font-mono text-sm text-slate-100 focus:border-[#c59b48] focus:outline-none dark:border-white/15" />
                  </label>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Add block */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Add content block">
        {KIND_META.map(({ kind, label, Icon }) => (
          <button
            key={kind}
            type="button"
            onClick={() => addBlock(kind)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-slate-300 px-3.5 py-2 text-xs font-extrabold text-slate-600 transition-colors hover:border-[#c59b48] hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
          >
            <Icon className="h-3.5 w-3.5 text-[#c59b48]" aria-hidden="true" />
            <Plus className="h-3 w-3" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* WMO tags + flags */}
      <div className="grid gap-4 lg:grid-cols-2">
        <fieldset className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1e36]/60">
          <legend className="flex items-center gap-1.5 px-1 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Tags className="h-3.5 w-3.5" aria-hidden="true" /> WMO competency tags
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {wmoSuggestions.wmoTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setWmoTags((tags) => (tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]))}
                aria-pressed={wmoTags.includes(t)}
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${wmoTags.includes(t) ? 'border-[#c59b48] bg-[#c59b48]/15 text-[#7a5a1c] dark:text-[#dfb76c]' : 'border-slate-200 text-slate-500 hover:border-[#c59b48]/60 dark:border-white/10 dark:text-slate-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <label htmlFor="studio-custom-tag" className="sr-only">Add custom tag</label>
            <input
              id="studio-custom-tag"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customTag.trim()) {
                  setWmoTags((tags) => (tags.includes(customTag.trim()) ? tags : [...tags, customTag.trim()]));
                  setCustomTag('');
                }
              }}
              placeholder="Custom tag + Enter"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-1.5 font-mono text-xs focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20"
            />
          </div>
          {wmoTags.length > 0 && <p className="mt-2 font-mono text-[11px] text-slate-500">Selected: {wmoTags.join(', ')}</p>}
        </fieldset>
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1e36]/60">
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={isPreviewFree} onChange={(e) => setIsPreviewFree(e.target.checked)} className="h-4 w-4 accent-[#c59b48]" />
            Free preview <span className="font-normal text-slate-500">(visible without login)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={isOffline} onChange={(e) => setIsOffline(e.target.checked)} className="h-4 w-4 accent-[#c59b48]" />
            Offline available <span className="font-normal text-slate-500">(PWA cache)</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            aria-expanded={showPreview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
            {showPreview ? 'Hide' : 'Show'} rendered preview
          </button>
        </div>
      </div>

      {showPreview && (
        <div className="rounded-2xl border border-[#c59b48]/40 bg-white p-6 dark:bg-black/20">
          <Markdown content={previewMd || '*Nothing to preview yet.*'} />
        </div>
      )}

      {/* Actions */}
      {msg && (
        <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 dark:bg-white/10 dark:text-slate-200" aria-live="polite">
          {msg}
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => save('draft')}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-extrabold text-slate-700 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:border-white/20 dark:text-slate-200"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          Save as Draft
        </button>
        <button
          type="button"
          onClick={() => save('publish')}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          Publish {editingId ? `(→ v${currentVersion + 1})` : '(→ v1)'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => save('archive')}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 px-5 py-2.5 text-sm font-extrabold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50 dark:text-rose-400"
          >
            Archive
          </button>
        )}
      </div>

      {/* Version history */}
      {editingId && (
        <section aria-label="Version history" className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-[#0b1e36]/60">
          <header className="flex items-center gap-2 border-b border-slate-100 px-5 py-3.5 dark:border-white/10">
            <History className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
            <h2 className="font-display text-sm font-extrabold text-[#0b1e36] dark:text-white">Version history (append-only)</h2>
          </header>
          {versions.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No published versions yet — publish to snapshot v2+.</p>
          ) : (
            <ol className="divide-y divide-slate-100 dark:divide-white/10">
              {versions.map((v) => (
                <li key={v.version} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm">
                  <span className="rounded-md bg-[#0b1e36] px-2 py-0.5 font-mono text-[11px] font-bold text-[#dfb76c]">v{v.version}</span>
                  <span className="min-w-0 flex-1 truncate text-slate-600 dark:text-slate-300">{v.changelog ?? '—'}</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    {v.authorName ?? 'unknown'} • {new Date(v.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  {v.version !== currentVersion && (
                    <button
                      type="button"
                      onClick={() => setRollbackV(rollbackV === v.version ? null : v.version)}
                      aria-expanded={rollbackV === v.version}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
                    >
                      {rollbackV === v.version ? 'Hide diff' : 'Diff + rollback'}
                    </button>
                  )}
                  {v.version === currentVersion && (
                    <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      current
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          {rollbackV !== null && (
            <RollbackPreview
              lessonId={editingId}
              target={versions.find((v) => v.version === rollbackV) ?? null}
              currentMd={previewMd}
              onDone={(message) => {
                setMsg(message);
                setRollbackV(null);
                openLesson(editingId);
              }}
            />
          )}
        </section>
      )}
    </div>
  );
}

/** Inline quiz block editor (lightweight, non-proctored practice). */
function QuizEditor({
  prompt,
  questionType,
  options,
  correctIds,
  explanation,
  onChange,
}: {
  prompt: string;
  questionType: 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'TRUE_FALSE';
  options: Array<{ id: string; text: string }>;
  correctIds: string[];
  explanation: string;
  onChange: (patch: Partial<LessonBlock>) => void;
}) {
  const setOpt = (id: string, text: string) => onChange({ options: options.map((o) => (o.id === id ? { ...o, text } : o)) });
  const toggleCorrect = (id: string) => {
    if (questionType === 'MULTI_CHOICE') {
      onChange({ correctIds: correctIds.includes(id) ? correctIds.filter((c) => c !== id) : [...correctIds, id] });
    } else {
      onChange({ correctIds: [id] });
    }
  };
  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-500">Prompt
        <input value={prompt} onChange={(e) => onChange({ prompt: e.target.value })} placeholder="What feature is visible here?" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
      </label>
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        Type:
        {(['SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE'] as const).map((t) => (
          <button key={t} type="button" onClick={() => onChange({ questionType: t, correctIds: [] })} aria-pressed={questionType === t} className={`rounded-lg border px-2.5 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] ${questionType === t ? 'border-[#c59b48] bg-[#c59b48]/15 text-[#7a5a1c] dark:text-[#dfb76c]' : 'border-slate-200 dark:border-white/15'}`}>
            {t === 'SINGLE_CHOICE' ? 'MCQ' : t === 'MULTI_CHOICE' ? 'Multi' : 'T/F'}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange({ options: [...options, { id: `opt_${options.length + 1}`, text: '' }] })}
          disabled={options.length >= 6}
          className="ml-auto rounded-lg border border-dashed border-slate-300 px-2.5 py-1 hover:border-[#c59b48] disabled:opacity-40"
        >
          + option
        </button>
      </div>
      {options.map((o) => (
        <div key={o.id} className="flex items-center gap-2">
          <input
            type={questionType === 'MULTI_CHOICE' ? 'checkbox' : 'radio'}
            name={`correct-${prompt.slice(0, 8)}`}
            checked={correctIds.includes(o.id)}
            onChange={() => toggleCorrect(o.id)}
            aria-label={`Mark option ${o.id} correct`}
            className="h-4 w-4 shrink-0 accent-emerald-600"
          />
          <input value={o.text} onChange={(e) => setOpt(o.id, e.target.value)} placeholder={`Option ${o.id}`} className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
          {options.length > 2 && (
            <button type="button" onClick={() => onChange({ options: options.filter((x) => x.id !== o.id), correctIds: correctIds.filter((c) => c !== o.id) })} aria-label="Remove option" className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:text-rose-600">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      ))}
      <label className="block text-xs font-bold text-slate-500">Explanation (shown after answering)
        <input value={explanation} onChange={(e) => onChange({ explanation: e.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
      </label>
    </div>
  );
}

/** Rollback with a real line-diff preview (snapshot content vs editor). */
function RollbackPreview({
  lessonId,
  target,
  currentMd,
  onDone,
}: {
  lessonId: string;
  target: { version: number; content: string } | null;
  currentMd: string;
  onDone: (message: string) => void;
}) {
  const [working, setWorking] = useState(false);
  const [showDiff, setShowDiff] = useState(true);
  if (!target) return null;
  const diff = diffLines(target.content, currentMd);

  const doRollback = async () => {
    setWorking(true);
    try {
      // Preserve current metadata; only the content rolls back.
      const cur = await fetch(`/api/trainer/lessons/${lessonId}`).then(async (r) => {
        const b = (await r.json()) as LessonApiResponse;
        if (!r.ok || !b.success || !b.data) throw new Error(b.error?.message ?? 'Could not load lesson.');
        return b.data.lesson;
      });
      const res = await fetch(`/api/trainer/lessons/${lessonId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: cur.title,
          blocks: cur.blocks,
          wmoTags: cur.wmoTags,
          contentType: cur.contentType,
          videoUrl: cur.videoUrl,
          pdfUrl: cur.pdfUrl,
          resources: cur.resources,
          isPreviewFree: cur.isPreviewFree,
          isOfflineAvailable: cur.isOfflineAvailable,
          action: 'rollback',
          rollbackVersion: target.version,
        }),
      });
      const body = (await res.json()) as LessonApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Rollback failed.');
      onDone(`Rolled back to v${target.version} — now live as v${body.data.lesson.version}. History preserved.`);
    } catch (e) {
      onDone(e instanceof Error ? e.message : 'Rollback failed.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="border-t border-amber-200 bg-amber-50/60 px-5 py-4 dark:border-amber-500/20 dark:bg-amber-500/5">
      <p className="flex items-start gap-2 text-sm font-semibold text-amber-800 dark:text-amber-200">
        <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Roll back to v{target.version}? The snapshot becomes a NEW version — history is never rewritten. Rollback
        restores markdown content; blocks collapse to a single text block.
      </p>
      <button
        type="button"
        onClick={() => setShowDiff((v) => !v)}
        aria-expanded={showDiff}
        className="mt-2 text-xs font-extrabold text-amber-700 underline underline-offset-2 dark:text-amber-300"
      >
        {showDiff ? 'Hide diff' : 'Show diff'} (snapshot → editor)
      </button>
      {showDiff && (
        <pre className="mt-2 max-h-56 overflow-auto rounded-xl bg-black/80 p-3 font-mono text-[11px] leading-relaxed text-slate-200" aria-label={`Diff of version ${target.version} against current content`}>
          {diff.length === 0 || diff.every((d) => d.kind === 'same')
            ? '(no differences — content already matches this snapshot)'
            : diff.filter((d) => d.kind !== 'same').slice(0, 200).map((d, i) => (
                <span key={i} className={d.kind === 'add' ? 'text-emerald-300' : 'text-rose-300'}>
                  {d.kind === 'add' ? '+ ' : '- '}{d.text || ' '}
                  {'\n'}
                </span>
              ))}
        </pre>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={doRollback}
          disabled={working}
          className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50"
        >
          {working ? 'Rolling back…' : `Confirm rollback to v${target.version}`}
        </button>
      </div>
    </div>
  );
}
