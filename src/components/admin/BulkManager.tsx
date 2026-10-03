'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Download, FileSpreadsheet, Loader2, TriangleAlert, Upload } from 'lucide-react';
import type { BulkJobView, BulkPreview } from '@/services/adminTypes';

type BulkKind = 'OFFICER_ROSTER' | 'STATION_DATA' | 'BATCH_ASSIGNMENT';

const KIND_LABEL: Record<BulkKind, string> = {
  OFFICER_ROSTER: 'Officer roster',
  STATION_DATA: 'Station / posting data',
  BATCH_ASSIGNMENT: 'Training batch assignments',
};

interface JobsApiResponse {
  success: boolean;
  data?: { jobs: BulkJobView[] };
  error?: { message: string };
}

interface PreviewApiResponse {
  success: boolean;
  data?: BulkPreview;
  error?: { message: string };
}

const STATUS_STYLE: Record<string, string> = {
  QUEUED: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  PROCESSING: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  DONE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  FAILED: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
};

/**
 * Bulk operations (Section D): CSV template download, upload → row-level
 * validation preview with highlighted errors → confirm & import, async-style
 * job history (Queued/Processing/Done/Failed/Partial) and failed-row CSV
 * downloads. Roster imports create pending accounts with invites.
 */
export function BulkManager() {
  const [kind, setKind] = useState<BulkKind>('OFFICER_ROSTER');
  const [jobs, setJobs] = useState<BulkJobView[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState<BulkPreview | null>(null);
  const [message, setMessage] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);

  const loadJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const res = await fetch('/api/admin/bulk');
      const body = (await res.json()) as JobsApiResponse;
      if (body.success && body.data) setJobs(body.data.jobs);
    } catch {
      /* jobs list is best-effort */
    } finally {
      setJobsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    setPreview(null);
    setMessage(null);
  }, [kind]);

  const runValidation = async (file: File) => {
    setValidating(true);
    setMessage(null);
    setPreview(null);
    try {
      const form = new FormData();
      form.append('type', kind);
      form.append('file', file);
      form.append('fileName', file.name);
      const res = await fetch('/api/admin/bulk/validate', { method: 'POST', body: form });
      const body = (await res.json()) as PreviewApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Validation failed.');
      setPreview(body.data);
      loadJobs();
    } catch (e) {
      setMessage({ tone: 'err', text: e instanceof Error ? e.message : 'Validation failed.' });
    } finally {
      setValidating(false);
    }
  };

  const confirmImport = async () => {
    if (!preview) return;
    setConfirming(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/bulk/${preview.jobId}/confirm`, { method: 'POST' });
      const body = (await res.json()) as { success: boolean; data?: { status: string; successRows: number; failedRows: number }; error?: { message: string } };
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Import failed.');
      setMessage({
        tone: body.data.failedRows === 0 ? 'ok' : 'err',
        text: `Job ${body.data.status}: ${body.data.successRows} imported, ${body.data.failedRows} failed. Audited as BULK_IMPORTED.`,
      });
      setPreview(null);
      loadJobs();
    } catch (e) {
      setMessage({ tone: 'err', text: e instanceof Error ? e.message : 'Import failed.' });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Upload card */}
      <section aria-label="New bulk import" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="bulk-kind" className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Dataset
          </label>
          <select
            id="bulk-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as BulkKind)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
          >
            {(Object.keys(KIND_LABEL) as BulkKind[]).map((k) => (
              <option key={k} value={k}>{KIND_LABEL[k]}</option>
            ))}
          </select>
          <a
            href={`/api/admin/bulk/template?type=${kind}`}
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Template CSV
          </a>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#0b1e36] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible-within:outline-none focus-visible-within:ring-2 focus-visible-within:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]">
            {validating ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Validating" /> : <Upload className="h-3.5 w-3.5" aria-hidden="true" />}
            Upload & validate
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              disabled={validating}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) runValidation(f);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">Max 2000 rows • 5 MB • validation stages a QUEUED job; nothing imports until you confirm.</p>
        {message && (
          <p className={`mt-3 rounded-xl px-4 py-2.5 text-xs font-bold ${message.tone === 'ok' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`} aria-live="polite">
            {message.text}
          </p>
        )}
      </section>

      {/* Validation preview */}
      {preview && (
        <section aria-label="Validation preview" className="overflow-hidden rounded-2xl border-2 border-[#c59b48]/50 bg-white shadow-sm dark:bg-[#0b1e36]/60">
          <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-4 dark:border-white/10">
            <FileSpreadsheet className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
            <h2 className="font-display min-w-0 flex-1 text-base font-extrabold text-[#0b1e36] dark:text-white">
              Preview: {preview.fileName}
            </h2>
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1 font-mono text-xs font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              {preview.validRows} valid
            </span>
            {preview.errorRows > 0 && (
              <span className="rounded-lg bg-rose-100 px-2.5 py-1 font-mono text-xs font-black text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                {preview.errorRows} invalid
              </span>
            )}
          </header>
          {preview.errors.length > 0 && (
            <div className="max-h-64 overflow-auto">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="sticky top-0 bg-rose-50 dark:bg-rose-500/10">
                  <tr className="text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-300">
                    <th scope="col" className="px-5 py-2 font-extrabold">Row</th>
                    <th scope="col" className="py-2 pr-3 font-extrabold">Field</th>
                    <th scope="col" className="px-5 py-2 font-extrabold">Problem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 dark:divide-white/5">
                  {preview.errors.map((e, i) => (
                    <tr key={i} className="bg-rose-50/40 dark:bg-transparent">
                      <td className="px-5 py-1.5 font-mono font-bold">{e.row}</td>
                      <td className="py-1.5 pr-3 font-mono">{e.field}</td>
                      <td className="px-5 py-1.5">{e.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-5 py-4 dark:border-white/10">
            <p className="min-w-0 flex-1 text-xs text-slate-500 dark:text-slate-400">
              {preview.validRows === 0 ? 'No valid rows — fix the file and re-upload.' : `${preview.validRows} of ${preview.totalRows} rows will be imported. Invalid rows are skipped and downloadable afterwards.`}
            </p>
            <button
              type="button"
              onClick={confirmImport}
              disabled={confirming || preview.validRows === 0}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
            >
              {confirming ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              Confirm & import
            </button>
          </div>
        </section>
      )}

      {/* Job history */}
      <section aria-label="Bulk job history" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Job history</h2>
        </header>
        {jobsLoading ? (
          <div aria-busy="true" aria-label="Loading jobs" className="space-y-2 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="flex items-center gap-2 p-5 text-sm text-slate-500">
            <TriangleAlert className="h-4 w-4" aria-hidden="true" />
            No bulk jobs yet — upload a CSV above to create the first.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/10">
            {jobs.map((j) => (
              <li key={j.id} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-slate-700 dark:text-slate-200">{j.fileName}</span>
                  <span className="block font-mono text-[11px] text-slate-500">
                    {j.type} • {new Date(j.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {j.successRows}/{j.totalRows} ok
                  </span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${STATUS_STYLE[j.status] ?? STATUS_STYLE.QUEUED}`}>
                  {j.status}
                </span>
                {j.hasErrors && (
                  <a
                    href={`/api/admin/bulk/${j.id}/errors`}
                    download
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-[11px] font-extrabold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/30 dark:text-rose-300"
                  >
                    <Download className="h-3 w-3" aria-hidden="true" />
                    Error CSV ({j.failedRows})
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
