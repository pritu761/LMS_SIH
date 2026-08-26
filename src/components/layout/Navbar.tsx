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
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      label: 'System Admin',
      sub: 'Dr. Rajeshwari Sharma',
      icon: ShieldCheck,
      colorClass: 'hover:bg-emerald-600/20',
      iconBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      hoverText: 'group-hover:text-emerald-300',
      check: userRole === 'ADMIN',
      checkColor: 'text-emerald-400',
    },
    {
      role: 'TRAINER',
      label: 'Approved Trainer',
      sub: 'Prof. Vikramaditya Sen',
      icon: BookOpen,
      colorClass: 'hover:bg-indigo-600/20',
      iconBg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
      hoverText: 'group-hover:text-indigo-300',
      check: userRole === 'TRAINER' && currentUser?.status === 'APPROVED',
      checkColor: 'text-indigo-400',
    },
    {
      role: 'TRAINEE',
      label: 'Approved Trainee',
      sub: 'Aarav Patel',
      icon: Award,
      colorClass: 'hover:bg-cyan-600/20',
      iconBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
      hoverText: 'group-hover:text-cyan-300',
      check: userRole === 'TRAINEE' && currentUser?.status === 'APPROVED',
      checkColor: 'text-cyan-400',
    },
    {
      role: 'TRAINER_PENDING',
      label: 'Pending Candidate',
      sub: 'Karthik Raman (Pending Verification)',
      icon: Users,
      colorClass: 'hover:bg-amber-600/20',
      iconBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      hoverText: 'group-hover:text-amber-300',
      check: false,
      checkColor: '',
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
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-amber-500 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black">
                  <GraduationCap className="h-5 w-5 text-blue-400 group-hover:text-amber-300 transition-colors duration-300" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg tracking-tight text-white group-hover:text-blue-300 transition-colors duration-300">
                    CAPACITY<span className="text-blue-500">CONNECT</span>
                  </span>
                  <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-black text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                    GOVTECH
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                  Digital Capacity Building Portal
                </p>
              </div>
            </Link>

            {/* Navigation Links based on role */}
            <nav className="hidden md:flex items-center gap-1">
              {userRole === 'TRAINEE' && (
                <>
                  <Link href="/trainee" className={navLinkClass('/trainee', true)}>My Learning</Link>
                  <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>Course Catalog</Link>
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
                  <Link href="/admin" className={navLinkClass('/admin', true)}>Executive KPI</Link>
                  <Link href="/admin/users" className={navLinkClass('/admin/users', true)}>User Governance & RBAC</Link>
                  <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>Competency Matcher</Link>
                </>
              )}
            </nav>
          </div>

          {/* Action Controls & Profile Switcher */}
          <div className="flex items-center gap-3">
            
            {/* Live System Operational Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span>Database Live</span>
            </div>

            {/* Notification Bell */}
            {currentUser && (
              <button className="relative rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-300" title="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-slate-950 animate-pulse" />
              </button>
            )}

            {/* Demo Quick Role Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/40 px-3.5 py-1.5 text-xs font-bold text-indigo-200 hover:border-indigo-400 transition-all duration-300 shadow-md shadow-indigo-950/40 hover:scale-105 hover:shadow-glow-sm btn-shimmer"
                title="Switch role persona in 1-click"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Role Switcher</span>
                <ChevronDown className={`h-3 w-3 text-indigo-300 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isRoleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/15 bg-[#09090f]/95 backdrop-blur-2xl p-2.5 shadow-2xl shadow-black/90 z-[100]"
                  >
                    <div className="flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/10">
                      <span>Switch Active Persona</span>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">● Instant RBAC</span>
                    </div>
                    <div className="space-y-1.5 mt-2">
                      {roleEntries.map((entry) => {
                        const RoleIcon = entry.icon;
                        return (
                          <motion.button
                            key={entry.role}
                            whileHover={{ x: 4, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDemoSwitch(entry.role)}
                            className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 bg-white/[0.03] border border-white/10 ${entry.colorClass} hover:border-white/20 hover:text-white transition-all group text-left`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`h-9 w-9 rounded-xl ${entry.iconBg} border flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0`}>
                                <RoleIcon className="h-4.5 w-4.5" />
                              </div>
                              <div className="min-w-0">
                                <div className={`font-bold text-white text-xs ${entry.hoverText}`}>{entry.label}</div>
                                <div className={`text-[11px] truncate ${entry.role === 'TRAINER_PENDING' ? 'text-amber-400/90 font-medium' : 'text-slate-400'}`}>
                                  {entry.sub}
                                </div>
                              </div>
                            </div>
                            {entry.check && <CheckCircle2 className={`h-4 w-4 shrink-0 ml-2 ${entry.checkColor}`} />}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile / Auth State */}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser.profile?.fullName || currentUser.fullName}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 flex items-center justify-end gap-1">
                    <span
                      className={`inline-block h-1.5 w-1.5 rounded-full ${
                        currentUser.status === 'APPROVED' ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                    />
                    {currentUser.role}
                  </span>
                </div>

                {/* Avatar with animated gradient ring */}
                <div className="relative group/avatar">
                  <div className="absolute -inset-[3px] rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500 animate-gradient-shift blur-[1px]" />
                  <img
                    src={
                      currentUser.profile?.avatarUrl ||
                      currentUser.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
                    }
                    alt="Profile Avatar"
                    className="relative h-9 w-9 rounded-full object-cover border-2 border-slate-800 shadow-md z-10"
                  />
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="rounded-xl p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-300"
                  title="Log Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/auth/login"
                  className="rounded-full px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-bridgemind-blue rounded-full px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/60 bg-slate-950/98 backdrop-blur-2xl p-4 space-y-2 animate-slide-down">
            {userRole === 'TRAINEE' && (
              <>
                <Link href="/trainee" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>My Learning</Link>
                <Link href="/trainee/courses" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Course Catalog</Link>
                <Link href="/trainee/profile" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Competency Profile</Link>
              </>
            )}
            {userRole === 'TRAINER' && (
              <>
                <Link href="/trainer" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Faculty Hub</Link>
                <Link href="/trainer/library" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Media Library</Link>
                <Link href="/trainer/analytics" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Cohort Analytics</Link>
              </>
            )}
            {userRole === 'ADMIN' && (
              <>
                <Link href="/admin" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Executive KPI</Link>
                <Link href="/admin/users" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>User Governance</Link>
                <Link href="/admin/competency" className="block px-3 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:bg-slate-800/60 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Competency Matcher</Link>
              </>
            )}
          </div>
        )}
      </motion.header>
    </>
  );
}
