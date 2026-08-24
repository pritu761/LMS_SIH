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
  FileCheck,
  BarChart3,
  Brain,
  Shield,
  Layers,
  Settings,
  HelpCircle,
  FileText,
} from 'lucide-react';

interface SidebarProps {
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { href: '/admin', label: 'Executive Overview', icon: LayoutDashboard },
          { href: '/admin/users', label: 'User Governance & RBAC', icon: UserCheck, badge: 'Active' },
          { href: '/admin/competency', label: 'Competency Matcher (55/30/15)', icon: Brain, highlight: true },
          { href: '/admin/cms', label: 'Announcements & CMS', icon: FileText },
        ];
      case 'TRAINER':
        return [
          { href: '/trainer', label: 'Trainer Hub', icon: LayoutDashboard },
          { href: '/trainer/library', label: 'Media Library & Uploads', icon: Video },
          { href: '/trainer/assessments/create', label: 'MCQ Assessment Creator', icon: FileCheck },
          { href: '/trainer/analytics', label: 'Cohort Analytics', icon: BarChart3 },
        ];
      case 'TRAINEE':
      default:
        return [
          { href: '/trainee', label: 'My Learning Dashboard', icon: LayoutDashboard },
          { href: '/trainee/courses', label: 'Course Catalog & Enroll', icon: BookOpen },
          { href: '/trainee/profile', label: 'Competency Profile', icon: Award },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-slate-800 bg-slate-950/40 p-4 space-y-6">
      <div className="space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {role} Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              } ${item.highlight ? 'border-dashed border-indigo-400/40 bg-indigo-950/20' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Role Context Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-white">
          <Shield className="h-3.5 w-3.5 text-indigo-400" />
          <span>Security Guard Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Access is enforced at the edge via JWT and RBAC headers.
        </p>
      </div>
    </aside>
  );
}
