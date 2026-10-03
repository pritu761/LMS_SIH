'use client';

import React from 'react';
import { initialUsers } from '@/lib/mockData';
import { UserApprovalTable } from '@/components/admin/UserApprovalTable';
import { Sidebar } from '@/components/layout/Sidebar';
import { Users, UserCheck, Clock, ShieldAlert, Download } from 'lucide-react';

export default function AdminUsersGovernancePage() {
  const total = initialUsers.length;
  const approved = initialUsers.filter((u) => u.status === 'APPROVED').length;
  const pending = initialUsers.filter((u) => u.status === 'PENDING').length;
  const flagged = initialUsers.filter((u) => u.status === 'SUSPENDED' || u.status === 'REJECTED').length;

  const exportUsers = () => {
    const header = ['Name', 'Email', 'Role', 'Status', 'Organization', 'Department'];
    const rows = initialUsers.map((u) => [
      u.profile?.fullName || '',
      u.email,
      u.role,
      u.status,
      u.profile?.organization || '',
      u.profile?.department || '',
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-directory-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = [
    { icon: Users, label: 'Total Accounts', value: total, tone: 'text-indigo-700 dark:text-indigo-300' },
    { icon: UserCheck, label: 'Approved', value: approved, tone: 'text-emerald-700 dark:text-emerald-300' },
    { icon: Clock, label: 'Pending Review', value: pending, tone: 'text-amber-700 dark:text-amber-300' },
    { icon: ShieldAlert, label: 'Suspended / Rejected', value: flagged, tone: 'text-rose-700 dark:text-rose-300' },
  ];

  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#070f1a] p-4 flex items-center gap-3 shadow-sm"
              >
                <div className="h-9 w-9 rounded-xl bg-[#0b1e36]/5 dark:bg-[#c59b48]/10 border border-[#c59b48]/30 flex items-center justify-center shrink-0">
                  <Icon className={`h-4 w-4 ${s.tone}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-extrabold text-[#0b1e36] dark:text-white tabular-nums leading-none">
                    {s.value}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={exportUsers}
            className="flex items-center gap-1.5 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/50 px-4 py-2 text-xs font-bold text-white transition-all hover:scale-[1.02]"
          >
            <Download className="h-3.5 w-3.5 text-[#c59b48]" />
            <span>Export User Directory (CSV)</span>
          </button>
        </div>

        <UserApprovalTable initialUsersList={initialUsers} />
      </main>
    </div>
  );
}
