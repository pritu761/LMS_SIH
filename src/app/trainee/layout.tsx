'use client';

import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { MobileNav } from '@/components/layout/MobileNav';

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth allowedRoles={['TRAINEE']}>
      <div className="pb-20 lg:pb-0">{children}</div>
      <MobileNav role="TRAINEE" />
    </RequireAuth>
  );
}
