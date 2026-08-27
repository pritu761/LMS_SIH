'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
  Users,
  CheckCircle2,
  Activity,
  Zap,
  Bell,
  Menu,
  X,
  Satellite,
  Compass,
} from 'lucide-react';
import { ThemeSwitcher } from '@/components/layout/ThemeSwitcher';
import { ModeToggle } from '@/components/layout/ModeToggle';
import { useVisualTheme } from '@/context/ThemeContext';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { mode } = useVisualTheme();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll progress bar + glass intensity
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
      setIsScrolled(scrollTop > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDemoSwitch = async (role: string) => {
    setLoadingRole(true);
    setIsRoleDropdownOpen(false);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TRAINER') router.push('/trainer');
        else if (role.includes('PENDING')) router.push('/auth/pending');
        else router.push('/trainee');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRole(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      router.push('/auth/login');
    } catch (e) {
      console.error(e);
    }
  };

  const userRole = currentUser?.role || 'GUEST';

  const navLinkClass = (href: string, exact = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return `nav-underline px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm active'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
    }`;
  };

  const roleEntries = [
    {
      role: 'ADMIN',
      label: 'Director General (DG IMD)',
      sub: 'Dr. Mrutyunjay Mohapatra (MoES)',
      icon: ShieldCheck,
      colorClass: 'hover:bg-emerald-600/20',
      iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      hoverText: 'group-hover:text-emerald-300',
      check: userRole === 'ADMIN',
      checkColor: 'text-emerald-400',
    },
    {
      role: 'TRAINER',
      label: 'Lead Faculty (NWP/HPC)',
      sub: 'Prof. Vikramaditya Sen (MTI Pune)',
      icon: BookOpen,
      colorClass: 'hover:bg-indigo-600/20',
      iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      hoverText: 'group-hover:text-indigo-300',
      check: userRole === 'TRAINER' && currentUser?.status === 'APPROVED',
      checkColor: 'text-indigo-400',
    },
    {
      role: 'TRAINEE',
      label: 'Scientist-B (DRSTC)',
      sub: 'Aarav Patel (NWP Division)',
      icon: Award,
      colorClass: 'hover:bg-cyan-600/20',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      hoverText: 'group-hover:text-cyan-300',
      check: userRole === 'TRAINEE' && currentUser?.status === 'APPROVED',
      checkColor: 'text-cyan-400',
    },
  ];

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="scroll-progress-bar"
        style={{ width: `${scrollProgress}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.2 }}
      />

      <motion.header
        suppressHydrationWarning
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={`sticky top-0 z-50 w-full border-b transition-all duration-500 ${
          isScrolled
            ? 'border-white/15 bg-black/90 backdrop-blur-2xl shadow-elevation-2'
            : 'border-white/10 bg-black/75 backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Brand & Portal Identity */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all duration-300">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black">
                  <Satellite className="h-5 w-5 text-cyan-400 group-hover:text-indigo-300 transition-colors duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors duration-300">
                    CAPACITY<span className="text-cyan-400">CONNECT</span>
                  </span>
                  <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-black text-cyan-300 border border-cyan-500/30 uppercase tracking-wider">
                    MISSION MAUSAM
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  IMD / MoES Capacity & Competency Portal
                </p>
              </div>
            </Link>

            {/* Navigation Links based on role */}
            <nav className="hidden md:flex items-center gap-1">
              {userRole === 'TRAINEE' && (
                <>
                  <Link href="/trainee" className={navLinkClass('/trainee', true)}>Learning Dashboard</Link>
                  <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>Mission Mausam Courses</Link>
                  <Link href="/trainee/profile" className={navLinkClass('/trainee/profile', true)}>Competency Profile</Link>
                </>
              )}

              {userRole === 'TRAINER' && (
                <>
                  <Link href="/trainer" className={navLinkClass('/trainer', true)}>Faculty Hub</Link>
                  <Link href="/trainer/library" className={navLinkClass('/trainer/library', true)}>Media Library</Link>
                  <Link href="/trainer/analytics" className={navLinkClass('/trainer/analytics', true)}>Cohort Analytics</Link>
                </>
              )}

              {userRole === 'ADMIN' && (
                <>
                  <Link href="/admin" className={navLinkClass('/admin', true)}>National Overview</Link>
                  <Link href="/admin/users" className={navLinkClass('/admin/users', true)}>User Governance</Link>
                  <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>Competency & Gap Engine</Link>
                  <Link href="/admin/cms" className={navLinkClass('/admin/cms', true)}>Directives & CMS</Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Side Tools & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                disabled={loadingRole}
                className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:border-cyan-500/40 transition-all hover:scale-105 active:scale-95"
              >
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="hidden sm:inline text-slate-300">Persona:</span>
                <span className="text-cyan-300 font-black">{userRole}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isRoleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-2xl z-50 space-y-1"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Switch Mission Mausam Persona
                    </div>

                    {roleEntries.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.role}
                          type="button"
                          onClick={() => handleDemoSwitch(item.role)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-left group ${item.colorClass} ${
                            item.check ? 'bg-slate-900 border border-slate-800' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${item.iconBg}`}>
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold text-white truncate ${item.hoverText}`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate font-medium">
                                {item.sub}
                              </div>
                            </div>
                          </div>
                          {item.check && (
                            <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.checkColor}`} />
                          )}
                        </button>
                      );
                    })}

                    {currentUser && (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors pt-2 border-t border-slate-800/80"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2"
            >
              {userRole === 'TRAINEE' && (
                <>
                  <Link href="/trainee" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Learning Dashboard</Link>
                  <Link href="/trainee/courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Mission Mausam Courses</Link>
                  <Link href="/trainee/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Competency Profile</Link>
                </>
              )}
              {userRole === 'TRAINER' && (
                <>
                  <Link href="/trainer" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Faculty Hub</Link>
                  <Link href="/trainer/library" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Media Library</Link>
                  <Link href="/trainer/analytics" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Cohort Analytics</Link>
                </>
              )}
              {userRole === 'ADMIN' && (
                <>
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">National Overview</Link>
                  <Link href="/admin/users" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">User Governance</Link>
                  <Link href="/admin/competency" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-xs font-bold text-slate-200">Competency & Gap Engine</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
