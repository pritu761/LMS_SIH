'use client';

import React from 'react';
import { RequireAuth } from '@/components/auth/RequireAuth';

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuth allowedRoles={['TRAINER']}>{children}</RequireAuth>;
}
