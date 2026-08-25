'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ShieldAlert, CheckCircle, ArrowRight, RefreshCw, Home, LogIn, Loader2 } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  const checkApprovalStatus = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user?.status === 'APPROVED') {
          if (data.user.role === 'ADMIN') router.push('/admin');
          else if (data.user.role === 'TRAINER') router.push('/trainer');
          else router.push('/trainee');
          return;
        }
      }
    } catch (e) {
      // Still pending
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none morph-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none morph-blob-alt" />

      <div className="w-full max-w-md relative z-10 space-y-6 animate-scale-in">
        <div className="rounded-3xl border border-amber-500/30 bg-slate-900/80 p-8 backdrop-blur-2xl shadow-elevation-3 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent animate-gradient-shift bg-[length:200%_100%]" />
          
          {/* Animated Waiting Icon */}
          <div className="relative mx-auto w-fit">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600/20 to-amber-400/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10">
              <Clock className="h-10 w-10 animate-breathe" />
            </div>
            {/* Pulse ring animation */}
            <div className="absolute inset-0 rounded-3xl border-2 border-amber-400/30 animate-ping" />
          </div>

          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-300 border border-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Account Status: PENDING VERIFICATION
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight pt-1">
              Awaiting Admin Approval
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              Your profile has been submitted and is currently under review by the System Administrator as per sovereign capacity building governance protocols.
            </p>
          </div>

          {/* Status Steps */}
          <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <span className="text-xs text-slate-300">
                <span className="font-bold text-emerald-300">Step 1:</span> Registration submitted successfully
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Clock className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              </div>
              <span className="text-xs text-slate-300">
                <span className="font-bold text-amber-300">Step 2:</span> Administrator reviewing your credentials
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <span className="text-xs text-slate-500">
                <span className="font-bold">Step 3:</span> Access granted upon approval
              </span>
            </div>
          </div>

          {/* Check Status Button */}
          <button
            onClick={checkApprovalStatus}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 px-5 py-3 text-sm font-bold text-amber-200 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 hover:shadow-glow-amber"
          >
            {checking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{checking ? 'Checking Status...' : 'Check Approval Status'}</span>
          </button>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:scale-105"
            >
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 btn-shimmer"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Sign In with Another ID</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
