'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, FileText, Loader2, TableProperties } from 'lucide-react';
import { REPORTS, type ReportTable } from '@/services/adminTypes';

interface ReportApiResponse {
  success: boolean;
  data?: { report: ReportTable };
  error?: { message: string };
}

/**
 * Reports explorer (Section E): six pre-built governance reports with an
 * optional custom date window (applies to time-based reports), an on-screen
 * preview table and one-click CSV / PDF downloads.
 */
export function ReportsExplorer() {
  const [reportId, setReportId] = useState(REPORTS[0].id);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [table, setTable] = useState<ReportTable | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ format: 'json' });
      if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
      if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString());
      const res = await fetch(`/api/admin/reports/${reportId}?${params.toString()}`);
      const body = (await res.json()) as ReportApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not build report.');
      setTable(body.data.report);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not build report.');
    } finally {
      setLoading(false);
    }
  }, [reportId, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const downloadHref = (format: 'csv' | 'pdf') => {
    const params = new URLSearchParams({ format });
    if (from) params.set('from', new Date(`${from}T00:00:00`).toISOString());
    if (to) params.set('to', new Date(`${to}T23:59:59`).toISOString());
    return `/api/admin/reports/${reportId}?${params.toString()}`;
  };

  const info = REPORTS.find((r) => r.id === reportId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <TableProperties className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
        <label htmlFor="rep-pick" className="sr-only">Choose report</label>
        <select
          id="rep-pick"
          value={reportId}
          onChange={(e) => setReportId(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
        >
          {REPORTS.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          From
          <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
        </label>
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
          To
          <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className="ml-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold normal-case focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100" />
        </label>
        <a href={downloadHref('csv')} download className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300">
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          CSV
        </a>
        <a href={downloadHref('pdf')} download className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36]">
          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
          PDF
        </a>
      </div>

      {info && <p className="text-xs text-slate-500 dark:text-slate-400">{info.description}</p>}

      <section aria-label="Report preview" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        {loading ? (
          <div aria-busy="true" aria-label="Building report" className="space-y-2 p-4">
            <div className="h-8 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" />
            ))}
          </div>
        ) : error ? (
          <p className="p-5 text-sm font-semibold text-slate-500" role="alert">{error}</p>
        ) : table ? (
          <>
            <header className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-5 py-3.5 dark:border-white/10">
              <h2 className="font-display min-w-0 flex-1 text-base font-extrabold text-[#0b1e36] dark:text-white">{table.title}</h2>
              <span className="font-mono text-[11px] text-slate-500">{table.rows.length} rows</span>
            </header>
            <div className="max-h-[480px] overflow-auto">
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-black/30">
                  <tr>
                    {table.columns.map((c) => (
                      <th key={c} scope="col" className="px-4 py-2 font-mono font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {table.rows.slice(0, 200).map((row, i) => (
                    <tr key={i} className="odd:bg-white even:bg-slate-50/60 dark:odd:bg-transparent dark:even:bg-white/[0.02]">
                      {row.map((cell, j) => (
                        <td key={j} className={`px-4 py-1.5 ${j === 0 ? 'font-bold text-slate-700 dark:text-slate-200' : 'font-mono text-slate-600 dark:text-slate-300'}`}>
                          {cell === '' ? '—' : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {table.rows.length > 200 && (
              <p className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500 dark:border-white/10">
                Showing first 200 of {table.rows.length} rows — download CSV/PDF for the full report.
              </p>
            )}
            {table.note && <p className="border-t border-slate-100 px-5 py-2.5 text-xs text-slate-500 dark:border-white/10">{table.note}</p>}
          </>
        ) : null}
        {loading && <Loader2 className="sr-only" aria-hidden="true" />}
      </section>
    </div>
  );
}
