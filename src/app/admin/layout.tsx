'use client';

import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={['ADMIN']}>
      <div className="pb-20 lg:pb-0">{children}</div>
      <MobileNav role="ADMIN" />
    </RequireAuth>
  );
}
