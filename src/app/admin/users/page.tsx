import React from 'react';
import { initialUsers } from '@/lib/mockData';
import { UserApprovalTable } from '@/components/admin/UserApprovalTable';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminUsersGovernancePage() {
  return (
    <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
      <Sidebar role="ADMIN" />

      <main className="flex-1 min-w-0">
        <UserApprovalTable initialUsersList={initialUsers} />
      </main>
    </div>
  );
}
