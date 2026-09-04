'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Fingerprint,
  Building2,
  Shield,
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  UserCheck,
  ShieldCheck,
  BookOpen,
  Award,
  Sparkles,
  Server,
  RefreshCw,
} from 'lucide-react';

interface CadreAccount {
  name: string;
  role: 'ADMIN' | 'TRAINER' | 'TRAINEE';
  email: string;
  department: string;
  designation: string;
  icon: React.ElementType;
  roleColor: string;
}

const AUTHORIZED_CADRES: CadreAccount[] = [
  {
    name: 'Dr. Mrutyunjay Mohapatra',
    role: 'ADMIN',
    email: 'dg.imd@moes.gov.in',
    department: 'Ministry of Earth Sciences (MoES) & IMD',
    designation: 'Director General of Meteorology • National Lead, Mission Mausam',
    icon: ShieldCheck,
    roleColor: 'border-[#c59b48] text-[#0b1e36] dark:text-[#dfb76c] bg-[#c59b48]/15',
  },
  {
    name: 'Dr. Rajeshwari Sharma',
    role: 'ADMIN',
    email: 'admin@capacityconnect.gov',
    department: 'Central Administration & Capacity Building Wing',
    designation: 'Chief Administrative Officer & Portal Director',
    icon: ShieldCheck,
    roleColor: 'border-[#c59b48] text-[#0b1e36] dark:text-[#dfb76c] bg-[#c59b48]/15',
  },
  {
    name: 'Prof. Vikramaditya Sen',
    role: 'TRAINER',
    email: 'vikram.sen@imd.gov.in',
    department: 'Central Training Division & NWP Core, Pune',
    designation: 'Senior Faculty & Chief Atmospheric Modeller',
    icon: BookOpen,
    roleColor: 'border-amber-400 text-amber-800 dark:text-amber-300 bg-amber-500/15',
  },
  {
    name: 'Aarav Patel',
    role: 'TRAINEE',
    email: 'aarav.patel@imd.gov.in',
    department: 'Numerical Weather Prediction Division, New Delhi',
    designation: 'Scientist-B • DRSTC 2026 Induction Track',
    icon: Award,
    roleColor: 'border-[#c59b48] text-[#0b1e36] dark:text-[#dfb76c] bg-[#c59b48]/15',
  },
  {
    name: 'Priya Sharma',
    role: 'TRAINEE',
    email: 'priya.sharma@capacityconnect.gov',
    department: 'Satellite Meteorology & Remote Sensing Division',
    designation: 'Scientist-B • INSAT-3DS Sounder Analytics',
    icon: Award,
    roleColor: 'border-[#c59b48] text-[#0b1e36] dark:text-[#dfb76c] bg-[#c59b48]/15',
  },
  {
    name: 'Pending Verification Officer',
    role: 'TRAINEE',
    email: 'pending@capacityconnect.org',
    department: 'National Induction Batch (Awaiting Admin Review)',
    designation: 'Candidate Officer • Pending Governance Review',
    icon: HelpCircle,
    roleColor: 'border-amber-400 text-amber-800 dark:text-amber-300 bg-amber-500/15',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; role: string; redirectUrl: string } | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showCadreDirectory, setShowCadreDirectory] = useState(false);
  const [nextPath, setNextPath] = useState<string | null>(null);

  // Load remembered email + proxy redirect hints on initial client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('cc_remembered_email');
      const savedPref = localStorage.getItem('cc_remember_pref');
      if (savedEmail) {
        setEmail(savedEmail);
      }
      if (savedPref !== null) {
        setRememberEmail(savedPref === 'true');
      }

      // Honor ?next= and ?error= set by the auth proxy layer.
      try {
        const params = new URLSearchParams(window.location.search);
        const requestedNext = params.get('next');
        if (
          requestedNext &&
          requestedNext.startsWith('/') &&
          !requestedNext.startsWith('//') &&
          !requestedNext.startsWith('/auth/')
        ) {
          setNextPath(requestedNext);
        }
        const errorHint = params.get('error');
        if (errorHint === 'LoginRequired' || errorHint === 'SessionExpired') {
          setError('Please sign in to access the requested protected area.');
        } else if (errorHint === 'AccountSuspended') {
          setError('Your account is suspended. Please contact IMD administration.');
        }
      } catch {
        // Ignore malformed query strings
      }
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    setCapsLockOn(e.getModifierState('CapsLock'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessInfo(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your registered official email ID.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Save or clear remembered email preference
        if (typeof window !== 'undefined') {
          if (rememberEmail) {
            localStorage.setItem('cc_remembered_email', trimmedEmail);
            localStorage.setItem('cc_remember_pref', 'true');
          } else {
            localStorage.removeItem('cc_remembered_email');
            localStorage.setItem('cc_remember_pref', 'false');
          }
        }

        const user = data.user;
        const defaultUrl =
          data.redirectUrl ||
          (user.status !== 'APPROVED' && user.role !== 'ADMIN'
            ? '/auth/pending'
            : user.role === 'ADMIN'
            ? '/admin'
            : user.role === 'TRAINER'
            ? '/trainer'
            : '/trainee');
        // Return users to the protected page they originally requested,
        // but never override PENDING routing or escape to external URLs.
        const targetUrl =
          nextPath && user.status === 'APPROVED' ? nextPath : defaultUrl;

        setSuccessInfo({
          name: user.fullName || user.email,
          role: user.role,
          redirectUrl: targetUrl,
        });

        // Trigger global auth-change notification for Navbar and Sidebar
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-change'));
        }

        // Brief delay for user feedback, then navigate
        setTimeout(() => {
          router.push(targetUrl);
          router.refresh();
        }, 600);
      } else {
        if (res.status === 403) {
          setError(
            data.error ||
              'Access denied. Your account status does not permit login. Please contact IMD administration.'
          );
        } else if (res.status === 401) {
          setError(
            data.error ||
              'Invalid email or password. Please verify your official credentials.'
          );
        } else {
          setError(data.error || 'Authentication failed. Please verify credentials and try again.');
        }
      }
    } catch (err: any) {
      setError('Network or server connection error. Please check your network and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (cadreEmail: string) => {
    setEmail(cadreEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden bg-slate-50/70 dark:bg-[#070f1a]">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-[#c59b48]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#0b1e36]/10 dark:bg-[#c59b48]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Official Sovereign Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0b1e36] border-2 border-[#c59b48] text-[#c59b48] shadow-xl shadow-[#0b1e36]/20">
            <Fingerprint className="h-8 w-8" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b1e36]/10 dark:bg-[#c59b48]/15 border border-[#c59b48]/40 text-[10px] font-sans font-bold uppercase tracking-wider text-[#0b1e36] dark:text-[#dfb76c] mb-1.5">
              <Shield className="h-3 w-3 text-[#c59b48]" />
              <span>Sovereign Single Sign-On (SSO)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0b1e36] dark:text-white tracking-tight">
              Sign In to <span className="text-[#c59b48]">CapacityConnect</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              India Meteorological Department (IMD) • Ministry of Earth Sciences (MoES)
            </p>
          </div>
        </div>

        {/* Database Credentials Reference (Accordion for Evaluators & Real Users) */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1e36] shadow-md overflow-hidden">
          <button
            type="button"
            onClick={() => setShowCadreDirectory(!showCadreDirectory)}
            className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-[#0b1e36] dark:text-[#dfb76c]">
              <Building2 className="h-4 w-4 text-[#c59b48]" />
              <span>Authorized IMD Cadre Directory (Database Accounts)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{showCadreDirectory ? 'Hide Directory' : 'Show Accounts'}</span>
              {showCadreDirectory ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </div>
          </button>

          <AnimatePresence>
            {showCadreDirectory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3.5 border-t border-slate-200 dark:border-white/10 space-y-2.5 text-xs"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>
                    The database contains seed records for all roles with default password{' '}
                    <code className="font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-950 dark:text-amber-100">
                      Password123!
                    </code>
                    . Click <strong>Fill Email</strong> below to pre-populate and authenticate.
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {AUTHORIZED_CADRES.map((cadre) => {
                    const CadreIcon = cadre.icon;
                    return (
                      <div
                        key={cadre.email}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:border-[#c59b48]/50 transition-all gap-2"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg bg-[#0b1e36]/10 dark:bg-[#c59b48]/20 flex items-center justify-center text-[#0b1e36] dark:text-[#dfb76c] shrink-0 mt-0.5">
                            <CadreIcon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                {cadre.name}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase border ${cadre.roleColor}`}
                              >
                                {cadre.role}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                              {cadre.email}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFillCredentials(cadre.email)}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0b1e36] text-white hover:bg-[#122c4d] border border-[#c59b48]/50 transition-all active:scale-95 dark:bg-[#c59b48] dark:hover:bg-[#d6af5d] dark:text-[#0b1e36] gold-ink-dark"
                          title="Fill verified credentials for database authentication"
                        >
                          Use Account
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Credentials Form Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b1e36] p-6 sm:p-8 shadow-xl shadow-[#0b1e36]/5 dark:shadow-black/40 space-y-5">
          {/* Success Banner */}
          {successInfo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-emerald-50 border border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800 p-4 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-3 shadow-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-950 dark:text-emerald-100">
                  Authentication Successful
                </div>
                <div>
                  Welcome back, <strong>{successInfo.name}</strong> ({successInfo.role}). Redirecting to your sovereign portal...
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-rose-50 border border-rose-300 dark:bg-rose-950/40 dark:border-rose-800 p-4 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3 shadow-sm"
            >
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-950 dark:text-rose-100">
                  Authentication Warning
                </div>
                <div>{error}</div>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Official Email ID</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">
                  NIC / MoES / IMD Domain
                </span>
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#c59b48] transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="officer@imd.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c59b48]/50 focus:border-[#c59b48] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-semibold text-[#0b1e36] dark:text-[#dfb76c] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#c59b48] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your official password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 pl-10 pr-12 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#c59b48]/50 focus:border-[#c59b48] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {capsLockOn && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 pt-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Caps Lock is ON</span>
                </div>
              )}
            </div>

            {/* Remember Me & Security Notice */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="rounded border-slate-300 text-[#0b1e36] focus:ring-[#c59b48] h-4 w-4"
                />
                <span>Remember Email ID</span>
              </label>
              <span className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1">
                <Server className="h-3 w-3 text-emerald-500" />
                <span>Neon DB Synced</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!successInfo}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] border border-[#c59b48]/60 py-3 text-sm font-bold text-white shadow-lg shadow-[#0b1e36]/20 transition-all disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] dark:bg-[#c59b48] dark:hover:bg-[#d6af5d] dark:text-[#0b1e36] dark:border-[#c59b48] gold-ink-dark"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white dark:border-[#0b1e36]/30 dark:border-t-[#0b1e36] rounded-full animate-spin" />
              ) : (
                <Fingerprint className="h-4 w-4 text-[#c59b48] dark:text-[#0b1e36] gold-ink-dark" />
              )}
              <span>
                {loading
                  ? 'Authenticating...'
                  : successInfo
                  ? 'Redirecting...'
                  : 'Sign In with Gov ID'}
              </span>
              {!loading && !successInfo && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          {/* Registration Link */}
          <div className="pt-4 border-t border-slate-100 dark:border-white/10 text-center text-xs text-slate-500 dark:text-slate-400">
            New to Capacity Connect?{' '}
            <Link
              href="/auth/register"
              className="font-bold text-[#0b1e36] hover:text-[#c59b48] transition-colors dark:text-[#dfb76c] dark:hover:text-white"
            >
              Register for an Official Account
            </Link>
          </div>
        </div>

        {/* Security & Regulatory Notice */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-white/5 p-3.5 text-[11px] text-slate-500 dark:text-slate-400 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Government Security & Compliance</span>
          </div>
          <p>
            Authorized access is monitored under CERT-In guidelines and IT Act 2000. All sessions use 7-day secure HTTP-only cryptographic tokens.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0b1e36] border border-slate-200 dark:border-white/15 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2 text-sm font-bold text-[#0b1e36] dark:text-white">
                  <HelpCircle className="h-4 w-4 text-[#c59b48]" />
                  <span>Credential Assistance</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  As an official sovereign system for the India Meteorological Department and MoES, password resets require verification by the Central Administrator.
                </p>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                  <div className="font-bold text-[#0b1e36] dark:text-white">
                    Official Support Contact:
                  </div>
                  <div className="space-y-1">
                    <div>
                      • <strong>Email:</strong> it.support@imd.gov.in / admin@capacityconnect.gov
                    </div>
                    <div>
                      • <strong>Direct Phone:</strong> +91 11 2461 1068 (Ext. 402)
                    </div>
                    <div>
                      • <strong>Location:</strong> IMD HQ Mausam Bhavan, Lodhi Road, New Delhi
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Default seed testing accounts use password <strong>Password123!</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#0b1e36] hover:bg-[#122c4d] text-white text-xs font-bold transition-all dark:bg-[#c59b48] dark:hover:bg-[#d6af5d] dark:text-[#0b1e36] gold-ink-dark"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}