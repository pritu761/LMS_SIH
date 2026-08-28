'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Award,
  BookOpen,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  Fingerprint,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          const user = data.user;
          if (user.status !== 'APPROVED' && user.role !== 'ADMIN') {
            router.push('/auth/pending');
          } else if (user.role === 'ADMIN') router.push('/admin');
          else if (user.role === 'TRAINER') router.push('/trainer');
          else router.push('/trainee');
        }
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: string) => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TRAINER') router.push('/trainer');
        else if (role.includes('PENDING')) router.push('/auth/pending');
        else router.push('/trainee');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50/50">

      {/* Subtle Ambient Orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#c59b48]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#0b1e36]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">

        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0b1e36] border-2 border-[#c59b48] text-[#c59b48] shadow-xl shadow-[#0b1e36]/20">
            <Fingerprint className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b1e36] tracking-tight">
              Sign In to <span className="text-[#c59b48]">CapacityConnect</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              India Meteorological Department (IMD) • Ministry of Earth Sciences
            </p>
          </div>
        </div>

        {/* 1-Click Demo Persona Box */}
        <div className="rounded-2xl border border-[#c59b48]/40 bg-white p-4 space-y-3 shadow-md">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#0b1e36] flex items-center gap-1.5 font-mono">
            <Zap className="h-3.5 w-3.5 text-[#c59b48]" />
            <span>Instant Evaluator Demo Login</span>
            <span className="ml-auto text-[10px] text-emerald-700 font-mono flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('TRAINEE')}
              className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#0b1e36]/5 hover:border-[#c59b48] py-3 text-[11px] font-bold text-[#0b1e36] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <Award className="h-4 w-4 mx-auto mb-1 text-[#c59b48]" />
              Trainee
            </button>
            <button
              onClick={() => handleQuickDemo('TRAINER')}
              className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 py-3 text-[11px] font-bold text-[#0b1e36] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <BookOpen className="h-4 w-4 mx-auto mb-1 text-amber-700" />
              Trainer
            </button>
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 py-3 text-[11px] font-bold text-[#0b1e36] transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <ShieldCheck className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
              Admin
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-[#0b1e36]/5 space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Official Email ID</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#c59b48] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@capacityconnect.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c59b48]/50 focus:border-[#c59b48] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#c59b48] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-12 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c59b48]/50 focus:border-[#c59b48] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/60 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b1e36]/20 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-[#c59b48] rounded-full animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4 text-[#c59b48]" />
              )}
              <span>{loading ? 'Authenticating...' : 'Sign In with Gov ID'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            New to Capacity Connect?{' '}
            <Link href="/auth/register" className="font-bold text-[#0b1e36] hover:text-[#c59b48] transition-colors">
              Register for an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}