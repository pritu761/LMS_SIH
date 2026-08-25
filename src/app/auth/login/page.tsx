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
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">

      {/* Animated Background Orbs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none morph-blob" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none morph-blob-alt" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none animate-breathe" />

      <div className="w-full max-w-md space-y-6 relative z-10">

        {/* Logo & Header */}
        <div className="text-center space-y-3 animate-fade-in-down">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 border border-indigo-500/40 text-indigo-400 shadow-xl shadow-indigo-500/10 animate-glow-pulse">
            <Fingerprint className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to Capacity Connect
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              National Digital Capacity Building & Learning Management Portal
            </p>
          </div>
        </div>

        {/* 1-Click Demo Persona Box */}
        <div className="rounded-2xl border border-indigo-500/25 bg-slate-900/50 p-4 space-y-3 backdrop-blur-md animate-fade-in-up animation-delay-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Instant Evaluator Demo Login</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-mono flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              Live
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 stagger-children">
            <button
              onClick={() => handleQuickDemo('TRAINEE')}
              className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 hover:border-cyan-400 py-3 text-[11px] font-bold text-cyan-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-cyan"
            >
              <Award className="h-4 w-4 mx-auto mb-1" />
              Trainee
            </button>
            <button
              onClick={() => handleQuickDemo('TRAINER')}
              className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 hover:bg-indigo-900/30 hover:border-indigo-400 py-3 text-[11px] font-bold text-indigo-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm"
            >
              <BookOpen className="h-4 w-4 mx-auto mb-1" />
              Trainer
            </button>
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 hover:bg-emerald-900/30 hover:border-emerald-400 py-3 text-[11px] font-bold text-emerald-300 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-emerald"
            >
              <ShieldCheck className="h-4 w-4 mx-auto mb-1" />
              Admin
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-elevation-3 space-y-5 animate-scale-in animation-delay-300">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300 flex items-center gap-2 animate-shake">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 flex-shrink-0 animate-pulse" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Official Email ID</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="name@capacityconnect.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 input-glow transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-12 py-2.5 text-sm text-slate-200 placeholder-slate-500 input-glow transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] hover:shadow-glow-md btn-shimmer"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4" />
              )}
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            New to Capacity Connect?{' '}
            <Link href="/auth/register" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Register for an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
