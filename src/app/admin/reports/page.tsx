'use client';

import React, { useMemo } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import {
  FileText,
  Download,
  Award,
  Users,
  Brain,
  Megaphone,
  CheckCircle2,
} from 'lucide-react';
import {
  initialCourses,
  initialEnrollments,
  initialAssessments,
  initialUsers,
  initialAnnouncements,
  initialCompetencies,
} from '@/lib/mockData';

function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminReportsPage() {
  const userById = useMemo(() => new Map(initialUsers.map((u) => [u.id, u])), []);
  const courseById = useMemo(() => new Map(initialCourses.map((c) => [c.id, c])), []);

  const certRows = useMemo(
    () =>
      initialEnrollments.map((e) => {
        const user = userById.get(e.userId);
        const course = courseById.get(e.courseId);
        const exam = initialAssessments.find((a) => a.courseId === e.courseId);
        return {
          id: e.id,
          learner: user?.profile?.fullName || user?.email || e.userId,
          email: user?.email || '—',
          course: course ? `${course.code} — ${course.title}` : e.courseId,
          track: course?.cadreTrack || '—',
          progress: `${Math.round(e.progressPercentage)}%`,
          status: e.status,
          exam: exam ? `${exam.timeLimitMinutes} min • Pass ${exam.passingScorePercentage}%` : '—',
          certificate: e.certificateId || 'Not issued',
          enrolledAt: e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString('en-IN') : '—',
        };
      }),
    [userById, courseById]
  );

  const exportCertifications = () =>
    downloadCsv(
      `certification-roster-${today()}.csv`,
      ['Enrollment', 'Learner', 'Email', 'Course', 'Track', 'Progress', 'Status', 'Exam', 'Certificate', 'Enrolled On'],
      certRows.map((r) => [r.id, r.learner, r.email, r.course, r.track, r.progress, r.status, r.exam, r.certificate, r.enrolledAt])
    );

  const exportUsers = () =>
    downloadCsv(
      `user-directory-${today()}.csv`,
      ['Name', 'Email', 'Role', 'Status', 'Organization', 'Department'],
      initialUsers.map((u) => [
        u.profile?.fullName || '',
        u.email,
        u.role,
        u.status,
        u.profile?.organization || '',
        u.profile?.department || '',
      ])
    );

  const exportCompetency = () =>
    downloadCsv(
      `competency-matrix-${today()}.csv`,
      ['Code', 'Competency', 'Category', 'Target Level', 'Description'],
      initialCompetencies.map((c: any) => [c.code || '', c.name || '', c.category || '', String(c.targetLevel ?? ''), (c.description || '').slice(0, 200)])
    );

  const exportBulletins = () =>
    downloadCsv(
      `bulletins-${today()}.csv`,
      ['Title', 'Type', 'Pinned', 'Author', 'Published On'],
      initialAnnouncements.map((a: any) => [
        a.title,
        a.type,
        a.isPinned ? 'Yes' : 'No',
        a.authorName || '',
        a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '',
      ])
    );

  const cards = [
    {
      icon: Award,
      title: 'Certification Roster',
      desc: `${certRows.length} enrollments with course, progress, exam and certificate status.`,
      count: `${certRows.length} rows`,
      onExport: exportCertifications,
    },
    {
      icon: Users,
      title: 'User Directory',
      desc: `${initialUsers.length} accounts with role, status and posting details.`,
      count: `${initialUsers.length} rows`,
      onExport: exportUsers,
    },
    {
      icon: Brain,
      title: 'Competency Matrix',
      desc: `${initialCompetencies.length} WMO-mapped competencies with benchmark levels.`,
      count: `${initialCompetencies.length} rows`,
      onExport: exportCompetency,
    },
    {
      icon: Megaphone,
      title: 'Ministry Bulletins',
      desc: `${initialAnnouncements.length} directives and announcements archive.`,
      count: `${initialAnnouncements.length} rows`,
      onExport: exportBulletins,
    },
  ];

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0 space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#060a14] p-6 sm:p-8 backdrop-blur-xl space-y-2 relative overflow-hidden shadow-lg shadow-[#0b1e36]/5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c59b48] to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-md bg-[#0b1e36] text-[#dfb76c] border border-[#c59b48]/40 px-2.5 py-0.5 text-xs font-sans font-bold flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-[#c59b48]" />
                GOVERNANCE REPORTING
              </span>
              <span className="text-xs font-sans text-emerald-600 dark:text-emerald-400 font-bold">
                CSV • Audit-ready
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#0b1e36] dark:text-white tracking-tight mt-1">
              Reports & Data Exports
            </h1>
            <p className="text-[13px] sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl mt-1.5 leading-relaxed">
              One-click compliance exports — certification rosters, user directories, competency matrices and bulletin archives for MoES audit reviews.
            </p>
          </div>
        </div>

        {/* Export cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-5 sm:p-6 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="h-10 w-10 rounded-xl bg-[#0b1e36]/5 dark:bg-[#c59b48]/10 border border-[#c59b48]/30 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-[#9a7224] dark:text-[#dfb76c]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                    {card.count}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0b1e36] dark:text-white">{card.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{card.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={card.onExport}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 px-4 py-2 text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-95"
                >
                  <Download className="h-3.5 w-3.5 text-[#c59b48]" />
                  <span>Download CSV</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Certification roster preview */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-5 sm:p-6 space-y-4 shadow-lg shadow-[#0b1e36]/5">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/10 flex-wrap">
            <h3 className="text-base font-bold text-[#0b1e36] dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>Certification Roster Preview</span>
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {certRows.length} record{certRows.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-[0.08em]">
                  <th className="py-3 px-3 sticky left-0 bg-white dark:bg-[#070f1a] z-10">Learner</th>
                  <th className="py-3 px-3 min-w-[220px]">Course</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Exam</th>
                  <th className="py-3 px-3">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {certRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-3 sticky left-0 bg-white dark:bg-[#070f1a] z-10">
                      <div className="font-bold text-slate-900 dark:text-white whitespace-nowrap">{r.learner}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[180px]" title={r.email}>{r.email}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{r.course}</td>
                    <td className="py-3 px-3 tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">{r.progress}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{r.exam}</td>
                    <td className="py-3 px-3">
                      {r.certificate === 'Not issued' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 whitespace-nowrap">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-mono whitespace-nowrap">
                          {r.certificate}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
