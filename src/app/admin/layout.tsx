'use client';

import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth allowedRoles={['ADMIN']}>{children}</RequireAuth>;
}
