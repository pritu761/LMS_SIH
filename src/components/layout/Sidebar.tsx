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
          { href: '/admin/users', label: 'User Governance', icon: UserCheck, badge: 'RBAC' },
          { href: '/admin/competency', label: 'Competency Matcher', icon: Brain, badge: '55/30/15', highlight: true },
          { href: '/admin/cms', label: 'Announcements & CMS', icon: FileText },
        ];
      case 'TRAINER':
        return [
          { href: '/trainer', label: 'Faculty Hub', icon: LayoutDashboard },
          { href: '/trainer/library', label: 'Media Library', icon: Video },
          { href: '/trainer/assessments/create', label: 'Assessment Creator', icon: FileCheck },
          { href: '/trainer/analytics', label: 'Cohort Analytics', icon: BarChart3 },
        ];
      case 'TRAINEE':
      default:
        return [
          { href: '/trainee', label: 'Learning Dashboard', icon: LayoutDashboard },
          { href: '/trainee/courses', label: 'Course Catalog', icon: BookOpen },
          { href: '/trainee/profile', label: 'Competency Profile', icon: Award },
        ];
    }
  };

  const roleColors = {
    ADMIN: { label: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
    TRAINER: { label: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' },
    TRAINEE: { label: 'text-cyan-400', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' },
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 lg:w-72 shrink-0 hidden lg:flex flex-col rounded-3xl border border-white/10 bg-[#08080d] backdrop-blur-2xl p-5 space-y-6 shadow-elevation-2 animate-fade-in-left self-start sticky top-20">
      
      {/* Workspace Tag Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className={`text-[10px] font-black uppercase tracking-wider ${roleColors[role].label}`}>
            {role} Workspace
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        </div>

        {/* Navigation List */}
        <div className="space-y-1.5 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600/20 text-white border border-blue-500/40 shadow-sm shadow-blue-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                } ${item.highlight && !isActive ? 'border-dashed border-blue-500/30 bg-blue-950/20' : ''}`}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-400 shadow-glow-sm" />
                )}

                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white group-hover:scale-105'
                  }`} />
                  <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase border shrink-0 ${
                    isActive ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' : 'bg-white/5 text-slate-400 border-white/10'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Role Context Card */}
      <div className="rounded-2xl border border-white/10 bg-black/70 p-4 space-y-2 mt-auto shadow-inner">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <div className="relative">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <div className="absolute -inset-1 rounded-full bg-blue-400/20 animate-breathe pointer-events-none" />
          </div>
          <span>Security Guard Active</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Access is enforced at the edge via JWT and RBAC headers.
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          <span className="text-[10px] text-blue-400 font-bold">All systems nominal</span>
        </div>
      </div>
    </aside>
  );
}
