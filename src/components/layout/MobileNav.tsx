'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  Award,
  Video,
  BarChart3,
  Brain,
  FileText,
  Radio,
} from 'lucide-react';

interface MobileNavProps {
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
}

function itemsFor(role: MobileNavProps['role']) {
  switch (role) {
    case 'ADMIN':
      return [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/radar', label: 'Radar', icon: Radio },
        { href: '/admin/users', label: 'Users', icon: UserCheck },
        { href: '/admin/competency', label: 'Engine', icon: Brain },
        { href: '/admin/cms', label: 'CMS', icon: FileText },
      ];
    case 'TRAINER':
      return [
        { href: '/trainer', label: 'Hub', icon: LayoutDashboard },
        { href: '/radar', label: 'Radar', icon: Radio },
        { href: '/trainer/courses/create', label: 'Studio', icon: BookOpen },
        { href: '/trainer/library', label: 'Library', icon: Video },
        { href: '/trainer/analytics', label: 'Cohort', icon: BarChart3 },
      ];
    case 'TRAINEE':
    default:
      return [
        { href: '/trainee', label: 'Home', icon: LayoutDashboard },
        { href: '/radar', label: 'Radar', icon: Radio },
        { href: '/trainee/courses', label: 'Tracks', icon: BookOpen },
        { href: '/trainee/profile', label: 'Dossier', icon: Award },
      ];
  }
}

/**
 * Bottom tab bar for <lg screens — the desktop Sidebar is hidden there,
 * so this keeps every workspace navigable on phones and tablets.
 */
export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const items = itemsFor(role);

  return (
    <nav
      aria-label={`${role} workspace navigation`}
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-xl shadow-[0_-8px_30px_-10px_rgba(11,30,54,0.25)] dark:border-white/10 dark:bg-[#0b1e36]/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-lg auto-cols-fr grid-flow-col px-2 pt-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-all active:scale-95 ${
                isActive
                  ? 'text-[#9a7224] dark:text-[#dfb76c]'
                  : 'text-slate-500 hover:text-[#0b1e36] dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <span
                className={`flex h-7 items-center justify-center rounded-full px-4 transition-all ${
                  isActive ? 'bg-[#c59b48]/20 border border-[#c59b48]/50' : 'border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
