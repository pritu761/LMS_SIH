'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Compass,
  Satellite,
} from 'lucide-react';
import { staggerContainer, staggerItem, ease } from '@/lib/animations';

interface SidebarProps {
  role: 'TRAINEE' | 'TRAINER' | 'ADMIN';
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { href: '/admin', label: 'National Overview', icon: LayoutDashboard },
          { href: '/admin/users', label: 'User Governance', icon: UserCheck, badge: 'RBAC' },
          { href: '/admin/competency', label: 'Competency & Gap Engine', icon: Brain, badge: '55/30/15', highlight: true },
          { href: '/admin/cms', label: 'Directives & CMS', icon: FileText },
        ];
      case 'TRAINER':
        return [
          { href: '/trainer', label: 'Faculty Hub', icon: LayoutDashboard },
          { href: '/trainer/library', label: 'Media Library', icon: Video },
          { href: '/trainer/assessments/create', label: 'Cadre Assessment Creator', icon: FileCheck },
          { href: '/trainer/analytics', label: 'Cohort Telemetry', icon: BarChart3 },
        ];
      case 'TRAINEE':
      default:
        return [
          { href: '/trainee', label: 'Learning Dashboard', icon: LayoutDashboard },
          { href: '/trainee/courses', label: 'Mission Mausam Tracks', icon: BookOpen },
          { href: '/trainee/profile', label: 'Competency Dossier', icon: Award },
        ];
    }
  };

  const roleColors = {
    ADMIN: { label: 'text-[#0b1e36]', badge: 'bg-[#0b1e36]/10 text-[#0b1e36] border-[#c59b48]/40' },
    TRAINER: { label: 'text-[#c59b48]', badge: 'bg-[#c59b48]/10 text-[#0b1e36] border-[#c59b48]/40' },
    TRAINEE: { label: 'text-[#0b1e36]', badge: 'bg-[#0b1e36]/10 text-[#0b1e36] border-[#c59b48]/40' },
  };

  const navItems = getNavItems();

  return (
    <motion.aside
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: ease.smooth }}
      className="w-64 lg:w-72 shrink-0 hidden lg:flex flex-col rounded-3xl border border-slate-200 bg-white p-5 space-y-6 shadow-lg shadow-[#0b1e36]/5 self-start sticky top-20 dark:border-white/10 dark:bg-[#0b1e36] dark:shadow-black/30"
    >
      {/* Workspace Tag Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className={`text-[10px] font-black uppercase tracking-wider ${roleColors[role].label}`}>
            IMD {role} Workspace
          </span>
          <motion.span
            className="h-2 w-2 rounded-full bg-[#c59b48]"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Navigation List with Framer Motion Stagger */}
        <motion.div
          className="space-y-1.5 pt-1"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== `/${role.toLowerCase()}` && pathname.startsWith(item.href));

            return (
              <motion.div
                key={item.href}
                variants={staggerItem}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={item.href}
                  className={`relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'text-white font-bold bg-[#0b1e36] border border-[#c59b48]/60 shadow-md shadow-[#0b1e36]/20 dark:bg-[#122c4d]'
                      : 'text-slate-700 hover:text-[#0b1e36] hover:bg-slate-100/80 border border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
                  } ${item.highlight && !isActive ? 'border-dashed border-[#c59b48]/60 bg-[#c59b48]/5' : ''}`}
                >
                  {/* Shared Active Sliding Indicator Background */}
                  {isActive && (
                    <motion.div
                      layoutId={`sidebar-active-pill-${role}`}
                      className="absolute inset-0 rounded-2xl bg-[#0b1e36]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  {/* Active indicator bar */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bar"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#c59b48] z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-2.5 min-w-0 flex-1">
                    <Icon className={`h-4 w-4 shrink-0 transition-all duration-200 ${
                      isActive ? 'text-[#c59b48]' : 'text-slate-500 group-hover:text-[#0b1e36] group-hover:scale-105'
                    }`} />
                    <span className="truncate whitespace-nowrap overflow-hidden text-ellipsis">{item.label}</span>
                  </div>

                      {item.badge && (
                        <span className={`relative z-10 rounded-full px-2 py-0.5 text-[9px] font-black uppercase border shrink-0 ${
                          isActive ? 'bg-[#c59b48] text-[#0b1e36] border-[#c59b48]' : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/15'
                        }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Role Context Card */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2 mt-auto shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <div className="flex items-center gap-2 text-xs font-bold text-[#0b1e36] dark:text-white">
          <div className="relative">
            <Satellite className="h-3.5 w-3.5 text-[#c59b48]" />
          </div>
          <span>Mission Mausam Node</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed dark:text-slate-300">
          National capacity telemetry synced with IMD HQ Mausam Bhavan.
        </p>
        <div className="flex items-center gap-1.5 pt-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-emerald-700 font-bold font-mono">Telemetry Active</span>
        </div>
      </motion.div>
    </motion.aside>
  );
}
