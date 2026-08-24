'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Award,
  BookOpen,
  User,
  Mail,
  Lock,
  Building,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  CheckCircle2,
  Briefcase,
  AlertCircle,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'TRAINEE' | 'TRAINER'>('TRAINEE');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [department, setDepartment] = useState('');
  const [headline, setHeadline] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength
  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabels = ['', 'Weak', 'Moderate', 'Strong'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          fullName,
          email,
          password,
          organization,
          department,
          headline,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/auth/pending');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative">
      <div className="absolute top-10 right-1/4 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg space-y-6 relative z-10">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-cyan-500/20 border border-indigo-500/40 text-indigo-400 shadow-xl shadow-indigo-500/10">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Register for Capacity Connect
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Join the national digital civil service capacity building network
            </p>
          </div>
        </div>

        {/* Approval Notice */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-3.5 flex items-start gap-2.5 backdrop-blur-md">
          <AlertCircle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold">Verification Required:</span> All new accounts are subject to mandatory review and approval by the System Administrator before access is granted.
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-5">
          {error && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-300 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Role Choice */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Registration Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('TRAINEE')}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all hover:-translate-y-0.5 ${
                  role === 'TRAINEE'
                    ? 'border-cyan-500/60 bg-cyan-950/30 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Award className={`h-5 w-5 ${role === 'TRAINEE' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Civil Service Trainee</div>
                  <div className="text-[10px] text-slate-400">Upskill & get certified</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('TRAINER')}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all hover:-translate-y-0.5 ${
                  role === 'TRAINER'
                    ? 'border-indigo-500/60 bg-indigo-950/30 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <BookOpen className={`h-5 w-5 ${role === 'TRAINER' ? 'text-indigo-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Accredited Trainer</div>
                  <div className="text-[10px] text-slate-400">Author & lecture cohorts</div>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Official Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Government Email ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. priya.sharma@gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-12 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength >= level ? strengthColors[passwordStrength] : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-bold ${
                    passwordStrength === 3 ? 'text-emerald-400' : passwordStrength === 2 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Organization / Ministry</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. MeitY"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Professional Headline</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="e.g. Systems Analyst"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              <span>{loading ? 'Submitting Registration...' : 'Submit for Verification'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            Already have an active account?{' '}
            <Link href="/auth/login" className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
