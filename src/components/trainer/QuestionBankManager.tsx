'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Download,
  FlaskConical,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { BankQuestionView, QuestionBankView } from '@/services/trainerTypes';
import { useDebouncedValue } from '@/components/catalog/useDebouncedValue';

interface QuestionsApiResponse {
  success: boolean;
  data?: { questions: BankQuestionView[]; count: number };
  error?: { message: string };
}

interface SingleApiResponse {
  success: boolean;
  data?: { question: BankQuestionView };
  error?: { message: string };
}

interface ImportApiResponse {
  success: boolean;
  data?: { created: number; failed: number; errors: Array<{ row: number; message: string }> };
  error?: { message: string };
}

const TYPES = ['SINGLE_CHOICE', 'MULTI_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER'] as const;
const DIFFS = ['EASY', 'MEDIUM', 'HARD'] as const;
const BLOOMS = ['REMEMBER', 'UNDERSTAND', 'APPLY', 'ANALYZE', 'EVALUATE', 'CREATE'] as const;

const EMPTY_FORM = {
  text: '',
  type: 'SINGLE_CHOICE' as (typeof TYPES)[number],
  options: [
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
    { id: 'opt_4', text: '' },
  ],
  correctSingle: 'opt_1',
  correctMulti: [] as string[],
  weight: 1,
  explanation: '',
  competencyTag: '',
  difficulty: 'MEDIUM' as (typeof DIFFS)[number],
  bloomsLevel: 'UNDERSTAND' as (typeof BLOOMS)[number],
  wmoRef: '',
};

type FormState = typeof EMPTY_FORM;

