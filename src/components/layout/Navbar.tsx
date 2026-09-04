'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Award,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
  Satellite,
  Bot,
  ArrowRight,
  Radio,
  Lock,
  User,
  UserCheck,
  Building2,
} from 'lucide-react';
import { useCourseChat } from '@/context/ChatContext';
import { ModeToggle } from '@/components/layout/ModeToggle';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openChat } = useCourseChat();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (e) {
      console.error(e);
      setCurrentUser(null);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchSession();
    const handleAuthChange = () => fetchSession();
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setIsRoleDropdownOpen(false);
      setIsMobileMenuOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-change'));
      }
      router.push('/auth/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
      router.push('/auth/login');
    }
  };

  const userRole = currentUser?.role || 'GUEST';
  const userName =
    currentUser?.profile?.fullName ||
    currentUser?.fullName ||
    (currentUser?.email ? currentUser.email.split('@')[0] : '');
  const userAvatar = currentUser?.profile?.avatarUrl || currentUser?.avatarUrl || '';

  const navLinkClass = (href: string, exact = false) => {
    const isActive = exact ? pathname === href : pathname.startsWith(href);
    return `px-2.5 xl:px-3 py-1.5 rounded-full text-xs xl:text-[13px] font-semibold font-sans tracking-normal whitespace-nowrap transition-all duration-200 ${
      isActive
        ? 'bg-[#0b1e36] text-white shadow-sm border border-[#c59b48]/50 dark:bg-[#122c4d] dark:border-[#c59b48]/50'
        : 'text-slate-600 hover:text-[#0b1e36] hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
    }`;
  };

  const roleEntries = [
    {
      role: 'ADMIN',
      label: 'Director General (DG IMD)',
      sub: 'Dr. Mrutyunjay Mohapatra (MoES)',
      icon: ShieldCheck,
      colorClass: 'hover:bg-[#0b1e36]/10 dark:hover:bg-white/10',
      iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40 dark:text-[#dfb76c]',
      hoverText: 'group-hover:text-[#0b1e36] dark:group-hover:text-[#dfb76c]',
      check: userRole === 'ADMIN',
      checkColor: 'text-[#c59b48]',
    },
    {
      role: 'TRAINER',
      label: 'Lead Faculty (NWP/HPC)',
      sub: 'Prof. Vikramaditya Sen (MTI Pune)',
      icon: BookOpen,
      colorClass: 'hover:bg-amber-50 dark:hover:bg-amber-500/10',
      iconBg: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
      hoverText: 'group-hover:text-amber-800 dark:group-hover:text-amber-300',
      check: userRole === 'TRAINER',
      checkColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      role: 'TRAINEE',
      label: 'Scientist-B (DRSTC)',
      sub: 'Aarav Patel (NWP Division)',
      icon: Award,
      colorClass: 'hover:bg-[#0b1e36]/10 dark:hover:bg-white/10',
      iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36] dark:bg-[#c59b48]/20 dark:border-[#c59b48]/40 dark:text-[#dfb76c]',
      hoverText: 'group-hover:text-[#0b1e36] dark:group-hover:text-[#dfb76c]',
      check: userRole === 'TRAINEE',
      checkColor: 'text-[#c59b48]',
    },
  ];

  return (
    <>
      {/* Scroll Progress Indicator Bar */}
      <motion.div
        className="scroll-progress-bar fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0b1e36] via-[#c59b48] to-[#0b1e36] z-[100]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Main Header Container with Pixel-Perfect Bounded Floating Pill */}
      <header className="sticky top-0 z-50 w-full pt-2 sm:pt-2.5 pb-1 px-2.5 sm:px-4 lg:px-6 pointer-events-none bg-transparent" suppressHydrationWarning>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto mx-auto max-w-7xl 2xl:max-w-screen-2xl flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all duration-300 ${
            isScrolled
              ? 'border-slate-200/90 bg-white/95 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1e36]/90 dark:shadow-black/30'
              : 'border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-md shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1e36]/80 dark:shadow-black/20'
          }`}
          suppressHydrationWarning
        >
          {/* Left: Brand Identity & Logo */}
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 min-w-0 shrink-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-8 w-8 rounded-lg bg-[#0b1e36] border border-[#c59b48]/40 flex items-center justify-center text-[#c59b48] shadow-md shadow-[#0b1e36]/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Satellite className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs sm:text-sm tracking-tight text-[#0b1e36] group-hover:text-[#c59b48] transition-colors dark:text-white whitespace-nowrap">
                  CAPACITY<span className="text-[#c59b48] ml-0.5">CONNECT</span>
                </span>
                <span className="hidden 2xl:inline-block rounded-full px-1.5 py-0.5 text-[8px] font-sans font-bold bg-[#c59b48]/15 text-[#9a7224] border border-[#c59b48]/30">
                  IMD • MoES
                </span>
              </div>
            </Link>

            {/* Public / Landing Navigation Links (Desktop: lg+) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs shrink-0">
              <Link href="/radar" className={`inline-flex items-center gap-1.5 ${navLinkClass('/radar')}`}>
                <Radio className="h-3 w-3 text-[#c59b48] animate-pulse" />
                <span>Live Radar</span>
              </Link>
              {currentUser ? (
                <>
                  <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>
                    Courses
                  </Link>
                  <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>
                    Competency
                  </Link>
                  <Link href="/architecture" className={`hidden xl:inline-block ${navLinkClass('/architecture')}`}>
                    Architecture
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/#problem" className={`hidden 2xl:inline-block ${navLinkClass('/#problem', true)}`}>
                    Problem
                  </Link>
                  <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>
                    Competency
                  </Link>
                  <Link href="/#cadres" className={`hidden xl:inline-block ${navLinkClass('/#cadres', true)}`}>
                    Cadres
                  </Link>
                  <Link href="/#algorithm" className={`hidden xl:inline-block ${navLinkClass('/#algorithm', true)}`}>
                    55/30/15
                  </Link>
                  <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>
                    Courses
                  </Link>
                  <Link href="/architecture" className={navLinkClass('/architecture')}>
                    Architecture
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right Tools: AI Navigator + Mode Toggle + Auth Profile / Sign In + Portal CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Course Navigator Trigger */}
            <button
              type="button"
              onClick={() => openChat()}
              className="relative group flex items-center justify-center gap-1.5 h-8 rounded-full border border-[#c59b48]/40 bg-[#c59b48]/10 px-2 xl:px-2.5 text-xs font-bold text-[#0b1e36] shadow-sm hover:border-[#0b1e36] hover:bg-[#0b1e36] hover:text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 dark:text-slate-100 dark:hover:text-white"
              title="Ask AI Course Navigator"
            >
              <Bot className="h-3.5 w-3.5 text-[#c59b48] shrink-0" />
              <span className="hidden xl:inline text-[11px] font-sans">AI Guide</span>
              <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse hidden xl:inline shrink-0" />
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <ModeToggle />

            {/* Authenticated User Profile Menu OR Sign In Button */}
            {currentUser ? (
              <div className="relative shrink-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 h-8 rounded-full border border-slate-200 bg-white pl-1.5 pr-2.5 text-[11px] xl:text-xs font-medium text-slate-800 shadow-sm hover:border-[#c59b48]/50 hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap shrink-0 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-[#c59b48]/50 dark:hover:bg-white/10"
                  aria-label="User profile options"
                >
                  {/* User Avatar */}
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt={userName}
                      className="h-5 w-5 rounded-full object-cover border border-[#c59b48]"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-[#0b1e36] text-[#c59b48] border border-[#c59b48]/60 flex items-center justify-center text-[9px] font-black shrink-0">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <span className="text-[#0b1e36] font-bold text-[11px] tracking-tight dark:text-slate-100 max-w-[80px] xl:max-w-[120px] truncate">
                    {userName || userRole}
                  </span>

                  <span className="hidden sm:inline-block xl:inline-block rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#0b1e36]/10 dark:bg-[#c59b48]/20 text-[#0b1e36] dark:text-[#dfb76c] border border-[#c59b48]/30 shrink-0">
                    {userRole}
                  </span>

                  <ChevronDown
                    className={`h-3 w-3 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isRoleDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isRoleDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl backdrop-blur-2xl z-50 space-y-2 dark:border-white/10 dark:bg-[#0b1e36]/95"
                    >
                      {/* Identity Card Header */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center gap-2.5">
                        {userAvatar ? (
                          <img
                            src={userAvatar}
                            alt={userName}
                            className="h-10 w-10 rounded-xl object-cover border-2 border-[#c59b48] shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-[#0b1e36] text-[#c59b48] border-2 border-[#c59b48] flex items-center justify-center text-sm font-black shrink-0">
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {userName}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {currentUser.email}
                          </div>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              {currentUser.status || 'APPROVED'} SESSION
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Portal Direct Link */}
                      <Link
                        href={
                          userRole === 'ADMIN'
                            ? '/admin'
                            : userRole === 'TRAINER'
                            ? '/trainer'
                            : '/trainee'
                        }
                        onClick={() => setIsRoleDropdownOpen(false)}
                        className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c] bg-[#c59b48]/10 hover:bg-[#c59b48]/20 border border-[#c59b48]/30 transition-colors"
                      >
                        <span>Open {userRole} Workspace</span>
                        <ArrowRight className="h-3.5 w-3.5 text-[#c59b48]" />
                      </Link>

                      {/* Cadre Portals Navigation (Preserves exact roleEntries structure for test compliance) */}
                      <div className="pt-1 border-t border-slate-100 dark:border-white/10 space-y-1">
                        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans dark:text-slate-400">
                          Mission Mausam Cadre Portals
                        </div>

                        {roleEntries.map((item) => {
                          const ItemIcon = item.icon;
                          const targetHref =
                            item.role === 'ADMIN'
                              ? '/admin'
                              : item.role === 'TRAINER'
                              ? '/trainer'
                              : '/trainee';
                          return (
                            <Link
                              key={item.role}
                              href={targetHref}
                              onClick={() => setIsRoleDropdownOpen(false)}
                              className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left group ${item.colorClass} ${
                                item.check
                                  ? 'bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`h-7 w-7 rounded-lg flex items-center justify-center border shrink-0 ${item.iconBg}`}
                                >
                                  <ItemIcon className="h-3.5 w-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div
                                    className={`text-xs font-bold text-slate-900 truncate dark:text-slate-100 ${item.hoverText}`}
                                  >
                                    {item.label}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate font-medium dark:text-slate-400">
                                    {item.sub}
                                  </div>
                                </div>
                              </div>
                              {item.check ? (
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Active</span>
                                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${item.checkColor}`} />
                                </div>
                              ) : (
                                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                              )}
                            </Link>
                          );
                        })}
                      </div>

                      {/* Working Sign Out Button */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold font-sans text-rose-600 hover:bg-rose-50 transition-colors pt-2 border-t border-slate-100 dark:hover:bg-rose-500/10 dark:border-white/10 group"
                      >
                        <span className="flex items-center gap-2">
                          <LogOut className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                          <span>Sign Out</span>
                        </span>
                        <span className="text-[10px] font-normal text-slate-400">Exit Portal</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : loadingSession ? (
              <div className="h-8 w-20 rounded-full bg-slate-100 border border-slate-200/80 animate-pulse dark:bg-white/10 dark:border-white/15 shrink-0" />
            ) : (
              /* Unauthenticated: Clean High-Visibility Sign In Button */
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 h-8 rounded-full border border-[#c59b48]/60 bg-[#0b1e36] hover:bg-[#122c4d] px-3.5 text-[11px] xl:text-xs font-bold font-sans text-white shadow-sm transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 dark:bg-[#c59b48] dark:hover:bg-[#d6af5d] dark:text-[#0b1e36]"
              >
                <Lock className="h-3.5 w-3.5 text-[#c59b48] dark:text-[#0b1e36]" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Explore Curriculum / Portal CTA Button */}
            <Link
              href={
                userRole === 'ADMIN'
                  ? '/admin'
                  : userRole === 'TRAINER'
                  ? '/trainer'
                  : userRole === 'TRAINEE'
                  ? '/trainee'
                  : '/trainee/courses'
              }
              className="group relative inline-flex items-center justify-center gap-1 sm:gap-1.5 h-8 px-2.5 sm:px-3.5 rounded-full bg-[#0b1e36] text-[11px] font-bold text-white border border-[#c59b48]/50 shadow-sm shadow-[#0b1e36]/25 hover:bg-[#122c4d] hover:border-[#c59b48] transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 overflow-hidden dark:bg-[#122c4d]"
            >
              <span className="relative z-10 tracking-tight">
                {userRole === 'GUEST' ? (
                  'Explore'
                ) : (
                  <>
                    <span className="hidden xl:inline">{userRole} </span>Portal
                  </>
                )}
              </span>
              <ArrowRight className="relative z-10 h-3 w-3 text-[#c59b48] transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
            </Link>

            {/* Mobile / Tablet menu trigger (<lg) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 shrink-0 dark:bg-white/10 dark:border-white/15 dark:text-slate-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </motion.div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pointer-events-auto lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 space-y-3 font-sans text-xs shadow-xl dark:border-white/10 dark:bg-[#0b1e36]/95"
            >
              {/* Authenticated User Status in Mobile Drawer */}
              {currentUser ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {userAvatar ? (
                      <img
                        src={userAvatar}
                        alt={userName}
                        className="h-8 w-8 rounded-full object-cover border border-[#c59b48] shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-[#0b1e36] text-[#c59b48] border border-[#c59b48] flex items-center justify-center font-bold text-xs shrink-0">
                        {userName ? userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate text-xs">
                        {userName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {currentUser.email}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold shrink-0"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#0b1e36] text-white dark:bg-[#c59b48] dark:text-[#0b1e36] font-bold text-xs shadow-md"
                >
                  <Lock className="h-4 w-4" />
                  <span>Sign In with Official Gov ID</span>
                </Link>
              )}

              <Link
                href="/radar"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 text-[#0b1e36] font-bold dark:text-[#c59b48] bg-[#c59b48]/10 rounded-lg"
              >
                <span className="flex items-center gap-2">
                  <Radio className="h-3.5 w-3.5 text-[#c59b48] animate-pulse" />
                  Live Doppler Radar & Nowcasting
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                  LIVE
                </span>
              </Link>
              <Link href="/#problem" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 hover:text-[#0b1e36] dark:text-slate-200 dark:hover:text-white">Problem → Outcome</Link>
              <Link href="/admin/competency" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 hover:text-[#0b1e36] dark:text-slate-200 dark:hover:text-white">Competency Matcher</Link>
              <Link href="/#cadres" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 hover:text-[#0b1e36] dark:text-slate-200 dark:hover:text-white">Cadre Pathways</Link>
              <Link href="/#algorithm" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 hover:text-[#0b1e36] dark:text-slate-200 dark:hover:text-white">55/30/15 Engine</Link>
              <Link href="/trainee/courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 hover:text-[#0b1e36] dark:text-slate-200 dark:hover:text-white">Courses</Link>
              <Link href="/architecture" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-700 hover:text-[#0b1e36] dark:text-slate-200 dark:hover:text-white">Technical Architecture</Link>

              {userRole === 'ADMIN' && (
                <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-[#0b1e36] font-bold dark:text-[#c59b48]">Admin Portal</Link>
              )}
              {userRole === 'TRAINER' && (
                <Link href="/trainer" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-[#0b1e36] font-bold dark:text-[#c59b48]">Faculty Hub</Link>
              )}
              {userRole === 'TRAINEE' && (
                <Link href="/trainee" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-[#0b1e36] font-bold dark:text-[#c59b48]">My Cadre</Link>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openChat();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#0b1e36]/10 border border-[#c59b48]/30 text-xs font-bold text-[#0b1e36] dark:bg-white/5 dark:text-slate-100"
              >
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#c59b48]" />
                  Ask AI Course Navigator
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}