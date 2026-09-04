'use client';

import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function TraineeLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth allowedRoles={['TRAINEE']}>{children}</RequireAuth>;
}
