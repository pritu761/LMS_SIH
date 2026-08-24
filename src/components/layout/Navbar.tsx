'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(false);

  useEffect(() => {
    fetchSession();
  }, [pathname]);

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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-2xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand & Portal Identity */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950/90">
                <GraduationCap className="h-5 w-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-indigo-300 transition-colors">
                  CAPACITY<span className="text-indigo-400">CONNECT</span>
                </span>
                <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-black text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
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
                <Link
                  href="/trainee"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/trainee'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  My Learning
                </Link>
                <Link
                  href="/trainee/courses"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname.startsWith('/trainee/courses')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Course Catalog
                </Link>
                <Link
                  href="/trainee/profile"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/trainee/profile'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Competency Profile
                </Link>
              </>
            )}

            {userRole === 'TRAINER' && (
              <>
                <Link
                  href="/trainer"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/trainer'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Faculty Hub
                </Link>
                <Link
                  href="/trainer/library"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/trainer/library'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Media Library
                </Link>
                <Link
                  href="/trainer/analytics"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/trainer/analytics'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Cohort Analytics
                </Link>
              </>
            )}

            {userRole === 'ADMIN' && (
              <>
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Executive KPI
                </Link>
                <Link
                  href="/admin/users"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/users'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  User Governance & RBAC
                </Link>
                <Link
                  href="/admin/competency"
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/admin/competency'
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  Competency Matcher
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Action Controls & Profile Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Live System Operational Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Database Live</span>
          </div>

          {/* Demo Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-950/80 to-slate-900 border border-indigo-500/40 px-3.5 py-1.5 text-xs font-bold text-indigo-200 hover:border-indigo-400 transition-all shadow-md shadow-indigo-950/40 hover:scale-105"
              title="Switch role persona in 1-click"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400 animate-bounce" style={{ animationDuration: '2s' }} />
              <span>Role Switcher</span>
              <ChevronDown className="h-3 w-3 text-indigo-300" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Switch Active Persona
                </div>
                <div className="space-y-1 mt-1">
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-emerald-600/20 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white group-hover:text-emerald-300">System Admin</div>
                        <div className="text-[10px] text-slate-400">Dr. Rajeshwari Sharma</div>
                      </div>
                    </div>
                    {userRole === 'ADMIN' && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('TRAINER')}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-indigo-600/20 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white group-hover:text-indigo-300">Approved Trainer</div>
                        <div className="text-[10px] text-slate-400">Prof. Vikramaditya Sen</div>
                      </div>
                    </div>
                    {userRole === 'TRAINER' && currentUser?.status === 'APPROVED' && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('TRAINEE')}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-cyan-600/20 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Award className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white group-hover:text-cyan-300">Approved Trainee</div>
                        <div className="text-[10px] text-slate-400">Aarav Patel</div>
                      </div>
                    </div>
                    {userRole === 'TRAINEE' && currentUser?.status === 'APPROVED' && (
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDemoSwitch('TRAINER_PENDING')}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-slate-200 hover:bg-amber-600/20 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-white group-hover:text-amber-300">Pending Candidate</div>
                        <div className="text-[10px] text-amber-400/80">Karthik Raman (Pending Verification)</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
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

              {/* Avatar with glowing ring */}
              <div className="relative">
                <img
                  src={
                    currentUser.profile?.avatarUrl ||
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'
                  }
                  alt="Profile Avatar"
                  className="h-9 w-9 rounded-full object-cover border-2 border-indigo-500/50 shadow-md shadow-indigo-500/20"
                />
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="rounded-xl p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-1.5 text-xs font-bold text-white hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/30 transition-all hover:scale-105"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
