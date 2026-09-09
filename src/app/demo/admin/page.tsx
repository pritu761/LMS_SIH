import type { Metadata } from 'next';
import {
  Award,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Gauge,
  Inbox,
  Map as MapIcon,
  ScrollText,
  TriangleAlert,
  Upload,
  XCircle,
} from 'lucide-react';
import { DemoBanner } from '@/components/demo/DemoBanner';
import { SectionCard } from '@/components/demo/SectionCard';
import { DemoTooltip } from '@/components/demo/DemoTooltip';
import { StationReadinessMap } from '@/components/demo/StationReadinessMap';
import { demoAdmin } from '@/services/demoData';

export const metadata: Metadata = {
  title: 'Demo: Admin View',
  description: 'Fictional admin dashboard demo — station readiness map, approval queue, audit trail and bulk ops.',
};

const DISABLED_TIP = 'Disabled in demo mode — sign in as Admin to perform this action.';

/**
 * GET /demo/admin — fictional admin dashboard. Fully static: all content
 * comes from src/demo-data/demo-admin.json (no DB calls, no PII). Every
 * mutating control is disabled with an explanatory tooltip.
 */
export default function DemoAdminPage() {
  const d = demoAdmin;
  const lowest = [...d.stations].sort((a, b) => a.readiness - b.readiness).slice(0, 5);

  return (
    <div className="min-h-screen">
      <DemoBanner persona={`Admin — ${d.persona.name}`} />
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b1e36] font-display text-lg font-black text-[#dfb76c] dark:bg-[#c59b48] dark:text-[#0b1e36]"
          >
            {d.persona.initials}
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-black text-[#0b1e36] sm:text-3xl dark:text-white">
              {d.persona.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {d.persona.headline} • {d.persona.station}
            </p>
          </div>
        </header>

        {/* Summary cards */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Gauge className="h-4 w-4 text-[#c59b48]" aria-hidden="true" />
              National avg readiness
            </p>
            <p className="font-display mt-2 text-3xl font-black text-[#0b1e36] dark:text-white">{d.summary.nationalAvg}%</p>
            <div
              role="progressbar"
              aria-label="National average readiness"
              aria-valuenow={d.summary.nationalAvg}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
            >
              <div className="h-full rounded-full bg-[#c59b48]" style={{ width: `${d.summary.nationalAvg}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <TriangleAlert className="h-4 w-4 text-rose-500" aria-hidden="true" />
              Stations at risk
            </p>
            <p className="font-display mt-2 text-3xl font-black text-rose-600 dark:text-rose-400">
              {d.summary.stationsAtRisk}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Readiness below {d.summary.riskThreshold}% — mostly NE stations
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0b1e36]/60">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Award className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              Certifications this month
            </p>
            <p className="font-display mt-2 text-3xl font-black text-[#0b1e36] dark:text-white">
              {d.summary.certsThisMonth}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Across all tracks and cadres</p>
          </div>
        </div>

        {/* Readiness map */}
        <div className="mt-5">
          <SectionCard
            icon={MapIcon}
            title={`Station readiness map (${d.stations.length} demo stations)`}
            subtitle="Circle markers colored by readiness — click any marker for details"
          >
            <StationReadinessMap stations={d.stations} />
            <h3 className="mt-5 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Needs attention — lowest readiness
            </h3>
            <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 dark:divide-white/10 dark:border-white/10">
              {lowest.map((s) => (
                <li
                  key={s.code}
                  className="flex flex-wrap items-center gap-2 bg-slate-50/60 px-3.5 py-2.5 text-sm dark:bg-white/[0.03]"
                >
                  <span className="font-mono text-xs font-bold text-[#9a7224] dark:text-[#dfb76c]">{s.code}</span>
                  <span className="min-w-0 flex-1 truncate font-bold text-slate-700 dark:text-slate-200">{s.name}</span>
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">gap: {s.topGap}</span>
                  <span className="rounded-lg bg-rose-100 px-2 py-0.5 font-mono text-xs font-black text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                    {s.readiness}%
                  </span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {/* Approval queue */}
          <SectionCard
            icon={Inbox}
            title={`Approval queue (${d.approvals.length} pending)`}
            subtitle="Registrations awaiting review • SLA escalates at 48h"
          >
            <ul className="space-y-4">
              {d.approvals.map((a) => (
                <li key={a.email} className="rounded-2xl border border-slate-100 p-4 dark:border-white/10">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1e36]/5 font-display text-sm font-black text-[#0b1e36] dark:bg-white/10 dark:text-[#dfb76c]"
                    >
                      {a.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-800 dark:text-slate-100">{a.name}</span>
                      <span className="block truncate font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {a.email} • {a.role} • {a.station}
                      </span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] font-extrabold ${
                        a.slaBreach
                          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300'
                          : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                      }`}
                    >
                      <Clock3 className="h-3 w-3" aria-hidden="true" />
                      {a.slaHrs}h{a.slaBreach ? ' • BREACHED' : ''}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[52px] text-xs text-slate-500 dark:text-slate-400">Submitted {a.submitted}</p>
                  {a.slaBreach && (
                    <p className="mt-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                      SLA breached — escalated to super-admin in the live portal.
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 pl-[52px]">
                    <DemoTooltip tip={DISABLED_TIP}>
                      <button
                        type="button"
                        disabled
                        title={DISABLED_TIP}
                        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-extrabold text-emerald-700 opacity-60 dark:bg-emerald-500/15 dark:text-emerald-300"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve
                      </button>
                    </DemoTooltip>
                    <DemoTooltip tip={DISABLED_TIP}>
                      <button
                        type="button"
                        disabled
                        title={DISABLED_TIP}
                        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl bg-rose-100 px-4 py-2 text-xs font-extrabold text-rose-700 opacity-60 dark:bg-rose-500/15 dark:text-rose-300"
                      >
                        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        Reject
                      </button>
                    </DemoTooltip>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">Actions are disabled in demo mode.</p>
          </SectionCard>

          {/* Audit log */}
          <SectionCard
            icon={ScrollText}
            title={`Audit log (${d.audit.length} recent)`}
            subtitle="Append-only trail — demo snapshot"
          >
            <ol className="space-y-1">
              {d.audit.map((e) => (
                <li
                  key={`${e.time}-${e.action}`}
                  className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-xl px-3 py-2.5 text-sm odd:bg-slate-50 dark:odd:bg-white/[0.03]"
                >
                  <span className="shrink-0 font-mono text-[11px] font-bold text-slate-500">{e.time}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{e.actor}</span>
                  <span className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-400">
                    {e.role}
                  </span>
                  <span className="rounded bg-[#0b1e36] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#dfb76c]">
                    {e.action}
                  </span>
                  <span className="w-full truncate text-xs text-slate-500 dark:text-slate-400">{e.entity}</span>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        {/* Bulk operations */}
        <div className="mt-5">
          <SectionCard
            icon={FileSpreadsheet}
            title="Bulk operations"
            subtitle="Officer rosters, station data and batch assignments via CSV"
          >
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <DemoTooltip tip={d.bulkUpload.tooltip}>
                <button
                  type="button"
                  disabled
                  title={d.bulkUpload.tooltip}
                  aria-describedby="bulk-demo-hint"
                  className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#0b1e36] px-5 py-3 text-sm font-extrabold text-white opacity-60 dark:bg-[#c59b48] dark:text-[#0b1e36]"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload officer roster
                </button>
              </DemoTooltip>
              <div className="text-sm">
                <p className="font-bold text-slate-700 dark:text-slate-200">officer-roster-template.csv</p>
                <p id="bulk-demo-hint" className="text-xs text-slate-500 dark:text-slate-400">
                  Template preview only — {d.bulkUpload.tooltip}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
