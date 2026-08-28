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
  Layers,
  Brain,
  Rocket,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useVisualTheme } from '@/context/ThemeContext';
import { useCourseChat } from '@/context/ChatContext';

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
    return `px-3.5 py-1.5 rounded-full text-xs font-semibold font-mono transition-all duration-200 ${
      isActive
        ? 'bg-[#e0234e] text-white shadow-md shadow-[#e0234e]/30'
        : 'text-slate-300 hover:text-white hover:bg-white/10'
    }`;
  };

  const roleEntries = [
    {
      role: 'ADMIN',
      label: 'Director General (DG IMD)',
      sub: 'Dr. Mrutyunjay Mohapatra (MoES)',
      icon: ShieldCheck,
      colorClass: 'hover:bg-[#e0234e]/20',
      iconBg: 'bg-[#e0234e]/10 border-[#e0234e]/30 text-[#ff4d6d]',
      hoverText: 'group-hover:text-[#ff758c]',
      check: userRole === 'ADMIN',
      checkColor: 'text-[#ff4d6d]',
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
      colorClass: 'hover:bg-[#e0234e]/20',
      iconBg: 'bg-[#e0234e]/10 border-[#e0234e]/30 text-[#ff4d6d]',
      hoverText: 'group-hover:text-[#ff758c]',
      check: userRole === 'TRAINEE' && currentUser?.status === 'APPROVED',
      checkColor: 'text-[#ff4d6d]',
    },
  ];

  return (
    <>
      {/* Scroll Progress Indicator Bar */}
      <motion.div
        className="scroll-progress-bar fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#e0234e] via-[#ff758c] to-[#ff2d55] z-[100]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Main Header Container with NestJS Floating Pill Styling */}
      <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-3 sm:px-6 lg:px-8 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`pointer-events-auto mx-auto max-w-7xl flex items-center justify-between p-2.5 sm:p-3 rounded-full sm:rounded-[32px] border transition-all duration-300 ${
            isScrolled
              ? 'border-white/15 bg-black/85 backdrop-blur-2xl shadow-2xl shadow-black/80'
              : 'border-white/10 bg-[#0d0407]/80 backdrop-blur-xl shadow-xl shadow-black/50'
          }`}
        >
          {/* Left: Brand Identity & Logo with Ruby Glow */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 pl-2 group">
              <div className="h-9 w-9 rounded-xl bg-[#e0234e] flex items-center justify-center text-white shadow-lg shadow-[#e0234e]/50 group-hover:scale-110 transition-transform duration-300">
                <Satellite className="h-5 w-5" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white group-hover:text-[#ff758c] transition-colors">
                  Capacity<span className="text-[#e0234e]">Connect</span>
                </span>
                <span className="hidden sm:inline-block rounded-full px-2 py-0.5 text-[9px] font-mono font-bold bg-[#e0234e]/20 text-[#ff758c] border border-[#e0234e]/40">
                  v3.4 NESTJS
                </span>
              </div>
            </Link>

            {/* Public / Landing Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs">
              <Link href="/admin/competency" className={navLinkClass('/admin/competency', true)}>
                Competency Matcher
              </Link>
              <Link href="/trainee/courses" className={navLinkClass('/trainee/courses')}>
                Courses
              </Link>
              <Link href="/#architecture" className={navLinkClass('/#architecture', true)}>
                Architecture
              </Link>
              <Link href="/#ecosystem" className={navLinkClass('/#ecosystem', true)}>
                Tools & Ecosystem
              </Link>
              <Link href="/#pathways" className={navLinkClass('/#pathways', true)}>
                Cadres
              </Link>

              {/* Logged in role shortcuts */}
              {userRole === 'ADMIN' && (
                <Link href="/admin" className={navLinkClass('/admin', true)}>
                  Admin Portal
                </Link>
              )}
              {userRole === 'TRAINER' && (
                <Link href="/trainer" className={navLinkClass('/trainer', true)}>
                  Faculty Hub
                </Link>
              )}
              {userRole === 'TRAINEE' && (
                <Link href="/trainee" className={navLinkClass('/trainee', true)}>
                  My Cadre
                </Link>
              )}
            </nav>
          </div>

          {/* Right Tools: AI Navigator + Persona Switcher + Launch Portal CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* AI Course Navigator Trigger */}
            <button
              type="button"
              onClick={() => openChat()}
              className="relative group hidden sm:flex items-center gap-2 h-9 rounded-full border border-[#e0234e]/35 bg-[#e0234e]/10 px-3.5 text-xs font-bold text-[#ff6b8b] shadow-sm hover:border-[#e0234e] hover:bg-[#e0234e]/20 hover:text-white transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <Bot className="h-3.5 w-3.5 text-[#ff4d6d] group-hover:text-white transition-colors" />
              <span>AI Navigator</span>
              <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            </button>

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                disabled={loadingRole}
                className="flex items-center gap-1.5 sm:gap-2 h-9 rounded-full border border-white/15 bg-black/60 px-3.5 text-xs font-medium text-white shadow-sm hover:border-[#e0234e]/50 hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              >
                <div className="h-2 w-2 rounded-full bg-[#e0234e] animate-pulse" />
                <span className="hidden sm:inline text-slate-400">Persona:</span>
                <span className="text-[#ff4d6d] font-bold tracking-tight">{userRole}</span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-300 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} />
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
                    <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
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
                        className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors pt-2 border-t border-slate-800/80 font-mono"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Launch / Action CTA Button */}
            <Link
              href={userRole === 'ADMIN' ? '/admin' : userRole === 'TRAINER' ? '/trainer' : userRole === 'TRAINEE' ? '/trainee' : '/admin/competency'}
              className="group relative inline-flex items-center justify-center gap-2 h-9 px-4 sm:px-5 rounded-full bg-gradient-to-r from-[#e0234e] via-[#ea2845] to-[#ff4d6d] text-xs font-bold text-white shadow-lg shadow-[#e0234e]/35 hover:shadow-xl hover:shadow-[#e0234e]/55 border border-white/20 transition-all duration-300 hover:scale-105 hover:brightness-110 active:scale-95 whitespace-nowrap overflow-hidden"
            >
              <span className="relative z-10 tracking-tight">Launch Portal</span>
              <ArrowRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent ease-in-out" />
            </Link>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
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
              className="pointer-events-auto lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl p-4 space-y-2 font-mono text-xs shadow-2xl"
            >
              <Link href="/admin/competency" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-200 hover:text-white">Competency Matcher</Link>
              <Link href="/trainee/courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-200 hover:text-white">Mission Mausam Courses</Link>
              <Link href="/#architecture" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-200 hover:text-white">Architecture Pillars</Link>
              <Link href="/#ecosystem" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-200 hover:text-white">Tools & Ecosystem</Link>
              <Link href="/#pathways" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-slate-200 hover:text-white">Cadre Pathways</Link>

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openChat();
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#e0234e]/10 border border-[#e0234e]/30 text-xs font-bold text-[#ff758c]"
              >
                <span className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#ff4d6d]" />
                  Ask AI Course Navigator
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
