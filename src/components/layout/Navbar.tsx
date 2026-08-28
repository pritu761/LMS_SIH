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
} from 'lucide-react';
import { useCourseChat } from '@/context/ChatContext';
import { ModeToggle } from '@/components/layout/ModeToggle';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openChat } = useCourseChat();
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
    return `px-2.5 xl:px-3 py-1 rounded-full text-[11px] xl:text-xs font-semibold font-mono whitespace-nowrap transition-all duration-200 ${
      isActive
        ? 'bg-[#0b1e36] text-white shadow-sm border border-[#c59b48]/40 dark:bg-[#122c4d]'
        : 'text-slate-600 hover:text-[#0b1e36] hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10'
    }`;
  };

  const roleEntries = [
    {
      role: 'ADMIN',
      label: 'Director General (DG IMD)',
      sub: 'Dr. Mrutyunjay Mohapatra (MoES)',
      icon: ShieldCheck,
      colorClass: 'hover:bg-[#0b1e36]/10',
      iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36]',
      hoverText: 'group-hover:text-[#0b1e36]',
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
      check: userRole === 'TRAINER' && currentUser?.status === 'APPROVED',
      checkColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      role: 'TRAINEE',
      label: 'Scientist-B (DRSTC)',
      sub: 'Aarav Patel (NWP Division)',
      icon: Award,
      colorClass: 'hover:bg-[#0b1e36]/10',
      iconBg: 'bg-[#0b1e36]/10 border-[#c59b48]/30 text-[#0b1e36]',
      hoverText: 'group-hover:text-[#0b1e36]',
      check: userRole === 'TRAINEE' && currentUser?.status === 'APPROVED',
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
      <header className="sticky top-0 z-50 w-full pt-2.5 pb-1 px-3 sm:px-4 lg:px-6 pointer-events-none" suppressHydrationWarning>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto mx-auto max-w-7xl flex items-center justify-between gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all duration-300 ${
            isScrolled
              ? 'border-slate-200 bg-white/95 backdrop-blur-2xl shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1e36]/90 dark:shadow-black/30'
              : 'border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-md shadow-slate-900/5 dark:border-white/10 dark:bg-[#0b1e36]/80 dark:shadow-black/20'
          }`}
          suppressHydrationWarning
        >
          {/* Left: Brand Identity & Logo */}
          <div className="flex items-center gap-3 xl:gap-5 shrink-0">
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <div className="h-8 w-8 rounded-lg bg-[#0b1e36] border border-[#c59b48]/40 flex items-center justify-center text-[#c59b48] shadow-md shadow-[#0b1e36]/25 group-hover:scale-105 transition-transform duration-300 shrink-0">
                <Satellite className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-[#0b1e36] group-hover:text-[#c59b48] transition-colors dark:text-white whitespace-nowrap">
                  CAPACITY<span className="text-[#c59b48] ml-0.5">CONNECT</span>
                </span>
                <span className="hidden xl:inline-block rounded-full px-1.5 py-0.5 text-[8px] font-mono font-bold bg-[#c59b48]/15 text-[#9a7224] border border-[#c59b48]/30">
                  IMD • MoES
                </span>
              </div>
            </Link>

            {/* Public / Landing Navigation Links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs">
              <Link href="/#problem" className={`hidden 2xl:inline-block ${navLinkClass('/#problem', true)}`}>
                Problem
              </Link>
              <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>
                Competency
              </Link>
              <Link href="/#cadres" className={navLinkClass('/#cadres', true)}>
                Cadres
              </Link>
              <Link href="/#algorithm" className={navLinkClass('/#algorithm', true)}>
                55/30/15
              </Link>
              <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>
                Courses
              </Link>
              <Link href="/architecture" className={navLinkClass('/architecture')}>
                Architecture
              </Link>

              {/* Logged in role shortcuts */}
              {userRole === 'ADMIN' && (
                <Link href="/admin" className={navLinkClass('/admin', true)}>
                  Admin
                </Link>
              )}
              {userRole === 'TRAINER' && (
                <Link href="/trainer" className={navLinkClass('/trainer', true)}>
                  Faculty
                </Link>
              )}
              {userRole === 'TRAINEE' && (
                <Link href="/trainee" className={navLinkClass('/trainee', true)}>
                  My Cadre
                </Link>
              )}
            </nav>
          </div>

          {/* Right Tools: AI Navigator + Mode Toggle + Persona Switcher + Launch Portal CTA */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Course Navigator Trigger */}
            <button
              type="button"
              onClick={() => openChat()}
              className="relative group flex items-center gap-1.5 h-8 rounded-full border border-[#c59b48]/40 bg-[#c59b48]/10 px-2.5 text-xs font-bold text-[#0b1e36] shadow-sm hover:border-[#0b1e36] hover:bg-[#0b1e36] hover:text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap shrink-0 dark:text-slate-100 dark:hover:text-white"
              title="Ask AI Course Navigator"
            >
              <Bot className="h-3.5 w-3.5 text-[#c59b48]" />
              <span className="hidden sm:inline text-[11px]">AI Guide</span>
              <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse hidden sm:inline" />
            </button>

            {/* Dark / Light Mode Toggle Button */}
            <ModeToggle />

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                disabled={loadingRole}
                className="flex items-center gap-1.5 h-8 rounded-full border border-slate-200 bg-white px-2.5 sm:px-3 text-xs font-medium text-slate-800 shadow-sm hover:border-[#c59b48]/50 hover:bg-slate-50 transition-all active:scale-95 whitespace-nowrap shrink-0 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:hover:border-[#c59b48]/50 dark:hover:bg-white/10"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-[#0b1e36] font-bold text-[11px] tracking-tight dark:text-slate-100">{userRole}</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-300 shrink-0 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isRoleDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl backdrop-blur-2xl z-50 space-y-1 dark:border-white/10 dark:bg-[#0b1e36]/95"
                  >
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 font-mono dark:text-slate-400 dark:border-white/10">
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
                            item.check ? 'bg-slate-50 border border-slate-200 dark:bg-white/5 dark:border-white/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border shrink-0 ${item.iconBg}`}>
                              <ItemIcon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className={`text-xs font-bold text-slate-900 truncate dark:text-slate-100 ${item.hoverText}`}>
                                {item.label}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate font-medium dark:text-slate-400">
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
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors pt-2 border-t border-slate-100 font-mono dark:hover:bg-rose-500/10 dark:border-white/10"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Explore Curriculum CTA Button */}
            <Link
              href={userRole === 'ADMIN' ? '/admin' : userRole === 'TRAINER' ? '/trainer' : userRole === 'TRAINEE' ? '/trainee' : '/trainee/courses'}
              className="group relative inline-flex items-center justify-center gap-1.5 h-8 px-3.5 sm:px-4 rounded-full bg-[#0b1e36] text-[11px] xl:text-xs font-bold text-white border border-[#c59b48]/50 shadow-sm shadow-[#0b1e36]/25 hover:bg-[#122c4d] hover:border-[#c59b48] transition-all duration-200 active:scale-95 whitespace-nowrap shrink-0 overflow-hidden dark:bg-[#122c4d]"
            >
              <span className="relative z-10 tracking-tight">
                {userRole === 'GUEST' ? 'Explore Curriculum' : `${userRole} Portal`}
              </span>
              <ArrowRight className="relative z-10 h-3 w-3 text-[#c59b48] transition-transform duration-300 group-hover:translate-x-0.5 shrink-0" />
            </Link>

            {/* Mobile menu trigger */}
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
              className="pointer-events-auto lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 space-y-2 font-mono text-xs shadow-xl dark:border-white/10 dark:bg-[#0b1e36]/95"
            >
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