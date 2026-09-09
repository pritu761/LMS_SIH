import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Award, ShieldCheck, ShieldX, Timer } from 'lucide-react';
import { getVerificationRecord } from '@/services/traineeService';

export const metadata: Metadata = {
  title: 'Verify Certificate',
  description: 'Verify a CapacityConnect certificate by its public verification ID. No login required.',
  robots: { index: false, follow: false },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

/**
 * GET /verify/[certId] — public certificate verification (no login).
 * Shows holder name, module, issue date and VALID / REVOKED / EXPIRED
 * status for a verification ID. Unknown IDs render the 404 page.
 */
export default async function VerifyPage({ params }: { params: Promise<{ certId: string }> }) {
  const { certId } = await params;
  const record = await getVerificationRecord(certId.trim());
  if (!record) notFound();

  const valid = record.status === 'VALID';
  const expired = record.status === 'EXPIRED';

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-10 sm:px-6">
      <nav aria-label="Breadcrumb">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 transition-colors hover:text-[#0b1e36] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:text-slate-400 dark:hover:text-[#dfb76c]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Public catalog
        </Link>
      </nav>

      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
        <div className="h-2 w-full bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#0b1e36]" aria-hidden="true" />
        <div className="p-8 sm:p-10">
          <Award className="mx-auto h-12 w-12 text-[#c59b48]" aria-hidden="true" />
          <h1 className="font-display mt-3 text-2xl font-black text-[#0b1e36] dark:text-white">Certificate verification</h1>
          <p
            className={`mx-auto mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-black uppercase tracking-wider ${
              valid
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                : expired
                  ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300'
            }`}
            role="status"
          >
            {valid ? <ShieldCheck className="h-4 w-4" aria-hidden="true" /> : expired ? <Timer className="h-4 w-4" aria-hidden="true" /> : <ShieldX className="h-4 w-4" aria-hidden="true" />}
            {record.status}
          </p>

          <dl className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {[
              ['Holder', record.holderName],
              ['Module', record.moduleTitle],
              ...(record.trackCode ? [['Track', record.trackCode] as [string, string]] : []),
              ['Issued', formatDate(record.issuedAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2.5 dark:border-white/10">
                <dt className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-slate-500">{k}</dt>
                <dd className="text-right text-sm font-bold text-slate-800 dark:text-slate-100">{v}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4">
              <dt className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-slate-500">Verification ID</dt>
              <dd className="break-all text-right font-mono text-xs text-slate-600 dark:text-slate-300">{record.verificationId}</dd>
            </div>
          </dl>

          {!valid && (
            <p className="mx-auto mt-5 max-w-md rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
              {expired
                ? 'This credential has expired. Contact the CapacityConnect helpdesk for re-certification.'
                : 'This credential was revoked and must not be accepted as proof of competency.'}
            </p>
          )}

          <p className="mt-6 font-mono text-[11px] text-slate-500">
            Issued by CapacityConnect • India Meteorological Department • Ministry of Earth Sciences
          </p>
        </div>
      </div>
    </div>
  );
}