function analysisVerdict(q: BankQuestionView): { label: string; tone: string } {
  if (q.usageCount < 3) return { label: 'Too few attempts', tone: 'bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400' };
  const d = q.difficultyIndex ?? 1;
  const disc = q.discriminationIndex ?? 0;
  if (d > 0.85 || d < 0.2) return { label: 'Review difficulty', tone: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' };
  if (disc < 0.2) return { label: 'Weak discrimination', tone: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' };
  return { label: 'Sound item', tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' };
}

/**
 * Question bank manager (Section C): filter/search, create/edit with full
 * metadata (competency, difficulty, Bloom's, WMO ref), CSV bulk import with
 * per-row error reporting, guarded delete and per-item analysis.
 */
export function QuestionBankManager({ banks: initialBanks }: { banks: QuestionBankView[] }) {
  const [banks] = useState(initialBanks);
  const [bankId, setBankId] = useState(initialBanks[0]?.id ?? '');
  const [competency, setCompetency] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [blooms, setBlooms] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const [questions, setQuestions] = useState<BankQuestionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<BankQuestionView | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);

  const [importing, setImporting] = useState(false);
  const [importReport, setImportReport] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!bankId) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ bankId });
      if (competency) params.set('competency', competency);
      if (difficulty) params.set('difficulty', difficulty);
      if (blooms) params.set('blooms', blooms);
      if (debouncedQuery) params.set('q', debouncedQuery);
      const res = await fetch(`/api/trainer/questions?${params.toString()}`);
      const body = (await res.json()) as QuestionsApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load questions.');
      setQuestions(body.data.questions);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load questions.');
    } finally {
      setLoading(false);
    }
  }, [bankId, competency, difficulty, blooms, debouncedQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const competencies = useMemo(() => {
    const list: string[] = [];
    const seen = new Set<string>();
    for (const q of questions) {
      if (q.competencyTag && !seen.has(q.competencyTag)) {
        seen.add(q.competencyTag);
        list.push(q.competencyTag);
      }
    }
    return list.sort();
  }, [questions]);

  const openEditor = (q: BankQuestionView | null) => {
    setEditing(q);
    if (!q) {
      setForm({ ...EMPTY_FORM, options: EMPTY_FORM.options.map((o) => ({ ...o })) });
    } else {
      const opts = q.options.length > 0 ? q.options.map((o) => ({ ...o })) : [{ id: 'opt_1', text: '' }];
      while (opts.length < 2) opts.push({ id: `opt_${opts.length + 1}`, text: '' });
      setForm({
        text: q.text,
        type: (TYPES as readonly string[]).includes(q.type) ? (q.type as FormState['type']) : 'SINGLE_CHOICE',
        options: opts,
        correctSingle: typeof q.correct === 'string' ? q.correct : 'opt_1',
        correctMulti: Array.isArray(q.correct) ? q.correct : [],
        weight: q.weight,
        explanation: q.explanation ?? '',
        competencyTag: q.competencyTag ?? '',
        difficulty: (DIFFS as readonly string[]).includes(q.difficulty) ? (q.difficulty as FormState['difficulty']) : 'MEDIUM',
        bloomsLevel: (BLOOMS as readonly string[]).includes(q.bloomsLevel) ? (q.bloomsLevel as FormState['bloomsLevel']) : 'UNDERSTAND',
        wmoRef: q.wmoRef ?? '',
      });
    }
    setFormError(null);
    setEditorOpen(true);
  };

  const saveEditor = async () => {
    setFormSaving(true);
    setFormError(null);
    try {
      const correct = form.type === 'MULTI_CHOICE' ? form.correctMulti : form.correctSingle;
      const payload = {
        ...(editing ? {} : { bankId }),
        text: form.text.trim(),
        type: form.type,
        options: form.type === 'SHORT_ANSWER' ? [{ id: 'opt_1', text: 'Free-text answer (trainer graded)' }] : form.options.filter((o) => o.text.trim()),
        correct,
        weight: form.weight,
        explanation: form.explanation.trim() || undefined,
        competencyTag: form.competencyTag.trim() || undefined,
        difficulty: form.difficulty,
        bloomsLevel: form.bloomsLevel,
        wmoRef: form.wmoRef.trim() || undefined,
      };
      const url = editing ? `/api/trainer/questions/${editing.id}` : '/api/trainer/questions';
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const body = (await res.json()) as SingleApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Save failed.');
      setEditorOpen(false);
      load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setFormSaving(false);
    }
  };

  const removeQuestion = async (q: BankQuestionView) => {
    if (!window.confirm(`Delete this question?\n\n${q.text.slice(0, 120)}`)) return;
    try {
      const res = await fetch(`/api/trainer/questions/${q.id}`, { method: 'DELETE' });
      const body = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!res.ok || !body.success) throw new Error(body.error?.message ?? 'Delete failed.');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed.');
    }
  };

  const runImport = async (file: File) => {
    setImporting(true);
    setImportReport(null);
    try {
      const formData = new FormData();
      formData.append('bankId', bankId);
      formData.append('file', file);
      const res = await fetch('/api/trainer/questions/import', { method: 'POST', body: formData });
      const body = (await res.json()) as ImportApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Import failed.');
      const { created, failed, errors } = body.data;
      setImportReport(
        `Imported ${created} question(s)${failed > 0 ? `, ${failed} row(s) rejected` : ''}.` +
          (errors.length > 0 ? ` First issues — ${errors.slice(0, 3).map((e) => `row ${e.row}: ${e.message}`).join(' • ')}` : '')
      );
      load();
    } catch (e) {
      setImportReport(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  const bank = banks.find((b) => b.id === bankId);

  return (
    <div className="space-y-5">
      {/* Bank + filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <label htmlFor="qb-bank" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Bank</label>
        <select
          id="qb-bank"
          value={bankId}
          onChange={(e) => setBankId(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
        >
          {banks.map((b) => (
            <option key={b.id} value={b.id}>{b.name} ({b.total})</option>
          ))}
        </select>
        <label htmlFor="qb-competency" className="sr-only">Filter by competency</label>
        <select id="qb-competency" value={competency} onChange={(e) => setCompetency(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
          <option value="">All competencies</option>
          {competencies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <label htmlFor="qb-difficulty" className="sr-only">Filter by difficulty</label>
        <select id="qb-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
          <option value="">All difficulties</option>
          {DIFFS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <label htmlFor="qb-blooms" className="sr-only">Filter by Bloom's level</label>
        <select id="qb-blooms" value={blooms} onChange={(e) => setBlooms(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
          <option value="">All Bloom's levels</option>
          {BLOOMS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
        <div className="relative min-w-0 flex-1 basis-48" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="qb-search" className="sr-only">Search questions</label>
          <input
            id="qb-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search question text…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => openEditor(null)}
          disabled={!bankId}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New question
        </button>
        <a
          href="/api/trainer/questions/template"
          download
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          CSV template
        </a>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-[#c59b48] focus-visible-within:outline-none focus-visible-within:ring-2 focus-visible-within:ring-[#c59b48] dark:border-white/15 dark:text-slate-300">
          {importing ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Importing" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          Bulk import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            disabled={importing || !bankId}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) runImport(f);
              e.target.value = '';
            }}
          />
        </label>
        {bank && (
          <span className="ml-auto font-mono text-xs font-bold text-slate-500">
            {questions.length} shown • {bank.total} in bank
          </span>
        )}
      </div>
      {importReport && (
        <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300" aria-live="polite">
          {importReport}
        </p>
      )}

      {/* Table */}
      {loading ? (
        <div aria-busy="true" aria-label="Loading questions" className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-semibold text-slate-500">{error}</p>
      ) : questions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
          No questions match these filters. Create one above or import via CSV.
        </p>
      ) : (
        <ol className="space-y-3">
          {questions.map((q) => {
            const verdict = analysisVerdict(q);
            return (
              <li key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-white/10 dark:bg-[#0b1e36]/60">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {q.type}
                  </span>
                  {q.competencyTag && (
                    <span className="rounded-md bg-[#0b1e36]/5 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
                      {q.competencyTag}
                    </span>
                  )}
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                    {q.difficulty} • {q.bloomsLevel}
                  </span>
                  {q.wmoRef && <span className="font-mono text-[11px] text-slate-500">{q.wmoRef}</span>}
                  <span className="ml-auto flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditor(q)}
                      aria-label="Edit question"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-[#c59b48] hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeQuestion(q)}
                      aria-label="Delete question"
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-white/15"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold leading-relaxed text-slate-800 dark:text-slate-100">{q.text}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {q.options.length} option(s) • weight {q.weight} • used {q.usageCount}×
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs dark:bg-black/20">
                  <BarChart3 className="h-3.5 w-3.5 text-[#c59b48]" aria-hidden="true" />
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                    difficulty {q.difficultyIndex !== null ? q.difficultyIndex.toFixed(2) : '—'}
                  </span>
                  <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                    discrimination {q.discriminationIndex !== null ? q.discriminationIndex.toFixed(2) : '—'}
                  </span>
                  <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${verdict.tone}`}>{verdict.label}</span>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {/* Editor modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="qe-title">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <div className="flex items-start justify-between gap-3">
              <h2 id="qe-title" className="font-display text-lg font-black text-[#0b1e36] dark:text-white">
                {editing ? 'Edit question' : 'New question'}
              </h2>
              <button type="button" onClick={() => setEditorOpen(false)} aria-label="Close editor" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-extrabold uppercase tracking-wider text-slate-500">Question text
              <textarea value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} rows={3} maxLength={5000} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Type
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as FormState['type'], correctSingle: 'opt_1', correctMulti: [] }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
                  {TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Difficulty
                <select value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as FormState['difficulty'] }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
                  {DIFFS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Bloom's
                <select value={form.bloomsLevel} onChange={(e) => setForm((f) => ({ ...f, bloomsLevel: e.target.value as FormState['bloomsLevel'] }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100">
                  {BLOOMS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </label>
            </div>

            {form.type !== 'SHORT_ANSWER' ? (
              <fieldset className="mt-3">
                <legend className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Options (tick correct{form.type === 'MULTI_CHOICE' ? ' ones' : ' one'})
                </legend>
                <div className="mt-1.5 space-y-2">
                  {form.options.map((o, i) => (
                    <div key={o.id} className="flex items-center gap-2">
                      <input
                        type={form.type === 'MULTI_CHOICE' ? 'checkbox' : 'radio'}
                        name="qe-correct"
                        checked={form.type === 'MULTI_CHOICE' ? form.correctMulti.includes(o.id) : form.correctSingle === o.id}
                        onChange={() =>
                          setForm((f) =>
                            f.type === 'MULTI_CHOICE'
                              ? { ...f, correctMulti: f.correctMulti.includes(o.id) ? f.correctMulti.filter((c) => c !== o.id) : [...f.correctMulti, o.id] }
                              : { ...f, correctSingle: o.id }
                          )
                        }
                        aria-label={`Mark option ${i + 1} correct`}
                        className="h-4 w-4 shrink-0 accent-emerald-600"
                      />
                      <input
                        value={o.text}
                        onChange={(e) => setForm((f) => ({ ...f, options: f.options.map((x) => (x.id === o.id ? { ...x, text: e.target.value } : x)) }))}
                        placeholder={`Option ${i + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                      />
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => setForm((f) => ({ ...f, options: f.options.filter((x) => x.id !== o.id) }))} aria-label="Remove option" className="shrink-0 rounded-lg p-1.5 text-slate-500 hover:text-rose-600">
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, options: [...f.options, { id: `opt_${f.options.length + 1}`, text: '' }] }))}
                    className="mt-2 text-xs font-bold text-[#9a7224] hover:underline dark:text-[#dfb76c]"
                  >
                    + Add option
                  </button>
                )}
              </fieldset>
            ) : (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-white/5">
                <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c59b48]" aria-hidden="true" />
                Short-answer items are trainer-graded; the explanation below doubles as the marking guide.
              </p>
            )}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Competency tag
                <input value={form.competencyTag} onChange={(e) => setForm((f) => ({ ...f, competencyTag: e.target.value }))} placeholder="e.g. RAD-NOWCAST" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
              </label>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">WMO rubric ref
                <input value={form.wmoRef} onChange={(e) => setForm((f) => ({ ...f, wmoRef: e.target.value }))} placeholder="e.g. WMO-1205-III.3" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-sm normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
              </label>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Weight
                <input type="number" min={0.5} max={100} step={0.5} value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) || 1 }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
              </label>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Explanation
                <input value={form.explanation} onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))} placeholder="Why the answer is correct…" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
              </label>
            </div>

            {formError && (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300" aria-live="polite">
                {formError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditorOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditor}
                disabled={formSaving}
                className="rounded-xl bg-[#0b1e36] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] disabled:opacity-50 dark:bg-[#c59b48] dark:text-[#0b1e36]"
              >
                {formSaving ? 'Saving…' : editing ? 'Save changes' : 'Create question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
