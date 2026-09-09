'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock3, Info, Loader2, Send, XCircle } from 'lucide-react';
import type { ApprovalItem } from '@/services/adminTypes';

interface ReviewApiResponse {
  success: boolean;
  data?: { status: string; tempPassword: string | null; mailSent: boolean };
  error?: { message: string };
}

function submittedLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/**
 * Approval queue (Section A): pending registrations with live SLA timers,
 * approve (optional role override + one-time temp password), reject with
 * mandatory reason, request-info, and breach escalation. Recent decisions
 * listed below for traceability.
 */
export function ApprovalQueueClient({ initial }: { initial: { pending: ApprovalItem[]; recent: ApprovalItem[] } }) {
  const [pending, setPending] = useState(initial.pending);
  const [recent, setRecent] = useState(initial.recent);
  const [modal, setModal] = useState<{ id: string; name: string; kind: 'reject' | 'info' } | null>(null);
  const [reason, setReason] = useState('');
  const [roleOverride, setRoleOverride] = useState<Record<string, string>>({});
  const [working, setWorking] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ tone: 'ok' | 'err'; text: string } | null>(null);
  const [tempPass, setTempPass] = useState<{ name: string; pass: string } | null>(null);

  const act = async (id: string, action: 'approve' | 'reject' | 'info' | 'escalate') => {
    if (action === 'reject' && !reason.trim()) {
      setBanner({ tone: 'err', text: 'A rejection reason is mandatory.' });
      return;
    }
    setWorking(id + action);
    setBanner(null);
    try {
      const isEscalate = action === 'escalate';
      const url = isEscalate ? `/api/admin/approvals/${id}/escalate` : `/api/admin/approvals/${id}`;
      const body = isEscalate
        ? undefined
        : {
            action,
            ...(action === 'reject' ? { reason: reason.trim() } : {}),
            ...(action === 'info' ? { message: reason.trim() || undefined } : {}),
            ...(action === 'approve' && roleOverride[id] ? { role: roleOverride[id] } : {}),
          };
      const res = await fetch(url, {
        method: 'POST',
        ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
      });
      const data = (await res.json()) as ReviewApiResponse & { data?: { alerted?: number } };
      if (!res.ok || !data.success || !data.data) throw new Error(data.error?.message ?? 'Action failed.');
      if (isEscalate) {
        setBanner({ tone: 'ok', text: `Escalated — ${data.data.alerted ?? 0} admin(s) alerted. Logged in audit.` });
      } else if (action === 'approve') {
        const done = pending.find((p) => p.id === id);
        if (done && data.data.tempPassword) setTempPass({ name: done.name, pass: data.data.tempPassword });
        setBanner({ tone: 'ok', text: `${done?.name ?? 'Account'} approved${data.data.mailSent ? ' — welcome email sent' : ' — email skipped (no provider), in-app notice sent'}.` });
        moveToRecent(id, 'APPROVED');
      } else if (action === 'reject') {
        setBanner({ tone: 'ok', text: 'Registration rejected with reason — applicant notified.' });
        moveToRecent(id, 'REJECTED');
        setModal(null);
        setReason('');
      } else {
        setBanner({ tone: 'ok', text: 'Information requested — applicant notified, stays pending.' });
        setModal(null);
        setReason('');
      }
    } catch (e) {
      setBanner({ tone: 'err', text: e instanceof Error ? e.message : 'Action failed.' });
    } finally {
      setWorking(null);
    }
  };

  const moveToRecent = (id: string, status: string) => {
    const item = pending.find((p) => p.id === id);
    setPending((list) => list.filter((p) => p.id !== id));
    if (item) setRecent((list) => [{ ...item, status, reviewedAt: new Date().toISOString(), reviewerName: 'You' }, ...list].slice(0, 20));
  };

  return (
    <div className="space-y-5">
      {banner && (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm font-bold ${banner.tone === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'}`}
          aria-live="polite"
        >
          {banner.text}
        </p>
      )}
      {tempPass && (
        <div className="rounded-2xl border-2 border-[#c59b48] bg-[#c59b48]/10 p-4" role="alert">
          <p className="text-sm font-extrabold text-[#7a5a1c] dark:text-[#dfb76c]">
            One-time temporary password for {tempPass.name} — copy it now, it will not be shown again:
          </p>
          <p className="mt-2 inline-block rounded-xl bg-[#0b1e36] px-4 py-2 font-mono text-lg font-black tracking-widest text-[#dfb76c]">
            {tempPass.pass}
          </p>
          <button type="button" onClick={() => setTempPass(null)} className="ml-3 text-xs font-bold text-slate-500 underline underline-offset-2">
            Dismiss
          </button>
        </div>
      )}

      <section aria-label="Pending registrations" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
            Pending ({pending.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">SLA escalates at 48h • oldest first</p>
        </header>
        {pending.length === 0 ? (
          <p className="flex items-center gap-2 p-5 text-sm text-slate-500">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            Queue clear — nothing awaiting review.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/10">
            {pending.map((p) => (
              <li key={p.id} className="p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1e36]/5 font-display text-sm font-black text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]">
                    {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                    <span className="block truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.email} • {p.role}{p.cadre ? ` • ${p.cadre}` : ''} • {p.station ?? 'No station'}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-slate-500">Submitted {submittedLabel(p.submittedAt)}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-extrabold ${
                      p.breached
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                    }`}
                    title={p.breached ? 'SLA breached — escalate' : 'Within SLA'}
                  >
                    <Clock3 className="h-3 w-3" aria-hidden="true" />
                    {p.slaHrs}h{p.breached ? ' BREACHED' : ''}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    Role
                    <select
                      value={roleOverride[p.id] ?? p.role}
                      onChange={(e) => setRoleOverride((m) => ({ ...m, [p.id]: e.target.value }))}
                      aria-label={`Role for ${p.name}`}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold focus:border-[#c59b48] focus:outline-none dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
                    >
                      {['TRAINEE', 'TRAINER', 'ADMIN'].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                  <span className="flex-1" />
                  <button
                    type="button"
                    onClick={() => act(p.id, 'approve')}
                    disabled={working !== null}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50"
                  >
                    {working === p.id + 'approve' ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReason('');
                      setModal({ id: p.id, name: p.name, kind: 'reject' });
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-rose-300 px-3.5 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:text-rose-400"
                  >
                    <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReason('');
                      setModal({ id: p.id, name: p.name, kind: 'info' });
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
                  >
                    <Info className="h-3.5 w-3.5" aria-hidden="true" />
                    Request info
                  </button>
                  {p.breached && (
                    <button
                      type="button"
                      onClick={() => act(p.id, 'escalate')}
                      disabled={working !== null}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 disabled:opacity-50"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      Escalate
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Recent decisions" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <header className="border-b border-slate-100 px-5 py-4 dark:border-white/10">
          <h2 className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">Recent decisions</h2>
        </header>
        {recent.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No decisions recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-white/10">
            {recent.slice(0, 10).map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 px-5 py-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate font-bold text-slate-700 dark:text-slate-200">
                  {r.name} <span className="font-mono text-[11px] font-normal text-slate-500">{r.email}</span>
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase ${r.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : r.status === 'REJECTED' ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300' : 'bg-slate-100 text-slate-500 dark:bg-white/10'}`}>
                  {r.status}
                </span>
                <span className="font-mono text-[11px] text-slate-500">{r.reviewerName ?? ''}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-[#0b1e36]">
            <h2 id="review-modal-title" className="font-display text-lg font-black text-[#0b1e36] dark:text-white">
              {modal.kind === 'reject' ? `Reject ${modal.name}` : `Request info from ${modal.name}`}
            </h2>
            <label htmlFor="review-reason" className="mt-3 block text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {modal.kind === 'reject' ? 'Rejection reason (mandatory)' : 'Message (optional)'}
            </label>
            <textarea
              id="review-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder={modal.kind === 'reject' ? 'State the reason — sent to the applicant…' : 'What do you need from the applicant?…'}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#c59b48] focus:outline-none focus:ring-2 focus:ring-[#c59b48]/40 dark:border-white/15 dark:bg-black/20 dark:text-slate-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 dark:border-white/15 dark:text-slate-300">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => act(modal.id, modal.kind)}
                disabled={working !== null || (modal.kind === 'reject' && !reason.trim())}
                className={`rounded-xl px-5 py-2.5 text-sm font-extrabold text-white disabled:opacity-50 ${modal.kind === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0b1e36] hover:bg-[#122c4d] dark:bg-[#c59b48] dark:text-[#0b1e36]'}`}
              >
                {modal.kind === 'reject' ? 'Confirm rejection' : 'Send request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
