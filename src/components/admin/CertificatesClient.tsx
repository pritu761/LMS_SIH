'use client';

import { useCallback, useEffect, useState } from 'react';
import { Award, Ban, RotateCcw, Search, ShieldCheck, ShieldX } from 'lucide-react';
import { useDebouncedValue } from '@/components/catalog/useDebouncedValue';
import type { AdminCertificate } from '@/services/adminTypes';

interface CertsApiResponse {
  success: boolean;
  data?: { certificates: AdminCertificate[]; count: number };
  error?: { message: string };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Credential registry: search/filter issued certificates, revoke with a
 * mandatory reason (holder notified, /verify flips immediately) or
 * reinstate. Both directions are audit-logged server-side.
 */
export function CertificatesClient() {
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const [certs, setCerts] = useState<AdminCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ cert: AdminCertificate; to: 'VALID' | 'REVOKED' } | null>(null);
  const [reason, setReason] = useState('');
  const [working, setWorking] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (debouncedQuery) params.set('q', debouncedQuery);
      const res = await fetch(`/api/admin/certificates?${params.toString()}`);
      const body = (await res.json()) as CertsApiResponse;
      if (!res.ok || !body.success || !body.data) throw new Error(body.error?.message ?? 'Could not load certificates.');
      setCerts(body.data.certificates);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load certificates.');
    } finally {
      setLoading(false);
    }
  }, [status, debouncedQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const applyStatus = async () => {
    if (!modal) return;
    if (modal.to === 'REVOKED' && !reason.trim()) {
      setBanner('A revocation reason is mandatory.');
      return;
    }
    setWorking(true);
    try {
      const res = await fetch(`/api/admin/certificates/${modal.cert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: modal.to, reason: reason.trim() || undefined }),
      });
      const body = (await res.json()) as { success: boolean; error?: { message: string } };
      if (!res.ok || !body.success) throw new Error(body.error?.message ?? 'Update failed.');
      setBanner(modal.to === 'REVOKED' ? `Revoked — holder notified, /verify updated, audit written.` : `Reinstated to VALID — holder notified, audit written.`);
      setModal(null);
      setReason('');
      load();
    } catch (e) {
      setBanner(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <label htmlFor="cert-status" className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</label>
        <select
          id="cert-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
        >
          <option value="">All statuses</option>
          {['VALID', 'REVOKED', 'EXPIRED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="relative min-w-0 flex-1 basis-56" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <label htmlFor="cert-search" className="sr-only">Search holder, module or verification ID</label>
          <input
            id="cert-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Holder, module or verification ID…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
          />
        </span>
        <span className="ml-auto font-mono text-xs font-bold text-slate-500" aria-live="polite">{certs.length} shown</span>
      </div>

      {banner && (
        <p className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300" aria-live="polite">
          {banner}
        </p>
      )}

      {loading ? (
        <div aria-busy="true" aria-label="Loading certificates" className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm font-semibold text-slate-500" role="alert">{error}</p>
      ) : certs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">No credentials match.</p>
      ) : (
        <ul className="space-y-3">
          {certs.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
              <Award className="h-8 w-8 shrink-0 text-[#c59b48]" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-slate-800 dark:text-slate-100">
                  {c.moduleTitle} <span className="font-mono text-[11px] font-normal text-slate-500">{c.trackCode ?? ''}</span>
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {c.holderName} • {c.holderEmail} • issued {formatDate(c.issuedAt)}{c.score !== null ? ` • score ${c.score}` : ''}
                </span>
                <a href={`/verify/${c.verificationId}`} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-[#9a7224] hover:underline dark:text-[#dfb76c]">
                  /verify/{c.verificationId}
                </a>
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-extrabold uppercase ${c.status === 'VALID' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'}`}>
                {c.status === 'VALID' ? <ShieldCheck className="h-3 w-3" aria-hidden="true" /> : <ShieldX className="h-3 w-3" aria-hidden="true" />}
                {c.status}
              </span>
              {c.status === 'VALID' ? (
                <button
                  type="button"
                  onClick={() => {
                    setReason('');
                    setModal({ cert: c, to: 'REVOKED' });
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-rose-300 px-3.5 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-rose-400"
                >
                  <Ban className="h-3.5 w-3.5" aria-hidden="true" />
                  Revoke
                </button>
              ) : c.status === 'REVOKED' ? (
                <button
                  type="button"
                  onClick={() => {
                    setReason('');
                    setModal({ cert: c, to: 'VALID' });
                  }}
                  className="inline-flex items-center gap-1 rounded-xl border border-emerald-300 px-3.5 py-2 text-xs font-extrabold text-emerald-600 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-emerald-400"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reinstate
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="cert-modal-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <h2 id="cert-modal-title" className="font-display text-lg font-black text-[#0b1e36] dark:text-white">
              {modal.to === 'REVOKED' ? 'Revoke credential' : 'Reinstate credential'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {modal.cert.moduleTitle} — {modal.cert.holderName}.{' '}
              {modal.to === 'REVOKED' ? 'The public verification page will show REVOKED immediately.' : 'The public verification page will show VALID again.'}
            </p>
            {modal.to === 'REVOKED' && (
              <>
                <label htmlFor="cert-reason" className="mt-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Revocation reason (mandatory)
                </label>
                <textarea
                  id="cert-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="e.g. Issued against an unproctored attempt under review…"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                />
              </>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={applyStatus}
                disabled={working || (modal.to === 'REVOKED' && !reason.trim())}
                className={`rounded-xl px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50 ${modal.to === 'REVOKED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {modal.to === 'REVOKED' ? 'Confirm revocation' : 'Confirm reinstatement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
