'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Loader2 } from 'lucide-react';

type UserRole = 'TRAINEE' | 'TRAINER' | 'ADMIN';

interface RequireAuthProps {
  children: React.ReactNode;
  /** Roles permitted to view the wrapped tree. ADMIN is always permitted. */
  allowedRoles: UserRole[];
}

function roleHome(role: UserRole, status?: string): string {
  if (status === 'PENDING') return '/auth/pending';
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'TRAINER':
      return '/trainer';
    case 'TRAINEE':
    default:
      return '/trainee';
  }
}

/**
 * Client-side auth gate for dashboard layouts.
 *
 * Nothing (not even mock-data UI) renders until `/api/auth/me` confirms an
 * active session, so logged-out visitors never see protected content — even
 * for a flash — and role mismatches bounce to the correct dashboard.
 */
export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) throw new Error('unauthenticated');
        const data = await res.json();
        const user = data?.user;
        if (!user) throw new Error('unauthenticated');

        if (user.status === 'SUSPENDED' || user.status === 'REJECTED') {
          router.replace('/auth/login?error=AccountSuspended');
          return;
        }
        if (user.status === 'PENDING') {
          router.replace('/auth/pending');
          return;
        }
        if (!allowedRoles.includes(user.role) && user.role !== 'ADMIN') {
          router.replace(roleHome(user.role, user.status));
          return;
        }
        if (!cancelled) setVerified(true);
      } catch {
        if (!cancelled) {
          router.replace(`/auth/login?next=${encodeURIComponent(pathname || '/')}&error=LoginRequired`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!verified) {
    return (
      <div className="flex-1 flex items-center justify-center w-full py-24" aria-label="Verifying session">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-2xl bg-[#0b1e36] border border-[#c59b48]/40 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-[#c59b48]" />
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <Loader2 className="h-4 w-4 animate-spin text-[#c59b48]" />
            <span>Verifying secure session…</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Checking your credentials before loading protected data.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireAuth;
