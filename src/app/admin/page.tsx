import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, Award, BellRing, Gauge, Inbox, Map as MapIcon, ScrollText, TableProperties, Upload } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { Sidebar } from '@/components/layout/Sidebar';
import { getApprovals, getStations } from '@/services/adminService';

export const metadata = { title: 'National Overview' };

/**
 * GET /admin — governance overview (ADMIN only): approval workload with SLA
 * breaches, station readiness summary and shortcuts to every admin section.
 */
export default async function AdminOverviewPage() {
  const session = await getCurrentUser();
  if (!session) redirect('/auth/login?next=/admin');
  if (session.status === 'PENDING') redirect('/auth/pending');
  if (session.role !== 'ADMIN') redirect('/');

  const [approvals, { summary }] = await Promise.all([getApprovals(), getStations()]);

  const stats = [
    { label: 'Pending approvals', value: String(approvals.pendingCount), tone: approvals.pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : '' },
    { label: 'SLA breaches', value: String(approvals.breachedCount), tone: approvals.breachedCount > 0 ? 'text-rose-600 dark:text-rose-400' : '' },
    { label: 'National readiness', value: `${summary.nationalAvg}%`, tone: '' },
    { label: 'Stations at risk', value: String(summary.atRisk), tone: summary.atRisk > 0 ? 'text-rose-600 dark:text-rose-400' : '' },
    { label: 'Certs this month', value: String(summary.certsThisMonth), tone: '' },
  ];

  const sections = [
    { href: '/admin/approvals', icon: Inbox, title: 'Approval queue', desc: `${approvals.pendingCount} pending • SLA 48h`, badge: approvals.breachedCount > 0 ? `${approvals.breachedCount} breached` : null },
    { href: '/admin/audit', icon: ScrollText, title: 'Audit log', desc: 'Append-only trail • filters • CSV export', badge: null },
    { href: '/admin/stations', icon: MapIcon, title: 'Station readiness map', desc: `${summary.total} stations • region overlay`, badge: null },
    { href: '/admin/bulk', icon: Upload, title: 'Bulk operations', desc: 'Roster / station / batch CSV imports', badge: null },
    { href: '/admin/reports', icon: TableProperties, title: 'Reports', desc: '6 pre-built • CSV + PDF', badge: null },
    { href: '/admin/certificates', icon: Award, title: 'Certificates', desc: 'Registry • revoke / reinstate', badge: null },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <Sidebar role="ADMIN" />
      <main className="min-w-0 flex-1 space-y-5 pb-10">
        <header>
          <h1 className="font-display text-xl font-black text-[#0b1e36] sm:text-2xl dark:text-white">National overview</h1>
          <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">Governance at a glance — Mission Mausam capacity posture</p>
        </header>

        {approvals.breachedCount > 0 && (
          <Link
            href="/admin/approvals"
            className="flex items-center gap-3 rounded-2xl border border-rose-300 bg-rose-50 px-5 py-3.5 text-sm font-bold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
          >
            <BellRing className="h-5 w-5 shrink-0" aria-hidden="true" />
            {approvals.breachedCount} registration{approvals.breachedCount === 1 ? ' has' : 's have'} breached the 48h SLA — review and escalate now.
            <ArrowRight className="ml-auto h-4 w-4" aria-hidden="true" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`font-display mt-1 text-2xl font-black text-[#0b1e36] dark:text-white ${s.tone}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#c59b48]/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c59b48] dark:border-white/10 dark:bg-[#0b1e36]/60"
            >
              <span className="flex items-center justify-between">
                <s.icon className="h-6 w-6 text-[#c59b48]" aria-hidden="true" />
                {s.badge && (
                  <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-extrabold uppercase text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    {s.badge}
                  </span>
                )}
              </span>
              <span className="font-display mt-3 block text-base font-extrabold text-[#0b1e36] dark:text-white">{s.title}</span>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{s.desc}</span>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-[#9a7224] dark:text-[#dfb76c]">
                Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>

        <p className="flex items-center gap-2 text-xs text-slate-500">
          <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
          Mail delivery: {process.env.RESEND_API_KEY ? 'Resend provider configured' : 'no provider — invites go in-app + dev log'}.
        </p>
      </main>
    </div>
  );
}
