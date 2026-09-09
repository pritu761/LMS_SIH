import Link from 'next/link';
import { Award, Download, ShieldCheck, ShieldX } from 'lucide-react';
import type { TraineeCertificateView } from '@/services/traineeTypes';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

/**
 * Certificate wall (Section E): earned credentials with PDF download
 * (QR-coded, server-generated) and public verification links.
 */
export function CertificateWall({ certificates }: { certificates: TraineeCertificateView[] }) {
  return (
    <section aria-labelledby="certs-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-white/10">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b1e36]/5 text-[#0b1e36] dark:bg-[#c59b48]/15 dark:text-[#dfb76c]">
          <Award className="h-5 w-5" aria-hidden="true" />
        </span>
        <span>
          <h2 id="certs-heading" className="font-display text-base font-extrabold text-[#0b1e36] dark:text-white">
            Certificate wall
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {certificates.length === 0 ? 'No certificates yet — complete a module to earn one' : `${certificates.length} credential${certificates.length === 1 ? '' : 's'} earned`}
          </p>
        </span>
      </header>
      <div className="p-5">
        {certificates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-white/15">
            <Award className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Finish all lessons in a module and pass its assessment — your verifiable certificate appears here.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {certificates.map((c) => {
              const valid = c.status === 'VALID';
              return (
                <li
                  key={c.id}
                  className="flex flex-col rounded-2xl border-2 border-[#c59b48]/40 bg-gradient-to-br from-[#c59b48]/10 via-transparent to-transparent p-5"
                >
                  <span className="flex items-center justify-between">
                    <Award className="h-8 w-8 text-[#c59b48]" aria-hidden="true" />
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ${
                        valid
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'
                          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                      }`}
                    >
                      {valid ? <ShieldCheck className="h-3 w-3" aria-hidden="true" /> : <ShieldX className="h-3 w-3" aria-hidden="true" />}
                      {c.status}
                    </span>
                  </span>
                  <h3 className="font-display mt-3 text-base font-extrabold leading-snug text-[#0b1e36] dark:text-white">
                    {c.moduleTitle}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                    {c.trackCode ? `${c.trackCode} • ` : ''}Issued {formatDate(c.issuedAt)}
                    {c.score !== null ? ` • Score ${c.score}` : ''}
                    {c.grade ? ` (${c.grade})` : ''}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 pt-1">
                    <a
                      href={`/api/trainee/certificates/${c.id}/pdf`}
                      download
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0b1e36] px-3.5 py-2 text-xs font-extrabold text-white transition-colors hover:bg-[#122c4d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:bg-[#c59b48] dark:text-[#0b1e36] dark:hover:bg-[#dfb76c]"
                    >
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      Download PDF
                    </a>
                    <Link
                      href={`/verify/${c.verificationId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-600 transition-colors hover:border-[#c59b48] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/15 dark:text-slate-300"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                      Verify
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
